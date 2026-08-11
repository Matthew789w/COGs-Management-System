<?php

namespace App\Http\Resources;

use App\Services\Production\Data\ProductionMaterialRequirement;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ProductionMaterialRequirement */
class ProductionMaterialRequirementResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'material_id' => $this->materialId,
            'material_name' => $this->materialName,
            'unit_id' => $this->unitId,
            'unit_symbol' => $this->unitSymbol,
            'bom_quantity_per_unit' => $this->bomQuantityPerUnit,
            'required_quantity' => $this->requiredQuantity,
            'quantity_on_hand' => $this->quantityOnHand,
            'is_sufficient' => $this->isSufficient,
        ];
    }
}
