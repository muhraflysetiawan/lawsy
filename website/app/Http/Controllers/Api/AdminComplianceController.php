<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ComplianceLog;
use App\Models\AdminActivityLog;

class AdminComplianceController extends Controller
{
    public function getLogs()
    {
        $logsRaw = collect();
        $stats = ['total_audits' => 0, 'passed' => 0, 'warning' => 0, 'failed' => 0];

        if (\Illuminate\Support\Facades\Schema::hasTable('admin_activity_logs')) {
            $logsRaw = AdminActivityLog::with('admin')->orderBy('created_at', 'desc')->take(100)->get();
            
            $stats = [
                'total_audits' => AdminActivityLog::count(),
                'passed' => AdminActivityLog::where('risk_level', 'Low')->orWhere('risk_level', 'info')->count(),
                'warning' => AdminActivityLog::where('risk_level', 'Medium')->count(),
                'failed' => AdminActivityLog::where('risk_level', 'High')->orWhere('risk_level', 'Critical')->count(),
            ];
        }

        $logs = $logsRaw->map(function($l) {
            $status = 'Passed';
            if ($l->risk_level === 'Medium') $status = 'Warning';
            if (in_array($l->risk_level, ['High', 'Critical'])) $status = 'Failed';

            return [
                'id' => $l->id,
                'created_at' => $l->created_at->format('M d, H:i A'),
                'admin_name' => $l->admin->name ?? 'System',
                'action' => $l->action,
                'category' => $l->category,
                'description' => $l->description,
                'status' => $status,
                'raw_status' => strtolower($status),
                'risk_level' => $l->risk_level
            ];
        });

        return response()->json([
            'logs' => $logs,
            'stats' => $stats
        ]);
    }
}
