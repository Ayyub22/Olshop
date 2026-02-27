<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Protected Admin API
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/orders', [App\Http\Controllers\Api\OrderController::class, 'indexUser']);
    
    Route::apiResource('/admin/products', App\Http\Controllers\Api\AdminProductController::class);
    
    // Admin Orders
    Route::get('/admin/orders', [App\Http\Controllers\Api\AdminOrderController::class, 'index']);
    Route::put('/admin/orders/{id}', [App\Http\Controllers\Api\AdminOrderController::class, 'update']);
});

// Public Product API
Route::get('/products', [App\Http\Controllers\Api\ProductController::class, 'index']);
Route::get('/products/{slug}', [App\Http\Controllers\Api\ProductController::class, 'show']);

// Public SEO Page Data (by slug)
Route::get('/brands/{slug}', [App\Http\Controllers\Api\PublicController::class, 'brandPage']);
Route::get('/branches/{slug}', [App\Http\Controllers\Api\PublicController::class, 'branchPage']);
Route::get('/categories/{slug}', [App\Http\Controllers\Api\PublicController::class, 'categoryPage']);

// List all (for frontend dropdowns)
Route::get('/brands', [App\Http\Controllers\Api\PublicController::class, 'allBrands']);
Route::get('/branches', [App\Http\Controllers\Api\PublicController::class, 'allBranches']);
Route::get('/categories', [App\Http\Controllers\Api\PublicController::class, 'allCategories']);

// Orders API
Route::post('/orders', [App\Http\Controllers\Api\OrderController::class, 'store']);
Route::get('/orders/{orderNumber}', [App\Http\Controllers\Api\OrderController::class, 'show']);
Route::get('/orders/{orderNumber}/track', [App\Http\Controllers\Api\OrderController::class, 'track']);
Route::post('/payments/notification', [App\Http\Controllers\Api\OrderController::class, 'notification']);
Route::post('/orders/{orderNumber}/mark-paid', [App\Http\Controllers\Api\OrderController::class, 'markPaid']);

// Include Breeze API routes
require __DIR__.'/auth.php';
