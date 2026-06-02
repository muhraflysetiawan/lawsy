<?php
require_once 'config.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS calls (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        caller_id INT NOT NULL,
        receiver_id INT NOT NULL,
        status VARCHAR(20) DEFAULT 'ringing',
        sdp_offer TEXT DEFAULT NULL,
        sdp_answer TEXT DEFAULT NULL,
        caller_candidates TEXT DEFAULT NULL,
        receiver_candidates TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )";

    $conn->exec($sql);
    echo json_encode(["status" => "success", "message" => "Table 'calls' created successfully."]);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Migration failed: " . $e->getMessage()]);
}
?>
