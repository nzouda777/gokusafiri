<?php

namespace App\Filament\Operator\Resources;

use App\Filament\Operator\Resources\BookingResource\Pages;
use App\Models\Booking;
use App\States\Booking\Completed;
use App\States\Booking\Confirmed;
use Filament\Schemas\Schema;
use Filament\Schemas;
use Filament\Infolists;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class BookingResource extends Resource
{
    protected static ?string $model = Booking::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-ticket';
    protected static ?string $label = 'Booking';
    protected static ?string $pluralLabel = 'Bookings';

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Section::make('Booking')->schema([
                Infolists\Components\TextEntry::make('reference')->badge()->color('primary'),
                Infolists\Components\TextEntry::make('status')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match ((string) $state) {
                        'pending'      => 'Pending',
                        'deposit_paid' => 'Deposit Paid',
                        'confirmed'    => 'Confirmed',
                        'completed'    => 'Completed',
                        'cancelled'    => 'Cancelled',
                        default        => (string) $state,
                    })
                    ->color(fn ($state) => match ((string) $state) {
                        'confirmed', 'completed' => 'success',
                        'pending', 'deposit_paid' => 'warning',
                        'cancelled', 'expired'   => 'danger',
                        default => 'gray',
                    }),
                Infolists\Components\TextEntry::make('schedule.starts_at')->label('Departure')->date(),
                Infolists\Components\TextEntry::make('schedule.ends_at')->label('Return')->date(),
                Infolists\Components\TextEntry::make('payment_plan')->label('Payment Plan')->badge(),
            ])->columns(3),

            Schemas\Components\Section::make('Customer')->schema([
                Infolists\Components\TextEntry::make('lead_first_name')->label('First Name'),
                Infolists\Components\TextEntry::make('lead_last_name')->label('Last Name'),
                Infolists\Components\TextEntry::make('lead_email')->label('Email')->copyable(),
                Infolists\Components\TextEntry::make('lead_phone')->label('Phone'),
                Infolists\Components\TextEntry::make('adults')->label('Adults'),
                Infolists\Components\TextEntry::make('children')->label('Children'),
                Infolists\Components\TextEntry::make('infants')->label('Infants'),
            ])->columns(4),

            Schemas\Components\Section::make('Travelers')->schema([
                Infolists\Components\RepeatableEntry::make('travelers')
                    ->label('')
                    ->schema([
                        Infolists\Components\TextEntry::make('type')->badge()->label('Type'),
                        Infolists\Components\TextEntry::make('first_name')->label('First Name'),
                        Infolists\Components\TextEntry::make('last_name')->label('Last Name'),
                        Infolists\Components\TextEntry::make('date_of_birth')->label('Date of Birth')->date(),
                        Infolists\Components\TextEntry::make('country')->label('Country'),
                    ])
                    ->columns(5)->columnSpanFull(),
            ]),

            Schemas\Components\Section::make('Amount')->schema([
                Infolists\Components\TextEntry::make('total')
                    ->label('Total')
                    ->formatStateUsing(fn ($state) => '$' . number_format($state / 100, 2))
                    ->weight(\Filament\Support\Enums\FontWeight::Bold),
                Infolists\Components\TextEntry::make('deposit_amount')
                    ->label('Deposit')
                    ->formatStateUsing(fn ($state) => '$' . number_format($state / 100, 2)),
                Infolists\Components\TextEntry::make('balance_due_at')
                    ->label('Balance Due Date')->date(),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('reference')
                    ->searchable()->badge()->color('primary')->copyable(),
                Tables\Columns\TextColumn::make('lead_first_name')
                    ->label('Customer')
                    ->formatStateUsing(
                        fn ($state, Booking $record) => "{$record->lead_first_name} {$record->lead_last_name}"
                    ),
                Tables\Columns\TextColumn::make('schedule.tour.title.en')
                    ->label('Tour')->limit(25),
                Tables\Columns\TextColumn::make('lead_email')
                    ->label('Email')->searchable()->toggleable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match ((string) $state) {
                        'pending'      => 'Pending',
                        'deposit_paid' => 'Deposit Paid',
                        'confirmed'    => 'Confirmed',
                        'completed'    => 'Completed',
                        'cancelled'    => 'Cancelled',
                        default        => (string) $state,
                    })
                    ->color(fn ($state) => match ((string) $state) {
                        'confirmed', 'completed' => 'success',
                        'cancelled', 'expired'   => 'danger',
                        'deposit_paid'           => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('schedule.starts_at')
                    ->label('Departure')->date()->sortable(),
                Tables\Columns\TextColumn::make('total')
                    ->label('Total')
                    ->formatStateUsing(fn ($state) => '$' . number_format($state / 100, 2)),
                Tables\Columns\TextColumn::make('payment_plan')->badge()->label('Plan'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending'      => 'Pending',
                        'confirmed'    => 'Confirmed',
                        'deposit_paid' => 'Deposit Paid',
                        'completed'    => 'Completed',
                        'cancelled'    => 'Cancelled',
                    ]),
            ])
            ->actions([
                \Filament\Actions\ViewAction::make(),
                \Filament\Actions\Action::make('checkin')
                    ->label('Check In')
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->visible(fn (Booking $record) => $record->status instanceof Confirmed)
                    ->requiresConfirmation()
                    ->action(function (Booking $record) {
                        $record->status->transitionTo(Completed::class);
                        $record->save();
                        Notification::make()->title('Check-in recorded')->success()->send();
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
            'index' => Pages\ListBookings::route('/'),
            'view'  => Pages\ViewBooking::route('/{record}'),
        ];
    }
}
