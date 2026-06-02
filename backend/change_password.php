<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    switch ($action) {
        case 'verify_current':
            $user_id = isset($data['user_id']) ? $data['user_id'] : null;
            $current_password = isset($data['current_password']) ? $data['current_password'] : null;

            if (!$user_id || !$current_password) {
                echo json_encode(["status" => "error", "message" => "Parameter tidak lengkap."]);
                exit;
            }

            try {
                $stmt = $conn->prepare("SELECT password FROM users WHERE id = ? LIMIT 1");
                $stmt->execute([$user_id]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($user && password_verify($current_password, $user['password'])) {
                    echo json_encode(["status" => "success", "message" => "Password saat ini valid."]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Password saat ini salah."]);
                }
            } catch (PDOException $e) {
                echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
            }
            break;

        case 'update_password':
            $user_id = isset($data['user_id']) ? $data['user_id'] : null;
            $current_password = isset($data['current_password']) ? $data['current_password'] : null;
            $new_password = isset($data['new_password']) ? $data['new_password'] : null;
            $confirm_password = isset($data['confirm_password']) ? $data['confirm_password'] : null;

            if (!$user_id || !$current_password || !$new_password || !$confirm_password) {
                echo json_encode(["status" => "error", "message" => "Semua field harus diisi."]);
                exit;
            }

            if ($new_password !== $confirm_password) {
                echo json_encode(["status" => "error", "message" => "Konfirmasi password baru tidak cocok."]);
                exit;
            }

            if (strlen($new_password) < 6) {
                echo json_encode(["status" => "error", "message" => "Password baru minimal 6 karakter."]);
                exit;
            }

            try {
                // Verify current password again for security
                $stmt = $conn->prepare("SELECT password FROM users WHERE id = ? LIMIT 1");
                $stmt->execute([$user_id]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($user && password_verify($current_password, $user['password'])) {
                    $new_password_hash = password_hash($new_password, PASSWORD_BCRYPT);
                    $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
                    $updateStmt->execute([$new_password_hash, $user_id]);

                    echo json_encode(["status" => "success", "message" => "Password berhasil diperbarui."]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Password saat ini salah."]);
                }
            } catch (PDOException $e) {
                echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
            }
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Aksi tidak valid."]);
            break;
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
?>
