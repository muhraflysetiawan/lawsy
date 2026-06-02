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
        if (!Schema::hasTable('admin_activity_logs')) {
            Schema::create('admin_activity_logs', function (Blueprint $table) {
                // Primary key
                $table->id();
                
                // Admin user details
                $table->unsignedBigInteger('admin_id')->nullable()->index();
                $table->string('admin_name')->nullable();
                
                // Action specifics
                $table->string('action')->index();
                $table->string('category')->nullable()->index(); 
                $table->string('target_type')->nullable()->index(); 
                $table->unsignedBigInteger('target_id')->nullable()->index();
                $table->text('description')->nullable();
                
                // Context and severity
                $table->string('severity')->nullable()->default('info');
                $table->string('risk_level')->nullable(); 
                $table->json('metadata')->nullable(); 
                
                // Request information
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                
                // Timestamps
                $table->timestamps();
            });
        } else {
            // Add missing columns if the table already exists
            Schema::table('admin_activity_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('admin_activity_logs', 'admin_name')) {
                    $table->string('admin_name')->nullable();
                }
                if (!Schema::hasColumn('admin_activity_logs', 'target_type')) {
                    $table->string('target_type')->nullable()->index();
                }
                if (!Schema::hasColumn('admin_activity_logs', 'target_id')) {
                    $table->unsignedBigInteger('target_id')->nullable()->index();
                }
                if (!Schema::hasColumn('admin_activity_logs', 'severity')) {
                    $table->string('severity')->nullable()->default('info');
                }
                if (!Schema::hasColumn('admin_activity_logs', 'risk_level')) {
                    $table->string('risk_level')->nullable();
                }
                if (!Schema::hasColumn('admin_activity_logs', 'user_agent')) {
                    $table->text('user_agent')->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        // Don't drop the entire table if it was created by an earlier migration,
        // but for simplicity, we'll leave this empty or just drop the columns we added.
        // Dropping the whole table is dangerous for duplicate migrations.
        // Schema::dropIfExists('admin_activity_logs');
    }
};
