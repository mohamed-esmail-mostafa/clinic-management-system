<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;

class CloudinaryService
{
    private function cloudinary()
    {
        return new Cloudinary([
            'cloud' => [
                'cloud_name' => config('services.cloudinary.cloud_name'),
                'api_key' => config('services.cloudinary.api_key'),
                'api_secret' => config('services.cloudinary.api_secret'),
            ],
        ]);
    }

    public function uploadToCloudinary(mixed $file, string $folder): ?array
    {
        try {
            $manager = ImageManager::usingDriver(
                GdDriver::class
            );

            if ($file instanceof UploadedFile) {
                $image = $manager->decodePath($file->getRealPath());
            } elseif (is_string($file) && file_exists($file)) {
                $image = $manager->decodePath($file);
            } else {
                $image = $manager->decode($file);
            }

            $image->scale(
                width: 1200
            );

            $encoded = $image->encodeUsingFormat(
                Format::WEBP,
                quality: 80
            );

            $tempPath = storage_path(
                'app/temp_'.uniqid().'.webp'
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
                'url' => $result['secure_url'],
                'public_id' => $result['public_id'],
            ];
        } catch (\Exception $e) {
            Log::error('Cloudinary upload error: '.$e->getMessage(), [
                'exception' => $e,
            ]);

            // Fallback: If Intervention fails, try direct Cloudinary upload if file is a string/data URI
            try {
                if (is_string($file)) {
                    $result = $this->cloudinary()->uploadApi()->upload(
                        $file,
                        ['folder' => $folder]
                    );

                    return [
                        'url' => $result['secure_url'],
                        'public_id' => $result['public_id'],
                    ];
                }
            } catch (\Exception $fallbackException) {
                Log::error('Cloudinary fallback direct upload error: '.$fallbackException->getMessage());
            }

            return null;
        }
    }

    public function uploadBase64ToCloudinary(string $base64Data, string $folder): ?array
    {
        return $this->uploadToCloudinary($base64Data, $folder);
    }

    public function deleteFromCloudinary(?string $publicId): bool
    {
        if (! $publicId) {
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
