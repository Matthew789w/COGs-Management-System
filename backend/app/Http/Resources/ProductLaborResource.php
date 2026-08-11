<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductLaborResource extends JsonResource
{
    public function toArray($request): array
    {
        $totalCost = round((float) $this->workers * (float) $this->hours * (float) $this->hourly_rate, 4);

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'role' => $this->role,
            'workers' => $this->workers,
            'hours' => $this->hours,
            'hourly_rate' => $this->hourly_rate,
            'total_cost' => $totalCost,
            'created_at' => optional($this->created_at)->toDatetimeString(),
            'updated_at' => optional($this->updated_at)->toDatetimeString(),
        ];
    }
}
