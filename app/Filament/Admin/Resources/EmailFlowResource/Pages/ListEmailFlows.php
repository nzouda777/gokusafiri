<?php

namespace App\Filament\Admin\Resources\EmailFlowResource\Pages;

use App\Filament\Admin\Resources\EmailFlowResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListEmailFlows extends ListRecords
{
    protected static string $resource = EmailFlowResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
