<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tour_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_id')->constrained()->cascadeOnDelete();
            $table->date('starts_at');
            $table->date('ends_at');
            $table->unsignedSmallInteger('capacity');
            $table->unsignedSmallInteger('seats_left');
            $table->unsignedBigInteger('price_override')->nullable();
            $table->timestamps();

            $table->index(['tour_id', 'starts_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_schedules');
    }
};
