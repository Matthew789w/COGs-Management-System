<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;

class ProductController extends ApiController
{
    public function index()
    {
        return $this->respondWithSuccess(
            ProductResource::collection(
                Product::with('defaultUnit')->orderBy('name')->get()
            )
        );
    }

    public function store(StoreProductRequest $request)
    {
        $product = Product::create($request->validated());

        return $this->respondCreated(
            new ProductResource($product->load('defaultUnit')),
            'Product created successfully.'
        );
    }

    public function show(Product $product)
    {
        return $this->respondWithSuccess(
            new ProductResource($product->load('defaultUnit'))
        );
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $product->update($request->validated());

        return $this->respondWithSuccess(
            new ProductResource($product->load('defaultUnit')),
            'Product updated successfully.'
        );
    }

    public function destroy(Product $product)
    {
        if ($product->productMaterials()->exists() || $product->productUtilities()->exists()) {
            return $this->respondWithError(
                'Product cannot be deleted while it is referenced by materials or utilities.',
                409
            );
        }

        $product->delete();

        return $this->respondWithSuccess(null, 'Product deleted successfully.');
    }
}
