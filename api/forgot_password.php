<?php
include "db_connect.php";

$data = json_decode(file_get_contents("php://input"));

if (isset($data->email) && isset($data->new_password)) {
    $email = $conn->real_escape_string($data->email);
    $plain_password = $data->new_password;

    if(empty($email) || empty($plain_password)){
        echo json_encode(["status" => "error", "message" => "Fields cannot be empty."]);
        exit;
    }

    $result = $conn->query("SELECT * FROM users WHERE email='$email'");

    if ($result->num_rows > 0) {
        $hashed_password = password_hash($plain_password, PASSWORD_DEFAULT);
        $update = $conn->query("UPDATE users SET password='$hashed_password' WHERE email='$email'");

        if ($update) {
            echo json_encode(["status" => "success", "message" => "Password updated successfully."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to update password."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Email not found. Please check your address or sign up first."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid input."]);
}

$conn->close();
?>
