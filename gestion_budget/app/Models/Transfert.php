<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transfert extends Model
{
    protected $fillable = ['amount', 'date', 'description', 'from_compte_id', 'to_compte_id'];

    public function fromCompte()
    {
        return $this->belongsTo(Compte::class, 'from_compte_id');
    }

    public function toCompte()
    {
        return $this->belongsTo(Compte::class, 'to_compte_id');
    }
}
