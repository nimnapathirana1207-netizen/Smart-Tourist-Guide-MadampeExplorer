<?php
// ============================================================
//  config/helpers.php  –  Shared helper functions
// ============================================================

require_once __DIR__ . '/db.php';

// Set JSON response headers
function jsonHeaders(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

// Send a JSON success response
function success(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

// Send a JSON error response
function error(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

// Get JSON body from request
function getBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

// Sanitise a string input
function clean(string $value): string {
    return htmlspecialchars(strip_tags(trim($value)));
}
