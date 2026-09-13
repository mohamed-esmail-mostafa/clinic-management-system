<?php

use App\Http\Controllers\RedirectController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(RedirectController::class)->group(function () {
        Route::get('/redirect', 'redirect')->name('dashboard');
    });
});
