<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductOverheadResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'name' => $this->name,
            'category' => $this->category,
            'allocation_method' => $this->allocation_method,
            'amount' => $this->amount,
            'total_cost' => round((float) $this->amount, 4),
            'created_at' => optional($this->created_at)->toDatetimeString(),
            'updated_at' => optional($this->updated_at)->toDatetimeString(),
        ];
    }
}
