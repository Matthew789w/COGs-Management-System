<?php

namespace App\Services\User;

use App\Models\User;
use App\Support\UserAvatars;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserProfileService
{
    public function profileUser(): User
    {
        $user = Auth::user();

        if ($user instanceof User) {
            return $this->ensureProfile($user);
        }

        throw new \Illuminate\Auth\AuthenticationException('Unauthenticated.');
    }

    public function ensureProfile(User $user): User
    {
        return $this->ensureProfileDefaults($user);
    }

    public function updateProfile(User $user, array $data): User
    {
        $user->fill([
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'role' => $data['role'],
            'avatar' => $data['avatar'],
        ]);
        $user->save();

        return $user->fresh();
    }

    public function updatePassword(User $user, string $currentPassword, string $newPassword): void
    {
        if (! Hash::check($currentPassword, $user->password)) {
            throw new InvalidUserPasswordException();
        }

        $user->password = $newPassword;
        $user->save();
    }

    public function storeProfilePhoto(User $user, UploadedFile $photo): User
    {
        $this->deleteStoredProfilePhoto($user);

        $extension = strtolower($photo->extension() ?: 'jpg');
        $path = $photo->storeAs(
            'profile-photos',
            "user-{$user->id}.{$extension}",
            'public',
        );

        $user->profile_photo_path = $path;
        $user->save();

        return $user->fresh();
    }

    public function removeProfilePhoto(User $user): User
    {
        $this->deleteStoredProfilePhoto($user);

        $user->profile_photo_path = null;
        $user->save();

        return $user->fresh();
    }

    public function profilePhotoUrl(User $user): ?string
    {
        if (blank($user->profile_photo_path)) {
            return null;
        }

        if (! Storage::disk('public')->exists($user->profile_photo_path)) {
            return null;
        }

        $path = '/storage/'.ltrim(str_replace('\\', '/', $user->profile_photo_path), '/');
        $version = Storage::disk('public')->lastModified($user->profile_photo_path);

        return "{$path}?v={$version}";
    }

    public function hasProfilePhoto(User $user): bool
    {
        return $this->profilePhotoUrl($user) !== null;
    }

    private function deleteStoredProfilePhoto(User $user): void
    {
        if (blank($user->profile_photo_path)) {
            return;
        }

        Storage::disk('public')->delete($user->profile_photo_path);
    }

    public function initials(User $user): string
    {
        $parts = preg_split('/\s+/', trim($user->name)) ?: [];

        if (count($parts) >= 2) {
            return strtoupper(substr($parts[0], 0, 1) . substr($parts[1], 0, 1));
        }

        $source = $user->username ?: $user->name;

        return strtoupper(substr($source, 0, 2));
    }

    private function ensureProfileDefaults(User $user): User
    {
        $updates = [];

        if (blank($user->username)) {
            $updates['username'] = $this->generateUniqueUsername($user);
        }

        if (blank($user->role)) {
            $updates['role'] = 'Administrator';
        }

        if (blank($user->avatar) || ! UserAvatars::isValid($user->avatar)) {
            $updates['avatar'] = UserAvatars::DEFAULT;
        }

        if ($updates !== []) {
            $user->fill($updates);
            $user->save();
        }

        return $user->fresh();
    }

    private function generateUniqueUsername(User $user): string
    {
        $base = Str::slug($user->name, '');
        $base = $base !== '' ? $base : 'user';
        $candidate = $base;
        $suffix = 1;

        while (
            User::query()
                ->where('username', $candidate)
                ->where('id', '!=', $user->id)
                ->exists()
        ) {
            $candidate = $base.$suffix;
            $suffix++;
        }

        return $candidate;
    }
}
