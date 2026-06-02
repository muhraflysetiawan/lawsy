<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    $sql = "CREATE TABLE IF NOT EXISTS generated_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        document_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        document_data LONGTEXT NOT NULL,
        content LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";

    $conn->exec($sql);
    echo json_encode(["status" => "success", "message" => "Table 'generated_documents' created successfully."]);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Migration failed: " . $e->getMessage()]);
}
?>
