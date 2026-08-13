<?php

namespace App\Services\User;

use App\Models\User;
use App\Support\UserRoles;
use Illuminate\Support\Facades\Auth;

class UserManagementService
{
    public function __construct(
        private UserProfileService $userProfileService,
    ) {}

    public function create(array $data): User
    {
        $user = User::query()->create([
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'role' => $data['role'],
            'avatar' => $data['avatar'],
            'password' => $data['password'],
        ]);

        return $this->userProfileService->ensureProfile($user);
    }

    public function update(User $user, array $data): User
    {
        $user->fill([
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'role' => $data['role'],
            'avatar' => $data['avatar'],
        ]);

        if (! empty($data['password'])) {
            $user->password = $data['password'];
        }

        $user->save();

        return $user->fresh();
    }

    public function delete(User $user): void
    {
        if ($user->id === Auth::id()) {
            throw new CannotDeleteUserException('You cannot delete your own account.');
        }

        if ($user->role === UserRoles::ADMINISTRATOR) {
            $adminCount = User::query()->where('role', UserRoles::ADMINISTRATOR)->count();

            if ($adminCount <= 1) {
                throw new CannotDeleteUserException('Cannot delete the last administrator account.');
            }
        }

        if ($user->profile_photo_path) {
            $this->userProfileService->removeProfilePhoto($user);
        }

        $user->delete();
    }
}
