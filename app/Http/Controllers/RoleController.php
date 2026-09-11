<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Services\RoleService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function __construct(protected RoleService $role_service) {}

    public function index(): Response
    {
        return Inertia::render('roles/index', [
            'roles' => $this->role_service->getAllRoles(),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $this->role_service->createNewRole($request->validated());

        return redirect()->back()->with('success', 'Role created successfully');
    }

    public function update(UpdateRoleRequest $request, string $slug): RedirectResponse
    {
        $this->role_service->updateRole($slug, $request->validated());

        return redirect()->back()->with('success', 'Role updated successfully');
    }

    public function destroy(string $slug): RedirectResponse
    {
        $this->role_service->destroyRole($slug);

        return redirect()->back()->with('success', 'Role deleted successfully');
    }
}
