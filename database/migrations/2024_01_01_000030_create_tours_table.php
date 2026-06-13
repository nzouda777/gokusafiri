<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('operator_id')->constrained()->cascadeOnDelete();
            $table->foreignId('destination_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('tour');
            $table->json('title');
            $table->string('slug')->unique();
            $table->json('excerpt')->nullable();
            $table->json('description')->nullable();
            $table->json('itinerary')->nullable();
            $table->json('included')->nullable();
            $table->json('excluded')->nullable();
            $table->json('inclusions')->nullable();
            $table->unsignedBigInteger('base_price');
            $table->string('currency', 3)->default('USD');
            $table->unsignedSmallInteger('duration_days');
            $table->unsignedSmallInteger('max_group_size')->default(20);
            $table->string('style');
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->unsignedSmallInteger('cancellation_days')->default(30);
            $table->string('badge')->nullable();
            $table->unsignedTinyInteger('discount_percent')->nullable();
            $table->string('status')->default('draft');
            $table->decimal('rating_cache', 3, 2)->default(0);
            $table->unsignedInteger('reviews_count_cache')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'type']);
            $table->index(['destination_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tours');
    }
};
