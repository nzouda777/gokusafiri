<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Schemas;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-users';
    protected static string|\UnitEnum|null $navigationGroup = 'Users';
    protected static ?int $navigationSort = 1;
    protected static ?string $label = 'User';
    protected static ?string $pluralLabel = 'Users';

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::whereNull('email_verified_at')->count() ?: null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Section::make('Identity')->schema([
                Forms\Components\TextInput::make('name')->required()->maxLength(255),
                Forms\Components\TextInput::make('first_name')->label('First Name')->maxLength(100),
                Forms\Components\TextInput::make('last_name')->label('Last Name')->maxLength(100),
                Forms\Components\TextInput::make('email')
                    ->email()->required()->unique(ignoreRecord: true)->maxLength(255),
                Forms\Components\TextInput::make('phone')->label('Phone')->tel(),
                Forms\Components\TextInput::make('country')->label('Country')->maxLength(2)
                    ->hint('ISO 2-letter code'),
            ])->columns(2),

            Schemas\Components\Section::make('Account')->schema([
                Forms\Components\Select::make('locale')
                    ->label('Language')
                    ->options(['en' => 'English', 'fr' => 'French', 'es' => 'Spanish'])
                    ->default('en'),
                Forms\Components\Select::make('tier')
                    ->label('Tier')
                    ->options(['explorer' => 'Explorer'])
                    ->default('explorer'),
                Forms\Components\Select::make('roles')
                    ->relationship('roles', 'name')
                    ->multiple()
                    ->preload()
                    ->label('Roles'),
                Forms\Components\Toggle::make('newsletter_opt_in')
                    ->label('Newsletter Subscriber'),
            ])->columns(2),

            Schemas\Components\Section::make('Password')->schema([
                Forms\Components\TextInput::make('password')
                    ->label('New Password')
                    ->password()
                    ->revealable()
                    ->dehydrateStateUsing(fn ($state) => filled($state) ? Hash::make($state) : null)
                    ->dehydrated(fn ($state) => filled($state))
                    ->nullable(),
            ])->collapsed(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Name')
                    ->searchable()->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable()->copyable(),
                Tables\Columns\IconColumn::make('email_verified_at')
                    ->label('Verified')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-clock')
                    ->trueColor('success')
                    ->falseColor('warning'),
                Tables\Columns\TextColumn::make('roles.name')
                    ->label('Roles')->badge(),
                Tables\Columns\TextColumn::make('tier')->badge()->color('info'),
                Tables\Columns\TextColumn::make('locale')->badge()->color('gray'),
                Tables\Columns\TextColumn::make('country'),
                Tables\Columns\TextColumn::make('bookings_count')
                    ->label('Bookings')
                    ->counts('bookings')
                    ->badge()->color('primary'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('roles')
                    ->relationship('roles', 'name')
                    ->label('Role'),
                Tables\Filters\SelectFilter::make('locale')
                    ->options(['en' => 'English', 'fr' => 'French', 'es' => 'Spanish'])
                    ->label('Language'),
                Tables\Filters\TernaryFilter::make('email_verified_at')
                    ->label('Email Verified')
                    ->nullable(),
                Tables\Filters\TernaryFilter::make('newsletter_opt_in')
                    ->label('Newsletter'),
            ])
            ->actions([
                \Filament\Actions\EditAction::make(),
                \Filament\Actions\Action::make('verify')
                    ->label('Verify Email')
                    ->icon('heroicon-o-envelope-open')
                    ->color('success')
                    ->visible(fn (User $record) => ! $record->email_verified_at)
                    ->action(function (User $record) {
                        $record->update(['email_verified_at' => now()]);
                        Notification::make()->title('Email verified')->success()->send();
                    }),
                \Filament\Actions\Action::make('reset_password')
                    ->label('Reset Password')
                    ->icon('heroicon-o-key')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->action(function (User $record) {
                        Password::sendResetLink(['email' => $record->email]);
                        Notification::make()->title('Password reset email sent')->success()->send();
                    }),
                \Filament\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                \Filament\Actions\BulkActionGroup::make([
                    \Filament\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit'   => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
