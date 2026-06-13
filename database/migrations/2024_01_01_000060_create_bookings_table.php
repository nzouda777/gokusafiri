<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 10)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('tour_schedule_id')->constrained()->restrictOnDelete();
            $table->string('lead_first_name');
            $table->string('lead_last_name');
            $table->string('lead_email');
            $table->string('lead_phone', 30)->nullable();
            $table->unsignedSmallInteger('adults')->default(1);
            $table->unsignedSmallInteger('children')->default(0);
            $table->unsignedSmallInteger('infants')->default(0);
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('member_discount')->default(0);
            $table->unsignedBigInteger('taxes_fees')->default(0);
            $table->unsignedBigInteger('total');
            $table->string('currency', 3)->default('USD');
            $table->string('payment_plan')->default('full');
            $table->unsignedBigInteger('deposit_amount')->default(0);
            $table->timestamp('balance_due_at')->nullable();
            $table->string('status')->default('pending');
            $table->string('locale', 5)->default('en');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'expires_at']);
            $table->index(['lead_email', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
