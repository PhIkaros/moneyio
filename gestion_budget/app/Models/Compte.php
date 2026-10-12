<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Compte extends Model
{
    protected $fillable = ['name', 'balance','type','user_id'];

    public function incomes()
    {
        return $this->hasMany(Income::class);
    }

    public function outcomes()
    {
        return $this->hasMany(Outcome::class);
    }

    public function sentTransferts()
    {
        return $this->hasMany(Transfert::class, 'from_compte_id');
    }

    public function receivedTransferts()
    {
        return $this->hasMany(Transfert::class, 'to_compte_id');
}
}
