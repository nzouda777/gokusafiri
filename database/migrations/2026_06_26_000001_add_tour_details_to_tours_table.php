<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table) {
            $table->unsignedTinyInteger('deposit_percent')->default(20)->after('cancellation_days');
            $table->string('difficulty', 20)->nullable()->after('deposit_percent');
            $table->unsignedSmallInteger('min_age')->nullable()->after('difficulty');
            $table->json('languages')->nullable()->after('min_age');
            $table->json('practical_info')->nullable()->after('languages');
        });
    }

    public function down(): void
    {
        Schema::table('tours', function (Blueprint $table) {
            $table->dropColumn(['deposit_percent', 'difficulty', 'min_age', 'languages', 'practical_info']);
        });
    }
};
