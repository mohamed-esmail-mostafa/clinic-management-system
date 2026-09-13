<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RedirectController extends Controller
{
    public function redirect()
    {
        $user = Auth::user();

        switch ($user->role?->slug ?? '') {
            case 'admin':
                return redirect()->route('admin.website-settings.index');
            case 'doctor':
                return redirect()->route('clinics.overview');
            case 'user':
                return redirect()->route('user.dashboard');
            default:
                return Inertia::render('dashboard');
        }
    }
}
