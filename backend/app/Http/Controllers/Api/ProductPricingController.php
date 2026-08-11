<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ProductPricingResource;
use App\Models\Product;
use App\Services\Costing\Exceptions\InvalidProductionQuantityException;
use App\Services\Pricing\Exceptions\InvalidProfitMarginException;
use App\Services\Pricing\ProductPricingService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProductPricingController extends ApiController
{
    public function show(Request $request, Product $product, ProductPricingService $pricingService)
    {
        $validated = $request->validate([
            'profit_margin' => 'required|numeric|min:'.ProductPricingService::MIN_PROFIT_MARGIN_PERCENT.'|max:'.ProductPricingService::MAX_PROFIT_MARGIN_PERCENT,
            'production_quantity' => 'nullable|numeric|min:0.0001',
        ]);

        try {
            $result = $pricingService->calculate(
                $product,
                (float) $validated['profit_margin'],
                isset($validated['production_quantity'])
                    ? (float) $validated['production_quantity']
                    : null
            );
        } catch (InvalidProfitMarginException $exception) {
            throw ValidationException::withMessages([
                'profit_margin' => [$exception->getMessage()],
            ]);
        } catch (InvalidProductionQuantityException $exception) {
            return $this->respondWithError($exception->getMessage(), 422);
        }

        return $this->respondWithSuccess(new ProductPricingResource($result));
    }
}
