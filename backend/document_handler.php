<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'save':
        if (!isset($_POST['user_id']) || !isset($_POST['type']) || !isset($_POST['title'])) {
            echo json_encode(["status" => "error", "message" => "Missing required user_id, type, or title"]);
            exit;
        }

        $user_id = filter_var($_POST['user_id'], FILTER_VALIDATE_INT);
        if ($user_id === false || $user_id <= 0) {
            echo json_encode(["status" => "error", "message" => "Invalid user_id"]);
            exit;
        }

        $type = $_POST['type'];
        $title = $_POST['title'];
        $document_date = isset($_POST['document_date']) ? $_POST['document_date'] : date('Y-m-d');
        $status = isset($_POST['status']) ? $_POST['status'] : 'Completed';
        $document_data = isset($_POST['document_data']) ? $_POST['document_data'] : '{}';
        $content = isset($_POST['content']) ? $_POST['content'] : '';

        try {
            $sql = "INSERT INTO generated_documents (user_id, type, title, document_date, status, document_data, content) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$user_id, $type, $title, $document_date, $status, $document_data, $content]);

            echo json_encode([
                "status" => "success",
                "message" => "Document saved to database successfully",
                "document_id" => $conn->lastInsertId()
            ]);
        } catch(PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'list':
        $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : '';
        $user_id = filter_var($user_id, FILTER_VALIDATE_INT);
        if ($user_id === false || $user_id <= 0) {
            echo json_encode(["status" => "error", "message" => "Invalid or missing user_id"]);
            exit;
        }

        try {
            $stmt = $conn->prepare("SELECT * FROM generated_documents WHERE user_id = ? ORDER BY id DESC");
            $stmt->execute([$user_id]);
            $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "status" => "success",
                "documents" => $documents
            ]);
        } catch(PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'delete':
        $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : '';
        $document_id = isset($_GET['document_id']) ? $_GET['document_id'] : '';

        $user_id = filter_var($user_id, FILTER_VALIDATE_INT);
        $document_id = filter_var($document_id, FILTER_VALIDATE_INT);

        if ($user_id === false || $user_id <= 0 || $document_id === false || $document_id <= 0) {
            echo json_encode(["status" => "error", "message" => "Invalid user_id or document_id"]);
            exit;
        }

        try {
            $stmt = $conn->prepare("DELETE FROM generated_documents WHERE id = ? AND user_id = ?");
            $stmt->execute([$document_id, $user_id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(["status" => "success", "message" => "Document deleted successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Document not found or unauthorized"]);
            }
        } catch(PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
        break;
}
?>
