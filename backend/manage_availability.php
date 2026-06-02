<?php
require_once 'config.php';

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($action) {
        case 'get_availability':
            $lawyer_id = isset($_GET['lawyer_id']) ? intval($_GET['lawyer_id']) : 0;
            if (!$lawyer_id) {
                echo json_encode(["status" => "error", "message" => "Missing lawyer_id"]);
                exit;
            }

            // 1. Fetch working hours
            $stmt = $conn->prepare("SELECT id, day_range, start_time, end_time FROM lawyer_working_hours WHERE lawyer_id = ?");
            $stmt->execute([$lawyer_id]);
            $working_hours = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 2. Fetch closed dates
            $stmt = $conn->prepare("SELECT closed_date FROM lawyer_closed_dates WHERE lawyer_id = ?");
            $stmt->execute([$lawyer_id]);
            $closed_dates_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $closed_dates = array_map(function($row) {
                return $row['closed_date'];
            }, $closed_dates_raw);

            // 3. Fetch slot availabilities
            $stmt = $conn->prepare("SELECT slot_date, slot_time, is_available FROM lawyer_slot_availabilities WHERE lawyer_id = ?");
            $stmt->execute([$lawyer_id]);
            $slot_availabilities = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 4. Fetch confirmed bookings
            $stmt = $conn->prepare("SELECT booking_date, booking_time FROM bookings WHERE lawyer_id = ? AND (LOWER(status) = 'confirmed' OR LOWER(status) = 'approved')");
            $stmt->execute([$lawyer_id]);
            $confirmed_bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "status" => "success",
                "data" => [
                    "working_hours" => $working_hours,
                    "closed_dates" => $closed_dates,
                    "slot_availabilities" => $slot_availabilities,
                    "confirmed_bookings" => $confirmed_bookings
                ]
            ]);
            break;

        case 'save_availability':
            $data = json_decode(file_get_contents("php://input"), true);
            if (!isset($data['user_id'])) {
                echo json_encode(["status" => "error", "message" => "Unauthorized or missing user_id"]);
                exit;
            }

            $lawyer_id = intval($data['user_id']);
            $working_hours = isset($data['working_hours']) ? $data['working_hours'] : [];
            $closed_dates = isset($data['closed_dates']) ? $data['closed_dates'] : [];
            $slot_availabilities = isset($data['slot_availabilities']) ? $data['slot_availabilities'] : [];

            $conn->beginTransaction();

            try {
                // 1. Update working hours (delete existing and insert new)
                $stmt = $conn->prepare("DELETE FROM lawyer_working_hours WHERE lawyer_id = ?");
                $stmt->execute([$lawyer_id]);

                if (!empty($working_hours)) {
                    $stmtInsert = $conn->prepare("INSERT INTO lawyer_working_hours (lawyer_id, day_range, start_time, end_time) VALUES (?, ?, ?, ?)");
                    foreach ($working_hours as $wh) {
                        $stmtInsert->execute([
                            $lawyer_id,
                            $wh['day_range'],
                            $wh['start_time'],
                            $wh['end_time']
                        ]);
                    }
                }

                // 2. Update closed dates (delete existing and insert new)
                $stmt = $conn->prepare("DELETE FROM lawyer_closed_dates WHERE lawyer_id = ?");
                $stmt->execute([$lawyer_id]);

                if (!empty($closed_dates)) {
                    $stmtInsert = $conn->prepare("INSERT INTO lawyer_closed_dates (lawyer_id, closed_date) VALUES (?, ?)");
                    foreach ($closed_dates as $date) {
                        $stmtInsert->execute([$lawyer_id, $date]);
                    }
                }

                // 3. Update slot availabilities (delete existing and insert new)
                $stmt = $conn->prepare("DELETE FROM lawyer_slot_availabilities WHERE lawyer_id = ?");
                $stmt->execute([$lawyer_id]);

                if (!empty($slot_availabilities)) {
                    $stmtInsert = $conn->prepare("INSERT INTO lawyer_slot_availabilities (lawyer_id, slot_date, slot_time, is_available) VALUES (?, ?, ?, ?)");
                    foreach ($slot_availabilities as $sa) {
                        $stmtInsert->execute([
                            $lawyer_id,
                            $sa['slot_date'],
                            $sa['slot_time'],
                            intval($sa['is_available'])
                        ]);
                    }
                }

                $conn->commit();
                echo json_encode(["status" => "success", "message" => "Availability changes saved successfully"]);

            } catch (Exception $e) {
                $conn->rollBack();
                echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
            }
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Invalid action"]);
            break;
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
?>
