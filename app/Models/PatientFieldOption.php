<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientFieldOption extends Model
{
    use HasFactory;

    protected $table = 'patient_field_options';

    protected $fillable = [
        'patient_field_id',
        'label',
        'value',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function field(): BelongsTo
    {
        return $this->belongsTo(PatientFields::class, 'patient_field_id');
    }
}
