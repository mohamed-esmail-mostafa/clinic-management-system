<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('home/index');
})->name('home');

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::inertia('dashboard', 'dashboard')->name('dashboard');
// });

require __DIR__.'/settings.php';
require __DIR__.'/clinics.php';
require __DIR__.'/roles.php';
require __DIR__.'/countries.php';
require __DIR__.'/governorates.php';
require __DIR__.'/cities.php';
require __DIR__.'/specialties.php';
require __DIR__.'/redirect.php';
require __DIR__.'/patients.php';
require __DIR__.'/medications.php';
require __DIR__.'/visits.php';

Route::get('/admin/dashboard', function () {
    return Inertia::render('admin/index');
});
