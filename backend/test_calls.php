<?php
require_once 'config.php';
try {
    $stmt = $conn->query("SELECT * FROM calls ORDER BY id DESC LIMIT 5");
    $calls = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($calls, JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
