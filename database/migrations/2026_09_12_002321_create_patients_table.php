<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('patient_number')->unique();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('gender')->nullable(); // male, female, other
            $table->date('date_of_birth')->nullable();

            // Contact Information
            $table->string('phone')->nullable();
            $table->string('secondary_phone')->nullable();
            $table->string('email')->nullable();

            // Address
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();

            // Identification
            $table->string('national_id')->nullable()->unique();
            $table->string('passport_number')->nullable();

            // Emergency Contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relation')->nullable();

            // Medical Information
            $table->string('blood_type')->nullable();
            $table->text('allergies')->nullable();
            $table->text('chronic_diseases')->nullable();
            $table->text('medical_history')->nullable();
            $table->text('surgical_history')->nullable();
            $table->text('family_medical_history')->nullable();

            // Insurance
            $table->boolean('has_insurance')->default(false);
            $table->string('insurance_company')->nullable();
            $table->string('insurance_number')->nullable();
            $table->date('insurance_expiry_date')->nullable();

            // Clinic Information
            $table->foreignId('clinic_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Additional Information
            $table->text('notes')->nullable();
            $table->string('occupation')->nullable();
            $table->string('marital_status')->nullable();

            // Status
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
