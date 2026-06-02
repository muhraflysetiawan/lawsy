<?php

namespace App\Services;

use App\Models\AdminActivityLog;
use App\Models\ComplianceLog;
use App\Models\AdminNotification;
use App\Models\AnalyticsStatistic;
use App\Models\SecurityEvent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;

class AdminActivityService
{
    public static function log(
        string $action,
        string $category,
        string $description,
        array $metadata = [],
        string $riskLevel = 'info',
        $targetEntityId = null
    ) {
        $service = new self();
        return $service->logActivity($action, $category, $description, $metadata, $riskLevel, $targetEntityId);
    }

    public function logActivity(
        string $action,
        string $category,
        string $description,
        array $metadata = [],
        string $severity = 'info',
        $targetEntityId = null
    ) {
        return DB::transaction(function () use ($action, $category, $description, $metadata, $severity, $targetEntityId) {
            $user = auth()->user();

            if (!$user) {
                return null;
            }

            // 1. Create Admin Activity Log
            $activityLog = AdminActivityLog::create([
                'admin_id' => $user->id,
                'action' => $action,
                'category' => $category,
                'description' => $description,
                'metadata' => $metadata,
                'ip_address' => Request::ip(),
            ]);

            // 2. Create Compliance Log
            // Some DB schemas may require admin_id; this service currently only knows lawyer_id.
            // To avoid breaking support chat, only create compliance logs when schema supports it.
            try {
                ComplianceLog::create([
                    'lawyer_id' => $targetEntityId, // if applicable
                    'action' => $action,
                    'description' => $description,
                    'status' => 'Passed',
                    'risk_level' => $severity,
                ]);
            } catch (\Throwable $e) {
                // Never fail chat flow due to compliance logging.
            }


            // 3. Create Admin Notification
            // admin_notifications migration in this repo is minimal; protect chat from DB schema mismatch.
            try {
                AdminNotification::create([
                    'user_id' => $user->id,
                    'title' => 'New Activity: ' . $action,
                    'message' => $description,
                    'type' => $severity,
                    'category' => $category,
                    'is_read' => false,
                ]);
            } catch (\Throwable $e) {
                // ignore notification persistence failures
            }


            // 4. Update Analytics Statistics
            // Here we could increment counts in AnalyticsStatistics or just rely on aggregations

            // Broadcast Event (Realtime)
            event(new \App\Events\AdminActivityLogged($activityLog));

            return $activityLog;
        });
    }
}
