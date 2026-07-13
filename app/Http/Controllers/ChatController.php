<?php

namespace App\Http\Controllers;

use App\Services\ChatAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class ChatController extends Controller
{
    public function __construct(
        private readonly ChatAssistantService $assistant,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'messages' => 'required|array|min:1|max:30',
            'messages.*.role' => ['required', Rule::in(['user', 'assistant'])],
            'messages.*.content' => 'required|string|max:4000',
        ]);

        if (! $this->assistant->isConfigured()) {
            return response()->json([
                'reply' => __('chat.unavailable'),
            ], 200);
        }

        try {
            $reply = $this->assistant->reply($request->input('messages'));
        } catch (\Throwable $e) {
            Log::warning('Chat assistant error: '.$e->getMessage());

            return response()->json([
                'reply' => __('chat.error'),
            ], 200);
        }

        return response()->json(['reply' => $reply]);
    }
}
