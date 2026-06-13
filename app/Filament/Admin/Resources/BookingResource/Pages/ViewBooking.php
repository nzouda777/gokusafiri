<?php

namespace App\Filament\Admin\Resources\BookingResource\Pages;

use App\Filament\Admin\Resources\BookingResource;
use App\Models\Booking;
use App\States\Booking\Cancelled;
use App\States\Booking\Completed;
use App\States\Booking\Confirmed;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\DB;

class ViewBooking extends ViewRecord
{
    protected static string $resource = BookingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('confirm')
                ->label('Confirm Booking')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->visible(fn () => in_array((string) $this->record->status, ['pending', 'deposit_paid', 'paid']))
                ->requiresConfirmation()
                ->action(function () {
                    /** @var Booking $booking */
                    $booking = $this->record;
                    $booking->status->transitionTo(Confirmed::class);
                    $booking->confirmed_at = now();
                    $booking->save();
                    $this->refreshFormData(['status', 'confirmed_at']);
                    Notification::make()->title('Booking confirmed')->success()->send();
                }),

            Actions\Action::make('complete')
                ->label('Mark as Completed')
                ->icon('heroicon-o-check-badge')
                ->color('info')
                ->visible(fn () => (string) $this->record->status === 'confirmed')
                ->requiresConfirmation()
                ->action(function () {
                    /** @var Booking $booking */
                    $booking = $this->record;
                    $booking->status->transitionTo(Completed::class);
                    $booking->save();
                    $this->refreshFormData(['status']);
                    Notification::make()->title('Booking completed')->success()->send();
                }),

            Actions\Action::make('cancel')
                ->label('Cancel Booking')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->visible(fn () => in_array((string) $this->record->status, ['pending', 'deposit_paid', 'confirmed']))
                ->requiresConfirmation()
                ->modalHeading('Cancel Booking')
                ->modalDescription('Seats will be returned to the schedule.')
                ->action(function () {
                    /** @var Booking $booking */
                    $booking = $this->record;
                    $booking->status->transitionTo(Cancelled::class);
                    $booking->save();
                    DB::transaction(function () use ($booking) {
                        $schedule = $booking->schedule()->lockForUpdate()->first();
                        if ($schedule) {
                            $schedule->increment('seats_left', $booking->totalPax());
                        }
                    });
                    $this->refreshFormData(['status']);
                    Notification::make()->title('Booking cancelled')->warning()->send();
                }),
        ];
    }
}
