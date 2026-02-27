<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'branch_id',
        'brand_id',
        'category_id',
        'camera_type',
        'condition_grade',
        'price',
        'description',
        'status',
        'stock',
        'image_url',
    ];

    public function images()
    {
        return $this->hasMany(\App\Models\ProductImage::class)->orderBy('sort_order');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                // Format: sony-a7iii-jakarta-grade-a-{unique_id}
                // Since we don't have ID yet, we use timestamp or random string, 
                // or we rely on the user/controller to pass it.
                // For now, let's make a best-effort slug.
                $base = \Illuminate\Support\Str::slug($product->name);
                $product->slug = $base . '-' . uniqid();
            }
        });
    }
}
