<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Outcome extends Model
{
    protected $fillable = ['amount', 'date', 'description', 'compte_id', 'sous_categ_id'];

    public function compte(){
        return $this->belongsTo(Compte::class);
    }

    public function sousCateg(){
        return $this->belongsTo(SousCateg::class, 'sous_categ_id');
    }
}
