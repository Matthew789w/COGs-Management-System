<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\UpdateUserPreferencesRequest;
use App\Services\User\UserPreferenceService;
use App\Services\User\UserProfileService;
use Illuminate\Http\JsonResponse;

class UserPreferenceController extends ApiController
{
    public function show(UserPreferenceService $userPreferenceService, UserProfileService $userProfileService): JsonResponse
    {
        $user = $userProfileService->profileUser();

        return $this->respondWithSuccess($userPreferenceService->forUser($user));
    }

    public function update(
        UpdateUserPreferencesRequest $request,
        UserPreferenceService $userPreferenceService,
        UserProfileService $userProfileService,
    ): JsonResponse {
        $user = $userProfileService->profileUser();
        $preferences = $userPreferenceService->update($user, $request->validated());

        return $this->respondWithSuccess($preferences, 'Preferences updated successfully.');
    }

    public function reset(
        UserPreferenceService $userPreferenceService,
        UserProfileService $userProfileService,
    ): JsonResponse {
        $user = $userProfileService->profileUser();
        $preferences = $userPreferenceService->reset($user);

        return $this->respondWithSuccess($preferences, 'Preferences reset successfully.');
    }
}
