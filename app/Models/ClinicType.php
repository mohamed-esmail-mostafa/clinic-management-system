<?php

namespace App\Models;

use Database\Factories\ClinicTypeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClinicType extends Model
{
    /** @use HasFactory<ClinicTypeFactory> */
    use HasFactory;

    protected $fillable = [
        'title_ar',
        'title_en',
        'slug',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function clinics(): HasMany
    {
        return $this->hasMany(Clinic::class);
    }
}
