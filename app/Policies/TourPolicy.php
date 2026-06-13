<?php

namespace App\Policies;

use App\Models\Tour;
use App\Models\User;

class TourPolicy
{
    public function update(User $user, Tour $tour): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('operator')
            && $user->operators()->where('operators.id', $tour->operator_id)->exists();
    }

    public function publish(User $user, Tour $tour): bool
    {
        return $user->hasRole('admin');
    }
}
