<?php

namespace App\Services;

use App\Models\WebsiteSetting;

class WebsiteSettingService
{
    /**
     * Create a new class instance.
     */
    public function __construct(protected CloudinaryService $cloudinary_service) {}

    public function getSettings(): WebsiteSetting
    {
        return WebsiteSetting::first() ?? new WebsiteSetting;
    }

    public function updateSettings(array $data, array $files = []): WebsiteSetting
    {
        $setting = WebsiteSetting::first();
        if (! $setting) {
            $setting = new WebsiteSetting;
        }

        $setting->title_en = $data['title_en'] ?? null;
        $setting->title_ar = $data['title_ar'] ?? null;
        $setting->description_en = $data['description_en'] ?? null;
        $setting->description_ar = $data['description_ar'] ?? null;
        $setting->keywords_en = $data['keywords_en'] ?? null;
        $setting->keywords_ar = $data['keywords_ar'] ?? null;
        $setting->email = $data['email'] ?? null;
        $setting->phone = $data['phone'] ?? null;
        $setting->address = $data['address'] ?? null;

        // Handle Light Logo Upload / Removal
        if (isset($files['logo']) && $files['logo']) {
            if ($setting->public_logo_id) {
                $this->cloudinary_service->deleteFromCloudinary($setting->public_logo_id);
            }
            $uploaded = $this->cloudinary_service->uploadToCloudinary($files['logo'], 'website_settings');
            if ($uploaded) {
                $setting->logo = $uploaded['url'];
                $setting->public_logo_id = $uploaded['public_id'];
            }
        } elseif (isset($data['remove_logo']) && $data['remove_logo']) {
            if ($setting->public_logo_id) {
                $this->cloudinary_service->deleteFromCloudinary($setting->public_logo_id);
            }
            $setting->logo = null;
            $setting->public_logo_id = null;
        }

        // Handle Dark Logo Upload / Removal
        if (isset($files['dark_logo']) && $files['dark_logo']) {
            if ($setting->public_dark_logo_id) {
                $this->cloudinary_service->deleteFromCloudinary($setting->public_dark_logo_id);
            }
            $uploaded = $this->cloudinary_service->uploadToCloudinary($files['dark_logo'], 'website_settings');
            if ($uploaded) {
                $setting->dark_logo = $uploaded['url'];
                $setting->public_dark_logo_id = $uploaded['public_id'];
            }
        } elseif (isset($data['remove_dark_logo']) && $data['remove_dark_logo']) {
            if ($setting->public_dark_logo_id) {
                $this->cloudinary_service->deleteFromCloudinary($setting->public_dark_logo_id);
            }
            $setting->dark_logo = null;
            $setting->public_dark_logo_id = null;
        }

        // Handle Favicon Upload / Removal
        if (isset($files['favicon']) && $files['favicon']) {
            if ($setting->public_favicon_id) {
                $this->cloudinary_service->deleteFromCloudinary($setting->public_favicon_id);
            }
            $uploaded = $this->cloudinary_service->uploadToCloudinary($files['favicon'], 'website_settings');
            if ($uploaded) {
                $setting->favicon = $uploaded['url'];
                $setting->public_favicon_id = $uploaded['public_id'];
            }
        } elseif (isset($data['remove_favicon']) && $data['remove_favicon']) {
            if ($setting->public_favicon_id) {
                $this->cloudinary_service->deleteFromCloudinary($setting->public_favicon_id);
            }
            $setting->favicon = null;
            $setting->public_favicon_id = null;
        }

        $setting->save();

        return $setting;
    }
}
