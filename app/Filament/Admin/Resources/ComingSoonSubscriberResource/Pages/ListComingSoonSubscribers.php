<?php

namespace App\Filament\Admin\Resources\ComingSoonSubscriberResource\Pages;

use App\Filament\Admin\Resources\ComingSoonSubscriberResource;
use App\Mail\ComingSoonLaunchNotification;
use App\Models\ComingSoonSubscriber;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Support\Facades\Mail;

class ListComingSoonSubscribers extends ListRecords
{
    protected static string $resource = ComingSoonSubscriberResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('send_all')
                ->label('Send to all subscribers')
                ->icon('heroicon-o-megaphone')
                ->color('primary')
                ->requiresConfirmation()
                ->modalHeading('Send launch email to all subscribers')
                ->modalDescription(fn () => ComingSoonSubscriber::count() . ' subscribers will receive this email.')
                ->modalSubmitActionLabel('Send to all')
                ->form(ComingSoonSubscriberResource::emailForm())
                ->action(function (array $data): void {
                    $count = 0;

                    ComingSoonSubscriber::each(function (ComingSoonSubscriber $subscriber) use ($data, &$count): void {
                        Mail::to($subscriber->email)->queue(
                            new ComingSoonLaunchNotification(
                                emailSubject: $data['subject'],
                                body:         $data['body'],
                                ctaLabel:     $data['cta_label'],
                                ctaUrl:       $data['cta_url'],
                            )
                        );
                        $count++;
                    });

                    Notification::make()
                        ->title("{$count} emails queued successfully")
                        ->success()
                        ->send();
                }),
        ];
    }
}
