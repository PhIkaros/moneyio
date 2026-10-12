<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SousCateg extends Model
{
    protected $fillable = ['name', 'description', 'categorie_id'];

    public function category()
    {
        return $this->belongsTo(Category::class, 'categorie_id');
    }

    public function incomes()
    {
        return $this->hasMany(Income::class, 'sous_categ_id');
    }

    public function outcomes()
    {
        return $this->hasMany(Outcome::class, 'sous_categ_id');
    }
}
