<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplianceLog extends Model
{
    protected $fillable = [
        'lawyer_id',
        'action',
        'description',
        'status',
        'risk_level'
    ];

    public function lawyer(): BelongsTo
    {
        return $this->belongsTo(Lawyer::class);
    }
}
