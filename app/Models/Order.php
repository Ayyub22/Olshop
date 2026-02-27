<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'order_number',
        'name',
        'phone',
        'address',
        'payment_method',
        'total_amount',
        'status',
        'payment_status',
        'snap_token',
        'shipping_cost',
        'courier',
        'tracking_number',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
