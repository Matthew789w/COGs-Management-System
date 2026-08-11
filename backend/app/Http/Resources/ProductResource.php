<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'name' => $this->name,
            'description' => $this->description,
            'default_unit' => new UnitOfMeasurementResource($this->whenLoaded('defaultUnit')),
            'list_price' => $this->list_price,
            'production_quantity' => $this->production_quantity,
            'is_active' => $this->is_active,
            'created_at' => optional($this->created_at)->toDatetimeString(),
            'updated_at' => optional($this->updated_at)->toDatetimeString(),
        ];
    }
}
