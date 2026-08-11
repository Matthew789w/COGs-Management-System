<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ProductCostingResource;
use App\Models\Product;
use App\Services\Costing\Exceptions\InvalidProductionQuantityException;
use App\Services\Costing\ProductCostingService;
use Illuminate\Http\Request;

class ProductCostingController extends ApiController
{
    public function show(Request $request, Product $product, ProductCostingService $costingService)
    {
        $validated = $request->validate([
            'production_quantity' => 'nullable|numeric|min:0.0001',
        ]);

        try {
            $breakdown = $costingService->calculate(
                $product,
                isset($validated['production_quantity'])
                    ? (float) $validated['production_quantity']
                    : null
            );
        } catch (InvalidProductionQuantityException $exception) {
            return $this->respondWithError($exception->getMessage(), 422);
        }

        return $this->respondWithSuccess(new ProductCostingResource($breakdown));
    }
}
