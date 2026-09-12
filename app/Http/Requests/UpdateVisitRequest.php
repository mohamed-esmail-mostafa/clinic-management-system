<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateVisitRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'visited_at' => ['required', 'date'],
            'type' => ['required', 'string', 'in:examination,follow_up'],
            'medications' => ['nullable', 'array'],
            'medications.*.medication_id' => ['nullable', 'exists:medications,id'],
            'medications.*.medication_name' => ['required', 'string', 'max:255'],
        ];
    }
}
