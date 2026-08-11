<?php

namespace App\Services\Costing\Exceptions;

use RuntimeException;

class InvalidProductionQuantityException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Production quantity must be greater than zero.');
    }
}
