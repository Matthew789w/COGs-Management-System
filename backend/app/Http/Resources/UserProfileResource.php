<?php

namespace App\Http\Resources;

use App\Services\User\UserProfileService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class UserProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var UserProfileService $profileService */
        $profileService = app(UserProfileService::class);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'role' => $this->role,
            'avatar' => $this->avatar,
            'profile_photo_url' => $profileService->profilePhotoUrl($this->resource),
            'has_profile_photo' => $profileService->hasProfilePhoto($this->resource),
            'initials' => $profileService->initials($this->resource),
        ];
    }
}
