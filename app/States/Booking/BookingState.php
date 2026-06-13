<?php

namespace App\States\Booking;

use Spatie\ModelStates\State;
use Spatie\ModelStates\StateConfig;

abstract class BookingState extends State
{
    public static function config(): StateConfig
    {
        return parent::config()
            ->default(Pending::class)
            ->allowTransition(Pending::class, DepositPaid::class)
            ->allowTransition(Pending::class, Paid::class)
            ->allowTransition(Pending::class, Expired::class)
            ->allowTransition(Pending::class, Cancelled::class)
            ->allowTransition(DepositPaid::class, Confirmed::class)
            ->allowTransition(DepositPaid::class, Cancelled::class)
            ->allowTransition(Paid::class, Confirmed::class)
            ->allowTransition(Confirmed::class, Completed::class)
            ->allowTransition(Confirmed::class, Cancelled::class)
            ->allowTransition(Cancelled::class, Refunded::class)
            ->allowTransition(DepositPaid::class, Refunded::class);
    }
}
