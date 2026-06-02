<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    if ($action === 'upload_doc') {
        if (!isset($_FILES['file'])) {
            echo json_encode(["status" => "error", "message" => "No file uploaded."]);
            exit;
        }

        $targetDir = "uploads/bookings/";
        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        $fileName = time() . '_' . basename($_FILES["file"]["name"]);
        $targetFilePath = $targetDir . $fileName;

        if (move_uploaded_file($_FILES["file"]["tmp_name"], $targetFilePath)) {
            echo json_encode([
                "status" => "success",
                "message" => "File uploaded successfully.",
                "file_path" => $targetFilePath,
                "file_name" => $_FILES["file"]["name"],
                "file_size" => round($_FILES["file"]["size"] / 1024 / 1024, 2) . ' MB'
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to move uploaded file."]);
        }
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    
    // Fallback if data is empty (might be sent as form data but we expect JSON for the final booking)
    if (empty($data)) {
        $data = $_POST;
    }
    $user_id = $data['user_id'] ?? null;
    $lawyer_id = $data['lawyer_id'] ?? null;
    $consultant_type = $data['consultant_type'] ?? null;
    $booking_date = $data['booking_date'] ?? null;
    $booking_time = $data['booking_time'] ?? null;
    $case_category = $data['case_category'] ?? null;
    $additional_notes = $data['additional_notes'] ?? '';
    $document_path = $data['document_path'] ?? null;

    if (!$user_id || !$lawyer_id || !$consultant_type || !$booking_date || !$booking_time || !$case_category) {
        echo json_encode(["status" => "error", "message" => "Missing required fields."]);
        exit;
    }

    try {
        $query = "INSERT INTO bookings (user_id, lawyer_id, consultant_type, booking_date, booking_time, case_category, additional_notes, document_path, status) 
                  VALUES (:user_id, :lawyer_id, :consultant_type, :booking_date, :booking_time, :case_category, :additional_notes, :document_path, 'Pending')";
        
        $stmt = $conn->prepare($query);
        $stmt->execute([
            ':user_id' => $user_id,
            ':lawyer_id' => $lawyer_id,
            ':consultant_type' => $consultant_type,
            ':booking_date' => $booking_date,
            ':booking_time' => $booking_time,
            ':case_category' => $case_category,
            ':additional_notes' => $additional_notes,
            ':document_path' => $document_path
        ]);

        echo json_encode(["status" => "success", "message" => "Appointment booked successfully.", "booking_id" => $conn->lastInsertId()]);
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
?>
