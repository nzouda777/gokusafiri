<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('lead_first_name')->nullable()->change();
            $table->string('lead_last_name')->nullable()->change();
            $table->string('lead_email')->nullable()->change();
            $table->unsignedBigInteger('subtotal')->default(0)->change();
            $table->unsignedBigInteger('total')->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('lead_first_name')->nullable(false)->change();
            $table->string('lead_last_name')->nullable(false)->change();
            $table->string('lead_email')->nullable(false)->change();
            $table->unsignedBigInteger('subtotal')->nullable(false)->change();
            $table->unsignedBigInteger('total')->nullable(false)->change();
        });
    }
};
