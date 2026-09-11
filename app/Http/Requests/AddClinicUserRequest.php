<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddClinicUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $mode = $this->input('mode', 'existing');

        if ($mode === 'new') {
            return [
                'mode' => 'required|in:existing,new',
                'role_id' => 'required|exists:roles,id',
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email',
                'password' => 'required|string|min:8',
                'phone' => 'nullable|string|max:20',
            ];
        }

        return [
            'mode' => 'required|in:existing,new',
            'role_id' => 'required|exists:roles,id',
            'user_id' => 'required|exists:users,id',
        ];
    }
}
