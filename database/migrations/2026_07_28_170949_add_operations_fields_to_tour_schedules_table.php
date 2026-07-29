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
        Schema::table('tour_schedules', function (Blueprint $table) {
            $table->string('guide_name')->nullable();
            $table->string('guide_phone')->nullable();
            $table->string('driver_name')->nullable();
            $table->string('hotel_name')->nullable();
            $table->string('hotel_address')->nullable();
            $table->string('emergency_contact')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_schedules', function (Blueprint $table) {
            $table->dropColumn([
                'guide_name', 'guide_phone', 'driver_name',
                'hotel_name', 'hotel_address', 'emergency_contact',
            ]);
        });
    }
};
