<?php

namespace App\Filament\Admin\Resources\PaymentResource\Pages;

use App\Filament\Admin\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\Payment\PaymentManager;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewPayment extends ViewRecord
{
    protected static string $resource = PaymentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('refund')
                ->label('Refund Payment')
                ->icon('heroicon-o-arrow-uturn-left')
                ->color('warning')
                ->visible(fn () => $this->record->status === 'succeeded')
                ->requiresConfirmation()
                ->modalHeading('Confirm Refund')
                ->modalDescription(fn () => "Refund $" . number_format($this->record->amount / 100, 2) . " via {$this->record->provider}?")
                ->action(function () {
                    /** @var Payment $payment */
                    $payment = $this->record;
                    $manager = app(PaymentManager::class)->driver($payment->provider);
                    $result = $manager->refund($payment);
                    if ($result->success) {
                        $payment->update(['status' => 'refunded']);
                        $this->refreshFormData(['status']);
                        Notification::make()->title('Refund processed successfully')->success()->send();
                    } else {
                        Notification::make()
                            ->title('Refund failed')
                            ->body($result->errorMessage)
                            ->danger()->send();
                    }
                }),
        ];
    }
}
