<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    // GET /api/admin/products (List for Admin Table)
    public function index(Request $request)
    {
        $query = Product::with(['branch', 'brand', 'category', 'images'])->latest();

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->brand) {
            $query->whereHas('brand', fn($q) => $q->where('slug', $request->brand));
        }
        if ($request->branch) {
            $query->whereHas('branch', fn($q) => $q->where('name', 'like', '%' . $request->branch . '%'));
        }

        $perPage = $request->per_page ? (int) $request->per_page : 20;
        return $query->paginate($perPage);
    }

    // POST /api/admin/products
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'branch_id'       => 'required|exists:branches,id',
            'brand_id'        => 'required|exists:brands,id',
            'category_id'     => 'required|exists:categories,id',
            'camera_type'     => 'nullable|string',
            'condition_grade' => 'required|in:new,like_new,a,b,c',
            'price'           => 'required|numeric',
            'description'     => 'required|string',
            'status'          => 'sometimes|in:available,booked,sold,archived',
            'stock'           => 'sometimes|integer|min:0',
            'images'          => 'nullable|array',
            'images.*'        => 'file|max:10240', // max 10MB per image, no type restriction on Windows
            // Legacy single image support
            'image'           => 'nullable|file|max:10240',
        ]);

        // Handle first image_url (legacy field for backward-compat)
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }

        unset($validated['image'], $validated['images']);
        $validated['status'] = $validated['status'] ?? 'available';

        $product = Product::create($validated);

        // Store each uploaded image in product_images table
        $this->storeImages($request, $product);

        return response()->json([
            'message' => 'Produk berhasil ditambahkan',
            'product' => $product->load('images'),
        ], 201);
    }

    // GET /api/admin/products/{id}
    public function show($id)
    {
        return Product::with(['branch', 'brand', 'category', 'images'])->findOrFail($id);
    }

    // PUT/PATCH /api/admin/products/{id}
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name'            => 'sometimes|required|string|max:255',
            'branch_id'       => 'sometimes|required|exists:branches,id',
            'brand_id'        => 'sometimes|required|exists:brands,id',
            'category_id'     => 'sometimes|required|exists:categories,id',
            'camera_type'     => 'nullable|string',
            'condition_grade' => 'sometimes|required|in:new,like_new,a,b,c',
            'price'           => 'sometimes|required|numeric',
            'description'     => 'sometimes|required|string',
            'status'          => 'sometimes|required|in:available,booked,sold,archived',
            'stock'           => 'sometimes|integer|min:0',
            'images'          => 'nullable|array',
            'images.*'        => 'file|max:10240',
            'image'           => 'nullable|file|max:10240',
            // Flag to delete a specific image by ID
            'delete_image_ids' => 'sometimes|array',
            'delete_image_ids.*' => 'integer',
        ]);

        // Legacy single image update
        if ($request->hasFile('image')) {
            if ($product->image_url) {
                $oldPath = str_replace(asset('storage/'), '', $product->image_url);
                \Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }

        // Delete specific images if requested
        if (!empty($validated['delete_image_ids'])) {
            foreach ($validated['delete_image_ids'] as $imgId) {
                $img = ProductImage::where('id', $imgId)->where('product_id', $product->id)->first();
                if ($img) {
                    $oldPath = str_replace(asset('storage/'), '', $img->url);
                    \Storage::disk('public')->delete($oldPath);
                    $img->delete();
                }
            }
        }

        unset($validated['image'], $validated['images'], $validated['delete_image_ids']);
        $product->update($validated);

        // Add any newly uploaded images
        $this->storeImages($request, $product);

        return response()->json([
            'message' => 'Produk berhasil diperbarui',
            'product' => $product->load('images'),
        ]);
    }

    // DELETE /api/admin/products/{id}
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Produk berhasil dihapus']);
    }

    // ─── Helper ─────────────────────────────────────────────────────────────
    private function storeImages(Request $request, Product $product): void
    {
        if (!$request->hasFile('images')) return;

        $existing = $product->images()->count();
        foreach ($request->file('images') as $i => $file) {
            $path = $file->store('products', 'public');
            $url  = asset('storage/' . $path);

            ProductImage::create([
                'product_id' => $product->id,
                'url'        => $url,
                'sort_order' => $existing + $i,
            ]);

            // Set first image as the main image_url if not already set
            if ($existing === 0 && $i === 0 && !$product->image_url) {
                $product->update(['image_url' => $url]);
            }
        }
    }
}
