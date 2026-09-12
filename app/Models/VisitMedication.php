<?php

namespace App\Models;

use Database\Factories\VisitMedicationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisitMedication extends Model
{
    /** @use HasFactory<VisitMedicationFactory> */
    use HasFactory;

    protected $fillable = [
        'visit_id',
        'medication_id',
        'medication_name',
    ];

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function medication(): BelongsTo
    {
        return $this->belongsTo(Medication::class);
    }
}
