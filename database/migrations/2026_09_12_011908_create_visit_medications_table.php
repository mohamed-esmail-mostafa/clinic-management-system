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
        Schema::create('visit_medications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visit_id')
                ->constrained('visits')
                ->cascadeOnDelete();

            $table->foreignId('medication_id')
                ->nullable()
                ->constrained('medications')
                ->nullOnDelete();

            $table->string('medication_name');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visit_medications');
    }
};
