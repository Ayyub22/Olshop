<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 0. Create Admin User
        // Note: Password is automatically encrypted because 'password' => 'hashed' cast in User model
        User::create([
            'name' => 'Admin Pusat',
            'email' => 'admin@eloracamera.com',
            'password' => 'password123', // Will be encrypted to Bcrypt/Argon2
        ]);

        // 1. Create Branches (SEO City Pages)
        $jakarta = \App\Models\Branch::create([
            'name' => 'TuKam Jakarta',
            'slug' => 'jakarta',
            'city' => 'Jakarta Selatan',
            'address' => 'Jl. Radio Dalam Raya No. 12',
            'google_maps_url' => 'https://maps.google.com/?q=jakarta',
            'contact_info' => '0812-3456-7890',
        ]);

        $bandung = \App\Models\Branch::create([
            'name' => 'TuKam Bandung',
            'slug' => 'bandung',
            'city' => 'Bandung',
            'address' => 'Jl. Braga No. 99',
            'google_maps_url' => 'https://maps.google.com/?q=bandung',
            'contact_info' => '0812-9876-5432',
        ]);

        // 2. Create Brands (Authority Pages)
        $sony = \App\Models\Brand::create([
            'name' => 'Sony',
            'slug' => 'sony',
            'seo_title' => 'Jual Kamera Sony Bekas & Baru Garansi Resmi',
            'seo_description' => 'Temukan koleksi kamera Sony terlengkap. Dari A7III hingga A6000.',
        ]);

        $fuji = \App\Models\Brand::create([
            'name' => 'Fujifilm',
            'slug' => 'fujifilm',
            'seo_title' => 'Kamera Fujifilm X-Series Terbaik',
            'seo_description' => 'Jual kamera Fujifilm bekas berkualitas Grade A.',
        ]);

        $canon = \App\Models\Brand::create([
            'name' => 'Canon',
            'slug' => 'canon',
            'seo_title' => 'Canon EOS & Mirrorless Store',
            'seo_description' => 'Pusat kamera Canon terlengkap.',
        ]);

        // 3. Create Categories
        $catKamera = \App\Models\Category::create(['name' => 'Kamera', 'slug' => 'kamera']);
        $catLensa = \App\Models\Category::create(['name' => 'Lensa', 'slug' => 'lensa']);

        // 4. Create Unique Products (The Core Logic)
        
        // Item 1: Sony A7III di Jakarta (Available)
        \App\Models\Product::create([
            'name' => 'Sony A7III Body Only',
            'slug' => 'sony-a7iii-jakarta-grade-a-001', // Unique Slug strategy
            'branch_id' => $jakarta->id,
            'brand_id' => $sony->id,
            'category_id' => $catKamera->id,
            'condition_grade' => 'a',
            'price' => 19500000,
            'description' => 'Kelengkapan fullset box, SC rendah 5rb, sensor bersih.',
            'status' => 'available',
        ]);

        // Item 2: Sony A7III di Bandung (Sold) -> Still visible for SEO
        \App\Models\Product::create([
            'name' => 'Sony A7III Body Only',
            'slug' => 'sony-a7iii-bandung-grade-b-002',
            'branch_id' => $bandung->id,
            'brand_id' => $sony->id,
            'category_id' => $catKamera->id,
            'condition_grade' => 'b',
            'price' => 17000000,
            'description' => 'Lecet pemakaian wajar, karet kencang, fungsi 100%.',
            'status' => 'sold',
        ]);

        // Item 3: Fuji XT30 di Jakarta
        \App\Models\Product::create([
            'name' => 'Fujifilm X-T30 Kit 15-45mm',
            'slug' => 'fuji-xt30-jakarta-like-new-003',
            'branch_id' => $jakarta->id,
            'brand_id' => $fuji->id,
            'category_id' => $catKamera->id,
            'condition_grade' => 'like_new',
            'price' => 12500000,
            'description' => 'Mulus 99% like new, garansi on.',
            'status' => 'available',
        ]);

        // Item 4: Lensa Canon di Bandung
        \App\Models\Product::create([
            'name' => 'Canon EF 50mm f/1.8 STM',
            'slug' => 'canon-50mm-stm-bandung-grade-a-004',
            'branch_id' => $bandung->id,
            'brand_id' => $canon->id,
            'category_id' => $catLensa->id,
            'condition_grade' => 'a',
            'price' => 1500000,
            'description' => 'No jamur no fog, af lancar jaya.',
            'status' => 'available',
        ]);
    }
}
