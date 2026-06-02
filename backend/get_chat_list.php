<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

require_once 'config.php';

$user_id = $_GET['user_id'] ?? null;
$role = $_GET['role'] ?? 'Client';

if (!$user_id) {
    echo json_encode(["status" => "error", "message" => "User ID is required."]);
    exit;
}

try {
    if ($role === 'Lawyer') {
        $query = "SELECT b.id as booking_id, b.case_category, u.id as other_user_id, u.name as other_user_name, u.profile_image as other_user_photo,
                  (SELECT 
                    CASE 
                        WHEN message_text != '' THEN message_text 
                        WHEN attachment_path IS NOT NULL AND (attachment_path LIKE '%.jpg' OR attachment_path LIKE '%.jpeg' OR attachment_path LIKE '%.png') THEN '[Photo]'
                        WHEN attachment_path IS NOT NULL THEN '[Document]'
                        ELSE 'Start a conversation...'
                    END
                   FROM messages WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as last_message,
                  (SELECT created_at FROM messages WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as last_message_time
                  FROM bookings b
                  JOIN users u ON b.user_id = u.id
                  WHERE b.lawyer_id = :user_id AND (b.status = 'Approved' OR b.status = 'Proposed')
                  ORDER BY last_message_time DESC";
    } else {
        $query = "SELECT b.id as booking_id, b.case_category, u.id as other_user_id, u.name as other_user_name, u.profile_image as other_user_photo,
                  (SELECT 
                    CASE 
                        WHEN message_text != '' THEN message_text 
                        WHEN attachment_path IS NOT NULL AND (attachment_path LIKE '%.jpg' OR attachment_path LIKE '%.jpeg' OR attachment_path LIKE '%.png') THEN '[Photo]'
                        WHEN attachment_path IS NOT NULL THEN '[Document]'
                        ELSE 'Start a conversation...'
                    END
                   FROM messages WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as last_message,
                  (SELECT created_at FROM messages WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as last_message_time
                  FROM bookings b
                  JOIN users u ON b.lawyer_id = u.id
                  WHERE b.user_id = :user_id AND (b.status = 'Approved' OR b.status = 'Proposed')
                  ORDER BY last_message_time DESC";
}

    $stmt = $conn->prepare($query);
    $stmt->execute([':user_id' => $user_id]);
    $chats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $chats]);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
