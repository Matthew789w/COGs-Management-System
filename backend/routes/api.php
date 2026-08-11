<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UnitOfMeasurementController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\UtilityController;
use App\Http\Controllers\Api\ProductController;

Route::apiResource('units', UnitOfMeasurementController::class);
Route::apiResource('materials', MaterialController::class);
Route::apiResource('utilities', UtilityController::class);
Route::apiResource('products', ProductController::class);
