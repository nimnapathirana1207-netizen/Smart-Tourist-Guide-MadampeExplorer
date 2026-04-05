<?php
// ============================================================
//  api/trip_plans.php
//  GET    /api/trip_plans.php?id=1   – get plan with items
//  POST   /api/trip_plans.php        – create a new plan
//  DELETE /api/trip_plans.php?id=1   – delete a plan
// ============================================================

require_once __DIR__ . '/../config/helpers.php';

jsonHeaders();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ── GET single plan with its places ─────────────────────────
if ($method === 'GET') {
    if (empty($_GET['id'])) error('Plan ID is required.');

    $stmt = $db->prepare("SELECT * FROM trip_plans WHERE id = ?");
    $stmt->execute([(int)$_GET['id']]);
    $plan = $stmt->fetch();
    if (!$plan) error('Plan not found.', 404);

    $stmt = $db->prepare("
        SELECT tpi.sort_order, p.id, p.name, p.distance_km, p.description,
               c.name AS category_name, c.icon AS category_icon
        FROM trip_plan_items tpi
        JOIN places     p ON p.id = tpi.place_id
        JOIN categories c ON c.id = p.category_id
        WHERE tpi.plan_id = ?
        ORDER BY tpi.sort_order
    ");
    $stmt->execute([(int)$_GET['id']]);
    $plan['items'] = $stmt->fetchAll();

    success($plan);
}

// ── POST – create plan with selected place IDs ───────────────
if ($method === 'POST') {
    $body = getBody();

    if (empty($body['place_ids']) || !is_array($body['place_ids'])) {
        error('place_ids array is required.');
    }

    $planName = clean($body['plan_name'] ?? 'My Day Trip');

    // Validate all place IDs exist
    $ids  = array_map('intval', $body['place_ids']);
    $in   = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $db->prepare("SELECT id FROM places WHERE id IN ($in) AND is_active = 1");
    $stmt->execute($ids);
    $validIds = array_column($stmt->fetchAll(), 'id');

    if (count($validIds) !== count($ids)) {
        error('One or more place IDs are invalid.');
    }

    $db->beginTransaction();
    try {
        // Insert plan
        $stmt = $db->prepare("INSERT INTO trip_plans (plan_name) VALUES (?)");
        $stmt->execute([$planName]);
        $planId = $db->lastInsertId();

        // Insert items sorted by distance
        $stmt2 = $db->prepare("SELECT id, distance_km FROM places WHERE id IN ($in) ORDER BY distance_km");
        $stmt2->execute($ids);
        $sorted = $stmt2->fetchAll();

        $ins = $db->prepare("INSERT INTO trip_plan_items (plan_id, place_id, sort_order) VALUES (?, ?, ?)");
        foreach ($sorted as $i => $place) {
            $ins->execute([$planId, $place['id'], $i + 1]);
        }

        $db->commit();
        success(['plan_id' => $planId, 'message' => 'Trip plan saved successfully.'], 201);

    } catch (Exception $e) {
        $db->rollBack();
        error('Failed to save trip plan.');
    }
}

// ── DELETE ───────────────────────────────────────────────────
if ($method === 'DELETE') {
    if (empty($_GET['id'])) error('Plan ID is required.');
    $stmt = $db->prepare("DELETE FROM trip_plans WHERE id = ?");
    $stmt->execute([(int)$_GET['id']]);
    success(['message' => 'Plan deleted.']);
}

error('Method not allowed.', 405);
