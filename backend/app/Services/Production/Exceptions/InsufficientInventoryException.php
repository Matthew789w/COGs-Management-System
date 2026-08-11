<?php

namespace App\Services\Production\Exceptions;

use RuntimeException;

class InsufficientInventoryException extends RuntimeException
{
    /**
     * @param  array<int, array{material_id: int, material_name: string, required: float, available: float}>  $shortfalls
     */
    public function __construct(public readonly array $shortfalls)
    {
        parent::__construct('Insufficient inventory for one or more materials.');
    }
}
