<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Order::with('items')->latest();

        if ($request->search) {
            $query->where('order_number', 'like', '%' . $request->search . '%')
                  ->orWhere('name', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $perPage = $request->per_page ? (int) $request->per_page : 20;
        return $query->paginate($perPage);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,paid,shipped,completed,cancelled',
            'courier' => 'nullable|string',
            'tracking_number' => 'nullable|string'
        ]);

        $order = \App\Models\Order::findOrFail($id);
        
        // If cancelled, return product status back to available
        if ($validated['status'] === 'cancelled' && $order->status !== 'cancelled') {
            foreach ($order->items as $item) {
                if ($item->product) {
                    $item->product->update(['status' => 'available']);
                }
            }
        }
        
        // If changed to paid/completed, keep as booked/sold based on business rules.
        // E.g., if completed, mark item as 'sold'.
        if (in_array($validated['status'], ['paid', 'shipped', 'completed']) && $order->status === 'pending') {
            foreach ($order->items as $item) {
                if ($item->product && $item->product->status === 'booked') {
                    $item->product->update(['status' => 'sold']);
                }
            }
        }

        $updateData = ['status' => $validated['status']];
        
        if ($request->has('tracking_number')) {
            $updateData['tracking_number'] = $request->tracking_number;
        }

        $order->update($updateData);

        return response()->json([
            'message' => 'Status pesanan berhasil diperbarui',
            'order' => $order
        ]);
    }
}
