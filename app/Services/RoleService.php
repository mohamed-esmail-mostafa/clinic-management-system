<?php

namespace App\Services;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Role;
use Illuminate\Support\Str;

class RoleService
{

    public function getAllRoles()
    {
        return Role::all();
    }

    
    public function createNewRole(StoreRoleRequest $request)
    {
        $role = new Role();
        $role->name = $request->name;
        $role->slug = Str::slug($request->name);
        $role->save();
        return $role;
    }


    public function updateRole(UpdateRoleRequest $request, string $slug)
    {
        $role = $this->getRole($slug);
        $role->name = $request->name;
        $role->slug = Str::slug($request->name);
        $role->save();
        return $role;
    }


    public function getRole(string $slug)
    {
        return Role::where('slug', $slug)->firstOrFail();
    }




    public function destroyRole(string $slug)
    {
        $role = $this->getRole($slug);
        $role->delete();
        return true;
    }
}
