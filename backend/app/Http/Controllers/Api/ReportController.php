<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ReportFilterRequest;
use App\Services\Pricing\Exceptions\InvalidProfitMarginException;
use App\Services\Reports\CogsReportService;
use Illuminate\Http\JsonResponse;

class ReportController extends ApiController
{
    public function meta(CogsReportService $reportService): JsonResponse
    {
        return $this->respondWithSuccess($reportService->meta());
    }

    public function productCostBreakdown(ReportFilterRequest $request, CogsReportService $reportService): JsonResponse
    {
        return $this->respondWithSuccess($reportService->productCostBreakdown($request->toFilter()));
    }

    public function cogsPerProduct(ReportFilterRequest $request, CogsReportService $reportService): JsonResponse
    {
        return $this->respondWithSuccess($reportService->cogsPerProduct($request->toFilter()));
    }

    public function materialCost(ReportFilterRequest $request, CogsReportService $reportService): JsonResponse
    {
        return $this->respondWithSuccess($reportService->materialCost($request->toFilter()));
    }

    public function utilityCost(ReportFilterRequest $request, CogsReportService $reportService): JsonResponse
    {
        return $this->respondWithSuccess($reportService->utilityCost($request->toFilter()));
    }

    public function laborCost(ReportFilterRequest $request, CogsReportService $reportService): JsonResponse
    {
        return $this->respondWithSuccess($reportService->laborCost($request->toFilter()));
    }

    public function manufacturingOverhead(ReportFilterRequest $request, CogsReportService $reportService): JsonResponse
    {
        return $this->respondWithSuccess($reportService->manufacturingOverhead($request->toFilter()));
    }

    public function recommendedSellingPrice(ReportFilterRequest $request, CogsReportService $reportService): JsonResponse
    {
        try {
            return $this->respondWithSuccess($reportService->recommendedSellingPrice($request->toFilter()));
        } catch (InvalidProfitMarginException $exception) {
            return $this->respondWithError($exception->getMessage(), 422);
        }
    }

    public function expectedProfit(ReportFilterRequest $request, CogsReportService $reportService): JsonResponse
    {
        try {
            return $this->respondWithSuccess($reportService->expectedProfit($request->toFilter()));
        } catch (InvalidProfitMarginException $exception) {
            return $this->respondWithError($exception->getMessage(), 422);
        }
    }

    public function productionCostByBatch(ReportFilterRequest $request, CogsReportService $reportService): JsonResponse
    {
        return $this->respondWithSuccess($reportService->productionCostByBatch($request->toFilter()));
    }

    public function costVariance(ReportFilterRequest $request, CogsReportService $reportService): JsonResponse
    {
        return $this->respondWithSuccess($reportService->costVariance($request->toFilter()));
    }
}
