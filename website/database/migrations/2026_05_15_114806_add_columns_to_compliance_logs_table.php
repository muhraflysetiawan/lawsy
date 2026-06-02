<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('compliance_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('compliance_logs', 'lawyer_id')) {
                $table->foreignId('lawyer_id')->nullable()->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('compliance_logs', 'action')) {
                $table->string('action');
            }
            if (!Schema::hasColumn('compliance_logs', 'description')) {
                $table->text('description')->nullable();
            }
            if (!Schema::hasColumn('compliance_logs', 'status')) {
                $table->string('status')->default('Passed');
            }
            if (!Schema::hasColumn('compliance_logs', 'risk_level')) {
                $table->string('risk_level')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('compliance_logs', function (Blueprint $table) {
            //
        });
    }
};
