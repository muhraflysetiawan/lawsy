<?php
include "db_connect.php";

$data = json_decode(file_get_contents("php://input"));

if (isset($data->email) && isset($data->password)) {
    $email = $conn->real_escape_string($data->email);
    $password = $data->password;

    if(empty($email) || empty($password)){
        echo json_encode(["status" => "error", "message" => "Fields cannot be empty."]);
        exit;
    }

    $result = $conn->query("SELECT * FROM users WHERE email='$email'");

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        if (password_verify($password, $user['password'])) {
            echo json_encode(["status" => "success", "message" => "Login successful", "user" => ["id" => $user['id'], "email" => $user['email'], "name" => $user['name']]]);
        } else {
            echo json_encode(["status" => "error", "message" => "Incorrect password. Please try again."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Email not found. Please check your address or sign up first."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid input."]);
}

$conn->close();
?>
