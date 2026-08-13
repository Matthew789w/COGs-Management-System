<?php

namespace App\Services\Auth;

use RuntimeException;

class LoginLockedException extends RuntimeException
{
    public function __construct(
        public readonly int $retryAfterSeconds,
        public readonly ?string $lockedUntil = null,
    ) {
        parent::__construct('Too many failed login attempts.');
    }
}
