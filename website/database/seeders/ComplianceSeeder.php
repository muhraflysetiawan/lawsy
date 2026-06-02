<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ComplianceLog;
use App\Models\Lawyer;

class ComplianceSeeder extends Seeder
{
    public function run(): void
    {
        $lawyer = Lawyer::first();
        if (!$lawyer) return;

        ComplianceLog::create([
            'lawyer_id' => $lawyer->id,
            'action' => 'Document Verification',
            'description' => 'Identity Card verified against national database.',
            'status' => 'Passed',
            'risk_level' => 'Low',
        ]);

        ComplianceLog::create([
            'lawyer_id' => $lawyer->id,
            'action' => 'License Check',
            'description' => 'Professional license expired 2 days ago.',
            'status' => 'Warning',
            'risk_level' => 'Medium',
        ]);

        ComplianceLog::create([
            'lawyer_id' => $lawyer->id,
            'action' => 'Background Check',
            'description' => 'Criminal record found in secondary database.',
            'status' => 'Failed',
            'risk_level' => 'Critical',
        ]);
    }
}
