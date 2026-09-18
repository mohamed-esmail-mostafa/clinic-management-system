<?php

namespace App\Models;

use Database\Factories\ClinicPhoneFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicPhone extends Model
{
    /** @use HasFactory<ClinicPhoneFactory> */
    use HasFactory;

    protected $fillable = [
        'clinic_id',
        'type',
        'label',
        'phone',
        'country_code',
        'is_whatsapp',
        'is_primary',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_whatsapp' => 'boolean',
            'is_primary' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }
}
