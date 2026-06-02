<?php
require_once 'config.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS lawyer_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        location VARCHAR(255),
        expertise TEXT,
        about_me TEXT,
        certifications TEXT,
        cases_solved INT DEFAULT 0,
        clients_served INT DEFAULT 0,
        legal_consultations INT DEFAULT 0,
        rating FLOAT DEFAULT 0.0,
        review_count INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $conn->exec($sql);
    echo "Table lawyer_profiles created successfully\n";

    // Also ensure lawyer_registrations has what we need or sync
    // For now let's just use this table for live profiles.
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
