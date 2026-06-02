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
        Schema::table('support_messages', function (Blueprint $table) {
            if (!Schema::hasColumn('support_messages', 'file_path')) {
                $table->string('file_path')->nullable();
            }
            if (!Schema::hasColumn('support_messages', 'file_name')) {
                $table->string('file_name')->nullable();
            }
            if (!Schema::hasColumn('support_messages', 'file_type')) {
                $table->string('file_type')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
