<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreProductMaterialRequest;
use App\Http\Requests\UpdateProductMaterialRequest;
use App\Http\Resources\ProductMaterialResource;
use App\Models\Product;
use App\Models\ProductMaterial;
use Illuminate\Http\Request;

class ProductMaterialController extends ApiController
{
    public function index(Request $request)
    {
        $productId = $request->query('product_id');
        $query = ProductMaterial::with(['material.unit', 'unit', 'product']);

        if ($productId) {
            $query->where('product_id', $productId);
        }

        return $this->respondWithSuccess(
            ProductMaterialResource::collection(
                $query->orderBy('position')->get()
            )
        );
    }

    public function store(StoreProductMaterialRequest $request)
    {
        $validated = $request->validated();
        $position = $validated['position'] ?? ProductMaterial::where('product_id', $validated['product_id'])->count();
        $validated['position'] = $position;

        $bomItem = ProductMaterial::create($validated);

        return $this->respondCreated(
            new ProductMaterialResource($bomItem->load(['material.unit', 'unit'])),
            'BOM item created successfully.'
        );
    }

    public function show(ProductMaterial $productMaterial)
    {
        return $this->respondWithSuccess(
            new ProductMaterialResource($productMaterial->load(['material.unit', 'unit']))
        );
    }

    public function update(UpdateProductMaterialRequest $request, ProductMaterial $productMaterial)
    {
        $productMaterial->update($request->validated());

        return $this->respondWithSuccess(
            new ProductMaterialResource($productMaterial->load(['material.unit', 'unit'])),
            'BOM item updated successfully.'
        );
    }

    public function destroy(ProductMaterial $productMaterial)
    {
        $productMaterial->delete();

        return $this->respondWithSuccess(null, 'BOM item removed successfully.');
    }

    public function reorder(Request $request)
    {
        $items = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:product_materials,id',
            'items.*.position' => 'required|integer|min:0',
        ]);

        foreach ($items['items'] as $item) {
            ProductMaterial::where('id', $item['id'])->update(['position' => $item['position']]);
        }

        return $this->respondWithSuccess(null, 'BOM order updated successfully.');
    }
}
