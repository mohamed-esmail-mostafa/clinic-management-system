<?php

namespace App\Models;

use Database\Factories\PatientFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Patient extends Model
{
    /** @use HasFactory<PatientFactory> */
    use HasFactory;

    protected $fillable = [
        'patient_number',
        'first_name',
        'middle_name',
        'last_name',
        'gender',
        'date_of_birth',
        'phone',
        'secondary_phone',
        'email',
        'address',
        'city',
        'country',
        'national_id',
        'passport_number',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
        'blood_type',
        'allergies',
        'chronic_diseases',
        'medical_history',
        'surgical_history',
        'family_medical_history',
        'has_insurance',
        'insurance_company',
        'insurance_number',
        'insurance_expiry_date',
        'clinic_id',
        'notes',
        'occupation',
        'marital_status',
        'is_active',
    ];

    protected $appends = ['full_name'];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date:Y-m-d',
            'insurance_expiry_date' => 'date:Y-m-d',
            'has_insurance' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function getFullNameAttribute(): string
    {
        $nameParts = array_filter([$this->first_name, $this->middle_name, $this->last_name]);

        return implode(' ', $nameParts);
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function visits(): HasMany
    {
        return $this->hasMany(Visit::class);
    }
}
