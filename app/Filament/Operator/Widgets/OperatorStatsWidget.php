<?php

namespace App\Filament\Operator\Widgets;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Tour;
use App\Models\TourSchedule;
use Filament\Facades\Filament;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class OperatorStatsWidget extends BaseWidget
{
    protected static ?int $sort = 0;
    protected ?string $pollingInterval = '60s';
    protected int|string|array $columnSpan = 'full';

    protected function getStats(): array
    {
        $operator    = Filament::getTenant();
        $tourIds     = Tour::where('operator_id', $operator->id)->pluck('id');
        $scheduleIds = TourSchedule::whereIn('tour_id', $tourIds)->pluck('id');

        $monthRevenue = Payment::whereHas('booking', fn ($q) => $q->whereIn('tour_schedule_id', $scheduleIds))
            ->where('status', 'succeeded')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        $totalRevenue = Payment::whereHas('booking', fn ($q) => $q->whereIn('tour_schedule_id', $scheduleIds))
            ->where('status', 'succeeded')
            ->sum('amount');

        $activeBookings = Booking::whereIn('tour_schedule_id', $scheduleIds)
            ->whereNotIn('status', ['expired', 'cancelled'])
            ->count();

        $publishedTours = Tour::where('operator_id', $operator->id)
            ->where('status', 'published')
            ->count();

        $totalTours = Tour::where('operator_id', $operator->id)->count();

        $upcomingSchedules = TourSchedule::whereIn('tour_id', $tourIds)
            ->where('starts_at', '>=', today())
            ->count();

        $avgFillRate = TourSchedule::whereIn('tour_id', $tourIds)
            ->where('starts_at', '>=', today())
            ->selectRaw('AVG((capacity - seats_left) / capacity * 100) as fill_rate')
            ->value('fill_rate');

        return [
            Stat::make('Revenue This Month', '$' . number_format($monthRevenue / 100, 0))
                ->description('All-time: $' . number_format($totalRevenue / 100, 0))
                ->icon('heroicon-o-banknotes')
                ->color('success'),

            Stat::make('Active Bookings', $activeBookings)
                ->description('Excluding expired & cancelled')
                ->icon('heroicon-o-calendar-days')
                ->color('primary'),

            Stat::make('Tours', $publishedTours . ' published / ' . $totalTours . ' total')
                ->description($upcomingSchedules . ' upcoming departures')
                ->icon('heroicon-o-map')
                ->color('info'),

            Stat::make('Avg Fill Rate', number_format($avgFillRate ?? 0, 0) . '%')
                ->description('Upcoming departures only')
                ->icon('heroicon-o-users')
                ->color(($avgFillRate ?? 0) >= 70 ? 'success' : (($avgFillRate ?? 0) >= 40 ? 'warning' : 'danger')),
        ];
    }
}
