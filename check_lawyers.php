<?php
require_once 'backend/config.php';
$stmt = $conn->query("SELECT * FROM lawyer_profiles");
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($results, JSON_PRETTY_PRINT);
?>
