<?php
// lawyer_stats.php
// Returns dynamic dashboard stats for a lawyer:
// - rating         (from lawyer_profiles)
// - total_clients  (distinct clients with payment_status = 'Success')
// - active_cases   (cases with payment_status = 'Success' that are still open)
// - weekly_revenue (sum of total_cost for successful payments in the last 7 days)

ini_set('display_errors', 0);
error_reporting(0);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once 'config.php';

$lawyer_id = isset($_GET['lawyer_id']) ? intval($_GET['lawyer_id']) : 0;

if ($lawyer_id <= 0) {
    echo json_encode(["status" => "error", "message" => "lawyer_id is required"]);
    exit;
}

try {
    // 1. Rating from lawyer_profiles
    $stmt = $conn->prepare("SELECT rating FROM lawyer_profiles WHERE user_id = ?");
    $stmt->execute([$lawyer_id]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);
    $rating = $profile ? floatval($profile['rating']) : 0.0;

    // 2. Total unique clients who have paid successfully for this lawyer
    $stmt = $conn->prepare(
        "SELECT COUNT(DISTINCT client_id) AS total
         FROM cases
         WHERE lawyer_id = ? AND payment_status = 'Success'"
    );
    $stmt->execute([$lawyer_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $total_clients = (int)($row['total'] ?? 0);

    // 3. Active cases = cases with successful payment (not yet closed/settled)
    //    We treat all paid cases as "active" since there's no explicit closed status
    $stmt = $conn->prepare(
        "SELECT COUNT(*) AS total
         FROM cases
         WHERE lawyer_id = ? AND payment_status = 'Success'"
    );
    $stmt->execute([$lawyer_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $active_cases = (int)($row['total'] ?? 0);

    // 4. Weekly Revenue = sum of total_cost for paid cases in the last 7 days
    $stmt = $conn->prepare(
        "SELECT COALESCE(SUM(total_cost), 0) AS weekly_total
         FROM cases
         WHERE lawyer_id = ?
           AND payment_status = 'Success'
           AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );
    $stmt->execute([$lawyer_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $weekly_revenue = (float)($row['weekly_total'] ?? 0);

    // Format weekly revenue: e.g. 12500000 -> "Rp 12.5M", 500000 -> "Rp 500K"
    if ($weekly_revenue >= 1_000_000) {
        $formatted = 'Rp ' . number_format($weekly_revenue / 1_000_000, 1, '.', '') . 'M';
    } elseif ($weekly_revenue >= 1_000) {
        $formatted = 'Rp ' . number_format($weekly_revenue / 1_000, 0, '.', '') . 'K';
    } else {
        $formatted = 'Rp ' . number_format($weekly_revenue, 0, ',', '.');
    }

    echo json_encode([
        "status"         => "success",
        "rating"         => number_format($rating, 1),
        "total_clients"  => $total_clients,
        "active_cases"   => $active_cases,
        "weekly_revenue" => $formatted,
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
