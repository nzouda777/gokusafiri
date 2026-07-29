<?php

namespace App\Filament\Admin\Resources\EmailAutomationResource\Pages;

use App\Filament\Admin\Resources\EmailAutomationResource;
use Carbon\Carbon;
use Filament\Resources\Pages\CreateRecord;

class CreateEmailAutomation extends CreateRecord
{
    protected static string $resource = EmailAutomationResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['recurring_day_of_month'] = ! empty($data['recurring_day_picker'])
            ? Carbon::parse($data['recurring_day_picker'])->day
            : null;
        unset($data['recurring_day_picker']);

        return $data;
    }
}
