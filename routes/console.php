<?php

use App\Jobs\CancelUnpaidBalances;
use App\Jobs\DispatchEmailAutomations;
use App\Jobs\DispatchScheduledEmailFlows;
use App\Jobs\ReleaseExpiredBookings;
use App\Jobs\SendBalanceReminders;
use Illuminate\Support\Facades\Schedule;

// ── Business logic ────────────────────────────────────────────────────────────
// withoutOverlapping() évite qu'une 2e instance démarre si la 1re tourne encore.

Schedule::job(ReleaseExpiredBookings::class)
    ->everyFiveMinutes()
    ->withoutOverlapping();

Schedule::job(SendBalanceReminders::class)
    ->dailyAt('09:00')
    ->withoutOverlapping();

Schedule::job(CancelUnpaidBalances::class)
    ->dailyAt('08:00')
    ->withoutOverlapping();

Schedule::job(DispatchScheduledEmailFlows::class)
    ->everyFiveMinutes()
    ->withoutOverlapping();

Schedule::job(DispatchEmailAutomations::class)
    ->everyFiveMinutes()
    ->withoutOverlapping();

// ── Queue processor (shared hosting) ─────────────────────────────────────────
// Lance un worker éphémère chaque minute :
//   --stop-when-empty  → s'arrête quand la file est vide
//   --max-time=50      → s'arrête au bout de 50 s même si des jobs arrivent
//   --tries=3          → 3 tentatives avant de déclarer un job failed
//   --backoff=10       → 10 s entre chaque retry
//   withoutOverlapping → verrou cache 55 s, évite les workers concurrents
//   runInBackground    → ne bloque pas les autres tâches du scheduler
Schedule::command('queue:work --stop-when-empty --max-time=50 --tries=3 --backoff=10')
    ->everyMinute()
    ->withoutOverlapping(55)
    ->runInBackground();
