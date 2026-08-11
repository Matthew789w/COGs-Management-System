<?php

namespace App\Services\Production\Data;

readonly class ProductionMaterialRequirement
{
    public function __construct(
        public int $materialId,
        public string $materialName,
        public int $unitId,
        public string $unitSymbol,
        public float $bomQuantityPerUnit,
        public float $requiredQuantity,
        public float $quantityOnHand,
        public bool $isSufficient,
    ) {}
}
