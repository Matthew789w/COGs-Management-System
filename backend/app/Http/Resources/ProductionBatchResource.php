<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductionBatchResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'batch_number' => $this->batch_number,
            'product_id' => $this->product_id,
            'product' => new ProductResource($this->whenLoaded('product')),
            'production_quantity' => $this->production_quantity,
            'production_date' => $this->production_date?->toDateString(),
            'status' => $this->status,
            'confirmed_at' => optional($this->confirmed_at)->toDatetimeString(),
            'notes' => $this->notes,
            'batch_materials' => ProductionBatchMaterialResource::collection($this->whenLoaded('batchMaterials')),
            'shortfalls' => $this->when(isset($this->shortfalls), $this->shortfalls),
            'all_materials_sufficient' => $this->when(
                isset($this->all_materials_sufficient),
                (bool) $this->all_materials_sufficient,
            ),
            'created_at' => optional($this->created_at)->toDatetimeString(),
            'updated_at' => optional($this->updated_at)->toDatetimeString(),
        ];
    }
}
