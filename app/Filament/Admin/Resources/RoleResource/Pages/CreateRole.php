<?php

namespace App\Filament\Admin\Resources\RoleResource\Pages;

use App\Filament\Admin\Resources\RoleResource;
use Filament\Resources\Pages\CreateRecord;
use Spatie\Permission\Models\Role;

class CreateRole extends CreateRecord
{
    protected static string $resource = RoleResource::class;

    protected function handleRecordCreation(array $data): Role
    {
        $role = Role::create([
            'name'       => $data['name'],
            'guard_name' => $data['guard_name'] ?? 'web',
        ]);

        $allSelected = collect($data)
            ->filter(fn ($v, $k) => str_starts_with($k, 'permissions_'))
            ->values()
            ->flatten()
            ->filter()
            ->toArray();

        $role->syncPermissions($allSelected);

        return $role;
    }
}
