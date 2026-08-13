<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserProfileResource;
use App\Services\Auth\LoginLockedException;
use App\Services\Auth\LoginLockoutService;
use App\Services\User\UserPreferenceService;
use App\Services\User\UserProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends ApiController
{
    public function login(
        LoginRequest $request,
        LoginLockoutService $loginLockoutService,
        UserProfileService $userProfileService,
        UserPreferenceService $userPreferenceService,
    ): JsonResponse {
        $username = strtolower(trim($request->validated('username')));

        try {
            $loginLockoutService->ensureNotLocked($username);
        } catch (LoginLockedException $exception) {
            return $this->respondWithError(
                'Too many failed login attempts. The system is temporarily locked.',
                423,
                [
                    'locked' => true,
                    'retry_after_seconds' => $exception->retryAfterSeconds,
                    'locked_until' => $exception->lockedUntil,
                ],
            );
        }

        $user = $loginLockoutService->validateCredentials(
            $username,
            $request->validated('password'),
        );

        if (! $user) {
            $status = $loginLockoutService->status($username);

            if ($status['locked']) {
                return $this->respondWithError(
                    'Too many failed login attempts. The system is temporarily locked.',
                    423,
                    [
                        'locked' => true,
                        'retry_after_seconds' => $status['retry_after_seconds'],
                        'locked_until' => $status['locked_until'],
                    ],
                );
            }

            return $this->respondWithError('Invalid username or password.', 422, [
                'username' => ['Invalid username or password.'],
                'remaining_attempts' => $status['remaining_attempts'],
            ]);
        }

        Auth::login($user, $request->boolean('remember'));

        if (! $request->hasSession()) {
            Auth::logout();

            return $this->respondWithError(
                'Session could not be started. Open the app at http://localhost:5173 and ensure Laravel is running.',
                503,
            );
        }

        $request->session()->regenerate();

        return $this->respondWithSuccess([
            'user' => new UserProfileResource($userProfileService->ensureProfile($user)),
            'preferences' => $userPreferenceService->forUser($user),
            'lockout' => $loginLockoutService->status($username),
        ], 'Signed in successfully.');
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->respondWithSuccess(null, 'Signed out successfully.');
    }

    public function me(
        UserProfileService $userProfileService,
        UserPreferenceService $userPreferenceService,
    ): JsonResponse {
        $user = Auth::user();

        if (! $user) {
            return $this->respondWithError('Unauthenticated.', 401);
        }

        $profileUser = $userProfileService->ensureProfile($user);

        return $this->respondWithSuccess([
            'user' => new UserProfileResource($profileUser),
            'preferences' => $userPreferenceService->forUser($profileUser),
        ]);
    }

    public function lockoutStatus(Request $request, LoginLockoutService $loginLockoutService): JsonResponse
    {
        $username = strtolower(trim((string) $request->query('username', '')));

        if ($username === '') {
            return $this->respondWithSuccess([
                'locked' => false,
                'remaining_attempts' => $loginLockoutService->maxAttempts(),
                'retry_after_seconds' => 0,
            ]);
        }

        return $this->respondWithSuccess($loginLockoutService->status($username));
    }
}
