<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'title',
        'category',
        'admin_name',
        'content',
        'image_path',
        'status',
        'views'
    ];
}
