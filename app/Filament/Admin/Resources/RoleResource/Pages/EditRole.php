<?php

namespace App\Filament\Admin\Resources\RoleResource\Pages;

use App\Filament\Admin\Resources\RoleResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role;

class EditRole extends EditRecord
{
    protected static string $resource = RoleResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        $record->update(['name' => $data['name']]);

        $allSelected = collect($data)
            ->filter(fn ($v, $k) => str_starts_with($k, 'permissions_'))
            ->values()
            ->flatten()
            ->filter()
            ->toArray();

        $record->syncPermissions($allSelected);

        return $record;
    }
}
