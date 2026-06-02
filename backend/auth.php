<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($method === 'POST') {
    switch ($action) {
        case 'register':
            if (isset($data['name']) && isset($data['email']) && isset($data['password'])) {
                $name = $data['name'];
                $email = $data['email'];
                $password = password_hash($data['password'], PASSWORD_BCRYPT);

                $query = "INSERT INTO users (name, email, password) VALUES (:name, :email, :password)";
                $stmt = $conn->prepare($query);
                
                try {
                    $stmt->execute([':name' => $name, ':email' => $email, ':password' => $password]);
                    echo json_encode(["status" => "success", "message" => "User registered successfully."]);
                } catch(PDOException $e) {
                    echo json_encode(["status" => "error", "message" => "Email already exists."]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => "Missing required fields."]);
            }
            break;

        case 'login':
            if (isset($data['email']) && isset($data['password'])) {
                $email = $data['email'];
                $password = $data['password'];

                $query = "SELECT * FROM users WHERE email = :email LIMIT 1";
                $stmt = $conn->prepare($query);
                $stmt->execute([':email' => $email]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($user && password_verify($password, $user['password'])) {
                    echo json_encode(["status" => "success", "message" => "Login successful.", "user" => ["id" => $user['id'], "name" => $user['name'], "email" => $user['email'], "role" => $user['role']]]);
                } else {

                    echo json_encode(["status" => "error", "message" => "Invalid email or password."]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => "Missing required fields."]);
            }
            break;

        case 'forgot_password':
            if (isset($data['email'])) {
                $email = $data['email'];
                $otp = rand(100000, 999999);

                $query = "INSERT INTO password_resets (email, otp) VALUES (:email, :otp)";
                $stmt = $conn->prepare($query);
                $stmt->execute([':email' => $email, ':otp' => $otp]);

                // In a real app, send email here. For now, return OTP in response.
                echo json_encode(["status" => "success", "message" => "OTP sent.", "otp" => $otp]);
            } else {
                echo json_encode(["status" => "error", "message" => "Missing required fields."]);
            }
            break;

        case 'reset_password':
            if (isset($data['email']) && isset($data['otp']) && isset($data['new_password'])) {
                $email = $data['email'];
                $otp = $data['otp'];
                $new_password = password_hash($data['new_password'], PASSWORD_BCRYPT);

                $query = "SELECT * FROM password_resets WHERE email = :email AND otp = :otp ORDER BY created_at DESC LIMIT 1";
                $stmt = $conn->prepare($query);
                $stmt->execute([':email' => $email, ':otp' => $otp]);
                
                if ($stmt->rowCount() > 0) {
                    $updateQuery = "UPDATE users SET password = :password WHERE email = :email";
                    $updateStmt = $conn->prepare($updateQuery);
                    $updateStmt->execute([':password' => $new_password, ':email' => $email]);

                    echo json_encode(["status" => "success", "message" => "Password reset successfully."]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Invalid OTP."]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => "Missing required fields."]);
            }
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Invalid action."]);
            break;
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
?>
