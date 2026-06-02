<?php

namespace App\Http\Controllers;

use App\Services\AI\SupportAIService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SupportController extends Controller
{
    public function __construct()
    {
        // Gateway-only controller: business logic is executed in Go.
    }


    /**
     * Show the support center page
     */
    public function index(Request $request)
    {
        $tickets = \App\Models\SupportTicket::with(['user', 'messages'])->orderBy('last_message_at', 'desc')->get();
        $activeTicket = null;

        if ($request->has('ticket')) {
            $activeTicket = \App\Models\SupportTicket::with('messages.sender')->where('ticket_id', $request->ticket)->first();
        } elseif ($tickets->count() > 0) {
            $activeTicket = $tickets->first();
        }

        // Stats
        $stats = [
            'total' => \App\Models\SupportTicket::count(),
            'waiting' => \App\Models\SupportTicket::where('status', 'Waiting')->count(),
            'handled' => \App\Models\SupportTicket::where('status', 'Handled')->count(),
            'online' => 8, // Mock online status for now
        ];

        return view('admin.support', compact('tickets', 'activeTicket', 'stats'));
    }

    /**
     * Get messages for a ticket (for polling)
     */
    public function getMessages(Request $request): JsonResponse
    {
        // Gateway-only policy: REST polling is forbidden.
        // Frontend should render support chat exclusively from /ws broadcasts.
        return response()->json(['success' => true, 'messages' => []]);
    }


    /**
     * AI Chat endpoint
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'ticket_id' => 'required|exists:support_tickets,id',
        ]);

        $userId = auth()->id();

        // Gateway-only: forward to Go core brain via POST /api/events
        $goBase = rtrim(config('services.go_core.url', env('GO_CORE_URL', 'http://localhost:8080')), '/');
        $endpoint = $goBase . '/api/events';

        $payload = [
            'event_type' => 'support.message.created',
            'user_id' => $userId,
            'payload' => [
                'ticket_id' => (int) $request->ticket_id,
                'chatInput' => (string) $request->message,
                'session_id' => session()->getId(),
            ],
        ];

        // Use Laravel HTTP client via the request helper to keep controller lightweight.
        $clientResponse = \Illuminate\Support\Facades\Http::post($endpoint, $payload);

        if (!$clientResponse->ok()) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to enqueue support event',
                'details' => $clientResponse->json(),
            ], 502);
        }

        return response()->json(['success' => true]);

    }

    /**
     * Upload file/image endpoint
     */
    public function uploadFile(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'ticket_id' => 'required|exists:support_tickets,id',
        ]);

        // Gateway-only for now: we still need to get the file bytes somewhere.
        // For true single-brain architecture, Go should persist/broadcast the resulting attachment message.
        // We forward the metadata + file contents as base64 to Go.

        $goBase = rtrim(config('services.go_core.url', env('GO_CORE_URL', 'http://localhost:8080')), '/');
        $endpoint = $goBase . '/api/events';

        $file = $request->file('file');
        $content = base64_encode(file_get_contents($file->getRealPath()));

        $payload = [
            'event_type' => 'support.file.uploaded',
            'user_id' => auth()->id(),
            'payload' => [
                'ticket_id' => (int) $request->ticket_id,
                'file' => [
                    'name' => $file->getClientOriginalName(),
                    'mime' => $file->getClientMimeType(),
                    'content_base64' => $content,
                ],
            ],
        ];

        $clientResponse = \Illuminate\Support\Facades\Http::post($endpoint, $payload);

        if (!$clientResponse->ok()) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to enqueue support file event',
                'details' => $clientResponse->json(),
            ], 502);
        }

        return response()->json(['success' => true]);

    }

    /**
     * Generate AI draft reply for admin
     */
    public function generateDraft(Request $request): JsonResponse
    {
        // Gateway-only: forward to Go (AI draft generation)
        $request->validate([
            'history' => 'array',
            'ticket_context' => 'string',
        ]);

        $goBase = rtrim(config('services.go_core.url', env('GO_CORE_URL', 'http://localhost:8080')), '/');
        $endpoint = $goBase . '/api/events';

        $clientResponse = \Illuminate\Support\Facades\Http::post($endpoint, [
            'event_type' => 'support.ai.draft_requested',
            'user_id' => auth()->id(),
            'payload' => [
                'ticket_context' => $request->input('ticket_context', 'General support inquiry'),
                'history' => $request->input('history', []),
            ],
        ]);

        if (!$clientResponse->ok()) {
            return response()->json(['success' => false], 502);
        }

        return response()->json(['success' => true]);
    }


    /**
     * Analyze OCR issue
     */
    public function analyzeOCR(Request $request): JsonResponse
    {
        $request->validate([
            'description' => 'required|string|max:2000',
        ]);

        // Gateway-only: forward to Go
        $goBase = rtrim(config('services.go_core.url', env('GO_CORE_URL', 'http://localhost:8080')), '/');
        $endpoint = $goBase . '/api/events';

        $clientResponse = \Illuminate\Support\Facades\Http::post($endpoint, [
            'event_type' => 'support.ai.ocr_requested',
            'user_id' => auth()->id(),
            'payload' => [
                'description' => $request->input('description'),
            ],
        ]);

        if (!$clientResponse->ok()) {
            return response()->json(['success' => false], 502);
        }

        return response()->json(['success' => true]);
    }


    /**
     * Summarize for escalation
     */
    public function summarize(Request $request): JsonResponse
    {
        $request->validate([
            'messages' => 'required|array',
        ]);

        // Gateway-only: forward to Go
        $goBase = rtrim(config('services.go_core.url', env('GO_CORE_URL', 'http://localhost:8080')), '/');
        $endpoint = $goBase . '/api/events';

        $clientResponse = \Illuminate\Support\Facades\Http::post($endpoint, [
            'event_type' => 'support.ai.escalation_summary_requested',
            'user_id' => auth()->id(),
            'payload' => [
                'messages' => $request->input('messages'),
            ],
        ]);

        if (!$clientResponse->ok()) {
            return response()->json(['success' => false], 502);
        }

        return response()->json(['success' => true]);
    }


    /**
     * Assign a random admin to the conversation
     */
    public function assignAdmin(Request $request): JsonResponse
    {
        // Gateway-only: delegate admin assignment to Go.
        $goBase = rtrim(config('services.go_core.url', env('GO_CORE_URL', 'http://localhost:8080')), '/');
        $endpoint = $goBase . '/api/events';

        $clientResponse = \Illuminate\Support\Facades\Http::post($endpoint, [
            'event_type' => 'support.admin.assign_requested',
            'user_id' => auth()->id(),
            'payload' => [
                'ticket_id' => (int) $request->input('ticket_id'),
            ],
        ]);

        if (!$clientResponse->ok()) {
            return response()->json(['success' => false], 502);
        }

        return response()->json(['success' => true]);

    }
}
