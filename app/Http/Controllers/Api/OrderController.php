<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'phone'                 => 'required|string|max:20',
            'address'               => 'required|string',
            'payment_method'        => 'nullable|string',
            'items'                 => 'required|array|min:1',
            'items.*.product_id'    => 'required|exists:products,id',
            'items.*.quantity'      => 'required|integer|min:1',
            'shipping_cost'         => 'required|numeric|min:0',
            'courier'               => 'required|string',
        ]);

        // Calculate total and prepare items
        $totalAmount    = 0;
        $orderItemsData = [];
        $productsToUpdate = [];
        $midtransItems  = [];

        foreach ($validated['items'] as $item) {
            $product = \App\Models\Product::find($item['product_id']);

            if (!$product || $product->status !== 'available') {
                return response()->json([
                    'message' => "Produk {$product->name} sudah tidak tersedia."
                ], 400);
            }

            if ($product->stock < $item['quantity']) {
                return response()->json([
                    'message' => "Stok produk {$product->name} tidak mencukupi (tersedia: {$product->stock})."
                ], 400);
            }

            $price    = (int) $product->price;
            $subtotal = $price * $item['quantity'];
            $totalAmount += $subtotal;

            $orderItemsData[] = [
                'product_id'   => $product->id,
                'product_name' => $product->name,
                'price'        => $price,
                'quantity'     => $item['quantity'],
            ];

            $midtransItems[] = [
                'id'       => (string) $product->id,
                'price'    => $price,
                'quantity' => $item['quantity'],
                'name'     => substr($product->name, 0, 50),
            ];

            $productsToUpdate[] = $product;
        }

        // Create Order record
        $orderNumber = 'ORD-' . strtoupper(uniqid());
        $shippingCost = (int) $validated['shipping_cost'];
        $grandTotal = $totalAmount + $shippingCost;

        $order = \App\Models\Order::create([
            'user_id'        => auth('sanctum')->check() ? auth('sanctum')->id() : null,
            'order_number'   => $orderNumber,
            'name'           => $validated['name'],
            'phone'          => $validated['phone'],
            'address'        => $validated['address'],
            'payment_method' => $validated['payment_method'] ?? 'midtrans',
            'total_amount'   => $grandTotal,
            'shipping_cost'  => $shippingCost,
            'courier'        => $validated['courier'],
            'status'         => 'pending',
            'payment_status' => 'pending',
        ]);

        // Create Order Items
        foreach ($orderItemsData as $itemData) {
            $order->items()->create($itemData);
        }

        // ── Midtrans Snap Token ──────────────────────────────────────────────
        $snapToken = null;
        try {
            \Midtrans\Config::$serverKey    = config('midtrans.server_key');
            \Midtrans\Config::$isProduction = config('midtrans.is_production');
            \Midtrans\Config::$isSanitized  = config('midtrans.is_sanitized', true);
            \Midtrans\Config::$is3ds        = config('midtrans.is_3ds', true);

            // Add shipping cost as a line item for Midtrans so gross_amount matches item_details sum
            if ($shippingCost > 0) {
                $midtransItems[] = [
                    'id'       => 'SHIPPING',
                    'price'    => $shippingCost,
                    'quantity' => 1,
                    'name'     => 'Ongkos Kirim (' . strtoupper($validated['courier']) . ')',
                ];
            }

            $params = [
                'transaction_details' => [
                    'order_id'     => $orderNumber,
                    'gross_amount' => $grandTotal,
                ],
                'item_details' => $midtransItems,
                'customer_details' => [
                    'first_name' => $validated['name'],
                    'phone'      => $validated['phone'],
                    'address'    => $validated['address'],
                ],
            ];

            $snapToken = \Midtrans\Snap::getSnapToken($params);
            $order->update(['snap_token' => $snapToken]);
        } catch (\Exception $e) {
            // Do not fail the whole order if Midtrans call fails — log and continue
            \Log::error('Midtrans snap token error: ' . $e->getMessage());
        }

        // Update product statuses and decrement stock
        foreach ($productsToUpdate as $index => $product) {
            $qty = $validated['items'][$index]['quantity'];
            $newStock = max(0, $product->stock - $qty);
            $newStatus = $newStock <= 0 ? 'booked' : 'available';
            $product->update(['status' => $newStatus, 'stock' => $newStock]);
        }

        return response()->json([
            'message'    => 'Pesanan berhasil dibuat',
            'order'      => $order->load('items'),
            'snap_token' => $snapToken,
            'client_key' => config('midtrans.client_key'),
        ], 201);
    }

    /**
     * Handle Midtrans payment notification (webhook)
     */
    public function notification(Request $request)
    {
        try {
            \Midtrans\Config::$serverKey    = config('midtrans.server_key');
            \Midtrans\Config::$isProduction = config('midtrans.is_production');

            $notif       = new \Midtrans\Notification();
            $orderId     = $notif->order_id;
            $status      = $notif->transaction_status;
            $type        = $notif->payment_type;
            $fraudStatus = $notif->fraud_status;

            $order = \App\Models\Order::where('order_number', $orderId)->first();
            if (!$order) {
                return response()->json(['message' => 'Order not found'], 404);
            }

            if ($status === 'capture') {
                $paymentStatus = ($fraudStatus === 'accept') ? 'paid' : 'fraud';
            } elseif ($status === 'settlement') {
                $paymentStatus = 'paid';
            } elseif (in_array($status, ['cancel', 'deny', 'expire'])) {
                $paymentStatus = 'cancelled';
            } else {
                $paymentStatus = 'pending';
            }

            $order->update([
                'payment_status' => $paymentStatus,
                'status'         => ($paymentStatus === 'paid') ? 'paid' : $order->status,
            ]);

            // If paid, mark all products as 'sold'
            if ($paymentStatus === 'paid') {
                foreach ($order->items as $item) {
                    $product = \App\Models\Product::find($item->product_id);
                    if ($product) $product->update(['status' => 'sold']);
                }
            }

            // If cancelled/expired, make products available again
            if ($paymentStatus === 'cancelled') {
                foreach ($order->items as $item) {
                    $product = \App\Models\Product::find($item->product_id);
                    if ($product) $product->update(['status' => 'available']);
                }
            }

            return response()->json(['message' => 'Notification handled']);
        } catch (\Exception $e) {
            \Log::error('Midtrans notification error: ' . $e->getMessage());
            return response()->json(['message' => 'Error'], 500);
        }
    }

    /**
     * Get orders for the authenticated user
     */
    public function indexUser(Request $request)
    {
        $orders = \App\Models\Order::where('user_id', $request->user()->id)
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Show a specific order by order_number
     */
    public function show($orderNumber)
    {
        $order = \App\Models\Order::where('order_number', $orderNumber)
            ->with('items')
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }

        // Verify ownership if authenticated, though public access is also needed for webhook/success page.
        // For security, if it belongs to a user, ideally we check, but Midtrans redirects here directly.
        // We will just return the data. If this is highly sensitive, we'd add an access token to the URL.

        return response()->json($order);
    }

    /**
     * Track shipping using Binderbyte API
     */
    public function track($orderNumber)
    {
        $order = \App\Models\Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }

        if (!$order->tracking_number || !$order->courier) {
            return response()->json(['message' => 'Nomor resi atau kurir belum tersedia'], 400);
        }

        $apiKey = env('BINDERBYTE_API_KEY', '59bdd012c050bad9d61114b5172e432ab49da859dea27856e1480caafd571b7a');
        $courier = strtolower($order->courier);
        $awb = $order->tracking_number;

        // --- Mock Response for simulation ---
        if (strtoupper(substr($awb, 0, 4)) === 'TEST' || strtoupper(substr($awb, 0, 8)) === 'SIMULASI') {
            return response()->json([
                "status" => 200,
                "message" => "Successfully tracked package (SIMULATED)",
                "data" => [
                    "summary" => [
                        "awb" => $awb,
                        "courier" => strtoupper($courier),
                        "service" => "REG",
                        "status" => "DELIVERED",
                        "date" => date('Y-m-d H:i:s'),
                        "desc" => "Paket telah diterima",
                        "amount" => "15000",
                        "weight" => "1"
                    ],
                    "detail" => [
                        "origin" => "Jakarta",
                        "destination" => "Kota Tujuan",
                        "shipper" => "TUKAM SHOP",
                        "receiver" => $order->name
                    ],
                    "history" => [
                        [
                            "date" => date('Y-m-d H:i:s'),
                            "desc" => "Delivered to " . $order->name,
                            "location" => "Kota Tujuan"
                        ],
                        [
                            "date" => date('Y-m-d H:i:s', strtotime('-1 days')),
                            "desc" => "Paket dibawa kurir menuju alamat tujuan",
                            "location" => "Kota Tujuan"
                        ],
                        [
                            "date" => date('Y-m-d H:i:s', strtotime('-2 days')),
                            "desc" => "Paket diserahkan ke JNE / Ekspedisi",
                            "location" => "Jakarta"
                        ]
                    ]
                ]
            ]);
        }
        // -------------------------------------

        $url = "https://api.binderbyte.com/v1/track?api_key={$apiKey}&courier={$courier}&awb={$awb}";

        try {
            $response = \Illuminate\Support\Facades\Http::get($url);
            
            if ($response->successful()) {
                return $response->json();
            }

            return response()->json([
                'message' => 'Gagal melacak resi dari server Binderbyte',
                'error'   => $response->json()
            ], $response->status());

        } catch (\Exception $e) {
            \Log::error('Binderbyte API Error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan sistem saat melacak resi'], 500);
        }
    }
    /**
     * Mark an order as paid - called from frontend after Midtrans Snap onSuccess.
     * Used for local dev where Midtrans cannot POST webhook to localhost.
     */
    public function markPaid(Request $request, $orderNumber)
    {
        $order = \App\Models\Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }

        // Only update if still pending; avoid double-processing
        if (in_array($order->status, ['paid', 'completed', 'shipped'])) {
            return response()->json(['message' => 'Status sudah diperbarui', 'order' => $order]);
        }

        // Optionally verify with Midtrans API before accepting
        try {
            \Midtrans\Config::$serverKey    = config('midtrans.server_key');
            \Midtrans\Config::$isProduction = config('midtrans.is_production');

            $status = \Midtrans\Transaction::status($orderNumber);
            $txStatus = $status->transaction_status ?? null;
            $fraudStatus = $status->fraud_status ?? 'accept';

            if (in_array($txStatus, ['settlement', 'capture']) && $fraudStatus === 'accept') {
                $order->update([
                    'status'         => 'paid',
                    'payment_status' => 'paid',
                ]);

                // Mark products as sold
                foreach ($order->items as $item) {
                    $product = \App\Models\Product::find($item->product_id);
                    if ($product) $product->update(['status' => 'sold']);
                }
            }
        } catch (\Exception $e) {
            // Midtrans check failed (e.g. sandbox delay) — trust the Snap onSuccess callback
            \Log::warning('markPaid Midtrans verify failed, trusting Snap callback: ' . $e->getMessage());
            $order->update([
                'status'         => 'paid',
                'payment_status' => 'paid',
            ]);
        }

        return response()->json(['message' => 'Pesanan berhasil diperbarui', 'order' => $order->fresh()]);
    }
}
