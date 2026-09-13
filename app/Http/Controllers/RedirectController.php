<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

class RedirectController extends Controller
{
    public function redirect()
    {
        $user = Auth::user();

        switch ($user->role->slug) {
            case 'admin':
                return redirect()->route('admin.dashboard');
            case 'doctor':
                return redirect()->route('clinics.overview');
            case 'user':
                return redirect()->route('user.dashboard');
            default:
                return redirect()->route('login');
        }
    }
}
