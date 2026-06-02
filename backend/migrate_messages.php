<?php
require_once 'config.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message_text TEXT,
        attachment_path VARCHAR(255) DEFAULT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id),
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
    )";

    $conn->exec($sql);
    echo json_encode(["status" => "success", "message" => "Table 'messages' created successfully."]);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Migration failed: " . $e->getMessage()]);
}
?>
