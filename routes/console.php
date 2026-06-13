<?php

use App\Jobs\CancelUnpaidBalances;
use App\Jobs\ReleaseExpiredBookings;
use App\Jobs\SendBalanceReminders;
use Illuminate\Support\Facades\Schedule;

Schedule::job(ReleaseExpiredBookings::class)->everyFiveMinutes();
Schedule::job(SendBalanceReminders::class)->dailyAt('09:00');
Schedule::job(CancelUnpaidBalances::class)->dailyAt('08:00');
