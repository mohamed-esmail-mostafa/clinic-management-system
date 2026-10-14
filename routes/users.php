<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(UserController::class)->group(function () {
        Route::get('/auth/profile', 'profile')->name('auth.profile');
        Route::post('/auth/profile', 'updateProfile')->name('auth.profile.update');

        Route::get('/clinic/{slug}/employees', 'employees_page')->name('employees.page');
        Route::post('/clinic/{slug}/employees', 'store_employee')->name('employees.store');
        Route::put('/clinic/{slug}/employees/{user}', 'update_employee')->name('employees.update');
        Route::delete('/clinic/{slug}/employees/{user}', 'destroy_employee')->name('employees.destroy');
    });
});
