<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Services\RoleService;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function __construct(protected RoleService $role_service) {}

     public function index(){
        
        return Inertia::render('roles/index',[
            "roles"=>$this->role_service->getAllRoles()
        ]);
    }


    public function store(StoreRoleRequest $request){
        $this->role_service->createNewRole($request);
        return redirect()->back();
    }

    public function update(UpdateRoleRequest $request,string $slug){
        $this->role_service->updateRole($request,$slug);
        return redirect()->back();
    }

    public function get(string $slug){
        $this->role_service->getRole($slug);
        return redirect()->back();
    }

    public function destroy(string $slug){
        $this->role_service->destroyRole($slug);
        return redirect()->back();
    }
}
