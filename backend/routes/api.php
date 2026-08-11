<?php

use Illuminate\Support\Facades\Route;
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

Route::apiResource('units', UnitOfMeasurementController::class);
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
Route::get('products/{product}/production-requirements', [ProductionBatchController::class, 'requirements']);
Route::post('production-batches/{production_batch}/confirm', [ProductionBatchController::class, 'confirm']);
Route::post('production-batches/{production_batch}/cancel', [ProductionBatchController::class, 'cancel']);
Route::apiResource('production-batches', ProductionBatchController::class);
