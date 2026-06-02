<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

try {
    // Ambil pengacara yang sudah memiliki koordinat
    $sql = "SELECT lp.user_id, lp.latitude, lp.longitude, lp.rating, lp.location, u.name, lr.specialization
            FROM lawyer_profiles lp
            JOIN users u ON lp.user_id = u.id
            LEFT JOIN lawyer_registrations lr ON lp.user_id = lr.user_id
            WHERE lp.latitude IS NOT NULL AND lp.longitude IS NOT NULL";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $lawyers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $lawyers]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
