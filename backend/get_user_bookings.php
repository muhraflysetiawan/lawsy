<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$user_id = $_GET['user_id'] ?? null;
$role = $_GET['role'] ?? 'Client'; // Client or Lawyer
$status = $_GET['status'] ?? null; // All, Pending, Confirmation, Payment, Scheduled, Canceled

if ($method === 'GET' && $user_id) {
    try {
        if ($role === 'Lawyer') {
            // If lawyer, we show client info
            $query = "SELECT b.*, u.name as other_party_name, u.profile_image as other_party_photo, lr.specialization as law_category
                      FROM bookings b 
                      JOIN users u ON b.user_id = u.id 
                      LEFT JOIN lawyer_registrations lr ON b.lawyer_id = lr.user_id
                      WHERE b.lawyer_id = :user_id";
        } else {
            // If client, we show lawyer info
            $query = "SELECT b.*, u.name as other_party_name, u.profile_image as other_party_photo, lr.specialization as law_category
                      FROM bookings b 
                      JOIN users u ON b.lawyer_id = u.id 
                      LEFT JOIN lawyer_registrations lr ON b.lawyer_id = lr.user_id
                      WHERE b.user_id = :user_id";
        }
        
        if ($status && $status !== 'All') {
            // Map 'Confirmation' to 'Approved' or similar if needed
            // User requested: All, Pending, Confirmation, Payment, Scheduled, Canceled
            // Existing in DB: Pending, Approved, Canceled
            $dbStatus = $status;
            if ($status === 'Confirmation') $dbStatus = 'Approved';
            
            $query .= " AND b.status = :status";
        }
        
        $query .= " ORDER BY b.created_at DESC";
        
        $stmt = $conn->prepare($query);
        $params = [':user_id' => $user_id];
        if ($status && $status !== 'All') {
            $params[':status'] = $dbStatus;
        }
        
        $stmt->execute($params);
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => $bookings]);
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Missing user_id or invalid request."]);
}
?>
