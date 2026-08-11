<?php

namespace App\Services\Production\Exceptions;

use RuntimeException;

class ProductionBatchNotConfirmableException extends RuntimeException
{
    public function __construct(string $message = 'Production batch cannot be confirmed in its current state.')
    {
        parent::__construct($message);
    }
}
