<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Lawyer;
use App\Models\Article;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Get stats directly from the shared MySQL database
        $totalUsers = User::count();
        $totalArticles = Article::count();

        // Calculate case stats from database
        $totalCases = DB::table('cases')->count();
        $activeInvestigations = DB::table('cases')->whereNotIn('status', ['Resolved', 'Closed'])->count();
        $criticalCases = DB::table('cases')->where('status', 'Escalated')->count();

        $caseStats = [
            'total' => $totalCases,
            'active_investigations' => $activeInvestigations,
            'critical' => $criticalCases
        ];

        // Calculate lawyer stats from database
        $totalLawyers = Lawyer::count();
        $pendingLawyers = Lawyer::where('status', 'pending')->count();
        $approvedLawyers = Lawyer::where('status', 'approved')->count();

        $lawyerStats = [
            'total' => $totalLawyers,
            'pending' => $pendingLawyers,
            'approved' => $approvedLawyers
        ];

        // Fetch recent activities from database
        $recentActivitiesRaw = collect();
        if (Schema::hasTable('admin_activity_logs')) {
            $recentActivitiesRaw = AdminActivityLog::with('admin')->latest()->take(10)->get();
        }

        $recentActivities = $recentActivitiesRaw->map(function ($log) {
            $icon = $log->icon; // accessor from model
            return [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $log->description,
                'admin_name' => $log->admin ? $log->admin->name : ($log->admin_name ?: 'System'),
                'time_ago' => $log->created_at ? $log->created_at->diffForHumans() : 'Just now',
                'icon_bg' => $icon['bg'] ?? 'bg-[#F3F4F6]',
                'icon_text' => $icon['text'] ?? 'text-[#6B7280]',
                'icon_svg' => $icon['icon'] ?? 'info',
            ];
        });

        return view('admin.dashboardadmin', [
            'totalUsers' => $totalUsers,
            'totalArticles' => $totalArticles,
            'caseStats' => $caseStats,
            'lawyerStats' => $lawyerStats,
            'recentActivities' => $recentActivities
        ]);
    }
}

