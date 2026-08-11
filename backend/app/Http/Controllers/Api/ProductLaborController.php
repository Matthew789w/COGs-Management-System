<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreProductLaborRequest;
use App\Http\Requests\UpdateProductLaborRequest;
use App\Http\Resources\ProductLaborResource;
use App\Models\ProductLabor;
use Illuminate\Http\Request;

class ProductLaborController extends ApiController
{
    public function index(Request $request)
    {
        $productId = $request->query('product_id');
        $query = ProductLabor::query();

        if ($productId) {
            $query->where('product_id', $productId);
        }

        return $this->respondWithSuccess(
            ProductLaborResource::collection(
                $query->orderBy('id')->get()
            )
        );
    }

    public function store(StoreProductLaborRequest $request)
    {
        $productLabor = ProductLabor::create($request->validated());

        return $this->respondCreated(
            new ProductLaborResource($productLabor),
            'Labor entry created successfully.'
        );
    }

    public function show(ProductLabor $productLabor)
    {
        return $this->respondWithSuccess(new ProductLaborResource($productLabor));
    }

    public function update(UpdateProductLaborRequest $request, ProductLabor $productLabor)
    {
        $productLabor->update($request->validated());

        return $this->respondWithSuccess(
            new ProductLaborResource($productLabor),
            'Labor entry updated successfully.'
        );
    }

    public function destroy(ProductLabor $productLabor)
    {
        $productLabor->delete();

        return $this->respondWithSuccess(null, 'Labor entry removed successfully.');
    }
}
