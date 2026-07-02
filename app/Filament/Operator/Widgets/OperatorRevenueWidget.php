<?php

namespace App\Filament\Operator\Widgets;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Tour;
use App\Models\TourSchedule;
use Filament\Facades\Filament;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class OperatorRevenueWidget extends ChartWidget
{
    protected ?string $heading = 'Revenue  Last 6 Months';
    protected static ?int $sort = 1;
    protected int|string|array $columnSpan = 'full';
    protected ?string $maxHeight = '260px';

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $operator    = Filament::getTenant();
        $tourIds     = Tour::where('operator_id', $operator->id)->pluck('id');
        $scheduleIds = TourSchedule::whereIn('tour_id', $tourIds)->pluck('id');

        $months = collect(range(5, 0))->map(fn (int $i) => now()->startOfMonth()->subMonths($i));

        $revenue = $months->map(fn (Carbon $m) => round(
            Payment::whereHas('booking', fn ($q) => $q->whereIn('tour_schedule_id', $scheduleIds))
                ->where('status', 'succeeded')
                ->whereYear('paid_at', $m->year)
                ->whereMonth('paid_at', $m->month)
                ->sum('amount') / 100,
            2
        ));

        $bookings = $months->map(fn (Carbon $m) => Booking::whereIn('tour_schedule_id', $scheduleIds)
            ->whereYear('created_at', $m->year)
            ->whereMonth('created_at', $m->month)
            ->count()
        );

        return [
            'datasets' => [
                [
                    'label'           => 'Revenue ($)',
                    'data'            => $revenue->values()->toArray(),
                    'backgroundColor' => '#0d9488',
                    'yAxisID'         => 'y',
                ],
                [
                    'label'       => 'Bookings',
                    'data'        => $bookings->values()->toArray(),
                    'type'        => 'line',
                    'borderColor' => '#f59e0b',
                    'fill'        => false,
                    'tension'     => 0.4,
                    'yAxisID'     => 'y1',
                ],
            ],
            'labels' => $months->map(fn (Carbon $m) => $m->format('M Y'))->toArray(),
        ];
    }

    protected function getOptions(): array
    {
        return [
            'scales' => [
                'y'  => ['position' => 'left',  'title' => ['display' => true, 'text' => 'Revenue ($)']],
                'y1' => ['position' => 'right', 'title' => ['display' => true, 'text' => 'Bookings'], 'grid' => ['drawOnChartArea' => false]],
            ],
        ];
    }
}
