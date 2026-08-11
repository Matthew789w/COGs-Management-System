<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class InventoryBalanceResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'material_id' => $this->material_id,
            'product_id' => $this->product_id,
            'unit_id' => $this->unit_id,
            'quantity_on_hand' => $this->quantity_on_hand,
            'material' => new MaterialResource($this->whenLoaded('material')),
            'product' => new ProductResource($this->whenLoaded('product')),
            'unit' => new UnitOfMeasurementResource($this->whenLoaded('unit')),
            'updated_at' => optional($this->updated_at)->toDatetimeString(),
        ];
    }
}
