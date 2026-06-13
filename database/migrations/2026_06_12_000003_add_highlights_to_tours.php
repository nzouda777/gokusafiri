<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table) {
            $table->json('highlights')->nullable()->after('inclusions');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->string('author_name', 100)->nullable()->after('user_id');
            $table->string('author_avatar', 500)->nullable()->after('author_name');
        });
    }

    public function down(): void
    {
        Schema::table('tours', function (Blueprint $table) {
            $table->dropColumn('highlights');
        });
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn(['author_name', 'author_avatar']);
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
