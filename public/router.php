<?php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$publicDir = __DIR__;
$path = $publicDir . $uri;

// Handle root path explicitly
if ($uri === '/' || $uri === '') {
    require $publicDir . '/index.php';
    return;
}

if (file_exists($path) && !is_dir($path)) {
    $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $mimeTypes = [
        'js' => 'application/javascript',
        'css' => 'text/css',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'svg' => 'image/svg+xml',
        'json' => 'application/json',
        'ico' => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
    ];

    if (isset($mimeTypes[$extension])) {
        header('Content-Type: ' . $mimeTypes[$extension]);
    }

    readfile($path);
    return;
}

// Fallback to index.php for SPA routing
require $publicDir . '/index.php';