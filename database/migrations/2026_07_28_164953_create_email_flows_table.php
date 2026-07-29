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
        Schema::create('email_flows', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->default('other');
            $table->string('audience')->default('all_subscribers');
            $table->json('subject');
            $table->json('body');
            $table->string('cta_label')->nullable();
            $table->string('cta_url')->nullable();
            $table->string('discount_code')->nullable();
            $table->string('status')->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->unsignedInteger('recipients_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_flows');
    }
};
