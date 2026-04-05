<?php
// ============================================================
//  api/contact.php
//  POST /api/contact.php   – submit a contact message
//  GET  /api/contact.php   – list all messages (admin)
// ============================================================

require_once __DIR__ . '/../config/helpers.php';

jsonHeaders();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

if ($method === 'POST') {
    $body = getBody();

    foreach (['name','email','message'] as $f) {
        if (empty($body[$f])) error("Field '$f' is required.");
    }

    if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
        error('Invalid email address.');
    }

    $stmt = $db->prepare("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)");
    $stmt->execute([
        clean($body['name']),
        clean($body['email']),
        clean($body['message']),
    ]);

    success(['message' => 'Thank you! Your message has been received.'], 201);
}

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
    success($stmt->fetchAll());
}

error('Method not allowed.', 405);
