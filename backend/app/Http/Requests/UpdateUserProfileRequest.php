<?php

namespace App\Http\Requests;

use App\Services\User\UserProfileService;
use App\Support\UserAvatars;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = app(UserProfileService::class)->profileUser()->id;

        return [
            'name' => 'required|string|max:255',
            'username' => [
                'required',
                'string',
                'min:3',
                'max:32',
                'alpha_dash',
                Rule::unique('users', 'username')->ignore($userId),
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'role' => 'required|string|max:64',
            'avatar' => ['required', 'string', Rule::in(UserAvatars::ids())],
        ];
    }
}
