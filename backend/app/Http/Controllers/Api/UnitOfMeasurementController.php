<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreUnitOfMeasurementRequest;
use App\Http\Requests\UpdateUnitOfMeasurementRequest;
use App\Http\Resources\UnitOfMeasurementResource;
use App\Models\UnitOfMeasurement;

class UnitOfMeasurementController extends ApiController
{
    public function index()
    {
        return $this->respondWithSuccess(
            UnitOfMeasurementResource::collection(
                UnitOfMeasurement::orderBy('name')->get()
            )
        );
    }

    public function store(StoreUnitOfMeasurementRequest $request)
    {
        $unit = UnitOfMeasurement::create($request->validated());

        return $this->respondCreated(
            new UnitOfMeasurementResource($unit),
            'Unit created successfully.'
        );
    }

    public function show(UnitOfMeasurement $unit)
    {
        return $this->respondWithSuccess(new UnitOfMeasurementResource($unit));
    }

    public function update(UpdateUnitOfMeasurementRequest $request, UnitOfMeasurement $unit)
    {
        $unit->update($request->validated());

        return $this->respondWithSuccess(
            new UnitOfMeasurementResource($unit),
            'Unit updated successfully.'
        );
    }

    public function destroy(UnitOfMeasurement $unit)
    {
        if (
            $unit->materials()->exists() ||
            $unit->utilities()->exists() ||
            $unit->products()->exists() ||
            $unit->productMaterials()->exists()
        ) {
            return $this->respondWithError(
                'Unit cannot be deleted while it is referenced by other records.',
                409
            );
        }

        $unit->delete();

        return $this->respondWithSuccess(null, 'Unit deleted successfully.');
    }
}
