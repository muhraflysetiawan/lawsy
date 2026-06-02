<?php
require_once 'config.php';

try {
    // Add columns to cases table for Midtrans integration
    $conn->exec("ALTER TABLE cases ADD COLUMN midtrans_order_id VARCHAR(100) DEFAULT NULL");
    $conn->exec("ALTER TABLE cases ADD COLUMN qris_url TEXT DEFAULT NULL");
    echo json_encode(["status" => "success", "message" => "Database updated: cases table now has midtrans_order_id and qris_url columns."]);
} catch (PDOException $e) {
    // Columns might already exist or another PDO error
    echo json_encode(["status" => "error", "message" => "Database error or columns already exist: " . $e->getMessage()]);
}
?>
