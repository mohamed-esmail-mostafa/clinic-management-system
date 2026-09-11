<?php

use App\Http\Controllers\ClinicController;
use Illuminate\Support\Facades\Route;



Route::controller(ClinicController::class)->group(function(){
    Route::get("/create/clinic/page",'create_clinic_page');
    Route::post("/store/clinic",'store_clinic');
    Route::get("/clinic/overview",'clinic_dashboard');
    Route::get("/admin/clinics",'index');
});