<?php

namespace App\Support;

class UserRoles
{
    public const ADMINISTRATOR = 'Administrator';

    /**
     * @return array<int, string>
     */
    public static function all(): array
    {
        return [
            self::ADMINISTRATOR,
            'Plant Manager',
            'Supervisor',
            'Operator',
            'Accountant',
        ];
    }

    public static function isValid(?string $role): bool
    {
        return $role !== null && in_array($role, self::all(), true);
    }
}
