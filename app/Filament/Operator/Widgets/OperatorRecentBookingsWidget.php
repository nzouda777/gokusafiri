<?php

namespace App\Filament\Operator\Widgets;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourSchedule;
use Filament\Facades\Filament;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class OperatorRecentBookingsWidget extends BaseWidget
{
    protected static ?string $heading = 'Recent Bookings';
    protected static ?int $sort = 3;
    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        $operator    = Filament::getTenant();
        $tourIds     = Tour::where('operator_id', $operator->id)->pluck('id');
        $scheduleIds = TourSchedule::whereIn('tour_id', $tourIds)->pluck('id');

        return $table
            ->query(
                Booking::whereIn('tour_schedule_id', $scheduleIds)
                    ->with('schedule.tour')
                    ->latest()
                    ->limit(10)
            )
            ->columns([
                Tables\Columns\TextColumn::make('reference')
                    ->badge()->color('primary'),
                Tables\Columns\TextColumn::make('lead_first_name')
                    ->label('Customer')
                    ->formatStateUsing(fn ($state, Booking $record) => $record->lead_first_name . ' ' . $record->lead_last_name),
                Tables\Columns\TextColumn::make('schedule.tour.title.en')
                    ->label('Tour')
                    ->limit(22),
                Tables\Columns\TextColumn::make('total')
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
                    ->since(),
            ])
            ->paginated(false);
    }
}
