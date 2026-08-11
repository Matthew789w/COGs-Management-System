<?php

namespace App\Services\Reports;

use App\Models\ProductionBatch;
use App\Services\Costing\Exceptions\InvalidProductionQuantityException;
use App\Services\Costing\ProductCostingService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class BatchCostReportService
{
    public function __construct(
        private ProductCostingService $costingService,
    ) {}

    public function productionCostByBatch(ReportFilter $filter): array
    {
        $rows = [];
        $totalStandard = 0.0;
        $totalActualMaterial = 0.0;
        $totalActual = 0.0;

        foreach ($this->batchesForFilter($filter) as $batch) {
            $costs = $this->calculateBatchCosts($batch);
            $rows[] = $costs;
            $totalStandard += $costs['standard_total_cost'];
            $totalActualMaterial += $costs['actual_material_cost'];
            $totalActual += $costs['actual_total_cost'];
        }

        return [
            'report_type' => 'production_cost_by_batch',
            'filters_applied' => $filter->toArray(),
            'summary' => [
                'batch_count' => count($rows),
                'total_standard_cost' => round($totalStandard, 4),
                'total_actual_material_cost' => round($totalActualMaterial, 4),
                'total_actual_cost' => round($totalActual, 4),
            ],
            'rows' => $rows,
        ];
    }

    public function costVariance(ReportFilter $filter): array
    {
        $rows = [];
        $totalVariance = 0.0;
        $totalStandard = 0.0;
        $totalActual = 0.0;

        foreach ($this->batchesForFilter($filter) as $batch) {
            $costs = $this->calculateBatchCosts($batch);
            $variance = round($costs['actual_total_cost'] - $costs['standard_total_cost'], 4);
            $variancePercent = $costs['standard_total_cost'] > 0
                ? round(($variance / $costs['standard_total_cost']) * 100, 4)
                : null;

            $rows[] = array_merge($costs, [
                'variance_amount' => $variance,
                'variance_percent' => $variancePercent,
                'material_variance' => round($costs['actual_material_cost'] - $costs['standard_material_cost'], 4),
                'status' => $this->varianceStatus($variance),
            ]);

            $totalVariance += $variance;
            $totalStandard += $costs['standard_total_cost'];
            $totalActual += $costs['actual_total_cost'];
        }

        return [
            'report_type' => 'cost_variance',
            'filters_applied' => $filter->toArray(),
            'summary' => [
                'batch_count' => count($rows),
                'total_standard_cost' => round($totalStandard, 4),
                'total_actual_cost' => round($totalActual, 4),
                'total_variance' => round($totalVariance, 4),
                'total_variance_percent' => $totalStandard > 0
                    ? round(($totalVariance / $totalStandard) * 100, 4)
                    : null,
            ],
            'rows' => $rows,
        ];
    }

    /**
     * @return Collection<int, ProductionBatch>
     */
    private function batchesForFilter(ReportFilter $filter): Collection
    {
        return $this->baseBatchQuery($filter)->get();
    }

    private function baseBatchQuery(ReportFilter $filter): Builder
    {
        return ProductionBatch::query()
            ->with([
                'product.defaultUnit',
                'product.productMaterials.material',
                'product.productUtilities.utility',
                'product.productLabor',
                'product.productOverhead',
                'batchMaterials.material',
                'batchMaterials.unit',
            ])
            ->where('status', ProductionBatch::STATUS_CONFIRMED)
            ->when($filter->productId, fn (Builder $query) => $query->where('product_id', $filter->productId))
            ->when($filter->productionBatchId, fn (Builder $query) => $query->where('id', $filter->productionBatchId))
            ->when($filter->dateFrom, fn (Builder $query) => $query->whereDate('production_date', '>=', $filter->dateFrom))
            ->when($filter->dateTo, fn (Builder $query) => $query->whereDate('production_date', '<=', $filter->dateTo))
            ->orderByDesc('production_date')
            ->orderByDesc('id');
    }

    private function calculateBatchCosts(ProductionBatch $batch): array
    {
        $product = $batch->product;
        $batchQuantity = (float) $batch->production_quantity;
        $recipeBatchSize = (float) $product->production_quantity;
        $scaleFactor = $recipeBatchSize > 0 ? $batchQuantity / $recipeBatchSize : 0.0;

        $standardMaterial = 0.0;
        $standardUtility = 0.0;
        $standardLabor = 0.0;
        $standardOverhead = 0.0;

        try {
            $breakdown = $this->costingService->calculate($product);
            $standardMaterial = round($breakdown->totalMaterialCost * $scaleFactor, 4);
            $standardUtility = round($breakdown->totalUtilityCost * $scaleFactor, 4);
            $standardLabor = round($breakdown->totalLaborCost * $scaleFactor, 4);
            $standardOverhead = round($breakdown->totalOverheadCost * $scaleFactor, 4);
            $standardTotal = round($breakdown->totalManufacturingCost * $scaleFactor, 4);
            $standardCogsPerUnit = $batchQuantity > 0 ? round($standardTotal / $batchQuantity, 4) : 0.0;
        } catch (InvalidProductionQuantityException) {
            $standardTotal = 0.0;
            $standardCogsPerUnit = 0.0;
        }

        $actualMaterial = round(
            $batch->batchMaterials->sum(function ($line) {
                $issued = (float) ($line->issued_quantity ?? 0);
                $snapshot = (float) ($line->unit_cost_snapshot ?? 0);

                return $issued * $snapshot;
            }),
            4
        );

        $actualUtility = $standardUtility;
        $actualLabor = $standardLabor;
        $actualOverhead = $standardOverhead;
        $actualTotal = round($actualMaterial + $actualUtility + $actualLabor + $actualOverhead, 4);
        $actualCogsPerUnit = $batchQuantity > 0 ? round($actualTotal / $batchQuantity, 4) : 0.0;

        return [
            'batch_id' => $batch->id,
            'batch_number' => $batch->batch_number,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'production_date' => $batch->production_date?->toDateString(),
            'production_quantity' => $batchQuantity,
            'recipe_batch_size' => $recipeBatchSize,
            'standard_material_cost' => $standardMaterial,
            'standard_utility_cost' => $standardUtility,
            'standard_labor_cost' => $standardLabor,
            'standard_overhead_cost' => $standardOverhead,
            'standard_total_cost' => $standardTotal,
            'standard_cogs_per_unit' => $standardCogsPerUnit,
            'actual_material_cost' => $actualMaterial,
            'actual_utility_cost' => $actualUtility,
            'actual_labor_cost' => $actualLabor,
            'actual_overhead_cost' => $actualOverhead,
            'actual_total_cost' => $actualTotal,
            'actual_cogs_per_unit' => $actualCogsPerUnit,
        ];
    }

    private function varianceStatus(float $variance): string
    {
        if (abs($variance) < 0.0001) {
            return 'on_target';
        }

        return $variance > 0 ? 'over_standard' : 'under_standard';
    }
}
