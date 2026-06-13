<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\PaymentResource\Pages;
use App\Models\Payment;
use App\Services\Payment\PaymentManager;
use Filament\Forms;
use Filament\Infolists;
use Filament\Schemas\Schema;
use Filament\Schemas;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PaymentResource extends Resource
{
    protected static ?string $model = Payment::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-credit-card';
    protected static string|\UnitEnum|null $navigationGroup = 'Bookings';
    protected static ?int $navigationSort = 2;
    protected static ?string $label = 'Payment';
    protected static ?string $pluralLabel = 'Payments';

    public static function infolist(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Section::make('Payment Details')->schema([
                Infolists\Components\TextEntry::make('booking.reference')
                    ->label('Booking')->badge()->color('primary'),
                Infolists\Components\TextEntry::make('type')
                    ->label('Type')->badge()
                    ->color(fn ($state) => match ($state) {
                        'full'    => 'success',
                        'deposit' => 'info',
                        'balance' => 'warning',
                        default   => 'gray',
                    }),
                Infolists\Components\TextEntry::make('provider')->label('Provider'),
                Infolists\Components\TextEntry::make('provider_reference')
                    ->label('Provider Reference')->copyable(),
                Infolists\Components\TextEntry::make('amount')
                    ->label('Amount')
                    ->formatStateUsing(fn ($state) => '$' . number_format($state / 100, 2))
                    ->weight(\Filament\Support\Enums\FontWeight::Bold),
                Infolists\Components\TextEntry::make('currency')->label('Currency'),
                Infolists\Components\TextEntry::make('status')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'succeeded' => 'success',
                        'failed'    => 'danger',
                        'refunded'  => 'warning',
                        default     => 'gray',
                    })
                    ->label('Status'),
                Infolists\Components\TextEntry::make('idempotency_key')
                    ->label('Idempotency Key')->copyable(),
                Infolists\Components\TextEntry::make('paid_at')->label('Paid At')->dateTime(),
                Infolists\Components\TextEntry::make('created_at')->label('Created At')->dateTime(),
            ])->columns(3),

            Schemas\Components\Section::make('Raw Payload')->schema([
                Infolists\Components\KeyValueEntry::make('payload')
                    ->label('')->columnSpanFull(),
            ])->collapsed(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('booking.reference')
                    ->label('Booking')->badge()->color('primary')
                    ->searchable()->copyable(),
                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'full'    => 'success',
                        'deposit' => 'info',
                        'balance' => 'warning',
                        default   => 'gray',
                    })
                    ->label('Type'),
                Tables\Columns\TextColumn::make('provider')->label('Provider'),
                Tables\Columns\TextColumn::make('amount')
                    ->label('Amount')
                    ->formatStateUsing(fn ($state) => '$' . number_format($state / 100, 2))
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'succeeded' => 'success',
                        'failed'    => 'danger',
                        'refunded'  => 'warning',
                        default     => 'gray',
                    })
                    ->label('Status'),
                Tables\Columns\TextColumn::make('provider_reference')
                    ->label('Reference')->copyable()->toggleable(),
                Tables\Columns\TextColumn::make('paid_at')
                    ->label('Paid At')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'processing' => 'Processing',
                        'succeeded'  => 'Succeeded',
                        'failed'     => 'Failed',
                        'refunded'   => 'Refunded',
                    ]),
                Tables\Filters\SelectFilter::make('type')
                    ->options(['full' => 'Full', 'deposit' => 'Deposit', 'balance' => 'Balance']),
                Tables\Filters\SelectFilter::make('provider')
                    ->options(fn () => Payment::distinct()->pluck('provider', 'provider')->toArray()),
                Tables\Filters\Filter::make('paid_at')
                    ->label('Payment Period')
                    ->form([
                        Forms\Components\DatePicker::make('from')->label('From'),
                        Forms\Components\DatePicker::make('until')->label('Until'),
                    ])
                    ->query(fn ($query, array $data) => $query
                        ->when($data['from'] ?? null, fn ($q, $v) => $q->whereDate('paid_at', '>=', $v))
                        ->when($data['until'] ?? null, fn ($q, $v) => $q->whereDate('paid_at', '<=', $v))),
            ])
            ->actions([
                \Filament\Actions\ViewAction::make(),
                \Filament\Actions\Action::make('refund')
                    ->label('Refund')
                    ->icon('heroicon-o-arrow-uturn-left')
                    ->color('warning')
                    ->visible(fn (Payment $record) => $record->status === 'succeeded')
                    ->requiresConfirmation()
                    ->modalHeading('Confirm Refund')
                    ->modalDescription(
                        fn (Payment $record) => "Refund $" . number_format($record->amount / 100, 2) . " via {$record->provider}?"
                    )
                    ->action(function (Payment $record) {
                        $manager = app(PaymentManager::class)->driver($record->provider);
                        $result = $manager->refund($record);
                        if ($result->success) {
                            $record->update(['status' => 'refunded']);
                            Notification::make()->title('Refund processed successfully')->success()->send();
                        } else {
                            Notification::make()
                                ->title('Refund failed')
                                ->body($result->errorMessage)
                                ->danger()
                                ->send();
                        }
                    }),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPayments::route('/'),
            'view'  => Pages\ViewPayment::route('/{record}'),
        ];
    }
}
