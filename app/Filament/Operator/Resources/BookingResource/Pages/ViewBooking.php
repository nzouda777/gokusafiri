<?php

namespace App\Filament\Operator\Resources\BookingResource\Pages;

use App\Filament\Operator\Resources\BookingResource;
use App\Models\Booking;
use App\States\Booking\Completed;
use App\States\Booking\Confirmed;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewBooking extends ViewRecord
{
    protected static string $resource = BookingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('checkin')
                ->label('Record Check-In')
                ->icon('heroicon-o-check-badge')
                ->color('success')
                ->visible(fn () => $this->record->status instanceof Confirmed)
                ->requiresConfirmation()
                ->action(function () {
                    /** @var Booking $booking */
                    $booking = $this->record;
                    $booking->status->transitionTo(Completed::class);
                    $booking->save();
                    $this->refreshFormData(['status']);
                    Notification::make()->title('Check-in recorded')->success()->send();
                }),
        ];
    }
}
