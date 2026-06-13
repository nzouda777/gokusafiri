<?php

namespace App\Filament\Admin\Widgets;

use App\Models\TourSchedule;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class UpcomingDeparturesWidget extends BaseWidget
{
    protected static ?string $heading = 'Upcoming Departures';
    protected static ?int $sort = 5;
    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        return $table
            ->query(
                TourSchedule::with(['tour.operator'])
                    ->where('starts_at', '>=', today())
                    ->orderBy('starts_at')
                    ->limit(10)
            )
            ->columns([
                Tables\Columns\TextColumn::make('starts_at')
                    ->label('Date')
                    ->date('d M Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('tour.title.en')
                    ->label('Tour')
                    ->limit(28)
                    ->tooltip(fn ($record) => $record->tour?->title['en'] ?? ''),
                Tables\Columns\TextColumn::make('tour.operator.name')
                    ->label('Operator')
                    ->limit(16),
                Tables\Columns\TextColumn::make('seats_left')
                    ->label('Available')
                    ->badge()
                    ->color(fn (int $state) => $state === 0 ? 'danger' : ($state <= 3 ? 'warning' : 'success')),
            ])
            ->paginated(false);
    }
}
