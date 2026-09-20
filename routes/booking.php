<?php

use App\Http\Controllers\BookingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::controller(BookingController::class)->group(function () {
        Route::get('/clinic/{slug}/booking', 'index')->name('clinics.booking');
        Route::get('/clinic/{slug}/today/booking', 'today_bookings')->name('clinics.today.booking');
        Route::post('/clinic/{slug}/booking', 'store')->name('clinics.booking.store');
        Route::put('/clinic/{slug}/booking/{booking}', 'update')->name('clinics.booking.update');
        Route::patch('/clinic/{slug}/booking/{booking}/status', 'updateStatus')->name('clinics.booking.update-status');
        Route::delete('/clinic/{slug}/booking/{booking}', 'destroy')->name('clinics.booking.destroy');
    });
});
