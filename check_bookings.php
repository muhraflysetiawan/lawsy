<?php
require_once 'backend/config.php';
$stmt = $conn->query("SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5");
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($results, JSON_PRETTY_PRINT);
?>
