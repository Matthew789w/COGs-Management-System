<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUnitOfMeasurementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $unitId = $this->route('unit')->id ?? null;

        return [
            'code' => [
                'required',
                'string',
                'max:10',
                Rule::unique('units_of_measurement', 'code')->ignore($unitId),
            ],
            'name' => 'required|string|max:100',
            'symbol' => 'required|string|max:10',
            'category' => 'required|string|max:50',
            'is_active' => 'boolean',
        ];
    }
}
