<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; // Added this line
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory; // Added this line

    protected $fillable = [
        'name',
        'slug',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
