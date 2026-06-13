<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\PackageResource\Pages;
use App\Models\Tour;
use Filament\Panel;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PackageResource extends TourResource
{
    protected static ?string $model = Tour::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-cube';
    protected static string|\UnitEnum|null $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 2;
    protected static ?string $label = 'Package';
    protected static ?string $pluralLabel = 'Packages';

    public static function getSlug(?Panel $panel = null): string
    {
        return 'packages';
    }

    public static function getNavigationBadge(): ?string
    {
        return null;
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('type', 'package');
    }

    public static function form(Schema $schema): Schema
    {
        return static::buildForm($schema, 'package');
    }

    public static function table(Table $table): Table
    {
        return static::buildTable($table);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListPackages::route('/'),
            'create' => Pages\CreatePackage::route('/create'),
            'edit'   => Pages\EditPackage::route('/{record}/edit'),
        ];
    }
}
