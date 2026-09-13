<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatientFields extends Model
{
    use HasFactory;

    protected $table = 'patient_fields';

    protected $fillable = [
        'clinic_id',
        'clinic_type_id',
        'name',
        'label',
        'type',
        'is_required',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function clinicType(): BelongsTo
    {
        return $this->belongsTo(ClinicType::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(PatientFieldOption::class, 'patient_field_id')->orderBy('sort_order', 'asc');
    }
}
