<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUnitOfMeasurementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => 'required|string|max:10|unique:units_of_measurement,code',
            'name' => 'required|string|max:100',
            'symbol' => 'required|string|max:10',
            'category' => 'required|string|max:50',
            'is_active' => 'boolean',
        ];
    }
}
