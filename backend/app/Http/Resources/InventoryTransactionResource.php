<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class InventoryTransactionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'transaction_type' => $this->transaction_type,
            'material_id' => $this->material_id,
            'product_id' => $this->product_id,
            'unit_id' => $this->unit_id,
            'quantity' => $this->quantity,
            'unit_cost' => $this->unit_cost,
            'reference_type' => $this->reference_type,
            'reference_id' => $this->reference_id,
            'notes' => $this->notes,
            'material' => new MaterialResource($this->whenLoaded('material')),
            'product' => new ProductResource($this->whenLoaded('product')),
            'unit' => new UnitOfMeasurementResource($this->whenLoaded('unit')),
            'created_at' => optional($this->created_at)->toDatetimeString(),
        ];
    }
}
