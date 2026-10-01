<?php

namespace App\Models;

use Database\Factories\VisitFieldOptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisitFieldOption extends Model
{
    /** @use HasFactory<VisitFieldOptionFactory> */
    use HasFactory;

    protected $table = 'visit_field_options';

    protected $fillable = [
        'visit_field_id',
        'label',
        'value',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function field(): BelongsTo
    {
        return $this->belongsTo(VisitField::class, 'visit_field_id');
    }
}
