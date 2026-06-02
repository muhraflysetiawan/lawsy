<?php
require_once 'config.php';

// Disable errors in output for JSON consistency
error_reporting(0);
ini_set('display_errors', 0);

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }
} else {
    $input = $_GET;
}

switch ($action) {
    case 'start_call':
        $booking_id = isset($input['booking_id']) ? intval($input['booking_id']) : 0;
        $caller_id = isset($input['caller_id']) ? intval($input['caller_id']) : 0;
        $receiver_id = isset($input['receiver_id']) ? intval($input['receiver_id']) : 0;
        $sdp_offer = isset($input['sdp_offer']) ? $input['sdp_offer'] : null;
        $is_video = isset($input['is_video']) ? intval($input['is_video']) : 0;

        if (!$booking_id || !$caller_id || !$receiver_id) {
            echo json_encode(["status" => "error", "message" => "Missing required fields."]);
            exit;
        }

        try {
            // End any existing calls for this booking first
            $stmt = $conn->prepare("UPDATE calls SET status = 'ended' WHERE booking_id = ? AND status IN ('ringing', 'active')");
            $stmt->execute([$booking_id]);

            // Insert new call
            $stmt = $conn->prepare("INSERT INTO calls (booking_id, caller_id, receiver_id, status, sdp_offer, is_video, caller_candidates, receiver_candidates) VALUES (?, ?, ?, 'ringing', ?, ?, '[]', '[]')");
            $stmt->execute([$booking_id, $caller_id, $receiver_id, $sdp_offer, $is_video]);
            $call_id = $conn->lastInsertId();

            // Fetch and return the inserted call
            $stmt = $conn->prepare("SELECT * FROM calls WHERE id = ?");
            $stmt->execute([$call_id]);
            $call = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode(["status" => "success", "data" => $call]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'set_sdp_offer':
        $call_id = isset($input['call_id']) ? intval($input['call_id']) : 0;
        $sdp_offer = isset($input['sdp_offer']) ? $input['sdp_offer'] : '';

        if (!$call_id || !$sdp_offer) {
            echo json_encode(["status" => "error", "message" => "Missing call_id or sdp_offer."]);
            exit;
        }

        try {
            $stmt = $conn->prepare("UPDATE calls SET sdp_offer = ? WHERE id = ?");
            $stmt->execute([$sdp_offer, $call_id]);
            echo json_encode(["status" => "success", "message" => "SDP offer uploaded."]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'get_call_status':
        $booking_id = isset($input['booking_id']) ? intval($input['booking_id']) : 0;
        $call_id = isset($input['call_id']) ? intval($input['call_id']) : 0;

        try {
            if ($call_id) {
                $stmt = $conn->prepare("SELECT * FROM calls WHERE id = ?");
                $stmt->execute([$call_id]);
            } else if ($booking_id) {
                // Get the latest call that is active or ringing, or the absolute latest ended call
                $stmt = $conn->prepare("SELECT * FROM calls WHERE booking_id = ? ORDER BY id DESC LIMIT 1");
                $stmt->execute([$booking_id]);
            } else {
                echo json_encode(["status" => "error", "message" => "Missing booking_id or call_id."]);
                exit;
            }

            $call = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($call) {
                echo json_encode(["status" => "success", "data" => $call]);
            } else {
                echo json_encode(["status" => "success", "data" => null]);
            }
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'answer_call':
        $call_id = isset($input['call_id']) ? intval($input['call_id']) : 0;
        $sdp_answer = isset($input['sdp_answer']) ? $input['sdp_answer'] : '';

        if (!$call_id || !$sdp_answer) {
            echo json_encode(["status" => "error", "message" => "Missing call_id or sdp_answer."]);
            exit;
        }

        try {
            $stmt = $conn->prepare("UPDATE calls SET status = 'active', sdp_answer = ? WHERE id = ?");
            $stmt->execute([$sdp_answer, $call_id]);

            echo json_encode(["status" => "success", "message" => "Call answered."]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'add_candidate':
        $call_id = isset($input['call_id']) ? intval($input['call_id']) : 0;
        $role = isset($input['role']) ? $input['role'] : ''; // 'caller' or 'receiver'
        $candidate = isset($input['candidate']) ? $input['candidate'] : '';

        if (!$call_id || !in_array($role, ['caller', 'receiver']) || !$candidate) {
            echo json_encode(["status" => "error", "message" => "Invalid fields."]);
            exit;
        }

        try {
            // Get existing candidates
            $stmt = $conn->prepare("SELECT caller_candidates, receiver_candidates FROM calls WHERE id = ?");
            $stmt->execute([$call_id]);
            $call = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$call) {
                echo json_encode(["status" => "error", "message" => "Call session not found."]);
                exit;
            }

            $col = ($role === 'caller') ? 'caller_candidates' : 'receiver_candidates';
            $candidates = json_decode($call[$col], true);
            if (!is_array($candidates)) {
                $candidates = [];
            }

            // Append candidate if not already in there
            $candidate_obj = is_string($candidate) ? json_decode($candidate, true) : $candidate;
            if ($candidate_obj) {
                // check uniqueness
                $exists = false;
                foreach ($candidates as $c) {
                    if (isset($c['candidate']) && isset($candidate_obj['candidate']) && $c['candidate'] === $candidate_obj['candidate']) {
                        $exists = true;
                        break;
                    }
                }
                if (!$exists) {
                    $candidates[] = $candidate_obj;
                }
            }

            $candidates_json = json_encode($candidates);
            $stmt = $conn->prepare("UPDATE calls SET {$col} = ? WHERE id = ?");
            $stmt->execute([$candidates_json, $call_id]);

            echo json_encode(["status" => "success", "message" => "Candidate added."]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'end_call':
        $call_id = isset($input['call_id']) ? intval($input['call_id']) : 0;
        $booking_id = isset($input['booking_id']) ? intval($input['booking_id']) : 0;

        try {
            if ($call_id) {
                $stmt = $conn->prepare("UPDATE calls SET status = 'ended' WHERE id = ?");
                $stmt->execute([$call_id]);
            } else if ($booking_id) {
                $stmt = $conn->prepare("UPDATE calls SET status = 'ended' WHERE booking_id = ? AND status IN ('ringing', 'active')");
                $stmt->execute([$booking_id]);
            } else {
                echo json_encode(["status" => "error", "message" => "Missing call_id or booking_id."]);
                exit;
            }
            echo json_encode(["status" => "success", "message" => "Call ended."]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid action."]);
        break;
}
?>
