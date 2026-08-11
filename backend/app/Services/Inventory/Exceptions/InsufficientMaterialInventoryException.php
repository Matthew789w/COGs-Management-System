<?php

namespace App\Services\Inventory\Exceptions;

use RuntimeException;

class InsufficientMaterialInventoryException extends RuntimeException
{
    public function __construct(
        public readonly int $materialId,
        public readonly float $required,
        public readonly float $available,
    ) {
        parent::__construct("Insufficient inventory for material {$materialId}.");
    }
}
