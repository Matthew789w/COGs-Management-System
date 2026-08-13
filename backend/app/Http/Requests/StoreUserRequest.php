<?php

namespace App\Http\Requests;

use App\Support\UserAvatars;
use App\Support\UserRoles;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'username' => 'required|string|min:3|max:32|alpha_dash|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'role' => ['required', 'string', Rule::in(UserRoles::all())],
            'avatar' => ['required', 'string', Rule::in(UserAvatars::ids())],
            'password' => 'required|string|min:8|confirmed',
        ];
    }
}
