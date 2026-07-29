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
        Schema::create('email_automations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->default('booking_journey');
            $table->string('trigger_event');
            $table->unsignedSmallInteger('offset_days')->default(0);
            $table->time('send_time')->default('09:00');
            $table->unsignedTinyInteger('recurring_day_of_month')->nullable();
            $table->string('audience')->nullable();
            $table->json('include_blocks')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('subject');
            $table->json('body');
            $table->string('cta_label')->nullable();
            $table->string('cta_url')->nullable();
            $table->string('discount_code')->nullable();
            $table->string('last_sent_period')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_automations');
    }
};
