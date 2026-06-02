<?php
require_once 'config.php';

try {
    $sql = "ALTER TABLE lawyer_profiles 
            ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER location,
            ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude";
    $conn->exec($sql);
    echo "Columns latitude and longitude added successfully\n";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
