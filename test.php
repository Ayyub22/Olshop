<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    Illuminate\Support\Facades\Schema::table('orders', function ($t) { 
        $t->decimal('shipping_cost', 15, 2)->default(0)->after('status'); 
        $t->string('courier')->nullable()->after('shipping_cost');
        $t->string('tracking_number')->nullable()->after('courier');
    });
    echo "OK";
} catch (\Exception $e) {
    echo $e->getMessage();
}
