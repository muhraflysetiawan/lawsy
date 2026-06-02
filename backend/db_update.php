<?php
require_once 'config.php';

try {
    // Ensure messages table exists if not already there (though it should be)
    $conn->exec("CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message_text TEXT,
        attachment_path VARCHAR(255),
        is_read TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Add new columns
    $columns = [
        "is_edited" => "TINYINT DEFAULT 0",
        "is_deleted_all" => "TINYINT DEFAULT 0",
        "deleted_by_sender" => "TINYINT DEFAULT 0",
        "deleted_by_receiver" => "TINYINT DEFAULT 0",
        "replied_to_id" => "INT DEFAULT NULL"
    ];

    foreach ($columns as $column => $definition) {
        try {
            $conn->exec("ALTER TABLE messages ADD COLUMN $column $definition");
            echo "Added column $column\n";
        } catch (PDOException $e) {
            // Probably column already exists
            echo "Column $column already exists or error: " . $e->getMessage() . "\n";
        }
    }

    // Add column is_video to calls table for identifying call types
    try {
        $conn->exec("ALTER TABLE calls ADD COLUMN is_video TINYINT DEFAULT 0");
        echo "Added column is_video to calls table\n";
    } catch (PDOException $e) {
        echo "Column is_video already exists in calls table or error: " . $e->getMessage() . "\n";
    }

    echo "Database updated successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
