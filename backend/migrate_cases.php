<?php
require_once 'config.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS cases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        client_id INT NOT NULL,
        lawyer_id INT NOT NULL,
        case_name VARCHAR(255) NOT NULL,
        category ENUM('Small', 'Medium', 'High') NOT NULL,
        estimated_costs DECIMAL(15, 2) NOT NULL,
        service_fee DECIMAL(15, 2) DEFAULT 2000.00,
        tax_percentage DECIMAL(5, 2) DEFAULT 11.00,
        total_cost DECIMAL(15, 2) NOT NULL,
        notes_for_client TEXT,
        status VARCHAR(50) DEFAULT 'Proposed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id),
        FOREIGN KEY (client_id) REFERENCES users(id),
        FOREIGN KEY (lawyer_id) REFERENCES users(id)
    )";

    $conn->exec($sql);
    echo json_encode(["status" => "success", "message" => "Table 'cases' created successfully."]);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Migration failed: " . $e->getMessage()]);
}
?>
