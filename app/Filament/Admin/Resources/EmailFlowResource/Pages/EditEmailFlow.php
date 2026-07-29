<?php

namespace App\Filament\Admin\Resources\EmailFlowResource\Pages;

use App\Filament\Admin\Resources\EmailFlowResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditEmailFlow extends EditRecord
{
    protected static string $resource = EmailFlowResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
