<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\Translatable\HasTranslations;

class GalleryCountry extends Model
{
    use HasSlug, HasTranslations;

    public array $translatable = ['name'];

    protected $fillable = ['name', 'slug', 'position', 'is_active'];

    protected $casts = [
        'position' => 'integer',
        'is_active' => 'boolean',
    ];

    // The slug is used in shareable gallery URLs (?country=uganda), so keep it
    // stable when the name is edited later.
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom(fn ($m) => $m->getTranslation('name', 'en'))
            ->saveSlugsTo('slug')
            ->doNotGenerateSlugsOnUpdate();
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('position');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('position');
    }

    public function items(): HasMany
    {
        return $this->hasMany(GalleryItem::class);
    }
}
