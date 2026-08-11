<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductionBatchMaterialResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'material_id' => $this->material_id,
            'material' => new MaterialResource($this->whenLoaded('material')),
            'unit_id' => $this->unit_id,
            'unit' => new UnitOfMeasurementResource($this->whenLoaded('unit')),
            'bom_quantity_per_unit' => $this->bom_quantity_per_unit,
            'required_quantity' => $this->required_quantity,
            'issued_quantity' => $this->issued_quantity,
            'unit_cost_snapshot' => $this->unit_cost_snapshot,
        ];
    }
}
