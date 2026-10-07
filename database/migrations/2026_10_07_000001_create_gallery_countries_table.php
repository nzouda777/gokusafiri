<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Starting set of countries. Admins can add more from Filament afterwards.
     */
    private const COUNTRIES = [
        'rwanda'       => ['en' => 'Rwanda',       'fr' => 'Rwanda',         'es' => 'Ruanda'],
        'uganda'       => ['en' => 'Uganda',       'fr' => 'Ouganda',        'es' => 'Uganda'],
        'kenya'        => ['en' => 'Kenya',        'fr' => 'Kenya',          'es' => 'Kenia'],
        'tanzania'     => ['en' => 'Tanzania',     'fr' => 'Tanzanie',       'es' => 'Tanzania'],
        'zambia'       => ['en' => 'Zambia',       'fr' => 'Zambie',         'es' => 'Zambia'],
        'south-africa' => ['en' => 'South Africa', 'fr' => 'Afrique du Sud', 'es' => 'Sudáfrica'],
        'morocco'      => ['en' => 'Morocco',      'fr' => 'Maroc',          'es' => 'Marruecos'],
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('gallery_countries', function (Blueprint $table) {
            $table->id();
            $table->json('name');
            $table->string('slug')->unique();
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        $now = now();
        $position = 1;
        foreach (self::COUNTRIES as $slug => $name) {
            DB::table('gallery_countries')->insert([
                'name'       => json_encode($name, JSON_UNESCAPED_UNICODE),
                'slug'       => $slug,
                'position'   => $position++,
                'is_active'  => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        Schema::table('gallery_items', function (Blueprint $table) {
            $table->foreignId('gallery_country_id')
                ->nullable()
                ->after('id')
                ->constrained('gallery_countries')
                ->restrictOnDelete();
        });

        // Every existing gallery item was shot in Rwanda.
        DB::table('gallery_items')->update([
            'gallery_country_id' => DB::table('gallery_countries')->where('slug', 'rwanda')->value('id'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gallery_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('gallery_country_id');
        });

        Schema::dropIfExists('gallery_countries');
    }
};
