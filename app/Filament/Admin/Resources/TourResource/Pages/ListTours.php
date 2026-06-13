<?php

namespace App\Filament\Admin\Resources\TourResource\Pages;

use App\Filament\Admin\Resources\TourResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListTours extends ListRecords
{
    protected static string $resource = TourResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
