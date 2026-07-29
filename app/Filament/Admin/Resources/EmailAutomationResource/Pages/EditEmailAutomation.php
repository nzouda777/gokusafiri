<?php

namespace App\Filament\Admin\Resources\EmailAutomationResource\Pages;

use App\Filament\Admin\Resources\EmailAutomationResource;
use Carbon\Carbon;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditEmailAutomation extends EditRecord
{
    protected static string $resource = EmailAutomationResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        if (! empty($data['recurring_day_of_month'])) {
            $data['recurring_day_picker'] = now()->startOfMonth()
                ->addDays(((int) $data['recurring_day_of_month']) - 1)
                ->toDateString();
        }

        return $data;
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $data['recurring_day_of_month'] = ! empty($data['recurring_day_picker'])
            ? Carbon::parse($data['recurring_day_picker'])->day
            : null;
        unset($data['recurring_day_picker']);

        return $data;
    }
}
