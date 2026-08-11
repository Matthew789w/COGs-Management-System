<?php

namespace App\Services\Pricing\Exceptions;

use RuntimeException;

class InvalidProfitMarginException extends RuntimeException
{
    public function __construct(string $message = 'Profit margin must be greater than 0% and less than 100%.')
    {
        parent::__construct($message);
    }
}
