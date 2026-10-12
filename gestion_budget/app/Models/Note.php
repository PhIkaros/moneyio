<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    protected $fillable = [
        'user_id', 'title', 'content','items', 'color','pinned', 'archived', 'pinned_dashboard'
    ];

    protected $casts = [
'pinned'   => 'boolean',
    'archived' => 'boolean',
    'items'    => 'array',    ];

    public function user(){
        return $this->belongsTo(User::class);
    }
}
