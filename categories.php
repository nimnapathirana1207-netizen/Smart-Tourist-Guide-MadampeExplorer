<?php
// ============================================================
//  api/categories.php
//  GET  /api/categories.php   – list all categories
//  POST /api/categories.php   – create category (admin)
// ============================================================

require_once __DIR__ . '/../config/helpers.php';

jsonHeaders();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

if ($method === 'GET') {
    $stmt = $db->query("
        SELECT c.*, COUNT(p.id) AS place_count
        FROM categories c
        LEFT JOIN places p ON p.category_id = c.id AND p.is_active = 1
        GROUP BY c.id
        ORDER BY c.name
    ");
    success($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = getBody();
    if (empty($body['name'])) error('Category name is required.');

    $stmt = $db->prepare("INSERT INTO categories (name, icon) VALUES (?, ?)");
    $stmt->execute([clean($body['name']), $body['icon'] ?? '📍']);
    success(['id' => $db->lastInsertId(), 'message' => 'Category created.'], 201);
}

error('Method not allowed.', 405);
