<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SupportTicket;
use App\Models\SupportMessage;
use App\Models\User;

class SupportSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (!$user) return;

        $ticket1 = SupportTicket::create([
            'ticket_id' => '#L-9042',
            'subject' => 'Verification delay for Marcus Thorne',
            'user_id' => $user->id,
            'status' => 'Waiting',
            'priority' => 'High',
            'last_message_at' => now(),
        ]);

        SupportMessage::create([
            'support_ticket_id' => $ticket1->id,
            'sender_id' => $user->id,
            'role' => 'user',
            'content' => 'Hello, I have been waiting for my verification for 3 days. Can you please check?',
        ]);

        SupportMessage::create([
            'support_ticket_id' => $ticket1->id,
            'sender_id' => $user->id,
            'role' => 'ai_report',
            'content' => 'AI detected high urgency. Escalating to human admin.',
            'ai_confidence' => 0.95
        ]);

        $ticket2 = SupportTicket::create([
            'ticket_id' => '#L-8821',
            'subject' => 'How to upload multiple documents?',
            'user_id' => $user->id,
            'status' => 'Handled',
            'priority' => 'Low',
            'last_message_at' => now()->subDay(),
        ]);

        SupportMessage::create([
            'support_ticket_id' => $ticket2->id,
            'sender_id' => $user->id,
            'role' => 'user',
            'content' => 'I am trying to upload 5 documents at once but it only accepts one by one.',
        ]);
    }
}
