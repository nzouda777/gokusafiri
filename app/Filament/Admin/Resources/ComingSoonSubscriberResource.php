<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\ComingSoonSubscriberResource\Pages;
use App\Mail\ComingSoonLaunchNotification;
use App\Models\ComingSoonSubscriber;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Mail;

class ComingSoonSubscriberResource extends Resource
{
    protected static ?string $model = ComingSoonSubscriber::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-envelope';
    protected static string|\UnitEnum|null $navigationGroup = 'Marketing';
    protected static ?string $label = 'Subscriber';
    protected static ?string $pluralLabel = 'Coming Soon Subscribers';
    protected static ?int $navigationSort = 1;

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::count() ?: null;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->sortable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Signed up')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([])
            ->actions([
                Action::make('send_email')
                    ->label('Send email')
                    ->icon('heroicon-o-paper-airplane')
                    ->color('info')
                    ->form(self::emailForm())
                    ->action(function (ComingSoonSubscriber $record, array $data): void {
                        Mail::to($record->email)->queue(
                            new ComingSoonLaunchNotification(
                                emailSubject: $data['subject'],
                                body:         $data['body'],
                                ctaLabel:     $data['cta_label'],
                                ctaUrl:       $data['cta_url'],
                            )
                        );

                        Notification::make()
                            ->title("Email queued for {$record->email}")
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
            'index' => Pages\ListComingSoonSubscribers::route('/'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    /** Shared form fields used by both single and bulk send actions. */
    public static function emailForm(): array
    {
        return [
            Forms\Components\TextInput::make('subject')
                ->label('Subject')
                ->required()
                ->default('We\'re live  your African adventure starts now 🌍')
                ->maxLength(150),

            Forms\Components\Textarea::make('body')
                ->label('Message')
                ->required()
                ->rows(6)
                ->default(
                    "We promised something wild, and today we're delivering.\n\n" .
                    "GokuSafiri is officially live. Gorilla treks, migration crossings, " .
                    "coastal escapes  every adventure you signed up to discover is waiting for you.\n\n" .
                    "As one of our early subscribers, you get first access. Browse our hand-picked safaris and secure your spot before they fill up."
                ),

            Forms\Components\TextInput::make('cta_label')
                ->label('Button label')
                ->default('Explore Now')
                ->maxLength(60),

            Forms\Components\TextInput::make('cta_url')
                ->label('Button URL')
                ->url()
                ->placeholder(config('app.url'))
                ->helperText('Leave blank to use the site URL.'),
        ];
    }
}
