<?php

namespace App\Filament\Admin\Widgets;

use App\Models\Booking;
use App\Models\Payment;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class BookingsPerDayWidget extends BaseWidget
{
    protected static ?int $sort = 1;
    protected ?string $pollingInterval = '60s';

    protected function getStats(): array
    {
        $todayCount = Booking::whereDate('created_at', today())->count();
        $yesterdayCount = Booking::whereDate('created_at', today()->subDay())->count();
        $todayDiff = $yesterdayCount > 0
            ? round((($todayCount - $yesterdayCount) / $yesterdayCount) * 100)
            : 0;

        $weekCount = Booking::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();
        $lastWeekCount = Booking::whereBetween('created_at', [
            now()->subWeek()->startOfWeek(),
            now()->subWeek()->endOfWeek(),
        ])->count();

        $monthRevenue = Payment::where('status', 'succeeded')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');
        $lastMonthRevenue = Payment::where('status', 'succeeded')
            ->whereMonth('paid_at', now()->subMonth()->month)
            ->whereYear('paid_at', now()->subMonth()->year)
            ->sum('amount');

        return [
            Stat::make("Today's Bookings", $todayCount)
                ->description(
                    $todayDiff >= 0
                        ? "+{$todayDiff}% vs yesterday ({$yesterdayCount})"
                        : "{$todayDiff}% vs yesterday ({$yesterdayCount})"
                )
                ->color($todayDiff >= 0 ? 'success' : 'danger')
                ->icon('heroicon-o-calendar'),

            Stat::make('This Week', $weekCount)
                ->description("vs {$lastWeekCount} last week")
                ->color($weekCount >= $lastWeekCount ? 'success' : 'warning')
                ->icon('heroicon-o-chart-bar'),

            Stat::make('Revenue This Month', '$' . number_format($monthRevenue / 100, 0))
                ->description('vs $' . number_format($lastMonthRevenue / 100, 0) . ' last month')
                ->color($monthRevenue >= $lastMonthRevenue ? 'success' : 'warning')
                ->icon('heroicon-o-banknotes'),
        ];
    }
}
