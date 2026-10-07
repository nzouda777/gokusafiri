<?php

namespace App\Filament\Admin\Resources\GalleryCountryResource\Pages;

use App\Filament\Admin\Resources\GalleryCountryResource;
use Filament\Resources\Pages\CreateRecord;

class CreateGalleryCountry extends CreateRecord
{
    protected static string $resource = GalleryCountryResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
