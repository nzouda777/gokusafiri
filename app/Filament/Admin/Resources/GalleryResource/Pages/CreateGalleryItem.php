<?php

namespace App\Filament\Admin\Resources\GalleryResource\Pages;

use App\Filament\Admin\Resources\GalleryResource;
use App\Models\GalleryItem;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class CreateGalleryItem extends CreateRecord
{
    protected static string $resource = GalleryResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        $paths = $data['files'] ?? [];
        $nextPosition = ((int) GalleryItem::max('position')) + 1;

        $record = null;

        foreach ($paths as $path) {
            $record = GalleryItem::create([
                'position'  => $nextPosition++,
                'is_active' => true,
            ]);

            $record->addMediaFromDisk($path, 'public')->toMediaCollection('file');

            Storage::disk('public')->delete($path);
        }

        return $record ?? new GalleryItem();
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
