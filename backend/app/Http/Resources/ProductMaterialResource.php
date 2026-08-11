<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductMaterialResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'material_id' => $this->material_id,
            'unit_id' => $this->unit_id,
            'quantity' => $this->quantity,
            'position' => $this->position,
            'material' => new MaterialResource($this->whenLoaded('material')),
            'unit' => new UnitOfMeasurementResource($this->whenLoaded('unit')),
            'cost_per_unit' => $this->whenLoaded('material') ? optional($this->material)->cost_per_unit : null,
            'total_cost' => $this->whenLoaded('material') ? optional($this->material)->cost_per_unit * $this->quantity : null,
            'created_at' => optional($this->created_at)->toDatetimeString(),
            'updated_at' => optional($this->updated_at)->toDatetimeString(),
        ];
    }
}
