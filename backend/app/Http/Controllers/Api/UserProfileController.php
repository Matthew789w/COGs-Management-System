<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\UpdateUserPasswordRequest;
use App\Http\Requests\UpdateUserProfileRequest;
use App\Http\Requests\UploadProfilePhotoRequest;
use App\Http\Resources\UserProfileResource;
use App\Services\User\InvalidUserPasswordException;
use App\Services\User\UserProfileService;
use App\Support\UserAvatars;
use Illuminate\Http\JsonResponse;

class UserProfileController extends ApiController
{
    public function show(UserProfileService $userProfileService): JsonResponse
    {
        return $this->respondWithSuccess([
            'profile' => new UserProfileResource($userProfileService->profileUser()),
            'avatars' => UserAvatars::options(),
        ]);
    }

    public function update(
        UpdateUserProfileRequest $request,
        UserProfileService $userProfileService,
    ): JsonResponse {
        $user = $userProfileService->profileUser();
        $profile = $userProfileService->updateProfile($user, $request->validated());

        return $this->respondWithSuccess(
            new UserProfileResource($profile),
            'Profile updated successfully.',
        );
    }

    public function updatePassword(
        UpdateUserPasswordRequest $request,
        UserProfileService $userProfileService,
    ): JsonResponse {
        $user = $userProfileService->profileUser();

        try {
            $userProfileService->updatePassword(
                $user,
                $request->validated('current_password'),
                $request->validated('password'),
            );
        } catch (InvalidUserPasswordException) {
            return $this->respondWithError('The current password is incorrect.', 422, [
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        return $this->respondWithSuccess(null, 'Password updated successfully.');
    }

    public function uploadPhoto(
        UploadProfilePhotoRequest $request,
        UserProfileService $userProfileService,
    ): JsonResponse {
        $user = $userProfileService->profileUser();
        $profile = $userProfileService->storeProfilePhoto($user, $request->file('photo'));

        return $this->respondWithSuccess(
            new UserProfileResource($profile),
            'Profile photo uploaded successfully.',
        );
    }

    public function removePhoto(UserProfileService $userProfileService): JsonResponse
    {
        $user = $userProfileService->profileUser();
        $profile = $userProfileService->removeProfilePhoto($user);

        return $this->respondWithSuccess(
            new UserProfileResource($profile),
            'Profile photo removed successfully.',
        );
    }
}
