<?php

namespace App\Models;

use Database\Factories\ClinicUserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicUser extends Model
{
    /** @use HasFactory<ClinicUserFactory> */
    use HasFactory;

    protected $fillable = [
        'clinic_id',
        'user_id',
        'role_id',
    ];

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }
}
