<?php
require_once 'config.php';

try {
    $conn->exec("CREATE TABLE IF NOT EXISTS lawyer_closed_dates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lawyer_id INT NOT NULL,
        closed_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_lawyer_closed_date (lawyer_id, closed_date),
        FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE CASCADE
    )");
    echo "Table lawyer_closed_dates created successfully\n";

    $conn->exec("CREATE TABLE IF NOT EXISTS lawyer_working_hours (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lawyer_id INT NOT NULL,
        day_range VARCHAR(100) NOT NULL,
        start_time VARCHAR(20) NOT NULL,
        end_time VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE CASCADE
    )");
    echo "Table lawyer_working_hours created successfully\n";

    $conn->exec("CREATE TABLE IF NOT EXISTS lawyer_slot_availabilities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lawyer_id INT NOT NULL,
        slot_date DATE NOT NULL,
        slot_time VARCHAR(30) NOT NULL,
        is_available TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_lawyer_slot_date_time (lawyer_id, slot_date, slot_time),
        FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE CASCADE
    )");
    echo "Table lawyer_slot_availabilities created successfully\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
