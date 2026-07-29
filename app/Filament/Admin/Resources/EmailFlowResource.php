<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\EmailFlowResource\Pages;
use App\Jobs\SendEmailFlow;
use App\Models\EmailFlow;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class EmailFlowResource extends Resource
{
    protected static ?string $model = EmailFlow::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-paper-airplane';
    protected static string|\UnitEnum|null $navigationGroup = 'Marketing';
    protected static ?int $navigationSort = 4;
    protected static ?string $label = 'Email Flow';
    protected static ?string $pluralLabel = 'Email Flows';

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Section::make('Campaign')->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Internal name')
                    ->required()->maxLength(150)
                    ->helperText('For your own reference, e.g. "Valentine\'s Day 2027" or "Black Friday 20%".'),
                Forms\Components\Select::make('type')
                    ->label('Reason')
                    ->options(EmailFlow::TYPES)
                    ->required()->default('other'),
                Forms\Components\Select::make('audience')
                    ->label('Audience')
                    ->options(EmailFlow::AUDIENCES)
                    ->required()->default('all_subscribers')
                    ->helperText('Always limited to users with newsletter consent enabled.'),
                Forms\Components\DateTimePicker::make('scheduled_at')
                    ->label('Send at')
                    ->native(false)
                    ->minDate(now())
                    ->helperText('Leave empty to keep this flow as a draft. Set a date to schedule it  it will send automatically.'),
            ])->columns(2),

            Schemas\Components\Section::make('Content (Translations)')->schema([
                Schemas\Components\Tabs::make()->tabs([
                    Schemas\Components\Tabs\Tab::make('🇬🇧 EN')->schema([
                        Forms\Components\TextInput::make('subject.en')->label('Subject (EN)')->required()->maxLength(150),
                        Forms\Components\RichEditor::make('body.en')->label('Body (EN)')->required(),
                    ]),
                    Schemas\Components\Tabs\Tab::make('🇫🇷 FR')->schema([
                        Forms\Components\TextInput::make('subject.fr')->label('Sujet (FR)')->maxLength(150),
                        Forms\Components\RichEditor::make('body.fr')->label('Corps (FR)'),
                    ]),
                    Schemas\Components\Tabs\Tab::make('🇪🇸 ES')->schema([
                        Forms\Components\TextInput::make('subject.es')->label('Asunto (ES)')->maxLength(150),
                        Forms\Components\RichEditor::make('body.es')->label('Cuerpo (ES)'),
                    ]),
                ])->columnSpanFull(),
            ]),

            Schemas\Components\Section::make('Call to Action (optional)')->schema([
                Forms\Components\TextInput::make('discount_code')
                    ->label('Discount code')
                    ->maxLength(50),
                Forms\Components\TextInput::make('cta_label')
                    ->label('Button label')
                    ->maxLength(60)
                    ->default('Explore Now'),
                Forms\Components\TextInput::make('cta_url')
                    ->label('Button URL')
                    ->url()
                    ->placeholder(config('app.url')),
            ])->columns(3)->collapsed(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()->weight(\Filament\Support\Enums\FontWeight::Medium),
                Tables\Columns\TextColumn::make('type')
                    ->label('Reason')
                    ->formatStateUsing(fn (string $state) => EmailFlow::TYPES[$state] ?? $state)
                    ->badge()->color('gray'),
                Tables\Columns\TextColumn::make('status')
                    ->formatStateUsing(fn (string $state) => EmailFlow::STATUSES[$state] ?? $state)
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'draft'     => 'gray',
                        'scheduled' => 'info',
                        'sending'   => 'warning',
                        'sent'      => 'success',
                        'cancelled' => 'danger',
                        default     => 'gray',
                    }),
                Tables\Columns\TextColumn::make('audience')
                    ->formatStateUsing(fn (string $state) => EmailFlow::AUDIENCES[$state] ?? $state)
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('scheduled_at')
                    ->label('Scheduled for')
                    ->dateTime('d M Y, H:i')
                    ->sortable()->placeholder(''),
                Tables\Columns\TextColumn::make('sent_at')
                    ->dateTime('d M Y, H:i')
                    ->sortable()->placeholder(''),
                Tables\Columns\TextColumn::make('recipients_count')
                    ->label('Sent to')
                    ->numeric()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')->options(EmailFlow::TYPES),
                Tables\Filters\SelectFilter::make('status')->options(EmailFlow::STATUSES),
            ])
            ->defaultSort('created_at', 'desc')
            ->actions([
                Action::make('send_now')
                    ->label('Send now')
                    ->icon('heroicon-o-paper-airplane')
                    ->color('success')
                    ->visible(fn (EmailFlow $record) => in_array($record->status, ['draft', 'scheduled'], true))
                    ->requiresConfirmation()
                    ->modalDescription(fn (EmailFlow $record) => 'This will immediately queue emails to: ' . (EmailFlow::AUDIENCES[$record->audience] ?? $record->audience))
                    ->action(function (EmailFlow $record): void {
                        $record->forceFill([
                            'status' => 'scheduled',
                            'scheduled_at' => $record->scheduled_at ?? now(),
                        ])->save();

                        SendEmailFlow::dispatch($record);

                        Notification::make()->title('Email flow queued for sending')->success()->send();
                    }),

                Action::make('cancel')
                    ->label('Cancel')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn (EmailFlow $record) => $record->status === 'scheduled')
                    ->requiresConfirmation()
                    ->action(fn (EmailFlow $record) => $record->forceFill(['status' => 'cancelled'])->save()),

                Action::make('duplicate')
                    ->label('Duplicate')
                    ->icon('heroicon-o-document-duplicate')
                    ->action(function (EmailFlow $record) {
                        $copy = $record->replicate(['status', 'scheduled_at', 'sent_at', 'recipients_count']);
                        $copy->name = $record->name . ' (copy)';
                        $copy->status = 'draft';
                        $copy->scheduled_at = null;
                        $copy->sent_at = null;
                        $copy->recipients_count = 0;
                        $copy->save();

                        return redirect(EmailFlowResource::getUrl('edit', ['record' => $copy]));
                    }),

                EditAction::make(),
                DeleteAction::make()
                    ->visible(fn (EmailFlow $record) => $record->status !== 'sending'),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListEmailFlows::route('/'),
            'create' => Pages\CreateEmailFlow::route('/create'),
            'edit'   => Pages\EditEmailFlow::route('/{record}/edit'),
        ];
    }
}
