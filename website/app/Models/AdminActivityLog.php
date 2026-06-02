<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminActivityLog extends Model
{
    protected $fillable = [
        'admin_id',
        'admin_name',
        'action',
        'category',
        'target_type',
        'target_id',
        'description',
        'severity',
        'risk_level',
        'metadata',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Prevent updates — activity logs are immutable.
     */
    public static function boot()
    {
        parent::boot();

        static::updating(function () {
            throw new \RuntimeException('Activity logs cannot be modified.');
        });

        static::deleting(function () {
            throw new \RuntimeException('Activity logs cannot be deleted.');
        });
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Scope to filter by category
     */
    public function scopeCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to filter by action
     */
    public function scopeAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Get a human-readable icon class for this action
     */
    public function getIconAttribute(): array
    {
        return match($this->action) {
            'approve_lawyer' => ['bg' => 'bg-[#E1FCEF]', 'text' => 'text-[#10B981]', 'icon' => 'check'],
            'reject_lawyer', 'suspend_lawyer' => ['bg' => 'bg-[#FCE8E8]', 'text' => 'text-[#EF4444]', 'icon' => 'x'],
            'revision_lawyer' => ['bg' => 'bg-[#FEF3C7]', 'text' => 'text-[#F59E0B]', 'icon' => 'refresh'],
            'close_ticket' => ['bg' => 'bg-[#E1FCEF]', 'text' => 'text-[#10B981]', 'icon' => 'check'],
            'assign_admin' => ['bg' => 'bg-[#EBF3FA]', 'text' => 'text-[#1D5083]', 'icon' => 'user'],
            'publish_article', 'create_document' => ['bg' => 'bg-[#EBF3FA]', 'text' => 'text-[#1D5083]', 'icon' => 'document'],
            'delete_article' => ['bg' => 'bg-[#FCE8E8]', 'text' => 'text-[#EF4444]', 'icon' => 'trash'],
            'update_profile', 'update_settings' => ['bg' => 'bg-[#F3F4F6]', 'text' => 'text-[#6B7280]', 'icon' => 'settings'],
            'send_message' => ['bg' => 'bg-[#EBF3FA]', 'text' => 'text-[#1D5083]', 'icon' => 'chat'],
            'escalate_case', 'resolve_case' => ['bg' => 'bg-[#FEF3C7]', 'text' => 'text-[#F59E0B]', 'icon' => 'alert'],
            default => ['bg' => 'bg-[#F3F4F6]', 'text' => 'text-[#6B7280]', 'icon' => 'info'],
        };
    }
}
