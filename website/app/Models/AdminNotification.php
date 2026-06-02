<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminNotification extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'category',
        'is_read',
        'data',
    ];
}

