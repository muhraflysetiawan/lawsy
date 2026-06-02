<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_sessions':
        $user_id = $_GET['user_id'] ?? 0;
        $stmt = $conn->prepare("SELECT * FROM ai_chat_sessions WHERE user_id = ? ORDER BY updated_at DESC");
        $stmt->execute([$user_id]);
        $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "sessions" => $sessions]);
        break;

    case 'get_messages':
        $session_id = $_GET['session_id'] ?? 0;
        $stmt = $conn->prepare("SELECT * FROM ai_chat_messages WHERE session_id = ? ORDER BY created_at ASC");
        $stmt->execute([$session_id]);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "messages" => $messages]);
        break;

    case 'save_message':
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['user_id'] ?? 0;
        $session_id = $data['session_id'] ?? 0;
        $role = $data['role'] ?? 'user';
        $content = $data['content'] ?? '';
        $attachment_uri = $data['attachment_uri'] ?? null;
        $attachment_type = $data['attachment_type'] ?? null;
        $attachment_name = $data['attachment_name'] ?? null;

        // Create session if it doesn't exist
        if (!$session_id) {
            $stmt = $conn->prepare("INSERT INTO ai_chat_sessions (user_id, title) VALUES (?, ?)");
            $stmt->execute([$user_id, 'New Chat']);
            $session_id = $conn->lastInsertId();
        }

        // Save message
        $stmt = $conn->prepare("INSERT INTO ai_chat_messages (session_id, role, content, attachment_uri, attachment_type, attachment_name) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$session_id, $role, $content, $attachment_uri, $attachment_type, $attachment_name]);

        echo json_encode(["status" => "success", "session_id" => (int)$session_id]);
        break;

    case 'update_title':
        $data = json_decode(file_get_contents('php://input'), true);
        $session_id = $data['session_id'] ?? 0;
        $title = $data['title'] ?? '';

        $stmt = $conn->prepare("UPDATE ai_chat_sessions SET title = ? WHERE id = ?");
        $stmt->execute([$title, $session_id]);
        echo json_encode(["status" => "success"]);
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
        break;
}
?>
