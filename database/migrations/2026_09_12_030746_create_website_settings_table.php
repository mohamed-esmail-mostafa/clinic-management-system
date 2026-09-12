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
        Schema::create('website_settings', function (Blueprint $table) {
            $table->id();
            $table->string('title_en')->nullable();
            $table->string('title_ar')->nullable();
            $table->longText('description_en')->nullable();
            $table->longText('description_ar')->nullable();
            $table->longText('keywords_en')->nullable();
            $table->longText('keywords_ar')->nullable();
            $table->longText('logo')->nullable();
            $table->longText('dark_logo')->nullable();
            $table->string('public_logo_id')->nullable();
            $table->string('public_dark_logo_id')->nullable();
            $table->longText('favicon')->nullable();
            $table->string('public_favicon_id')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->longText('address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('website_settings');
    }
};
