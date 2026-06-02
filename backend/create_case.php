<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $booking_id = $data['booking_id'] ?? null;
    $client_id = $data['client_id'] ?? null;
    $lawyer_id = $data['lawyer_id'] ?? null;
    $case_name = $data['case_name'] ?? null;
    $category = $data['category'] ?? null;
    $estimated_costs = $data['estimated_costs'] ?? 0;
    $notes_for_client = $data['notes_for_client'] ?? '';

    if (!$booking_id || !$client_id || !$lawyer_id || !$case_name || !$category || !$estimated_costs) {
        echo json_encode(["status" => "error", "message" => "Missing required fields."]);
        exit;
    }

    $service_fee = 2000;
    $tax_percentage = 11;
    
    $subtotal = $estimated_costs + $service_fee;
    $tax_amount = ($subtotal * $tax_percentage) / 100;
    $total_cost = $subtotal + $tax_amount;

    try {
        $conn->beginTransaction();

        // Insert into cases table
        $query = "INSERT INTO cases (booking_id, client_id, lawyer_id, case_name, category, estimated_costs, total_cost, notes_for_client) 
                  VALUES (:booking_id, :client_id, :lawyer_id, :case_name, :category, :estimated_costs, :total_cost, :notes_for_client)";
        $stmt = $conn->prepare($query);
        $stmt->execute([
            ':booking_id' => $booking_id,
            ':client_id' => $client_id,
            ':lawyer_id' => $lawyer_id,
            ':case_name' => $case_name,
            ':category' => $category,
            ':estimated_costs' => $estimated_costs,
            ':total_cost' => $total_cost,
            ':notes_for_client' => $notes_for_client
        ]);

        // Update booking status to 'Case Created' or similar? 
        // The user said "Send" for payment. Usually after payment it becomes active.
        // For now, let's update booking status to 'Proposed' as per context of "Payment client must pay"
        $conn->commit();

        // --- AUTOMATED BILLING LOGIC ---
        // Fetch client name for the bill
        $clientStmt = $conn->prepare("SELECT name FROM users WHERE id = ?");
        $clientStmt->execute([$client_id]);
        $client = $clientStmt->fetch();
        $client_name = $client ? $client['name'] : 'Client';

        // Construct Bill Card data
        $bill_data = [
            'client_name' => $client_name,
            'case_name' => $case_name,
            'category' => $category,
            'estimated_costs' => (int)$estimated_costs,
            'service_fee' => 2000,
            'tax_percentage' => 11,
            'notes' => $notes_for_client,
            'total_cost' => (int)$total_cost,
            'header_image' => 'uploads/bill_header.png'
        ];
        $bill_message = "[BILL_CARD]" . json_encode($bill_data);

        // Insert into chat messages
        $msgQuery = "INSERT INTO messages (booking_id, sender_id, receiver_id, message_text) 
                     VALUES (:booking_id, :sender_id, :receiver_id, :message_text)";
        $msgStmt = $conn->prepare($msgQuery);
        $msgStmt->execute([
            ':booking_id' => $booking_id,
            ':sender_id' => $lawyer_id,
            ':receiver_id' => $client_id,
            ':message_text' => $bill_message
        ]);
        // --- END BILLING LOGIC ---

        echo json_encode(["status" => "success", "message" => "Case created successfully. Bill sent to client.", "total_cost" => $total_cost]);
    } catch(PDOException $e) {
        $conn->rollBack();
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
?>
