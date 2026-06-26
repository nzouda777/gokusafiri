<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\Translatable\HasTranslations;

class Tour extends Model implements HasMedia
{
    use HasFactory, HasSlug, HasTranslations, InteractsWithMedia, SoftDeletes;

    public array $translatable = ['title', 'excerpt', 'description', 'itinerary', 'included', 'excluded', 'inclusions', 'highlights'];

    protected $fillable = [
        'operator_id', 'destination_id', 'type', 'title', 'slug', 'excerpt', 'description',
        'itinerary', 'included', 'excluded', 'inclusions', 'highlights',
        'base_price', 'child_price', 'currency', 'duration_days', 'max_group_size', 'style',
        'lat', 'lng', 'cancellation_days', 'badge', 'discount_percent', 'status',
        'rating_cache', 'reviews_count_cache',
    ];

    protected $casts = [
        'itinerary' => 'array',
        'included' => 'array',
        'excluded' => 'array',
        'inclusions' => 'array',
        'highlights' => 'array',
        'base_price' => 'integer',
        'child_price' => 'integer',
        'duration_days' => 'integer',
        'max_group_size' => 'integer',
        'cancellation_days' => 'integer',
        'discount_percent' => 'integer',
        'rating_cache' => 'float',
        'reviews_count_cache' => 'integer',
    ];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()->generateSlugsFrom(fn ($m) => $m->getTranslation('title', 'en'))->saveSlugsTo('slug');
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(Operator::class);
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(TourSchedule::class);
    }

    public function bookings(): HasManyThrough
    {
        return $this->hasManyThrough(Booking::class, TourSchedule::class);
    }

    public function addons(): HasMany
    {
        return $this->hasMany(TourAddon::class)->orderBy('position');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeTours($query)
    {
        return $query->where('type', 'tour');
    }

    public function scopePackages($query)
    {
        return $query->where('type', 'package');
    }

    /** Return a translatable field that stores an array, always as a PHP array. */
    public function arr(string $field): array
    {
        $v = $this->$field;
        if (is_array($v)) return $v;
        if (is_string($v) && $v !== '') return json_decode($v, true) ?? [];
        return [];
    }

    public function price(): int
    {
        return $this->base_price;
    }

    public function cancellationDeadline(\DateTimeInterface $departureDate): \Carbon\Carbon
    {
        return \Carbon\Carbon::parse($departureDate)->subDays($this->cancellation_days);
    }

    public function isCancellationFree(\DateTimeInterface $departureDate): bool
    {
        return now()->lte($this->cancellationDeadline($departureDate));
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('gallery');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')->width(400)->height(300)->format('jpg')->nonQueued();
        $this->addMediaConversion('card')->width(800)->height(600)->format('jpg')->nonQueued();
        $this->addMediaConversion('hero')->width(1920)->height(1080)->format('jpg')->nonQueued();
    }
}
