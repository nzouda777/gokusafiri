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
        Schema::create('email_automation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('email_automation_id')->constrained()->cascadeOnDelete();
            $table->string('subject_type');
            $table->unsignedBigInteger('subject_id');
            $table->string('period_key')->default('once');
            $table->timestamp('sent_at');

            $table->unique(['email_automation_id', 'subject_type', 'subject_id', 'period_key'], 'email_automation_logs_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_automation_logs');
    }
};
