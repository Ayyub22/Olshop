<?php
$product = \App\Models\Product::with('branch')->where('status', 'available')->first();
file_put_contents('c:/Users/Ayyub/Documents/KP Webcare/Olshop/tmp_product.json', json_encode($product, JSON_PRETTY_PRINT));
echo "Done";
