<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    $sql = "CREATE TABLE IF NOT EXISTS client_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        applicant_type VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        identifier_no VARCHAR(255) NOT NULL,
        tax_no VARCHAR(255) DEFAULT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        full_content LONGTEXT NOT NULL,
        profile_data LONGTEXT NOT NULL,
        file_decree VARCHAR(255) DEFAULT NULL,
        file_appoint VARCHAR(255) DEFAULT NULL,
        file_npwp VARCHAR(255) DEFAULT NULL,
        file_other VARCHAR(255) DEFAULT NULL,
        file_deed VARCHAR(255) DEFAULT NULL,
        file_amendment VARCHAR(255) DEFAULT NULL,
        file_ministry VARCHAR(255) DEFAULT NULL,
        file_adart VARCHAR(255) DEFAULT NULL,
        file_poa VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";

    $conn->exec($sql);
    echo json_encode(["status" => "success", "message" => "Table 'client_profiles' created successfully."]);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Migration failed: " . $e->getMessage()]);
}
?>
