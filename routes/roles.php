<?php


use App\Http\Controllers\RoleController;
use Illuminate\Support\Facades\Route;



Route::controller(RoleController::class)->group(function(){
    Route::get("/admin/roles/page",'index');
    Route::post("/admin/roles/store",'store');
});