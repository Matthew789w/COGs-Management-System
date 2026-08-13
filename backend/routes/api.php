<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserPreferenceController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\Api\UnitOfMeasurementController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\UtilityController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductCostingController;
use App\Http\Controllers\Api\ProductPricingController;
use App\Http\Controllers\Api\ProductOverheadController;
use App\Http\Controllers\Api\ProductionBatchController;
use App\Http\Controllers\Api\ProductLaborController;
use App\Http\Controllers\Api\ProductMaterialController;
use App\Http\Controllers\Api\ProductUtilityController;

Route::post('auth/login', [AuthController::class, 'login']);
Route::get('auth/lockout-status', [AuthController::class, 'lockoutStatus']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::get('user/profile', [UserProfileController::class, 'show']);
    Route::put('user/profile', [UserProfileController::class, 'update']);
    Route::post('user/profile/photo', [UserProfileController::class, 'uploadPhoto']);
    Route::delete('user/profile/photo', [UserProfileController::class, 'removePhoto']);
    Route::put('user/password', [UserProfileController::class, 'updatePassword']);
    Route::get('user/preferences', [UserPreferenceController::class, 'show']);
    Route::put('user/preferences', [UserPreferenceController::class, 'update']);
    Route::post('user/preferences/reset', [UserPreferenceController::class, 'reset']);

    Route::middleware('admin')->group(function () {
        Route::get('users/meta', [UserController::class, 'meta']);
        Route::apiResource('users', UserController::class);
    });

    Route::apiResource('units', UnitOfMeasurementController::class);

    Route::get('dashboard', [DashboardController::class, 'show']);
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::apiResource('materials', MaterialController::class);
    Route::apiResource('utilities', UtilityController::class);
    Route::get('products/{product}/costing', [ProductCostingController::class, 'show']);
    Route::get('products/{product}/pricing', [ProductPricingController::class, 'show']);
    Route::apiResource('products', ProductController::class);
    Route::post('product-materials/reorder', [ProductMaterialController::class, 'reorder']);
    Route::apiResource('product-materials', ProductMaterialController::class);
    Route::apiResource('product-utilities', ProductUtilityController::class);
    Route::apiResource('product-labor', ProductLaborController::class);
    Route::apiResource('product-overhead', ProductOverheadController::class);
    Route::get('inventory/balances', [InventoryController::class, 'balances']);
    Route::get('inventory/transactions', [InventoryController::class, 'transactions']);
    Route::post('inventory/material-receipts', [InventoryController::class, 'receiveMaterial']);
    Route::get('products/{product}/production-requirements', [ProductionBatchController::class, 'requirements']);
    Route::post('production-batches/{production_batch}/confirm', [ProductionBatchController::class, 'confirm']);
    Route::post('production-batches/{production_batch}/cancel', [ProductionBatchController::class, 'cancel']);
    Route::apiResource('production-batches', ProductionBatchController::class);

    Route::prefix('reports')->group(function () {
        Route::get('meta', [ReportController::class, 'meta']);
        Route::get('product-cost-breakdown', [ReportController::class, 'productCostBreakdown']);
        Route::get('cogs-per-product', [ReportController::class, 'cogsPerProduct']);
        Route::get('material-cost', [ReportController::class, 'materialCost']);
        Route::get('utility-cost', [ReportController::class, 'utilityCost']);
        Route::get('labor-cost', [ReportController::class, 'laborCost']);
        Route::get('manufacturing-overhead', [ReportController::class, 'manufacturingOverhead']);
        Route::get('recommended-selling-price', [ReportController::class, 'recommendedSellingPrice']);
        Route::get('expected-profit', [ReportController::class, 'expectedProfit']);
        Route::get('production-cost-by-batch', [ReportController::class, 'productionCostByBatch']);
        Route::get('cost-variance', [ReportController::class, 'costVariance']);
    });
});
