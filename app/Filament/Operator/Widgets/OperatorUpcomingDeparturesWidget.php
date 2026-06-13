<?php

namespace App\Filament\Operator\Widgets;

use App\Models\Tour;
use App\Models\TourSchedule;
use Filament\Facades\Filament;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class OperatorUpcomingDeparturesWidget extends BaseWidget
{
    protected static ?string $heading = 'Upcoming Departures';
    protected static ?int $sort = 2;
    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        $operator = Filament::getTenant();
        $tourIds  = Tour::where('operator_id', $operator->id)->pluck('id');

        return $table
            ->query(
                TourSchedule::whereIn('tour_id', $tourIds)
                    ->where('starts_at', '>=', today())
                    ->withCount(['bookings as confirmed_pax' => fn ($q) => $q->whereNotIn('status', ['expired', 'cancelled'])])
                    ->orderBy('starts_at')
                    ->limit(10)
            )
            ->columns([
                Tables\Columns\TextColumn::make('starts_at')
                    ->label('Departure')
                    ->date('d M Y'),
                Tables\Columns\TextColumn::make('ends_at')
                    ->label('Return')
                    ->date('d M Y'),
                Tables\Columns\TextColumn::make('tour.title.en')
                    ->label('Tour')
                    ->limit(28),
                Tables\Columns\TextColumn::make('seats_left')
                    ->label('Seats Left')
                    ->badge()
                    ->color(fn (int $state) => $state === 0 ? 'danger' : ($state <= 3 ? 'warning' : 'success')),
                Tables\Columns\TextColumn::make('capacity')
                    ->label('Capacity'),
            ])
            ->paginated(false);
    }
}
