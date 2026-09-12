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
        Schema::create('patient_field_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('patient_field_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->text('value')->nullable();
            $table->timestamps();

            $table->unique([
                'patient_id',
                'patient_field_id',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_field_values');
    }
};
