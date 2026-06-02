<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST");
header("Content-Type: application/json");

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $booking_id = $_GET['id'] ?? null;
    if (!$booking_id) {
        echo json_encode(["status" => "error", "message" => "Booking ID is required."]);
        exit;
    }

    try {
        $query = "SELECT b.*, u.name as client_name, u.email as client_email, u.profile_image as client_photo 
                  FROM bookings b 
                  JOIN users u ON b.user_id = u.id 
                  WHERE b.id = :id";
        $stmt = $conn->prepare($query);
        $stmt->execute([':id' => $booking_id]);
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($booking) {
            echo json_encode(["status" => "success", "data" => $booking]);
        } else {
            echo json_encode(["status" => "error", "message" => "Booking not found."]);
        }
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? null;
    $status = $data['status'] ?? null;

    if ($id && $status) {
        try {
            $query = "UPDATE bookings SET status = :status WHERE id = :id";
            $stmt = $conn->prepare($query);
            $stmt->execute([':status' => $status, ':id' => $id]);
            echo json_encode(["status" => "success", "message" => "Booking status updated to $status."]);
        } catch(PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Missing parameters."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
?>
