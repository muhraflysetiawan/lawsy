<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$lawyer_id = $_GET['lawyer_id'] ?? null;
$status = $_GET['status'] ?? null; // Optional: filter by status
$date = $_GET['date'] ?? null;     // Optional: filter by date (e.g. 'today' or 'YYYY-MM-DD')

if ($method === 'GET' && $lawyer_id) {
    try {
        $query = "SELECT b.*, u.name as client_name, u.profile_image as client_photo 
                  FROM bookings b 
                  JOIN users u ON b.user_id = u.id 
                  WHERE b.lawyer_id = :lawyer_id";
        
        if ($status) {
            $query .= " AND b.status = :status";
        }
        
        if ($date) {
            $query .= " AND b.booking_date = :booking_date";
        }
        
        $query .= " ORDER BY b.created_at DESC";
        
        $stmt = $conn->prepare($query);
        $params = [':lawyer_id' => $lawyer_id];
        if ($status) {
            $params[':status'] = $status;
        }
        if ($date) {
            $params[':booking_date'] = ($date === 'today') ? date('Y-m-d') : $date;
        }
        
        $stmt->execute($params);
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => $bookings]);
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Missing lawyer_id or invalid request."]);
}
?>
