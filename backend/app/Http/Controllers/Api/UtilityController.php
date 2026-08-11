<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreUtilityRequest;
use App\Http\Requests\UpdateUtilityRequest;
use App\Http\Resources\UtilityResource;
use App\Models\Utility;

class UtilityController extends ApiController
{
    public function index()
    {
        return $this->respondWithSuccess(
            UtilityResource::collection(
                Utility::with('unit')->orderBy('name')->get()
            )
        );
    }

    public function store(StoreUtilityRequest $request)
    {
        $utility = Utility::create($request->validated());

        return $this->respondCreated(
            new UtilityResource($utility->load('unit')),
            'Utility created successfully.'
        );
    }

    public function show(Utility $utility)
    {
        return $this->respondWithSuccess(
            new UtilityResource($utility->load('unit'))
        );
    }

    public function update(UpdateUtilityRequest $request, Utility $utility)
    {
        $utility->update($request->validated());

        return $this->respondWithSuccess(
            new UtilityResource($utility->load('unit')),
            'Utility updated successfully.'
        );
    }

    public function destroy(Utility $utility)
    {
        if ($utility->productUtilities()->exists()) {
            return $this->respondWithError(
                'Utility cannot be deleted while it is referenced by products.',
                409
            );
        }

        $utility->delete();

        return $this->respondWithSuccess(null, 'Utility deleted successfully.');
    }
}
