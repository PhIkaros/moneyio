<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NikkiEntry extends Model
{
    protected $fillable =[
        'user_id', 'title','content','layout', 'date'
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }
     public function images()
    {
        return $this->hasMany(NikkiEntryImage::class)->orderBy('order');
    }
}
