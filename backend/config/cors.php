<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'storage/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => env('FRONTEND_URL')
        ? array_merge(
            explode(',', env('FRONTEND_URL')),
            [
                'http://localhost:3000',
                'http://localhost:5173',
                'http://localhost:5174',
            ]
        )
        : [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
        ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];