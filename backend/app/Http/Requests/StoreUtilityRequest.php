<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUtilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => 'required|string|max:64|unique:utilities,code',
            'name' => 'required|string|max:255',
            'unit_id' => 'required|integer|exists:units_of_measurement,id',
            'rate' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ];
    }
}
