<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Notification;
use App\Models\User;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (!$user) return;

        Notification::create([
            'user_id' => $user->id,
            'title' => 'New Lawyer Registration',
            'message' => 'Marcus Thorne submitted a verification request with 6 documents.',
            'type' => 'info',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Revision Request Sent',
            'message' => 'Identity Card revision requested for Elena Rodriguez. Reason: Blurry document.',
            'type' => 'warning',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Lawyer Approved',
            'message' => 'Sarah Jenkins has been verified and approved as a licensed lawyer.',
            'type' => 'success',
            'is_read' => true,
        ]);
    }
}
