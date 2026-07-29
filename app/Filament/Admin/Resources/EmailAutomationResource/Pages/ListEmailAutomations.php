<?php

namespace App\Filament\Admin\Resources\EmailAutomationResource\Pages;

use App\Filament\Admin\Resources\EmailAutomationResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListEmailAutomations extends ListRecords
{
    protected static string $resource = EmailAutomationResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
