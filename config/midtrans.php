<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Payment Gateway Configuration
    |--------------------------------------------------------------------------
    |
    | These values are loaded from the .env file.
    | Get your keys from: https://dashboard.midtrans.com/settings/config_info
    |
    */

    'server_key'     => env('MIDTRANS_SERVER_KEY'),
    'client_key'     => env('MIDTRANS_CLIENT_KEY'),
    'is_production'  => env('MIDTRANS_IS_PRODUCTION', false),
    'is_sanitized'   => true,
    'is_3ds'         => true,
];
