<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'seo_title',
        'seo_description',
        'hero_image_url',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
