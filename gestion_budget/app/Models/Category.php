<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'description', 'type'];

    public function sousCategories()
    {
        return $this->hasMany(SousCateg::class, 'categorie_id'); }

           public function budgets(){
        return $this->hasMany(Budget::class);
     }
}
