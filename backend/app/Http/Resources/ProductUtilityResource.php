<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductUtilityResource extends JsonResource
{
    public function toArray($request): array
    {
        $rate = $this->whenLoaded('utility') ? optional($this->utility)->rate : null;
        $totalCost = $rate !== null
            ? round((float) $rate * (float) $this->quantity, 4)
            : null;

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'utility_id' => $this->utility_id,
            'quantity' => $this->quantity,
            'utility' => new UtilityResource($this->whenLoaded('utility')),
            'unit' => $this->whenLoaded('utility', function () {
                return new UnitOfMeasurementResource(optional($this->utility)->unit);
            }),
            'rate' => $rate,
            'total_cost' => $totalCost,
            'created_at' => optional($this->created_at)->toDatetimeString(),
            'updated_at' => optional($this->updated_at)->toDatetimeString(),
        ];
    }
}
