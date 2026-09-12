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
        Schema::create('patient_field_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_field_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('label');
            $table->string('value');

            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_field_options');
    }
};
