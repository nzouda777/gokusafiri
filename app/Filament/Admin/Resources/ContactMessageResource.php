<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\ContactMessageResource\Pages;
use App\Mail\ContactReplyMail;
use App\Models\ContactMessage;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Mail;

class ContactMessageResource extends Resource
{
    protected static ?string $model = ContactMessage::class;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static string|\UnitEnum|null $navigationGroup = 'Marketing';

    protected static ?string $label = 'Contact Message';

    protected static ?string $pluralLabel = 'Contact Messages';

    protected static ?int $navigationSort = 2;

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::unread()->count() ?: null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([
            Forms\Components\TextInput::make('name')->disabled(),
            Forms\Components\TextInput::make('email')->disabled(),
            Forms\Components\TextInput::make('phone')->disabled(),
            Forms\Components\TextInput::make('topic')->disabled(),
            Forms\Components\TextInput::make('subject')->disabled(),
            Forms\Components\TextInput::make('booking_reference')->disabled(),
            Forms\Components\Textarea::make('message')->rows(8)->disabled()->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('topic')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'booking' => 'info',
                        'payment' => 'warning',
                        'partnership' => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('subject')
                    ->limit(35)
                    ->toggleable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'new' => 'warning',
                        'read' => 'gray',
                        'replied' => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Received')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'new' => 'New',
                        'read' => 'Read',
                        'replied' => 'Replied',
                        'closed' => 'Closed',
                    ]),
                Tables\Filters\SelectFilter::make('topic')
                    ->options([
                        'general' => 'General',
                        'booking' => 'Booking',
                        'payment' => 'Payment',
                        'partnership' => 'Partnership',
                        'other' => 'Other',
                    ]),
            ])
            ->actions([
                ViewAction::make()
                    ->after(function (ContactMessage $record): void {
                        if ($record->status === 'new') {
                            $record->update(['status' => 'read']);
                        }
                    }),

                Action::make('reply')
                    ->label('Reply')
                    ->icon('heroicon-o-paper-airplane')
                    ->color('info')
                    ->form([
                        Forms\Components\TextInput::make('subject')
                            ->required()
                            ->default(fn (ContactMessage $record) => 'Re: '.($record->subject ?? 'Your message to GokuSafiri'))
                            ->maxLength(150),
                        Forms\Components\Textarea::make('body')
                            ->label('Message')
                            ->required()
                            ->rows(8),
                    ])
                    ->action(function (ContactMessage $record, array $data): void {
                        Mail::to($record->email)->queue(
                            new ContactReplyMail(
                                contactMessage: $record,
                                emailSubject: $data['subject'],
                                body: $data['body'],
                            )
                        );

                        $record->update(['status' => 'replied', 'replied_at' => now()]);

                        Notification::make()
                            ->title("Reply queued for {$record->email}")
                            ->success()
                            ->send();
                    }),

                DeleteAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListContactMessages::route('/'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
