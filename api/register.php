<?php
include "db_connect.php";

$data = json_decode(file_get_contents("php://input"));

if (isset($data->name) && isset($data->email) && isset($data->password)) {
    $name = $conn->real_escape_string($data->name);
    $email = $conn->real_escape_string($data->email);
    $plain_password = $data->password;

    // Check if fields empty
    if(empty($name) || empty($email) || empty($plain_password)){
        echo json_encode(["status" => "error", "message" => "Fields cannot be empty."]);
        exit;
    }

    // Check if email already exists
    $check_email = $conn->query("SELECT * FROM users WHERE email='$email'");

    if ($check_email->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Email already registered."]);
    } else {
        $hashed_password = password_hash($plain_password, PASSWORD_DEFAULT);
        $insert = $conn->query("INSERT INTO users (name, email, password) VALUES ('$name', '$email', '$hashed_password')");

        if ($insert) {
            echo json_encode(["status" => "success", "message" => "Account created successfully."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to create account. " . $conn->error]);
        }
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid input."]);
}

$conn->close();
?>
