<?php

namespace App\Filament\Operator\Resources\TourScheduleResource\Pages;

use App\Filament\Operator\Resources\TourScheduleResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditTourSchedule extends EditRecord
{
    protected static string $resource = TourScheduleResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
