<?php

namespace App\Filament\Admin\Resources\GalleryCountryResource\Pages;

use App\Filament\Admin\Resources\GalleryCountryResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListGalleryCountries extends ListRecords
{
    protected static string $resource = GalleryCountryResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
