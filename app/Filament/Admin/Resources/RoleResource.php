<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\RoleResource\Pages;
use Filament\Forms;
use Filament\Infolists;
use Filament\Resources\Resource;
use Filament\Schemas;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleResource extends Resource
{
    protected static ?string $model = Role::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-shield-check';
    protected static string|\UnitEnum|null $navigationGroup = 'Users';
    protected static ?int $navigationSort = 10;
    protected static ?string $label = 'Role';
    protected static ?string $pluralLabel = 'Roles & Permissions';

    public static function form(Schema $schema): Schema
    {
        $permissionsByGroup = Permission::all()
            ->groupBy(fn (Permission $p) => explode('.', $p->name)[0])
            ->map(fn ($group) => $group->pluck('name', 'name')->toArray())
            ->toArray();

        return $schema->schema([
            Schemas\Components\Section::make('Role')->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Role Name')->required()->maxLength(100)
                    ->helperText('Use lowercase, e.g. "admin", "moderator", "analyst"'),
                Forms\Components\TextInput::make('guard_name')
                    ->label('Guard')->default('web')->required()->maxLength(50)
                    ->disabled(fn ($record) => $record !== null),
            ])->columns(2),

            Schemas\Components\Section::make('Permissions')->schema(
                collect($permissionsByGroup)->map(fn ($permissions, $group) =>
                    Schemas\Components\Section::make(ucfirst($group))->schema([
                        Forms\Components\CheckboxList::make('permissions_' . $group)
                            ->label('')
                            ->options($permissions)
                            ->columns(3)
                            ->bulkToggleable()
                            ->dehydrated(false)
                            ->afterStateHydrated(function ($component, $state, $record) use ($group) {
                                if ($record) {
                                    $component->state(
                                        $record->permissions()
                                            ->where('name', 'like', $group . '.%')
                                            ->pluck('name')
                                            ->toArray()
                                    );
                                }
                            }),
                    ])->collapsed(count($permissions) === 0)
                )->values()->toArray()
            ),
        ]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Section::make('Role')->schema([
                Infolists\Components\TextEntry::make('name')->badge()->color('primary'),
                Infolists\Components\TextEntry::make('guard_name')->badge()->color('gray'),
                Infolists\Components\TextEntry::make('permissions_count')
                    ->label('Permissions')
                    ->getStateUsing(fn ($record) => $record->permissions()->count())
                    ->badge()->color('info'),
                Infolists\Components\TextEntry::make('users_count')
                    ->label('Users')
                    ->getStateUsing(fn ($record) => $record->users()->count())
                    ->badge()->color('success'),
            ])->columns(4),

            Schemas\Components\Section::make('Permissions granted')->schema([
                Infolists\Components\RepeatableEntry::make('permissions')->label('')
                    ->schema([
                        Infolists\Components\TextEntry::make('name')->badge()->color('gray'),
                    ])
                    ->columnSpanFull(),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->badge()->color('primary')->searchable(),
                Tables\Columns\TextColumn::make('guard_name')->badge()->color('gray'),
                Tables\Columns\TextColumn::make('permissions_count')
                    ->label('Permissions')
                    ->getStateUsing(fn ($record) => $record->permissions()->count())
                    ->badge()->color('info'),
                Tables\Columns\TextColumn::make('users_count')
                    ->label('Users')
                    ->getStateUsing(fn ($record) => $record->users()->count())
                    ->badge()->color('success'),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->actions([
                \Filament\Actions\ViewAction::make(),
                \Filament\Actions\EditAction::make()
                    ->using(function (Role $record, array $data): Role {
                        $record->update(['name' => $data['name']]);

                        // Sync permissions from all checkbox groups
                        $allSelected = collect($data)
                            ->filter(fn ($v, $k) => str_starts_with($k, 'permissions_'))
                            ->values()
                            ->flatten()
                            ->filter()
                            ->toArray();

                        $record->syncPermissions($allSelected);

                        return $record;
                    }),
                \Filament\Actions\DeleteAction::make()
                    ->visible(fn (Role $record) => ! in_array($record->name, ['admin', 'operator', 'customer', 'super_admin'])),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListRoles::route('/'),
            'create' => Pages\CreateRole::route('/create'),
            'view'   => Pages\ViewRole::route('/{record}'),
            'edit'   => Pages\EditRole::route('/{record}/edit'),
        ];
    }
}
