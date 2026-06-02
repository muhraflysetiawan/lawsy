<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('admin_activity_logs')) {
            Schema::create('admin_activity_logs', function (Blueprint $table) {
                $table->id();
                $table->integer('admin_id')->index();
                $table->foreign('admin_id')->references('id')->on('users')->onDelete('cascade');
                $table->string('action');          // approve_lawyer, suspend_lawyer, close_ticket, etc.
                $table->string('category');        // lawyers, cases, documents, support, settings
                $table->text('description');
                $table->json('metadata')->nullable(); // {target_id, target_name, extra...}
                $table->string('ip_address')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_activity_logs');
    }
};
