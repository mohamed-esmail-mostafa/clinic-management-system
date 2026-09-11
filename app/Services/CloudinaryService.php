<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Intervention\Image\ImageManager;
use Intervention\Image\Format;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;

class CloudinaryService
{
    private function cloudinary()
    {
        return new Cloudinary([
            'cloud' => [
                'cloud_name' => config('services.cloudinary.cloud_name'),
                'api_key'    => config('services.cloudinary.api_key'),
                'api_secret' => config('services.cloudinary.api_secret'),
            ],
        ]);
    }

    public function uploadToCloudinary($file, string $folder): ?array
    {
        try {
            $manager = ImageManager::usingDriver(
                GdDriver::class
            );

            $image = $manager->decodePath(
                $file->getRealPath()
            );

            $image->scale(
                width: 1200
            );

            $encoded = $image->encodeUsingFormat(
                Format::WEBP,
                quality: 80
            );

            $tempPath = storage_path(
                'app/temp_' . uniqid() . '.webp'
            );

            $encoded->save($tempPath);

            $result = $this->cloudinary()->uploadApi()->upload(
                $tempPath,
                ['folder' => $folder]
            );

            if (file_exists($tempPath)) {
                unlink($tempPath);
            }

            return [
                "url" => $result['secure_url'],
                "public_id" => $result['public_id']
            ];
        } catch (\Exception $e) {
            return null;
        }
    }

    public function deleteFromCloudinary(?string $publicId): bool
    {
        if (!$publicId) {
            return false;
        }
        
        try {
            $this->cloudinary()->uploadApi()->destroy($publicId);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}