<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreProductUtilityRequest;
use App\Http\Requests\UpdateProductUtilityRequest;
use App\Http\Resources\ProductUtilityResource;
use App\Models\ProductUtility;
use Illuminate\Http\Request;

class ProductUtilityController extends ApiController
{
    public function index(Request $request)
    {
        $productId = $request->query('product_id');
        $query = ProductUtility::with(['utility.unit', 'product']);

        if ($productId) {
            $query->where('product_id', $productId);
        }

        return $this->respondWithSuccess(
            ProductUtilityResource::collection(
                $query->orderBy('id')->get()
            )
        );
    }

    public function store(StoreProductUtilityRequest $request)
    {
        $productUtility = ProductUtility::create($request->validated());

        return $this->respondCreated(
            new ProductUtilityResource($productUtility->load(['utility.unit'])),
            'Utility usage created successfully.'
        );
    }

    public function show(ProductUtility $productUtility)
    {
        return $this->respondWithSuccess(
            new ProductUtilityResource($productUtility->load(['utility.unit']))
        );
    }

    public function update(UpdateProductUtilityRequest $request, ProductUtility $productUtility)
    {
        $productUtility->update($request->validated());

        return $this->respondWithSuccess(
            new ProductUtilityResource($productUtility->load(['utility.unit'])),
            'Utility usage updated successfully.'
        );
    }

    public function destroy(ProductUtility $productUtility)
    {
        $productUtility->delete();

        return $this->respondWithSuccess(null, 'Utility usage removed successfully.');
    }
}
