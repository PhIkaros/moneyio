<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class NikkiEntryImage extends Model
{
    protected $fillable = ['nikki_entry_id', 'path', 'order'];

    // so frontend gets a ready-to-use URL
    protected $appends = ['url'];

    public function getUrlAttribute()
    {
    return asset('storage/' . $this->path);
    }
}
