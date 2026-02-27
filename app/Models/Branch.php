<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'city',
        'address',
        'google_maps_url',
        'photo_url',
        'contact_info',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
