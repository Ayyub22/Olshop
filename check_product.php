<?php
$product = \App\Models\Product::with('branch')->where('status', 'available')->first();
echo json_encode($product, JSON_PRETTY_PRINT);
