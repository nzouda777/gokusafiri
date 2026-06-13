<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Bookings
            'bookings.view_any', 'bookings.view', 'bookings.create',
            'bookings.update', 'bookings.delete', 'bookings.confirm', 'bookings.cancel',
            // Tours
            'tours.view_any', 'tours.view', 'tours.create',
            'tours.update', 'tours.delete', 'tours.publish',
            // Destinations
            'destinations.view_any', 'destinations.view', 'destinations.create',
            'destinations.update', 'destinations.delete',
            // Users
            'users.view_any', 'users.view', 'users.create', 'users.update', 'users.delete',
            // Operators
            'operators.view_any', 'operators.view', 'operators.create',
            'operators.update', 'operators.delete',
            // Payments
            'payments.view_any', 'payments.view',
            // Reviews
            'reviews.view_any', 'reviews.view', 'reviews.update', 'reviews.delete',
            // FAQs
            'faqs.view_any', 'faqs.create', 'faqs.update', 'faqs.delete',
            // Admin-only
            'settings.manage', 'roles.manage',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->syncPermissions(
            Permission::whereNotIn('name', ['roles.manage'])->get()
        );

        $moderator = Role::firstOrCreate(['name' => 'moderator', 'guard_name' => 'web']);
        $moderator->syncPermissions([
            'bookings.view_any', 'bookings.view', 'bookings.confirm',
            'tours.view_any', 'tours.view', 'tours.update', 'tours.publish',
            'reviews.view_any', 'reviews.view', 'reviews.update', 'reviews.delete',
            'destinations.view_any', 'destinations.view',
        ]);

        $analyst = Role::firstOrCreate(['name' => 'analyst', 'guard_name' => 'web']);
        $analyst->syncPermissions([
            'bookings.view_any', 'bookings.view',
            'tours.view_any', 'tours.view',
            'payments.view_any', 'payments.view',
            'users.view_any', 'users.view',
            'destinations.view_any', 'destinations.view',
        ]);

        // Operator and customer roles have no admin panel permissions
        Role::firstOrCreate(['name' => 'operator', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
    }
}
