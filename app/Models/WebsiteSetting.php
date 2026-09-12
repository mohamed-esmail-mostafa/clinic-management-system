<?php

namespace App\Models;

use Database\Factories\WebsiteSettingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebsiteSetting extends Model
{
    /** @use HasFactory<WebsiteSettingFactory> */
    use HasFactory;

    protected $fillable = [
        'title_en',
        'title_ar',
        'description_en',
        'description_ar',
        'keywords_en',
        'keywords_ar',
        'logo',
        'public_logo_id',
        'dark_logo',
        'public_dark_logo_id',
        'favicon',
        'public_favicon_id',
        'email',
        'phone',
        'address',
    ];
}
