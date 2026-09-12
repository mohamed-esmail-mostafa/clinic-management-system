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
            $table->foreignId('clinic_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // Basic Information
            $table->string('patient_number')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('gender')->nullable(); // male, female, other
            $table->date('date_of_birth')->nullable();

            // Contact Information
            $table->string('phone')->nullable();
            $table->string('secondary_phone')->nullable();
            $table->text('address')->nullable();
            

    

            // Emergency Contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relation')->nullable();

            // Medical Information
            $table->string('blood_type')->nullable();
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
