<?php

namespace App\Filament\Admin\Resources\BookingResource\Pages;

use App\Filament\Admin\Resources\BookingResource;
use App\Models\TourSchedule;
use Filament\Resources\Pages\CreateRecord;

class CreateBooking extends CreateRecord
{
    protected static string $resource = BookingResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $schedule = TourSchedule::find($data['tour_schedule_id']);

        $paidPax = ($data['adults'] ?? 1) + ($data['children'] ?? 0);
        $subtotal = $schedule ? $schedule->effectivePrice() * $paidPax : 0;

        if ($data['payment_plan'] === 'deposit') {
            $depositAmount = (int) round($subtotal * 0.20);
        } else {
            $depositAmount = $subtotal;
        }

        $data['subtotal']        = $subtotal;
        $data['member_discount'] = 0;
        $data['taxes_fees']      = 0;
        $data['total']           = $subtotal;
        $data['deposit_amount']  = $depositAmount;
        $data['currency']        = 'USD';
        $data['status']          = 'confirmed';
        $data['confirmed_at']    = now();
        $data['expires_at']      = now()->addYear();
        $data['balance_due_at']  = $schedule?->starts_at?->subDays(30);

        return $data;
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->getRecord()]);
    }
}
