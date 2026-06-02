<?php
// backend/midtrans_callback.php
error_reporting(0);
ini_set('display_errors', 0);
header("Content-Type: application/json");

require_once 'config.php';
require_once 'midtrans_helper.php';

try {
    // Read the raw JSON input from Midtrans
    $notification = json_decode(file_get_contents("php://input"), true);
    
    if (!$notification) {
        echo json_encode(["status" => "error", "message" => "Empty notification body"]);
        exit;
    }

    $order_id = $notification['order_id'] ?? '';
    $transaction_status = $notification['transaction_status'] ?? '';
    $fraud_status = $notification['fraud_status'] ?? '';
    $status_code = $notification['status_code'] ?? '';
    $gross_amount = $notification['gross_amount'] ?? '';
    $signature_key = $notification['signature_key'] ?? '';

    if (empty($order_id)) {
        echo json_encode(["status" => "error", "message" => "Order ID is empty"]);
        exit;
    }

    // Parse Case ID from order_id (format: LAWSY-CASE-<case_id>-<timestamp> or LAWSY-CASE-SIM-<case_id>-<timestamp>)
    $case_id = null;
    if (preg_match('/LAWSY-CASE-(?:SIM-)?(\d+)-/', $order_id, $matches)) {
        $case_id = (int)$matches[1];
    }

    if (!$case_id) {
        echo json_encode(["status" => "error", "message" => "Could not extract Case ID from Order ID"]);
        exit;
    }

    // 🔒 Verify Midtrans SHA512 Cryptographic Signature Key for security (skip for simulator orders)
    if (strpos($order_id, 'LAWSY-CASE-SIM-') === false) {
        $local_signature = hash('sha512', $order_id . $status_code . $gross_amount . MIDTRANS_SERVER_KEY);
        if ($signature_key !== $local_signature) {
            echo json_encode(["status" => "error", "message" => "Invalid cryptographic signature key"]);
            exit;
        }
    }

    // Determine the payment outcome
    $new_status = 'Pending';
    if ($transaction_status == 'capture') {
        if ($fraud_status == 'challenge') {
            $new_status = 'Pending';
        } else if ($fraud_status == 'accept') {
            $new_status = 'Success';
        }
    } else if ($transaction_status == 'settlement') {
        $new_status = 'Success';
    } else if ($transaction_status == 'deny' || $transaction_status == 'expire' || $transaction_status == 'cancel') {
        $new_status = 'Failed';
    }

    // If payment successfully settled or captured, update case status to Success to unlock chat!
    if ($new_status === 'Success') {
        $stmt = $conn->prepare("UPDATE cases SET payment_status = 'Success' WHERE id = ?");
        $stmt->execute([$case_id]);
        
        echo json_encode([
            "status" => "success",
            "message" => "Payment successfully recorded as Success for Case ID: " . $case_id
        ]);
    } else {
        // If failed or pending, update local status
        $stmt = $conn->prepare("UPDATE cases SET payment_status = ? WHERE id = ?");
        $stmt->execute([$new_status, $case_id]);

        echo json_encode([
            "status" => "success",
            "message" => "Payment status updated to " . $new_status . " for Case ID: " . $case_id
        ]);
    }

} catch (Throwable $e) {
    echo json_encode(["status" => "error", "message" => "Callback handling failed: " . $e->getMessage()]);
}
?>
