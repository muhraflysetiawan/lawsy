<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

require_once 'config.php';

$booking_id = $_GET['booking_id'] ?? null;

if (!$booking_id) {
    echo json_encode(["status" => "error", "message" => "Booking ID is required."]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT * FROM cases WHERE booking_id = ? ORDER BY id DESC LIMIT 1");
    $stmt->execute([$booking_id]);
    $case = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($case) {
        echo json_encode(["status" => "success", "data" => $case]);
    } else {
        echo json_encode(["status" => "success", "data" => null]);
    }
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
