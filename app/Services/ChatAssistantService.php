<?php

namespace App\Services;

use Anthropic\Client;
use App\Models\Tour;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ChatAssistantService
{
    public function isConfigured(): bool
    {
        return match (config('services.chat.provider')) {
            'anthropic' => ! empty(config('services.anthropic.api_key')),
            default => ! empty(config('services.chat.api_key')),
        };
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    public function reply(array $messages): string
    {
        return match (config('services.chat.provider')) {
            'anthropic' => $this->replyViaAnthropic($messages),
            default => $this->replyViaOpenAiCompatible($messages),
        };
    }

    /**
     * Free-tier providers (Groq, Google Gemini, OpenRouter, Ollama, …)
     * all expose the same OpenAI-compatible chat completions endpoint.
     *
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    private function replyViaOpenAiCompatible(array $messages): string
    {
        $response = Http::withToken(config('services.chat.api_key'))
            ->timeout(30)
            ->post(rtrim(config('services.chat.base_url'), '/').'/chat/completions', [
                'model' => config('services.chat.model'),
                'max_tokens' => 1024,
                'messages' => [
                    ['role' => 'system', 'content' => $this->systemPrompt()],
                    ...$messages,
                ],
            ])
            ->throw()
            ->json();

        return trim($response['choices'][0]['message']['content'] ?? '');
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    private function replyViaAnthropic(array $messages): string
    {
        $client = new Client(apiKey: config('services.anthropic.api_key'));

        $response = $client->messages->create(
            maxTokens: 1024,
            model: config('services.anthropic.model'),
            system: [
                [
                    'type' => 'text',
                    'text' => $this->systemPrompt(),
                    'cache_control' => ['type' => 'ephemeral'],
                ],
            ],
            messages: $messages,
        );

        $reply = '';
        foreach ($response->content as $block) {
            if ($block->type === 'text') {
                $reply .= $block->text;
            }
        }

        return $reply;
    }

    private function systemPrompt(): string
    {
        return <<<PROMPT
        You are Safiri, the friendly AI travel assistant for GokuSafiri (gokusafiri.com), an African safari booking platform.

        Your role:
        - Help visitors discover safaris and packages, understand pricing, and navigate the booking process.
        - Answer questions about destinations, best travel seasons, group sizes, and what's included in tours.
        - Explain the booking flow: choose a tour, pick a departure date, add travelers, then pay a deposit (typically 20%) or the full amount. The balance is due 30 days before departure.
        - Guests can pay by card (Stripe). Booking confirmations and itineraries are emailed automatically.

        How to help:
        - Keep answers short, warm and practical (2-4 sentences unless more detail is asked for).
        - Answer in the language the visitor writes in (English, French or Spanish).
        - When a visitor is ready to book or asks about a specific tour, point them to the tour page or /packages.
        - For anything you cannot resolve (booking changes, refunds, payment problems, custom itineraries), direct them to human support: the contact form at /contact, WhatsApp +1 706-581-1963, or support@gokusafiri.com. The team is available Mon-Sat, 8am-8pm EST and replies within 2 hours.
        - There is a referral program: registered users get a personal link from their account (Refer & earn) and earn a commission on bookings made by people they refer.
        - Never invent tours, prices or availability that are not in the catalogue below. If unsure, say so and point to the website or human support.
        - Politely decline questions unrelated to GokuSafiri or African travel.
        - Provide direct link (full link)  to package or tour matching the client needs

        {$this->catalogueContext()}
        PROMPT;
    }

    private function catalogueContext(): string
    {
        return Cache::remember('chat-assistant.catalogue', now()->addMinutes(30), function () {
            $tours = Tour::published()
                ->with('destination')
                ->orderByDesc('rating_cache')
                ->limit(25)
                ->get();

            if ($tours->isEmpty()) {
                return 'Current catalogue: no tours are published right now.';
            }

            $lines = $tours->map(function (Tour $tour) {
                $price = '$'.number_format($tour->base_price / 100, 0);
                $dest = $tour->destination
                    ? "{$tour->destination->name}, {$tour->destination->country}"
                    : 'Africa';

                $path = $tour->type === 'package' ? 'packages' : 'tours';

                return "- {$tour->getTranslation('title', 'en', false)} ({$dest}) — "
                    ."{$tour->duration_days} days, from {$price} per adult — /{$path}/{$tour->slug}";
            })->implode("\n");

            return "Current catalogue (prices per adult, USD):\n{$lines}";
        });
    }
}
