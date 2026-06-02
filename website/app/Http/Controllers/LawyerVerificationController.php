<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\Lawyer;
use App\Models\User;
use App\Services\AdminActivityService;

class LawyerVerificationController extends Controller
{
    public function index(Request $request)
    {
        $statusQuery = $request->get('status', 'all');
        
        // Calculate dynamic stats
        $totalLawyers = Lawyer::count();
        $pendingCount = Lawyer::where('status', 'pending')->count();
        $approvedCount = Lawyer::where('status', 'approved')->count();
        $rejectedCount = Lawyer::where('status', 'rejected')->count();
        $approvedToday = Lawyer::where('status', 'approved')->whereDate('created_at', today())->count();

        $stats = [
            'total' => $totalLawyers,
            'pending' => $pendingCount,
            'approved_today' => $approvedToday,
            'rejected_30d' => $rejectedCount
        ];

        // Fetch query based on tab selected
        $query = Lawyer::latest();
        if ($statusQuery === 'pending') {
            $query->where('status', 'pending');
        } elseif ($statusQuery === 'approved') {
            $query->where('status', 'approved');
        }

        $rawLawyers = $query->get();

        $allLawyers = $rawLawyers->map(function ($lawyer) {
            $names = explode(' ', trim($lawyer->full_name));
            $initials = '';
            if (count($names) >= 2) {
                $initials = strtoupper(substr($names[0], 0, 1) . substr($names[1], 0, 1));
            } else {
                $initials = strtoupper(substr($names[0] ?? 'L', 0, 2));
            }

            return [
                'id' => $lawyer->id,
                'name' => $lawyer->full_name,
                'initials' => $initials,
                'avatar' => $lawyer->face_scan_path ? asset($lawyer->face_scan_path) : null,
                'education' => $lawyer->biography ?: 'JD, Faculty of Law',
                'firm' => $lawyer->law_firm ?: 'Independent Practice',
                'specialization' => $lawyer->specialization ?: 'General Practice',
                'experience' => ($lawyer->years_experience ?: 0) . ' Years',
                'status' => ucfirst($lawyer->status), // 'Pending' or 'Approved' or 'Rejected'
                'date' => $lawyer->created_at ? $lawyer->created_at->format('M d, Y') : now()->format('M d, Y'),
                'id_card_path' => $lawyer->id_card_path,
                'lawyer_license_path' => $lawyer->lawyer_license_path,
                'oath_doc_path' => $lawyer->oath_doc_path,
                'degree_path' => $lawyer->degree_path,
                'skill_cert_path' => $lawyer->skill_cert_path,
                'face_scan_path' => $lawyer->face_scan_path,
                'biography' => $lawyer->biography
            ];
        })->toArray();

        // Laravel Pagination wrapper for the collection
        $currentPage = $request->get('page', 1);
        $perPage = 50;
        $collection = collect($allLawyers);
        
        $paginator = new LengthAwarePaginator(
            $collection->slice(($currentPage - 1) * $perPage, $perPage)->all(),
            $collection->count(),
            $perPage,
            $currentPage,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        // UI expects these specific subsets
        $allApplicants = $paginator->items();
        $pendingApplicants = collect($allLawyers)->where('status', 'Pending')->all();
        $approvedApplicants = collect($allLawyers)->where('status', 'Approved')->all();

        return view('admin.lawyersverification', compact('paginator', 'allApplicants', 'pendingApplicants', 'approvedApplicants', 'stats'));
    }

    public function updateStatus(Request $request, $id)
    {
        $lawyer = Lawyer::findOrFail($id);
        $lawyer->status = strtolower($request->status); // e.g. 'approved', 'rejected'
        $lawyer->save();

        // Promote role to 'Lawyer' if approved
        if (strtolower($request->status) === 'approved') {
            $user = User::find($lawyer->user_id);
            if ($user) {
                $user->role = 'Lawyer';
                $user->save();
            }
        }

        $lawyerName = $lawyer->full_name;

        // Map status to action
        $action = match(strtolower($request->status)) {
            'approved' => 'approve_lawyer',
            'rejected' => 'reject_lawyer',
            'suspended' => 'suspend_lawyer',
            'revision' => 'revision_lawyer',
            default => 'update_lawyer',
        };

        AdminActivityService::log(
            action: $action,
            category: 'lawyers',
            description: ucfirst($request->status) . " lawyer: {$lawyerName}" . ($request->notes ? " — Notes: {$request->notes}" : ''),
            metadata: ['lawyer_id' => $id, 'lawyer_name' => $lawyerName, 'new_status' => $request->status],
            riskLevel: in_array(strtolower($request->status), ['suspended', 'rejected']) ? 'High' : 'Low'
        );

        return response()->json([
            'success' => true,
            'message' => 'Lawyer status updated successfully',
        ]);
    }
}

