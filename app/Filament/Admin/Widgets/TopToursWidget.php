<?php

namespace App\Filament\Admin\Widgets;

use App\Models\Tour;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Support\Facades\DB;

class TopToursWidget extends BaseWidget
{
    protected static ?int $sort = 3;
    protected int|string|array $columnSpan = 'full';
    protected static ?string $heading = 'Top 5 Tours (by bookings)';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Tour::query()
                    ->withCount('bookings')
                    ->addSelect([
                        'tours.*',
                        DB::raw('(
                            SELECT COALESCE(SUM(p.amount), 0)
                            FROM payments p
                            INNER JOIN bookings b ON p.booking_id = b.id
                            INNER JOIN tour_schedules ts ON b.tour_schedule_id = ts.id
                            WHERE ts.tour_id = tours.id
                              AND p.status = \'succeeded\'
                        ) as revenue'),
                    ])
                    ->orderByDesc('bookings_count')
                    ->limit(5)
            )
            ->columns([
                Tables\Columns\TextColumn::make('title.en')
                    ->label('Tour')->limit(40),
                Tables\Columns\TextColumn::make('operator.name')
                    ->label('Operator'),
                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->color(fn ($state) => $state === 'package' ? 'info' : 'gray'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'published' => 'success',
                        'in_review' => 'warning',
                        default     => 'gray',
                    }),
                Tables\Columns\TextColumn::make('bookings_count')
                    ->label('Bookings')
                    ->badge()->color('primary'),
                Tables\Columns\TextColumn::make('revenue')
                    ->label('Total Revenue')
                    ->formatStateUsing(fn ($state) => '$' . number_format(($state ?? 0) / 100, 0)),
            ])
            ->paginated(false);
    }
}
