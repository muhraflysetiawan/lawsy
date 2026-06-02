<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST");
header("Content-Type: application/json");

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    if ($action === 'get_messages') {
        $booking_id = $_GET['booking_id'] ?? null;
        $user_id = $_GET['user_id'] ?? null;
        if (!$booking_id) {
            echo json_encode(["status" => "error", "message" => "Booking ID is required."]);
            exit;
        }

        try {
            // Mark messages as read for the receiver
            if ($user_id) {
                $updateRead = "UPDATE messages SET is_read = 1 WHERE booking_id = :booking_id AND receiver_id = :user_id";
                $updateStmt = $conn->prepare($updateRead);
                $updateStmt->execute([':booking_id' => $booking_id, ':user_id' => $user_id]);
            }

            // Get messages that are NOT deleted for this user
            $query = "SELECT m.*, 
                      r.message_text as replied_text, 
                      r.attachment_path as replied_attachment 
                      FROM messages m 
                      LEFT JOIN messages r ON m.replied_to_id = r.id 
                      WHERE m.booking_id = :booking_id 
                      AND m.is_deleted_all = 0 
                      AND (
                          (m.sender_id = :user_id AND m.deleted_by_sender = 0) OR 
                          (m.receiver_id = :user_id AND m.deleted_by_receiver = 0)
                      )
                      ORDER BY m.created_at ASC";
            $stmt = $conn->prepare($query);
            $stmt->execute([':booking_id' => $booking_id, ':user_id' => $user_id]);
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["status" => "success", "data" => $messages]);
        } catch(PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
    }
} elseif ($method === 'POST') {
    if ($action === 'upload_attachment') {
        if (!isset($_FILES['file'])) {
            echo json_encode(["status" => "error", "message" => "No file uploaded."]);
            exit;
        }

        $targetDir = "uploads/chat/";
        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        $fileExtension = strtolower(pathinfo($_FILES["file"]["name"], PATHINFO_EXTENSION));
        $allowedExtensions = ['png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx'];

        if (!in_array($fileExtension, $allowedExtensions)) {
            echo json_encode(["status" => "error", "message" => "Invalid file format."]);
            exit;
        }

        // 20MB limit
        if ($_FILES["file"]["size"] > 20 * 1024 * 1024) {
            echo json_encode(["status" => "error", "message" => "File size exceeds 20MB limit."]);
            exit;
        }

        $fileName = time() . '_' . basename($_FILES["file"]["name"]);
        $targetFilePath = $targetDir . $fileName;

        if (move_uploaded_file($_FILES["file"]["tmp_name"], $targetFilePath)) {
            echo json_encode([
                "status" => "success",
                "message" => "File uploaded successfully.",
                "file_path" => $targetFilePath,
                "file_name" => $_FILES["file"]["name"]
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to move uploaded file."]);
        }
        exit;
    }

    if ($action === 'send_message') {
        $data = json_decode(file_get_contents("php://input"), true);
        $booking_id = $data['booking_id'] ?? null;
        $sender_id = $data['sender_id'] ?? null;
        $receiver_id = $data['receiver_id'] ?? null;
        $message_text = $data['message_text'] ?? '';
        $attachment_path = $data['attachment_path'] ?? null;
        $replied_to_id = $data['replied_to_id'] ?? null;

        if (!$booking_id || !$sender_id || !$receiver_id || (!$message_text && !$attachment_path)) {
            echo json_encode(["status" => "error", "message" => "Missing required fields."]);
            exit;
        }

        try {
            $query = "INSERT INTO messages (booking_id, sender_id, receiver_id, message_text, attachment_path, replied_to_id) 
                      VALUES (:booking_id, :sender_id, :receiver_id, :message_text, :attachment_path, :replied_to_id)";
            $stmt = $conn->prepare($query);
            $stmt->execute([
                ':booking_id' => $booking_id,
                ':sender_id' => $sender_id,
                ':receiver_id' => $receiver_id,
                ':message_text' => $message_text,
                ':attachment_path' => $attachment_path,
                ':replied_to_id' => $replied_to_id
            ]);

            echo json_encode(["status" => "success", "message" => "Message sent.", "id" => $conn->lastInsertId()]);
        } catch(PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
    }

    if ($action === 'edit_message') {
        $data = json_decode(file_get_contents("php://input"), true);
        $message_id = $data['message_id'] ?? null;
        $new_text = $data['message_text'] ?? '';

        if (!$message_id || !$new_text) {
            echo json_encode(["status" => "error", "message" => "Missing required fields."]);
            exit;
        }

        try {
            $query = "UPDATE messages SET message_text = :message_text, is_edited = 1 WHERE id = :id";
            $stmt = $conn->prepare($query);
            $stmt->execute([':message_text' => $new_text, ':id' => $message_id]);
            echo json_encode(["status" => "success", "message" => "Message edited."]);
        } catch(PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
    }

    if ($action === 'delete_message') {
        $data = json_decode(file_get_contents("php://input"), true);
        $message_id = $data['message_id'] ?? null;
        $user_id = $data['user_id'] ?? null;
        $delete_type = $data['delete_type'] ?? 'me'; // 'me' or 'everyone'

        if (!$message_id || !$user_id) {
            echo json_encode(["status" => "error", "message" => "Missing required fields."]);
            exit;
        }

        try {
            if ($delete_type === 'everyone') {
                $query = "UPDATE messages SET is_deleted_all = 1 WHERE id = :id";
                $stmt = $conn->prepare($query);
                $stmt->execute([':id' => $message_id]);
            } else {
                // Delete for me
                // Need to know if this user is sender or receiver
                $checkQuery = "SELECT sender_id, receiver_id FROM messages WHERE id = :id";
                $checkStmt = $conn->prepare($checkQuery);
                $checkStmt->execute([':id' => $message_id]);
                $msg = $checkStmt->fetch(PDO::FETCH_ASSOC);

                if ($msg['sender_id'] == $user_id) {
                    $query = "UPDATE messages SET deleted_by_sender = 1 WHERE id = :id";
                } else {
                    $query = "UPDATE messages SET deleted_by_receiver = 1 WHERE id = :id";
                }
                $stmt = $conn->prepare($query);
                $stmt->execute([':id' => $message_id]);
            }
            echo json_encode(["status" => "success", "message" => "Message deleted."]);
        } catch(PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
    }
}
?>
