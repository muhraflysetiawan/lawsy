<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ComplianceLog;

class ComplianceController extends Controller
{
    public function index()
    {
        $logs = ComplianceLog::with('lawyer')->orderBy('created_at', 'desc')->get();
        
        $stats = [
            'total_audits' => ComplianceLog::count(),
            'passed' => ComplianceLog::where('status', 'Passed')->count(),
            'warning' => ComplianceLog::where('status', 'Warning')->count(),
            'failed' => ComplianceLog::where('status', 'Failed')->count(),
        ];

        return view('admin.compliance', compact('logs', 'stats'));
    }
}
