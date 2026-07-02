<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\BookingResource\Pages;
use App\Models\Booking;
use App\Models\TourSchedule;
use App\States\Booking\Cancelled;
use App\States\Booking\Completed;
use App\States\Booking\Confirmed;
use Filament\Forms;
use Filament\Infolists;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\DB;

class BookingResource extends Resource
{
    protected static ?string $model = Booking::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-calendar-days';
    protected static string|\UnitEnum|null $navigationGroup = 'Bookings';
    protected static ?int $navigationSort = 1;
    protected static ?string $label = 'Booking';
    protected static ?string $pluralLabel = 'Bookings';

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Section::make('Trip Selection')->schema([
                Forms\Components\Select::make('tour_schedule_id')
                    ->label('Tour / Departure')
                    ->options(fn () =>
                        TourSchedule::with('tour')
                            ->where('starts_at', '>=', now())
                            ->orderBy('starts_at')
                            ->get()
                            ->mapWithKeys(fn (TourSchedule $s) => [
                                $s->id => $s->tour->getTranslation('title', 'en')
                                    . '  ' . $s->starts_at->format('d M Y')
                                    . ' ($' . number_format($s->effectivePrice() / 100, 0) . '/pp'
                                    . ', ' . $s->seats_left . ' seats)',
                            ])
                    )
                    ->searchable()
                    ->required()
                    ->live(),
                Forms\Components\Select::make('user_id')
                    ->label('Registered User (optional)')
                    ->relationship('user', 'email')
                    ->searchable()->preload()->nullable()
                    ->helperText('Link to an existing account, or leave empty for a guest booking.'),
                Forms\Components\Select::make('payment_plan')
                    ->label('Payment Plan')
                    ->options(['full' => 'Full Payment', 'deposit' => 'Deposit (20%)'])
                    ->required()->default('full'),
                Forms\Components\Select::make('locale')
                    ->label('Language')
                    ->options(['en' => 'English', 'fr' => 'French', 'es' => 'Spanish'])
                    ->default('en')->required(),
            ])->columns(2),

            Schemas\Components\Section::make('Lead Traveler')->schema([
                Forms\Components\TextInput::make('lead_first_name')
                    ->label('First Name')->required()->maxLength(100),
                Forms\Components\TextInput::make('lead_last_name')
                    ->label('Last Name')->required()->maxLength(100),
                Forms\Components\TextInput::make('lead_email')
                    ->label('Email')->email()->required()->maxLength(255),
                Forms\Components\TextInput::make('lead_phone')
                    ->label('Phone')->tel()->maxLength(30),
            ])->columns(2),

            Schemas\Components\Section::make('Group Composition')->schema([
                Forms\Components\TextInput::make('adults')
                    ->label('Adults')->numeric()->required()->default(1)->minValue(1)->maxValue(50)
                    ->live(debounce: 300),
                Forms\Components\TextInput::make('children')
                    ->label('Children (2–11 yrs)')->numeric()->default(0)->minValue(0)->maxValue(20)
                    ->live(debounce: 300),
                Forms\Components\TextInput::make('infants')
                    ->label('Infants (under 2, free)')->numeric()->default(0)->minValue(0)->maxValue(5),
            ])->columns(3),

            Schemas\Components\Section::make('Booking Notes')->schema([
                Forms\Components\Textarea::make('notes')
                    ->label('Internal Notes')->rows(3)->nullable()
                    ->helperText('Not visible to the customer.')
                    ->dehydrated(false),
            ])->collapsed(),
        ]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Section::make('Booking')->schema([
                Infolists\Components\TextEntry::make('reference')
                    ->badge()->color('primary')->copyable(),
                Infolists\Components\TextEntry::make('status')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match ((string) $state) {
                        'pending'      => 'Pending',
                        'deposit_paid' => 'Deposit Paid',
                        'paid'         => 'Paid',
                        'confirmed'    => 'Confirmed',
                        'completed'    => 'Completed',
                        'cancelled'    => 'Cancelled',
                        'refunded'     => 'Refunded',
                        'expired'      => 'Expired',
                        default        => (string) $state,
                    })
                    ->color(fn ($state) => match ((string) $state) {
                        'confirmed', 'completed', 'paid' => 'success',
                        'pending', 'deposit_paid'        => 'warning',
                        default                         => 'danger',
                    }),
                Infolists\Components\TextEntry::make('schedule.tour.title')
                    ->label('Tour')
                    ->formatStateUsing(fn ($state, $record) => $record->schedule?->tour?->getTranslation('title', 'en')),
                Infolists\Components\TextEntry::make('schedule.starts_at')->label('Departure')->date(),
                Infolists\Components\TextEntry::make('schedule.ends_at')->label('Return')->date(),
                Infolists\Components\TextEntry::make('payment_plan')->label('Payment Plan')->badge(),
                Infolists\Components\TextEntry::make('locale')->label('Language')->badge(),
                Infolists\Components\TextEntry::make('created_at')->label('Created At')->dateTime(),
                Infolists\Components\TextEntry::make('confirmed_at')->label('Confirmed At')->dateTime(),
                Infolists\Components\TextEntry::make('expires_at')->label('Expires At')->dateTime(),
            ])->columns(3),

            Schemas\Components\Section::make('Lead Traveler')->schema([
                Infolists\Components\TextEntry::make('lead_first_name')->label('First Name'),
                Infolists\Components\TextEntry::make('lead_last_name')->label('Last Name'),
                Infolists\Components\TextEntry::make('lead_email')->label('Email')->copyable(),
                Infolists\Components\TextEntry::make('lead_phone')->label('Phone'),
                Infolists\Components\TextEntry::make('adults')->label('Adults'),
                Infolists\Components\TextEntry::make('children')->label('Children'),
                Infolists\Components\TextEntry::make('infants')->label('Infants'),
            ])->columns(4),

            Schemas\Components\Section::make('Pricing')->schema([
                Infolists\Components\TextEntry::make('subtotal')
                    ->label('Subtotal')
                    ->formatStateUsing(fn ($state) => '$' . number_format($state / 100, 2)),
                Infolists\Components\TextEntry::make('member_discount')
                    ->label('Member Discount')
                    ->formatStateUsing(fn ($state) => '-$' . number_format($state / 100, 2)),
                Infolists\Components\TextEntry::make('taxes_fees')
                    ->label('Taxes & Fees')
                    ->formatStateUsing(fn ($state) => '$' . number_format($state / 100, 2)),
                Infolists\Components\TextEntry::make('total')
                    ->label('Total')
                    ->formatStateUsing(fn ($state) => '$' . number_format($state / 100, 2))
                    ->weight(\Filament\Support\Enums\FontWeight::Bold),
                Infolists\Components\TextEntry::make('deposit_amount')
                    ->label('Deposit Amount')
                    ->formatStateUsing(fn ($state) => '$' . number_format($state / 100, 2)),
                Infolists\Components\TextEntry::make('balance_due_at')->label('Balance Due')->date(),
            ])->columns(3),

            Schemas\Components\Section::make('Travelers')->schema([
                Infolists\Components\RepeatableEntry::make('travelers')->label('')
                    ->schema([
                        Infolists\Components\TextEntry::make('type')->badge()->label('Type'),
                        Infolists\Components\TextEntry::make('first_name')->label('First Name'),
                        Infolists\Components\TextEntry::make('last_name')->label('Last Name'),
                        Infolists\Components\TextEntry::make('date_of_birth')->label('DOB')->date(),
                        Infolists\Components\TextEntry::make('country')->label('Country'),
                    ])
                    ->columns(5)->columnSpanFull(),
            ]),

            Schemas\Components\Section::make('Payments')->schema([
                Infolists\Components\RepeatableEntry::make('payments')->label('')
                    ->schema([
                        Infolists\Components\TextEntry::make('type')->badge()->label('Type'),
                        Infolists\Components\TextEntry::make('provider')->label('Provider'),
                        Infolists\Components\TextEntry::make('amount')
                            ->label('Amount')
                            ->formatStateUsing(fn ($state) => '$' . number_format($state / 100, 2)),
                        Infolists\Components\TextEntry::make('status')
                            ->badge()
                            ->color(fn ($state) => match ($state) {
                                'succeeded' => 'success',
                                'failed'    => 'danger',
                                'refunded'  => 'warning',
                                default     => 'gray',
                            }),
                        Infolists\Components\TextEntry::make('provider_reference')->copyable(),
                        Infolists\Components\TextEntry::make('paid_at')->dateTime(),
                    ])
                    ->columns(6)->columnSpanFull(),
            ])->collapsed(),
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
                    )
                    ->searchable(['lead_first_name', 'lead_last_name', 'lead_email']),
                Tables\Columns\TextColumn::make('schedule.tour.title')
                    ->label('Tour')
                    ->getStateUsing(fn (Booking $record) => $record->schedule?->tour?->getTranslation('title', 'en'))
                    ->limit(30)->sortable(),
                Tables\Columns\TextColumn::make('schedule.starts_at')
                    ->label('Departure')->date()->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match ((string) $state) {
                        'pending'      => 'Pending',
                        'deposit_paid' => 'Deposit Paid',
                        'paid'         => 'Paid',
                        'confirmed'    => 'Confirmed',
                        'completed'    => 'Completed',
                        'cancelled'    => 'Cancelled',
                        'refunded'     => 'Refunded',
                        'expired'      => 'Expired',
                        default        => (string) $state,
                    })
                    ->color(fn ($state) => match ((string) $state) {
                        'confirmed', 'completed', 'paid'   => 'success',
                        'pending', 'deposit_paid'           => 'warning',
                        'cancelled', 'expired', 'refunded' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('total')
                    ->label('Total')
                    ->formatStateUsing(fn ($state) => '$' . number_format($state / 100, 2))
                    ->sortable(),
                Tables\Columns\TextColumn::make('payment_plan')->badge()->label('Plan'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending'      => 'Pending',
                        'deposit_paid' => 'Deposit Paid',
                        'paid'         => 'Paid',
                        'confirmed'    => 'Confirmed',
                        'completed'    => 'Completed',
                        'cancelled'    => 'Cancelled',
                        'refunded'     => 'Refunded',
                        'expired'      => 'Expired',
                    ]),
                Tables\Filters\SelectFilter::make('payment_plan')
                    ->label('Payment Plan')
                    ->options(['full' => 'Full Payment', 'deposit' => 'Deposit']),
                Tables\Filters\Filter::make('date_range')
                    ->label('Creation Period')
                    ->form([
                        Forms\Components\DatePicker::make('from')->label('From'),
                        Forms\Components\DatePicker::make('until')->label('Until'),
                    ])
                    ->query(fn ($query, array $data) => $query
                        ->when($data['from'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
                        ->when($data['until'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '<=', $v))),
            ])
            ->actions([
                \Filament\Actions\ViewAction::make(),
                \Filament\Actions\Action::make('confirm')
                    ->label('Confirm')->icon('heroicon-o-check-circle')->color('success')
                    ->visible(fn (Booking $record) => in_array((string) $record->status, ['pending', 'deposit_paid', 'paid']))
                    ->requiresConfirmation()
                    ->action(function (Booking $record) {
                        $record->status->transitionTo(Confirmed::class);
                        $record->confirmed_at = now();
                        $record->save();
                        Notification::make()->title('Booking confirmed')->success()->send();
                    }),
                \Filament\Actions\Action::make('complete')
                    ->label('Mark Completed')->icon('heroicon-o-check-badge')->color('info')
                    ->visible(fn (Booking $record) => (string) $record->status === 'confirmed')
                    ->requiresConfirmation()
                    ->action(function (Booking $record) {
                        $record->status->transitionTo(Completed::class);
                        $record->save();
                        Notification::make()->title('Booking completed')->success()->send();
                    }),
                \Filament\Actions\Action::make('cancel')
                    ->label('Cancel')->icon('heroicon-o-x-circle')->color('danger')
                    ->visible(fn (Booking $record) => in_array((string) $record->status, ['pending', 'deposit_paid', 'confirmed']))
                    ->requiresConfirmation()
                    ->modalHeading('Cancel Booking')
                    ->modalDescription('Seats will be returned to the schedule. This cannot be undone.')
                    ->action(function (Booking $record) {
                        $record->status->transitionTo(Cancelled::class);
                        $record->save();
                        DB::transaction(function () use ($record) {
                            $schedule = $record->schedule()->lockForUpdate()->first();
                            if ($schedule) {
                                $schedule->increment('seats_left', $record->totalPax());
                            }
                        });
                        Notification::make()->title('Booking cancelled')->warning()->send();
                    }),
            ])
            ->bulkActions([
                \Filament\Actions\BulkActionGroup::make([
                    \Filament\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListBookings::route('/'),
            'create' => Pages\CreateBooking::route('/create'),
            'view'   => Pages\ViewBooking::route('/{record}'),
        ];
    }
}
