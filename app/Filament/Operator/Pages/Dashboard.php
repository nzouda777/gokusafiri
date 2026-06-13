<?php

namespace App\Filament\Operator\Pages;

use Filament\Actions\Action;
use Filament\Facades\Filament;
use Filament\Pages\Dashboard as BaseDashboard;
use Illuminate\Contracts\Support\Htmlable;

class Dashboard extends BaseDashboard
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-home';
    protected static ?int $navigationSort = -10;

    public function getTitle(): string | Htmlable
    {
        $operator = Filament::getTenant();
        $hour     = now()->hour;
        $greeting = match (true) {
            $hour < 12 => 'Good morning',
            $hour < 17 => 'Good afternoon',
            default    => 'Good evening',
        };

        return $greeting . ' — ' . ($operator?->name ?? 'Operator');
    }

    public function getSubheading(): string | Htmlable | null
    {
        return "Your tour operations at a glance \u{2014} " . now()->format('l, F j, Y');
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('tours')
                ->label('My Tours')
                ->url(fn () => route('filament.operator.resources.tours.index', Filament::getTenant()))
                ->icon('heroicon-o-map')
                ->outlined(),
            Action::make('bookings')
                ->label('Bookings')
                ->url(fn () => route('filament.operator.resources.bookings.index', Filament::getTenant()))
                ->icon('heroicon-o-calendar-days')
                ->outlined(),
        ];
    }

    public function getWidgets(): array
    {
        return [
            \App\Filament\Operator\Widgets\OperatorStatsWidget::class,
            \App\Filament\Operator\Widgets\OperatorRevenueWidget::class,
            \App\Filament\Operator\Widgets\OperatorUpcomingDeparturesWidget::class,
            \App\Filament\Operator\Widgets\OperatorRecentBookingsWidget::class,
        ];
    }

    public function getColumns(): int | array
    {
        return 2;
    }
}
