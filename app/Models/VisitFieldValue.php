<?php

namespace App\Models;

use Database\Factories\VisitFieldValueFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisitFieldValue extends Model
{
    /** @use HasFactory<VisitFieldValueFactory> */
    use HasFactory;

    protected $table = 'visit_field_values';

    protected $fillable = [
        'visit_id',
        'visit_field_id',
        'value',
    ];

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function field(): BelongsTo
    {
        return $this->belongsTo(VisitField::class, 'visit_field_id');
    }
}
