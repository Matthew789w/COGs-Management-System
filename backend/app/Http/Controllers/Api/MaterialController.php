<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreMaterialRequest;
use App\Http\Requests\UpdateMaterialRequest;
use App\Http\Resources\MaterialResource;
use App\Models\Material;

class MaterialController extends ApiController
{
    public function index()
    {
        return $this->respondWithSuccess(
            MaterialResource::collection(
                Material::with('unit')->orderBy('name')->get()
            )
        );
    }

    public function store(StoreMaterialRequest $request)
    {
        $material = Material::create($request->validated());

        return $this->respondCreated(
            new MaterialResource($material->load('unit')),
            'Material created successfully.'
        );
    }

    public function show(Material $material)
    {
        return $this->respondWithSuccess(
            new MaterialResource($material->load('unit'))
        );
    }

    public function update(UpdateMaterialRequest $request, Material $material)
    {
        $material->update($request->validated());

        return $this->respondWithSuccess(
            new MaterialResource($material->load('unit')),
            'Material updated successfully.'
        );
    }

    public function destroy(Material $material)
    {
        if ($material->productMaterials()->exists()) {
            return $this->respondWithError(
                'Material cannot be deleted while it is referenced by products.',
                409
            );
        }

        $material->delete();

        return $this->respondWithSuccess(null, 'Material deleted successfully.');
    }
}
