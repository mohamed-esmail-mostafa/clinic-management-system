<?php

namespace App\Models;

use Database\Factories\MedicationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Medication extends Model
{
    /** @use HasFactory<MedicationFactory> */
    use HasFactory;

    protected $fillable = [
        'clinic_id',
        'name',
        'generic_name',
        'form',
        'strength',
        'unit',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }
}
