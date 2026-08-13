<?php

namespace App\Support;

class UserAvatars
{
    public const DEFAULT = 'indigo';

    /**
     * @return array<int, array{id: string, label: string}>
     */
    public static function options(): array
    {
        return [
            ['id' => 'indigo', 'label' => 'Indigo'],
            ['id' => 'emerald', 'label' => 'Emerald'],
            ['id' => 'violet', 'label' => 'Violet'],
            ['id' => 'cyan', 'label' => 'Cyan'],
            ['id' => 'amber', 'label' => 'Amber'],
            ['id' => 'rose', 'label' => 'Rose'],
            ['id' => 'slate', 'label' => 'Slate'],
            ['id' => 'brand', 'label' => 'Brand'],
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function ids(): array
    {
        return array_column(self::options(), 'id');
    }

    public static function isValid(?string $avatar): bool
    {
        return $avatar !== null && in_array($avatar, self::ids(), true);
    }
}
