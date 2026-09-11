<?php

namespace App\Models;

use Database\Factories\ClinicSpecialtyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicSpecialty extends Model
{
    /** @use HasFactory<ClinicSpecialtyFactory> */
    use HasFactory;

    protected $fillable = [
        'clinic_id',
        'specialty_id',
    ];

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function specialty(): BelongsTo
    {
        return $this->belongsTo(Specialty::class);
    }
}
