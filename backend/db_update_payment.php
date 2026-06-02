<?php
require_once 'config.php';

try {
    // Add payment_status to cases table if it doesn't exist
    $conn->exec("ALTER TABLE cases ADD COLUMN payment_status VARCHAR(20) DEFAULT 'Pending'");
    echo "Database updated: cases table now has payment_status column.\n";
} catch (PDOException $e) {
    // Column might already exist
    echo "Notice: " . $e->getMessage() . "\n";
}
?>
