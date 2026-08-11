<?php

namespace App\Services\Reports;

use App\Models\Product;
use App\Models\ProductionBatch;
use App\Services\Costing\Data\CostLineItem;
use App\Services\Costing\Data\ProductCostBreakdown;
use App\Services\Costing\Exceptions\InvalidProductionQuantityException;
use App\Services\Costing\ProductCostingService;
use App\Services\Pricing\ProductPricingService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class CogsReportService
{
    public function __construct(
        private ProductCostingService $costingService,
        private ProductPricingService $pricingService,
        private BatchCostReportService $batchCostReportService,
    ) {}

    public function meta(): array
    {
        $products = Product::query()
            ->select(['id', 'name', 'sku'])
            ->orderBy('name')
            ->get();

        $batches = ProductionBatch::query()
            ->select(['id', 'batch_number', 'product_id', 'production_date', 'status'])
            ->with('product:id,name')
            ->where('status', ProductionBatch::STATUS_CONFIRMED)
            ->orderByDesc('production_date')
            ->orderByDesc('id')
            ->limit(500)
            ->get()
            ->map(fn (ProductionBatch $batch) => [
                'id' => $batch->id,
                'batch_number' => $batch->batch_number,
                'product_id' => $batch->product_id,
                'product_name' => $batch->product?->name,
                'production_date' => $batch->production_date?->toDateString(),
            ]);

        return [
            'products' => $products,
            'production_batches' => $batches,
            'overhead_categories' => [
                ['value' => 'depreciation', 'label' => 'Depreciation'],
                ['value' => 'rent', 'label' => 'Rent'],
                ['value' => 'maintenance', 'label' => 'Maintenance'],
                ['value' => 'utilities_overhead', 'label' => 'Utilities Overhead'],
                ['value' => 'insurance', 'label' => 'Insurance'],
                ['value' => 'other', 'label' => 'Other'],
            ],
            'default_profit_margin' => 30,
        ];
    }

    public function productCostBreakdown(ReportFilter $filter): array
    {
        $rows = [];

        foreach ($this->productsForFilter($filter) as $product) {
            try {
                $breakdown = $this->costingService->calculate($product);
            } catch (InvalidProductionQuantityException) {
                continue;
            }

            $rows[] = $this->mapProductBreakdownRow($breakdown);
        }

        return $this->wrapReport('product_cost_breakdown', $filter, $rows, [
            'total_products' => count($rows),
        ]);
    }

    public function cogsPerProduct(ReportFilter $filter): array
    {
        $rows = [];

        foreach ($this->productsForFilter($filter) as $product) {
            try {
                $breakdown = $this->costingService->calculate($product);
            } catch (InvalidProductionQuantityException) {
                $rows[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'recipe_batch_size' => (float) $product->production_quantity,
                    'total_manufacturing_cost' => null,
                    'cogs_per_unit' => null,
                    'configured' => false,
                ];

                continue;
            }

            $rows[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'sku' => $product->sku,
                'recipe_batch_size' => $breakdown->productionQuantity,
                'total_manufacturing_cost' => $breakdown->totalManufacturingCost,
                'cogs_per_unit' => $breakdown->cogsPerUnit,
                'configured' => true,
            ];
        }

        return $this->wrapReport('cogs_per_product', $filter, $rows, [
            'average_cogs_per_unit' => $this->average(
                collect($rows)->where('configured', true)->pluck('cogs_per_unit')->all()
            ),
        ]);
    }

    public function materialCost(ReportFilter $filter): array
    {
        $rows = [];
        $grandTotal = 0.0;

        foreach ($this->productsForFilter($filter) as $product) {
            try {
                $breakdown = $this->costingService->calculate($product);
            } catch (InvalidProductionQuantityException) {
                continue;
            }

            foreach ($breakdown->materials->items as $item) {
                $rows[] = $this->mapLineItemRow($product, $item, 'material');
                $grandTotal += $item->totalCost;
            }
        }

        return $this->wrapReport('material_cost', $filter, $rows, [
            'total_material_cost' => round($grandTotal, 4),
        ]);
    }

    public function utilityCost(ReportFilter $filter): array
    {
        $rows = [];
        $grandTotal = 0.0;

        foreach ($this->productsForFilter($filter) as $product) {
            try {
                $breakdown = $this->costingService->calculate($product);
            } catch (InvalidProductionQuantityException) {
                continue;
            }

            foreach ($breakdown->utilities->items as $item) {
                $rows[] = $this->mapLineItemRow($product, $item, 'utility');
                $grandTotal += $item->totalCost;
            }
        }

        return $this->wrapReport('utility_cost', $filter, $rows, [
            'total_utility_cost' => round($grandTotal, 4),
        ]);
    }

    public function laborCost(ReportFilter $filter): array
    {
        $rows = [];
        $grandTotal = 0.0;

        foreach ($this->productsForFilter($filter) as $product) {
            try {
                $breakdown = $this->costingService->calculate($product);
            } catch (InvalidProductionQuantityException) {
                continue;
            }

            foreach ($breakdown->labor->items as $item) {
                $rows[] = $this->mapLineItemRow($product, $item, 'labor');
                $grandTotal += $item->totalCost;
            }
        }

        return $this->wrapReport('labor_cost', $filter, $rows, [
            'total_labor_cost' => round($grandTotal, 4),
        ]);
    }

    public function manufacturingOverhead(ReportFilter $filter): array
    {
        $rows = [];
        $grandTotal = 0.0;

        foreach ($this->productsForFilter($filter) as $product) {
            try {
                $breakdown = $this->costingService->calculate($product);
            } catch (InvalidProductionQuantityException) {
                continue;
            }

            foreach ($breakdown->overhead->items as $item) {
                if ($filter->category !== null && $item->category !== $filter->category) {
                    continue;
                }

                $rows[] = $this->mapLineItemRow($product, $item, 'overhead');
                $grandTotal += $item->totalCost;
            }
        }

        return $this->wrapReport('manufacturing_overhead', $filter, $rows, [
            'total_overhead_cost' => round($grandTotal, 4),
        ]);
    }

    public function recommendedSellingPrice(ReportFilter $filter): array
    {
        $margin = $filter->profitMarginPercent ?? 30.0;
        $rows = [];

        foreach ($this->productsForFilter($filter) as $product) {
            try {
                $pricing = $this->pricingService->calculate($product, $margin);
            } catch (InvalidProductionQuantityException) {
                continue;
            }

            $rows[] = [
                'product_id' => $pricing->productId,
                'product_name' => $pricing->productName,
                'cogs_per_unit' => $pricing->cogsPerUnit,
                'target_profit_margin_percent' => $pricing->targetProfitMarginPercent,
                'recommended_selling_price' => $pricing->recommendedSellingPrice,
            ];
        }

        return $this->wrapReport('recommended_selling_price', $filter, $rows, [
            'profit_margin_applied' => round($margin, 4),
        ]);
    }

    public function expectedProfit(ReportFilter $filter): array
    {
        $margin = $filter->profitMarginPercent ?? 30.0;
        $rows = [];

        foreach ($this->productsForFilter($filter) as $product) {
            try {
                $pricing = $this->pricingService->calculate($product, $margin);
            } catch (InvalidProductionQuantityException) {
                continue;
            }

            $rows[] = [
                'product_id' => $pricing->productId,
                'product_name' => $pricing->productName,
                'cogs_per_unit' => $pricing->cogsPerUnit,
                'recommended_selling_price' => $pricing->recommendedSellingPrice,
                'expected_profit_per_unit' => $pricing->expectedProfitPerUnit,
                'expected_profit_percentage' => $pricing->expectedProfitPercentage,
                'target_profit_margin_percent' => $pricing->targetProfitMarginPercent,
            ];
        }

        return $this->wrapReport('expected_profit', $filter, $rows, [
            'profit_margin_applied' => round($margin, 4),
        ]);
    }

    public function productionCostByBatch(ReportFilter $filter): array
    {
        return $this->batchCostReportService->productionCostByBatch($filter);
    }

    public function costVariance(ReportFilter $filter): array
    {
        return $this->batchCostReportService->costVariance($filter);
    }

    /**
     * @return Collection<int, Product>
     */
    private function productsForFilter(ReportFilter $filter): Collection
    {
        return $this->baseProductQuery($filter)->get();
    }

    private function baseProductQuery(ReportFilter $filter): Builder
    {
        return Product::query()
            ->with([
                'defaultUnit',
                'productMaterials.material.unit',
                'productMaterials.unit',
                'productUtilities.utility.unit',
                'productLabor',
                'productOverhead',
            ])
            ->when($filter->productId, fn (Builder $query) => $query->where('id', $filter->productId))
            ->when($filter->hasDateRange(), function (Builder $query) use ($filter) {
                $query->whereHas('productionBatches', function (Builder $batchQuery) use ($filter) {
                    $batchQuery->where('status', ProductionBatch::STATUS_CONFIRMED)
                        ->when($filter->dateFrom, fn (Builder $query) => $query->whereDate('production_date', '>=', $filter->dateFrom))
                        ->when($filter->dateTo, fn (Builder $query) => $query->whereDate('production_date', '<=', $filter->dateTo));
                });
            })
            ->orderBy('name');
    }

    private function mapProductBreakdownRow(ProductCostBreakdown $breakdown): array
    {
        return [
            'product_id' => $breakdown->productId,
            'product_name' => $breakdown->productName,
            'recipe_batch_size' => $breakdown->productionQuantity,
            'total_material_cost' => $breakdown->totalMaterialCost,
            'total_utility_cost' => $breakdown->totalUtilityCost,
            'total_labor_cost' => $breakdown->totalLaborCost,
            'total_overhead_cost' => $breakdown->totalOverheadCost,
            'total_manufacturing_cost' => $breakdown->totalManufacturingCost,
            'cogs_per_unit' => $breakdown->cogsPerUnit,
        ];
    }

    private function mapLineItemRow(Product $product, CostLineItem $item, string $costType): array
    {
        return array_filter([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'cost_type' => $costType,
            'reference_id' => $item->referenceId,
            'name' => $item->name,
            'quantity' => $item->quantity,
            'unit_symbol' => $item->unitSymbol,
            'unit_cost' => $item->unitCost,
            'total_cost' => $item->totalCost,
            'workers' => $item->workers,
            'hours' => $item->hours,
            'hourly_rate' => $item->hourlyRate,
            'category' => $item->category,
        ], fn ($value) => $value !== null);
    }

    private function wrapReport(string $type, ReportFilter $filter, array $rows, array $summary = []): array
    {
        return [
            'report_type' => $type,
            'filters_applied' => $filter->toArray(),
            'summary' => $summary,
            'rows' => array_values($rows),
        ];
    }

    private function average(array $values): ?float
    {
        if ($values === []) {
            return null;
        }

        return round(array_sum($values) / count($values), 4);
    }
}
