<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['branch', 'brand', 'category', 'images']);

        // Filter by Brand (slug)
        if ($request->filled('brand')) {
            $query->whereHas('brand', function ($q) use ($request) {
                $q->where('slug', $request->brand);
            });
        }

        // Filter by Category (slug)
        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Filter by Branch (slug)
        if ($request->filled('branch')) {
            $query->whereHas('branch', function ($q) use ($request) {
                $q->where('slug', $request->branch);
            });
        }

        // Filter by Price Range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by Condition Grade
        if ($request->filled('grade')) {
            $query->where('condition_grade', $request->grade);
        }

        // Filter by Camera Type
        if ($request->filled('camera_type')) {
            $query->where('camera_type', $request->camera_type);
        }

        // Search by Name
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Status default to available unless specified otherwise (or handled by scope)
        // Usually we only show available items in main list, but maybe 'sold' too if requested
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->whereIn('status', ['available', 'booked', 'sold']); // Show sold too?
        }

        $perPage = min(500, (int) $request->get('per_page', 100));
        $products = $query->latest()->paginate($perPage);

        return response()->json($products);
    }

    public function show($slug)
    {
        $product = Product::with(['branch', 'brand', 'category', 'images'])
            ->where('slug', $slug)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }
}
