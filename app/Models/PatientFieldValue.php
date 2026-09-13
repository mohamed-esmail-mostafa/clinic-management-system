<?php

namespace App\Models;

use Database\Factories\PatientFieldValueFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientFieldValue extends Model
{
    /** @use HasFactory<PatientFieldValueFactory> */
    use HasFactory;

    protected $table = 'patient_field_values';

    protected $fillable = [
        'patient_id',
        'patient_field_id',
        'value',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function field(): BelongsTo
    {
        return $this->belongsTo(PatientFields::class, 'patient_field_id');
    }
}
