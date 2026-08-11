<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UtilityResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'unit' => new UnitOfMeasurementResource($this->whenLoaded('unit')),
            'rate' => $this->rate,
            'is_active' => $this->is_active,
            'created_at' => optional($this->created_at)->toDatetimeString(),
            'updated_at' => optional($this->updated_at)->toDatetimeString(),
        ];
    }
}
