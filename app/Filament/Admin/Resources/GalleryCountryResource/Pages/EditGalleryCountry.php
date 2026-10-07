<?php

namespace App\Filament\Admin\Resources\GalleryCountryResource\Pages;

use App\Filament\Admin\Resources\GalleryCountryResource;
use App\Models\GalleryCountry;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditGalleryCountry extends EditRecord
{
    protected static string $resource = GalleryCountryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make()
                ->hidden(fn (GalleryCountry $record) => $record->items()->exists()),
        ];
    }
}
