<?php

namespace App\Services\Production;

use App\Models\ProductionBatch;
use App\Models\ProductionBatchMaterial;
use App\Services\Inventory\InventoryService;
use App\Services\Production\Exceptions\InsufficientInventoryException;
use App\Services\Production\Exceptions\ProductionBatchNotConfirmableException;
use Illuminate\Support\Facades\DB;

class ProductionBatchService
{
    public function __construct(
        private ProductionRequirementsService $requirementsService,
        private InventoryService $inventoryService,
    ) {}

    public function snapshotRequirements(ProductionBatch $batch): ProductionBatch
    {
        $batch->loadMissing('product');

        $requirements = $this->requirementsService->calculate(
            $batch->product,
            (float) $batch->production_quantity,
        );

        $batch->batchMaterials()->delete();

        foreach ($requirements as $requirement) {
            ProductionBatchMaterial::create([
                'production_batch_id' => $batch->id,
                'material_id' => $requirement->materialId,
                'unit_id' => $requirement->unitId,
                'bom_quantity_per_unit' => $requirement->bomQuantityPerUnit,
                'required_quantity' => $requirement->requiredQuantity,
            ]);
        }

        return $batch->fresh(['batchMaterials.material', 'batchMaterials.unit', 'product']);
    }

    public function confirm(ProductionBatch $batch): ProductionBatch
    {
        return DB::transaction(function () use ($batch) {
            $batch = ProductionBatch::query()
                ->lockForUpdate()
                ->with(['product.defaultUnit'])
                ->findOrFail($batch->id);

            if (! $batch->isDraft()) {
                throw new ProductionBatchNotConfirmableException();
            }

            $this->snapshotRequirements($batch);
            $batch->load(['batchMaterials.material', 'batchMaterials.unit']);

            if ($batch->batchMaterials->isEmpty()) {
                throw new ProductionBatchNotConfirmableException(
                    'Cannot confirm production without bill of materials.',
                );
            }

            $shortfalls = $this->inventoryService->getMaterialShortfalls(
                $batch->batchMaterials,
                lockForUpdate: true,
            );

            if ($shortfalls !== []) {
                throw new InsufficientInventoryException($shortfalls);
            }

            foreach ($batch->batchMaterials as $line) {
                $unitCost = (float) $line->material->cost_per_unit;

                $this->inventoryService->issueMaterialForProduction(
                    $line->material,
                    (float) $line->required_quantity,
                    $unitCost,
                    ProductionBatch::class,
                    $batch->id,
                );

                $line->update([
                    'issued_quantity' => $line->required_quantity,
                    'unit_cost_snapshot' => $unitCost,
                ]);
            }

            $this->inventoryService->receiveProductFromProduction(
                $batch->product,
                (float) $batch->production_quantity,
                ProductionBatch::class,
                $batch->id,
            );

            $batch->update([
                'status' => ProductionBatch::STATUS_CONFIRMED,
                'confirmed_at' => now(),
            ]);

            return $batch->fresh([
                'batchMaterials.material',
                'batchMaterials.unit',
                'product.defaultUnit',
            ]);
        });
    }

    public function cancel(ProductionBatch $batch): ProductionBatch
    {
        if (! $batch->isDraft()) {
            throw new ProductionBatchNotConfirmableException('Only draft production batches can be cancelled.');
        }

        $batch->update(['status' => ProductionBatch::STATUS_CANCELLED]);

        return $batch->fresh(['batchMaterials.material', 'batchMaterials.unit', 'product.defaultUnit']);
    }

    public function generateBatchNumber(): string
    {
        $prefix = 'PB-'.now()->format('Ymd');

        $latest = ProductionBatch::query()
            ->where('batch_number', 'like', $prefix.'-%')
            ->orderByDesc('batch_number')
            ->value('batch_number');

        $sequence = 1;
        if ($latest && preg_match('/-(\d+)$/', $latest, $matches)) {
            $sequence = (int) $matches[1] + 1;
        }

        return sprintf('%s-%04d', $prefix, $sequence);
    }

    /**
     * @return array<int, array{material_id: int, material_name: string, required: float, available: float}>
     */
    public function getDraftShortfalls(ProductionBatch $batch): array
    {
        if (! $batch->isDraft()) {
            return [];
        }

        $batch->loadMissing(['batchMaterials.material']);

        if ($batch->batchMaterials->isEmpty()) {
            $this->snapshotRequirements($batch);
            $batch->load(['batchMaterials.material']);
        }

        return $this->inventoryService->getMaterialShortfalls($batch->batchMaterials);
    }
}
