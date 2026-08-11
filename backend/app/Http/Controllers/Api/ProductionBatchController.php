<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreProductionBatchRequest;
use App\Http\Requests\UpdateProductionBatchRequest;
use App\Http\Resources\ProductionBatchResource;
use App\Http\Resources\ProductionMaterialRequirementResource;
use App\Models\Product;
use App\Models\ProductionBatch;
use App\Services\Production\Exceptions\InsufficientInventoryException;
use App\Services\Production\Exceptions\ProductionBatchNotConfirmableException;
use App\Services\Production\ProductionBatchService;
use App\Services\Production\ProductionRequirementsService;
use Illuminate\Http\Request;

class ProductionBatchController extends ApiController
{
    public function index(Request $request)
    {
        $query = ProductionBatch::with(['product.defaultUnit'])->orderByDesc('production_date');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->query('product_id'));
        }

        return $this->respondWithSuccess(
            ProductionBatchResource::collection($query->get())
        );
    }

    public function store(
        StoreProductionBatchRequest $request,
        ProductionBatchService $batchService,
    ) {
        $validated = $request->validated();
        $validated['batch_number'] = $validated['batch_number']
            ?? $batchService->generateBatchNumber();
        $validated['status'] = ProductionBatch::STATUS_DRAFT;

        $batch = ProductionBatch::create($validated);
        $batchService->snapshotRequirements($batch);

        return $this->respondCreated(
            new ProductionBatchResource($batch->load(['product.defaultUnit', 'batchMaterials.material', 'batchMaterials.unit'])),
            'Production batch created successfully.'
        );
    }

    public function show(ProductionBatch $productionBatch)
    {
        return $this->respondWithSuccess(
            new ProductionBatchResource(
                $productionBatch->load(['product.defaultUnit', 'batchMaterials.material', 'batchMaterials.unit'])
            )
        );
    }

    public function update(
        UpdateProductionBatchRequest $request,
        ProductionBatch $productionBatch,
        ProductionBatchService $batchService,
    ) {
        if (! $productionBatch->isDraft()) {
            return $this->respondWithError('Only draft production batches can be updated.', 409);
        }

        $productionBatch->update($request->validated());
        $batchService->snapshotRequirements($productionBatch);

        return $this->respondWithSuccess(
            new ProductionBatchResource(
                $productionBatch->load(['product.defaultUnit', 'batchMaterials.material', 'batchMaterials.unit'])
            ),
            'Production batch updated successfully.'
        );
    }

    public function destroy(ProductionBatch $productionBatch)
    {
        if (! $productionBatch->isDraft()) {
            return $this->respondWithError('Only draft production batches can be deleted.', 409);
        }

        $productionBatch->delete();

        return $this->respondWithSuccess(null, 'Production batch deleted successfully.');
    }

    public function requirements(
        Request $request,
        Product $product,
        ProductionRequirementsService $requirementsService,
    ) {
        $validated = $request->validate([
            'production_quantity' => 'required|numeric|min:0.0001',
        ]);

        $requirements = $requirementsService->calculate(
            $product,
            (float) $validated['production_quantity']
        );

        return $this->respondWithSuccess([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'production_quantity' => (float) $validated['production_quantity'],
            'recipe_batch_size' => (float) $product->production_quantity,
            'materials' => ProductionMaterialRequirementResource::collection($requirements),
            'all_materials_sufficient' => collect($requirements)->every(fn ($item) => $item->isSufficient),
        ]);
    }

    public function confirm(ProductionBatch $productionBatch, ProductionBatchService $batchService)
    {
        try {
            $batch = $batchService->confirm($productionBatch);
        } catch (ProductionBatchNotConfirmableException $exception) {
            return $this->respondWithError($exception->getMessage(), 409);
        } catch (InsufficientInventoryException $exception) {
            return $this->respondWithError($exception->getMessage(), 422, [
                'shortfalls' => $exception->shortfalls,
            ]);
        }

        return $this->respondWithSuccess(
            new ProductionBatchResource($batch),
            'Production batch confirmed and inventory updated successfully.'
        );
    }

    public function cancel(ProductionBatch $productionBatch, ProductionBatchService $batchService)
    {
        try {
            $batch = $batchService->cancel($productionBatch);
        } catch (ProductionBatchNotConfirmableException $exception) {
            return $this->respondWithError($exception->getMessage(), 409);
        }

        return $this->respondWithSuccess(
            new ProductionBatchResource($batch),
            'Production batch cancelled successfully.'
        );
    }
}
