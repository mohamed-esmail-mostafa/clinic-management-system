<?php

namespace App\Services;

use App\Models\Role;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class RoleService
{
    public function getAllRoles(): Collection
    {
        return Role::orderBy('id', 'desc')->get();
    }

    public function createNewRole(array $data): Role
    {
        $name = $data['name'];
        $slug = isset($data['slug']) && ! empty($data['slug'])
            ? Str::slug($data['slug'])
            : Str::slug($name);

        return Role::create([
            'name' => $name,
            'slug' => $slug,
            'type' => $data['type'] ?? 'system',
        ]);
    }

    public function updateRole(Role|string $roleOrSlug, array $data): Role
    {
        $role = $roleOrSlug instanceof Role ? $roleOrSlug : $this->getRole($roleOrSlug);
        $name = $data['name'];
        $slug = isset($data['slug']) && ! empty($data['slug'])
            ? Str::slug($data['slug'])
            : Str::slug($name);

        $role->update([
            'name' => $name,
            'slug' => $slug,
            'type' => $data['type'] ?? $role->type,
        ]);

        return $role;
    }

    public function getRole(string $slug): Role
    {
        return Role::where('slug', $slug)->firstOrFail();
    }

    public function destroyRole(Role|string $roleOrSlug): bool
    {
        $role = $roleOrSlug instanceof Role ? $roleOrSlug : $this->getRole($roleOrSlug);

        return (bool) $role->delete();
    }
}
