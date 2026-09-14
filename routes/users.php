<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(UserController::class)->group(function () {
        Route::get('/auth/profile', 'profile')->name('auth.profile');
        Route::post('/auth/profile', 'updateProfile')->name('auth.profile.update');
    });
});
