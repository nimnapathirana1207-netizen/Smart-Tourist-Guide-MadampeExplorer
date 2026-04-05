<?php
// ============================================================
//  api/places.php
//  GET    /api/places.php               – list all places
//  GET    /api/places.php?id=1          – single place
//  GET    /api/places.php?category=Religious  – filter by category
//  POST   /api/places.php               – create place  (admin)
//  PUT    /api/places.php?id=1          – update place  (admin)
//  DELETE /api/places.php?id=1          – delete place  (admin)
// ============================================================

require_once __DIR__ . '/../config/helpers.php';

jsonHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit; // CORS preflight

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ── GET ──────────────────────────────────────────────────────
if ($method === 'GET') {

    // Single place by ID
    if (!empty($_GET['id'])) {
        $stmt = $db->prepare("
            SELECT p.*, c.name AS category_name, c.icon AS category_icon
            FROM places p
            JOIN categories c ON c.id = p.category_id
            WHERE p.id = ? AND p.is_active = 1
        ");
        $stmt->execute([(int)$_GET['id']]);
        $place = $stmt->fetch();
        if (!$place) error('Place not found.', 404);
        success($place);
    }

    // Build query – optional category filter
    $sql    = "SELECT p.*, c.name AS category_name, c.icon AS category_icon
               FROM places p
               JOIN categories c ON c.id = p.category_id
               WHERE p.is_active = 1";
    $params = [];

    if (!empty($_GET['category'])) {
        $sql    .= " AND c.name = ?";
        $params[] = $_GET['category'];
    }

    if (!empty($_GET['search'])) {
        $sql    .= " AND (p.name LIKE ? OR p.description LIKE ?)";
        $like    = '%' . $_GET['search'] . '%';
        $params[] = $like;
        $params[] = $like;
    }

    $sql .= " ORDER BY p.distance_km ASC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    success($stmt->fetchAll());
}

// ── POST (Create) ────────────────────────────────────────────
if ($method === 'POST') {
    $body = getBody();

    $required = ['name', 'category_id', 'distance_km', 'description'];
    foreach ($required as $field) {
        if (empty($body[$field])) error("Field '$field' is required.");
    }

    $stmt = $db->prepare("
        INSERT INTO places (name, category_id, distance_km, description, image_url, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        clean($body['name']),
        (int)$body['category_id'],
        (float)$body['distance_km'],
        clean($body['description']),
        $body['image_url']  ?? null,
        $body['latitude']   ?? null,
        $body['longitude']  ?? null,
    ]);

    success(['id' => $db->lastInsertId(), 'message' => 'Place created successfully.'], 201);
}

// ── PUT (Update) ─────────────────────────────────────────────
if ($method === 'PUT') {
    if (empty($_GET['id'])) error('Place ID is required.');
    $body = getBody();

    $fields = [];
    $params = [];

    $allowed = ['name','category_id','distance_km','description','image_url','latitude','longitude','is_active'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $body)) {
            $fields[] = "$f = ?";
            $params[] = in_array($f, ['name','description','image_url']) ? clean($body[$f]) : $body[$f];
        }
    }

    if (empty($fields)) error('No fields to update.');

    $params[] = (int)$_GET['id'];
    $stmt = $db->prepare("UPDATE places SET " . implode(', ', $fields) . " WHERE id = ?");
    $stmt->execute($params);

    success(['message' => 'Place updated successfully.']);
}

// ── DELETE ───────────────────────────────────────────────────
if ($method === 'DELETE') {
    if (empty($_GET['id'])) error('Place ID is required.');

    // Soft delete
    $stmt = $db->prepare("UPDATE places SET is_active = 0 WHERE id = ?");
    $stmt->execute([(int)$_GET['id']]);

    success(['message' => 'Place deleted successfully.']);
}

error('Method not allowed.', 405);
