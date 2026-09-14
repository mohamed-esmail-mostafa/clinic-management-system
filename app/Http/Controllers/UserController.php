<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(protected UserService $user_service) {}

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
}
