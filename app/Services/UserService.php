<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(protected CloudinaryService $cloudinary_service) {}

    public function getAllUsers(): Collection
    {
        return User::select(['id', 'name', 'email', 'phone', 'avatar'])
            ->orderBy('name', 'asc')
            ->get();
    }

    public function createUser(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'role_id' => $data['role_id'] ?? null,
        ]);
    }

    public function updateProfile(User $user, array $data): User
    {
        if (! empty($data['remove_avatar'])) {
            if ($user->avatar_public_id) {
                $this->cloudinary_service->deleteFromCloudinary($user->avatar_public_id);
            }
            $user->avatar = null;
            $user->avatar_public_id = null;
        } elseif (isset($data['avatar']) && $data['avatar'] instanceof UploadedFile) {
            if ($user->avatar_public_id) {
                $this->cloudinary_service->deleteFromCloudinary($user->avatar_public_id);
            }
            $uploaded = $this->cloudinary_service->uploadToCloudinary($data['avatar'], 'avatars');
            if ($uploaded) {
                $user->avatar = $uploaded['url'];
                $user->avatar_public_id = $uploaded['public_id'];
            }
        }

        if (isset($data['name'])) {
            $user->name = $data['name'];
        }

        if (isset($data['email'])) {
            $user->email = $data['email'];
        }

        if (array_key_exists('phone', $data)) {
            $user->phone = ! empty($data['phone']) ? $data['phone'] : null;
        }

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return $user;
    }
}
