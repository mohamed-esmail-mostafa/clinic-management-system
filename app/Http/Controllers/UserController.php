<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClinicUserRequest;
use App\Http\Requests\UpdateClinicUserRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use App\Services\ClinicService;
use App\Services\RoleService;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(
        protected UserService $user_service,
        protected ClinicService $clinic_service,
        protected RoleService $role_service
    ) {}

    public function profile(Request $request): Response
    {
        return Inertia::render('profile/index', [
            'user' => $request->user(),
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): RedirectResponse
    {
        $this->user_service->updateProfile($request->user(), $request->validated());

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    public function employees_page(string $slug): Response
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $employees = $this->clinic_service->getClinicEmployees($clinic);
        $roles = $this->role_service->getRolesForClinic();
        $allUsers = $this->user_service->getAllUsers();

        return Inertia::render('employees/index', [
            'clinic' => $clinic,
            'employees' => $employees,
            'roles' => $roles,
            'all_users' => $allUsers,
        ]);
    }

    public function store_employee(StoreClinicUserRequest $request, string $slug): RedirectResponse
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $data = $request->validated();
        $mode = $data['mode'] ?? 'new';
        $roleId = (int) $data['role_id'];

        if ($mode === 'new') {
            $user = $this->user_service->createUser([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'phone' => $data['phone'] ?? null,
                'role_id' => $roleId,
            ]);
            $userId = $user->id;
        } else {
            $userId = (int) $data['user_id'];
        }

        $this->clinic_service->addUserToClinic($clinic, $userId, $roleId);

        return redirect()->back()->with('success', 'Employee added successfully.');
    }

    public function update_employee(UpdateClinicUserRequest $request, string $slug, User $user): RedirectResponse
    {
        $clinic = $this->clinic_service->getClinic($slug);
        $data = $request->validated();

        $this->user_service->updateUser($user, $data);
        $this->clinic_service->updateClinicUserRole($clinic, $user->id, (int) $data['role_id']);

        return redirect()->back()->with('success', 'Employee updated successfully.');
    }

    public function destroy_employee(Request $request, string $slug, User $user): RedirectResponse
    {
        $clinic = $this->clinic_service->getClinic($slug);

        if ($request->user() && $request->user()->id === $user->id) {
            return redirect()->back()->with('error', 'You cannot remove yourself from the clinic.');
        }

        $this->clinic_service->removeUserFromClinic($clinic, $user->id);

        return redirect()->back()->with('success', 'Employee removed successfully.');
    }
}
