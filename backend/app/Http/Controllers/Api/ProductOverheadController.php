<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreProductOverheadRequest;
use App\Http\Requests\UpdateProductOverheadRequest;
use App\Http\Resources\ProductOverheadResource;
use App\Models\ProductOverhead;
use Illuminate\Http\Request;

class ProductOverheadController extends ApiController
{
    public function index(Request $request)
    {
        $productId = $request->query('product_id');
        $query = ProductOverhead::query();

        if ($productId) {
            $query->where('product_id', $productId);
        }

        return $this->respondWithSuccess(
            ProductOverheadResource::collection(
                $query->orderBy('id')->get()
            )
        );
    }

    public function store(StoreProductOverheadRequest $request)
    {
        $productOverhead = ProductOverhead::create($request->validated());

        return $this->respondCreated(
            new ProductOverheadResource($productOverhead),
            'Overhead entry created successfully.'
        );
    }

    public function show(ProductOverhead $productOverhead)
    {
        return $this->respondWithSuccess(new ProductOverheadResource($productOverhead));
    }

    public function update(UpdateProductOverheadRequest $request, ProductOverhead $productOverhead)
    {
        $productOverhead->update($request->validated());

        return $this->respondWithSuccess(
            new ProductOverheadResource($productOverhead),
            'Overhead entry updated successfully.'
        );
    }

    public function destroy(ProductOverhead $productOverhead)
    {
        $productOverhead->delete();

        return $this->respondWithSuccess(null, 'Overhead entry removed successfully.');
    }
}
