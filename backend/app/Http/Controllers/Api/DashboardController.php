<?php

namespace App\Http\Controllers\Api;

use App\Services\Dashboard\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends ApiController
{
    public function show(DashboardService $dashboardService): JsonResponse
    {
        return $this->respondWithSuccess($dashboardService->summary());
    }
}
