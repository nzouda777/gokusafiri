<?php

namespace App\Filament\Admin\Pages;

use Filament\Actions\Action;
use Filament\Pages\Dashboard as BaseDashboard;
use Illuminate\Contracts\Support\Htmlable;

class Dashboard extends BaseDashboard
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-home';
    protected static ?int $navigationSort = -10;

    public function getTitle(): string | Htmlable
    {
        $hour = now()->hour;
        $greeting = match (true) {
            $hour < 12 => 'Good morning',
            $hour < 17 => 'Good afternoon',
            default    => 'Good evening',
        };
        $name = auth()->user()?->name ?? 'Admin';

        return $greeting . ', ' . $name;
    }

    public function getSubheading(): string | Htmlable | null
    {
        return "Here's what's happening at GoKuSafiri \u{2014} " . now()->format('l, F j, Y');
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('bookings')
                ->label('All Bookings')
                ->url(fn () => route('filament.admin.resources.bookings.index'))
                ->icon('heroicon-o-calendar-days')
                ->outlined(),
            Action::make('settings')
                ->label('Settings')
                ->url(fn () => route('filament.admin.pages.settings-page'))
                ->icon('heroicon-o-cog-6-tooth')
                ->outlined(),
        ];
    }

    public function getWidgets(): array
    {
        return [
            \App\Filament\Admin\Widgets\PlatformStatsWidget::class,
            \App\Filament\Admin\Widgets\BookingsPerDayWidget::class,
            \App\Filament\Admin\Widgets\CheckoutFunnelWidget::class,
            \App\Filament\Admin\Widgets\PendingReviewsWidget::class,
            \App\Filament\Admin\Widgets\RevenueChartWidget::class,
            \App\Filament\Admin\Widgets\UpcomingDeparturesWidget::class,
            \App\Filament\Admin\Widgets\RecentBookingsWidget::class,
            \App\Filament\Admin\Widgets\TopToursWidget::class,
        ];
    }

    public function getColumns(): int | array
    {
        return 2;
    }
}
