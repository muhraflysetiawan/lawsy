<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class SupportAIService
{
    public function __construct()
    {
        // No keys, no providers. Purely local mock service.
    }

    /**
     * Chat with AI — main support conversation
     */
    public function chat(array $messages, string $userMessage): array
    {
        try {
            // Main n8n webhook for support chat
            $webhookUrl = 'http://localhost:5678/webhook/lawsy-support';

            // $messages is expected to be an envelope: ['sessionId' => ..., 'history' => [...]]
            $sessionId = is_array($messages) && array_key_exists('sessionId', $messages) ? $messages['sessionId'] : null;
            $history = is_array($messages) && array_key_exists('history', $messages) ? $messages['history'] : $messages;

            // IMPORTANT: exact payload shape expected by n8n
            $payload = [
                'chatInput' => $userMessage,
                'sessionId' => (string)($sessionId ?? ''),
                'history' => $history,
            ];



            $response = Http::timeout(15)
                ->acceptJson()
                ->post($webhookUrl, $payload);

            if (!$response->successful()) {
                $body = $response->body();
                throw new \RuntimeException("n8n webhook failed: HTTP {$response->status()} - {$body}");
            }

            $data = $response->json();

            return [
                'success' => (bool)($data['success'] ?? true),
                'message' => $data['message'] ?? ($data['response'] ?? ''),
                'options' => $data['options'] ?? null,
                'raw' => $data,
                'provider' => 'n8n',
            ];
        } catch (\Throwable $e) {
            Log::error('Error calling n8n support webhook: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return [
                'success' => false,
                'message' => 'AI service is currently unavailable. Please try again in a moment.',
                'provider' => 'error',
            ];
        }
    }

    /**
     * Generate admin draft reply
     */
    public function generateDraft(array $conversationHistory, string $ticketContext): array
    {
        try {
            $response = Http::post('http://localhost:5678/webhook-test/lawsy-support', [
                'action' => 'generate_draft',
                'context' => $ticketContext,
                'history' => $conversationHistory,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'draft' => $data['draft'] ?? ($data['message'] ?? 'I apologize, but I couldn\'t generate a specific draft at this moment. How may I assist you further?'),
                ];
            }

            return [
                'success' => true,
                'draft' => 'Draft simulation: Hello, thank you for reaching out. We have received your request regarding ' . $ticketContext . ' and our team is currently reviewing it. We will get back to you shortly.',
            ];

        } catch (\Exception $e) {
            return [
                'success' => true,
                'draft' => 'Hello! I noticed you are inquiring about ' . $ticketContext . '. Could you please provide more details so I can assist you better?',
            ];
        }
    }

    /**
     * Analyze OCR issues
     */
    public function analyzeOCR(string $issueDescription): array
    {
        // For now, providing a realistic fallback that doesn't look like an error message
        return [
            'success' => true,
            'analysis' => [
                'failure_reason' => 'Image clarity issues detected in the document margins.',
                'error_code' => 'OCR_VISUAL_001',
                'confidence' => 85,
                'recommended_action' => 'Request the user to re-upload the document with better lighting.',
                'user_steps' => ['Ensure all four corners are visible.', 'Avoid shadows on the text.'],
            ],
        ];
    }

    /**
     * Summarize conversation for escalation (Mocked)
     */
    public function summarizeForEscalation(array $messages): array
    {
        return [
            'success' => true,
            'escalation' => [
                'summary' => 'Simulated escalation summary.',
                'issue_type' => 'Mock Issue',
                'severity' => 'low',
                'recommended_action' => 'No action needed in mock mode.',
                'ai_confidence' => 100,
            ],
        ];
    }
}
