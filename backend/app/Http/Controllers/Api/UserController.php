<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserProfileResource;
use App\Models\User;
use App\Services\User\CannotDeleteUserException;
use App\Services\User\UserManagementService;
use App\Services\User\UserProfileService;
use App\Support\UserAvatars;
use App\Support\UserRoles;
use Illuminate\Http\JsonResponse;

class UserController extends ApiController
{
    public function index(UserProfileService $userProfileService): JsonResponse
    {
        $users = User::query()
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => $userProfileService->ensureProfile($user));

        return $this->respondWithSuccess(
            UserProfileResource::collection($users),
        );
    }

    public function meta(): JsonResponse
    {
        return $this->respondWithSuccess([
            'roles' => UserRoles::all(),
            'avatars' => UserAvatars::options(),
        ]);
    }

    public function store(
        StoreUserRequest $request,
        UserManagementService $userManagementService,
    ): JsonResponse {
        $user = $userManagementService->create($request->validated());

        return $this->respondCreated(
            new UserProfileResource($user),
            'User created successfully.',
        );
    }

    public function show(User $user, UserProfileService $userProfileService): JsonResponse
    {
        return $this->respondWithSuccess(
            new UserProfileResource($userProfileService->ensureProfile($user)),
        );
    }

    public function update(
        UpdateUserRequest $request,
        User $user,
        UserManagementService $userManagementService,
    ): JsonResponse {
        $user = $userManagementService->update($user, $request->validated());

        return $this->respondWithSuccess(
            new UserProfileResource($user),
            'User updated successfully.',
        );
    }

    public function destroy(User $user, UserManagementService $userManagementService): JsonResponse
    {
        try {
            $userManagementService->delete($user);
        } catch (CannotDeleteUserException $exception) {
            return $this->respondWithError($exception->getMessage(), 409);
        }

        return $this->respondWithSuccess(null, 'User deleted successfully.');
    }
}
