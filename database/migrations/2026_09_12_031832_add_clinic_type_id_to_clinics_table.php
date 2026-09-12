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
        Schema::table('clinics', function (Blueprint $table) {
            if (! Schema::hasColumn('clinics', 'clinic_type_id')) {
                $table->foreignId('clinic_type_id')->nullable()->after('city_id')->constrained('clinic_types')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clinics', function (Blueprint $table) {
            if (Schema::hasColumn('clinics', 'clinic_type_id')) {
                $table->dropForeign(['clinic_type_id']);
                $table->dropColumn('clinic_type_id');
            }
        });
    }
};
