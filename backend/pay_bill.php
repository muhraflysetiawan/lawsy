<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
$case_id = $data['case_id'] ?? null;

if (!$case_id) {
    echo json_encode(["status" => "error", "message" => "Case ID is required."]);
    exit;
}

try {
    $stmt = $conn->prepare("UPDATE cases SET payment_status = 'Success' WHERE id = ?");
    $stmt->execute([$case_id]);
    echo json_encode(["status" => "success", "message" => "Payment successful."]);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
