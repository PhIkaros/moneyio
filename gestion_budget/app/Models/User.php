<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'avatar', 'locale', 'theme', 'currency', 'role', 'is_active'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function comptes()
    {
        return $this->hasMany(Compte::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function nikkiEntries()
    {
        return $this->hasMany(NikkiEntry::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
