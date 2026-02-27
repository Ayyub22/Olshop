<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function brandPage($slug)
    {
        $brand = Brand::where('slug', $slug)->first();

        if (!$brand) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        $products = $brand->products()->with(['branch', 'category', 'brand'])
            ->where('status', '!=', 'archived')
            ->latest()
            ->paginate(12);

        return response()->json([
            'brand' => $brand,
            'products' => $products
        ]);
    }

    public function branchPage($slug)
    {
        $branch = Branch::where('slug', $slug)->first();

        if (!$branch) {
            return response()->json(['message' => 'Branch not found'], 404);
        }

        $products = $branch->products()->with(['branch', 'category', 'brand'])
            ->where('status', '!=', 'archived')
            ->latest()
            ->paginate(12);

        return response()->json([
            'branch' => $branch,
            'products' => $products
        ]);
    }

    public function categoryPage($slug)
    {
        $category = Category::where('slug', $slug)->first();

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $products = $category->products()->with(['branch', 'category', 'brand'])
            ->where('status', '!=', 'archived')
            ->latest()
            ->paginate(12);

        return response()->json([
            'category' => $category,
            'products' => $products
        ]);
    }

    public function allBrands()
    {
        return response()->json(Brand::select('id', 'name', 'slug')->orderBy('name')->get());
    }

    public function allBranches()
    {
        return response()->json(Branch::select('id', 'name', 'slug', 'city')->orderBy('name')->get());
    }

    public function allCategories()
    {
        return response()->json(Category::select('id', 'name', 'slug')->orderBy('name')->get());
    }
}
