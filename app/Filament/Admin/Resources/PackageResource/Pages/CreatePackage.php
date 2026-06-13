<?php

namespace App\Filament\Admin\Resources\PackageResource\Pages;

use App\Filament\Admin\Resources\PackageResource;
use Filament\Resources\Pages\CreateRecord;

class CreatePackage extends CreateRecord
{
    protected static string $resource = PackageResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['type'] = 'package';

        return $data;
    }
}
