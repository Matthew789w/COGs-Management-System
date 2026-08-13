<?php

namespace App\Services\Auth;

use App\Models\LoginLockout;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class LoginLockoutService
{
    public function maxAttempts(): int
    {
        return max(1, (int) config('security.max_login_attempts', 5));
    }

    public function lockoutMinutes(): int
    {
        return max(1, (int) config('security.lockout_minutes', 15));
    }

    public function status(string $username): array
    {
        $record = $this->findRecord($username);

        if (! $record?->locked_until) {
            return [
                'locked' => false,
                'attempts' => $record?->attempts ?? 0,
                'remaining_attempts' => $this->maxAttempts() - ($record?->attempts ?? 0),
                'locked_until' => null,
                'retry_after_seconds' => 0,
            ];
        }

        if ($record->locked_until->isPast()) {
            $this->clear($username);

            return $this->status($username);
        }

        return [
            'locked' => true,
            'attempts' => $record->attempts,
            'remaining_attempts' => 0,
            'locked_until' => $record->locked_until->toIso8601String(),
            'retry_after_seconds' => max(0, now()->diffInSeconds($record->locked_until, false)),
        ];
    }

    public function ensureNotLocked(string $username): void
    {
        $status = $this->status($username);

        if ($status['locked']) {
            throw new LoginLockedException($status['retry_after_seconds'], $status['locked_until']);
        }
    }

    public function validateCredentials(string $username, string $password): ?User
    {
        $this->ensureNotLocked($username);

        $user = User::query()->whereRaw('LOWER(username) = ?', [strtolower($username)])->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            $this->recordFailedAttempt($username);

            return null;
        }

        $this->clear($username);

        return $user;
    }

    public function recordFailedAttempt(string $username): array
    {
        $record = LoginLockout::query()->firstOrCreate(
            ['username' => $username],
            ['attempts' => 0],
        );

        $record->attempts = min($record->attempts + 1, $this->maxAttempts());

        if ($record->attempts >= $this->maxAttempts()) {
            $record->locked_until = now()->addMinutes($this->lockoutMinutes());
        }

        $record->save();

        return $this->status($username);
    }

    public function clear(string $username): void
    {
        LoginLockout::query()->where('username', $username)->delete();
    }

    private function findRecord(string $username): ?LoginLockout
    {
        return LoginLockout::query()->where('username', $username)->first();
    }
}
