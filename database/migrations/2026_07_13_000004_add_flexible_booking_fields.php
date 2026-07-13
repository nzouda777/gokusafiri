<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table) {
            $table->boolean('flexible_dates')->default(true)->after('duration_days');
        });

        Schema::table('tour_schedules', function (Blueprint $table) {
            $table->boolean('is_custom')->default(false)->after('price_override');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->string('departure_time', 5)->nullable()->after('tour_schedule_id');
        });
    }

    public function down(): void
    {
        Schema::table('tours', function (Blueprint $table) {
            $table->dropColumn('flexible_dates');
        });

        Schema::table('tour_schedules', function (Blueprint $table) {
            $table->dropColumn('is_custom');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('departure_time');
        });
    }
};
