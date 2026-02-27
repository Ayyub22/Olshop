<?php
use Illuminate\Support\Facades\Hash;

$admin = \App\Models\User::where('email', 'admin@gmail.com')->first();
$yups = \App\Models\User::where('email', 'yups@gmail.com')->first();

echo "admin@gmail.com matches 'password123': " . (Hash::check('password123', $admin->password) ? 'YES' : 'NO') . "\n";
if ($yups) {
    echo "yups@gmail.com matches 'password123': " . (Hash::check('password123', $yups->password) ? 'YES' : 'NO') . "\n";
} else {
    echo "yups@gmail.com not found.\n";
}
