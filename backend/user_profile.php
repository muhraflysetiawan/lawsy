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
    case 'get':
        $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : '';
        if (!$user_id) {
            echo json_encode(["status" => "error", "message" => "Missing user_id"]);
            exit;
        }

        try {
            $stmt = $conn->prepare("SELECT id, name, email, profile_image, dob, address, role FROM users WHERE id = ? LIMIT 1");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                echo json_encode([
                    "status" => "success",
                    "user" => $user
                ]);
            } else {
                echo json_encode(["status" => "error", "message" => "User not found"]);
            }
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'update':
        // Can handle both JSON and multipart/form-data POST requests
        $user_id = isset($_POST['user_id']) ? $_POST['user_id'] : null;
        $name = isset($_POST['name']) ? $_POST['name'] : null;
        $email = isset($_POST['email']) ? $_POST['email'] : null;
        $dob = isset($_POST['dob']) ? $_POST['dob'] : null; // expect YYYY-MM-DD
        $address = isset($_POST['address']) ? $_POST['address'] : null;

        if (!$user_id) {
            // fallback to JSON payload
            $data = json_decode(file_get_contents("php://input"), true);
            if (!empty($data)) {
                $user_id = $data['user_id'] ?? null;
                $name = $data['name'] ?? null;
                $email = $data['email'] ?? null;
                $dob = $data['dob'] ?? null;
                $address = $data['address'] ?? null;
            }
        }

        if (!$user_id || !$name || !$email) {
            echo json_encode(["status" => "error", "message" => "Missing required fields (user_id, name, email)"]);
            exit;
        }

        try {
            // Handle Profile Image upload if provided
            $profile_image_path = null;
            if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
                $targetDir = "uploads/profiles/";
                if (!file_exists($targetDir)) {
                    mkdir($targetDir, 0777, true);
                }

                $file = $_FILES['profile_image'];
                $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
                $filename = "profile_" . $user_id . "_" . time() . "." . $ext;
                $targetFilePath = $targetDir . $filename;

                if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
                    $profile_image_path = $targetFilePath;
                }
            }

            // Perform Update
            if ($profile_image_path) {
                $sql = "UPDATE users SET name = :name, email = :email, dob = :dob, address = :address, profile_image = :profile_image WHERE id = :id";
                $params = [
                    ':name' => $name,
                    ':email' => $email,
                    ':dob' => (!empty($dob) ? $dob : null),
                    ':address' => $address,
                    ':profile_image' => $profile_image_path,
                    ':id' => $user_id
                ];
            } else {
                $sql = "UPDATE users SET name = :name, email = :email, dob = :dob, address = :address WHERE id = :id";
                $params = [
                    ':name' => $name,
                    ':email' => $email,
                    ':dob' => (!empty($dob) ? $dob : null),
                    ':address' => $address,
                    ':id' => $user_id
                ];
            }

            $stmt = $conn->prepare($sql);
            $stmt->execute($params);

            // Fetch updated user to return
            $stmt = $conn->prepare("SELECT id, name, email, profile_image, dob, address, role FROM users WHERE id = ? LIMIT 1");
            $stmt->execute([$user_id]);
            $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                "status" => "success",
                "message" => "Profile updated successfully",
                "user" => $updatedUser
            ]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
        break;
}
?>
