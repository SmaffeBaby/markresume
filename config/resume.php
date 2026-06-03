<?php

return [
    'admin_email' => strtolower((string) env('RESUME_ADMIN_EMAIL', 'mark230602@gmail.com')),
    'pdf' => [
        'timeout' => (int) env('BROWSERSHOT_TIMEOUT', 120),
        'use_internal_server' => (bool) env('BROWSERSHOT_USE_INTERNAL_SERVER', env('APP_ENV') === 'local'),
        'node_binary' => env('BROWSERSHOT_NODE_BINARY'),
        'npm_binary' => env('BROWSERSHOT_NPM_BINARY'),
        'chrome_path' => env('BROWSERSHOT_CHROME_PATH'),
    ],
];
