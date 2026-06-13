<?php

namespace App\Filament\Admin\Widgets;

use App\Models\Booking;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentBookingsWidget extends BaseWidget
{
    protected static ?string $heading = 'Recent Bookings';
    protected static ?int $sort = 6;
    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        return $table
            ->query(Booking::with('schedule.tour')->latest()->limit(10))
            ->columns([
                Tables\Columns\TextColumn::make('reference')
                    ->badge()->color('primary')->copyable(),
                Tables\Columns\TextColumn::make('lead_first_name')
                    ->label('Customer')
                    ->formatStateUsing(fn ($state, Booking $record) => $record->lead_first_name . ' ' . $record->lead_last_name),
                Tables\Columns\TextColumn::make('schedule.tour.title.en')
                    ->label('Tour')
                    ->limit(22),
                Tables\Columns\TextColumn::make('total')
                    ->label('Total')
                    ->formatStateUsing(fn ($state) => '$' . number_format($state / 100, 0)),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn ($state) => ucfirst(str_replace('_', ' ', (string) $state)))
                    ->color(fn ($state) => match ((string) $state) {
                        'confirmed', 'paid', 'completed' => 'success',
                        'pending', 'deposit_paid'        => 'warning',
                        'cancelled', 'expired'           => 'danger',
                        default                          => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('At')
                    ->since()
                    ->tooltip(fn ($record) => $record->created_at->format('d M Y H:i')),
            ])
            ->actions([
                \Filament\Actions\ViewAction::make()
                    ->url(fn (Booking $record) => route('filament.admin.resources.bookings.view', $record)),
            ])
            ->paginated(false);
    }
}
