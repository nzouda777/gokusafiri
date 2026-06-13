<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Direct tour FK so booking can exist before a schedule is picked
            $table->foreignId('tour_id')->nullable()->constrained()->nullOnDelete()->after('user_id');

            // Allow booking creation before the schedule is chosen (step 1)
            $table->unsignedBigInteger('tour_schedule_id')->nullable()->change();

            // Stripe fields for saving payment method (deposit → balance flow)
            $table->string('stripe_customer_id', 255)->nullable()->after('confirmed_at');
            $table->string('stripe_payment_method_id', 255)->nullable()->after('stripe_customer_id');

            // Free-text field from travelers form
            $table->text('special_request')->nullable()->after('locale');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['tour_id']);
            $table->dropColumn(['tour_id', 'stripe_customer_id', 'stripe_payment_method_id', 'special_request']);
            $table->unsignedBigInteger('tour_schedule_id')->nullable(false)->change();
        });
    }
};
