<?php

namespace App\Services;

use App\Models\Clinic;

class ClinicService
{
   
    public function __construct(){}
    public function getAllClinics(){
        return Clinic::all();
    }
}
