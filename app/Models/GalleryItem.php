<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Translatable\HasTranslations;

class GalleryItem extends Model implements HasMedia
{
    use HasFactory, HasTranslations, InteractsWithMedia;

    public array $translatable = ['caption'];

    protected $fillable = ['caption', 'position', 'is_active'];

    protected $casts = [
        'position' => 'integer',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('position');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('file')
            ->singleFile()
            ->acceptsMimeTypes([
                'image/jpeg', 'image/png', 'image/webp', 'image/gif',
                'video/mp4', 'video/webm', 'video/quicktime',
            ]);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        if ($media && str_starts_with($media->mime_type ?? '', 'image/')) {
            $this->addMediaConversion('thumb')->width(500)->height(500)->format('jpg')->nonQueued();
        }
    }
}
