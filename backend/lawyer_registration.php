<?php
require_once 'config.php';

// Menambahkan header CORS jika belum ada di config.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'save_step1':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['user_id'])) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            exit;
        }

        // Cek apakah sudah ada registrasi sebelumnya
        $checkStmt = $conn->prepare("SELECT id FROM lawyer_registrations WHERE user_id = ? AND status = 'pending'");
        $checkStmt->execute([$data['user_id']]);
        $existing = $checkStmt->fetch();

        if ($existing) {
            $sql = "UPDATE lawyer_registrations SET full_name = ?, law_firm = ?, specialization = ?, years_experience = ?, biography = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['fullName'],
                $data['lawFirm'],
                $data['specialization'],
                $data['yearsExperience'],
                $data['biography'],
                $existing['id']
            ]);
        } else {
            $sql = "INSERT INTO lawyer_registrations (user_id, full_name, law_firm, specialization, years_experience, biography) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['user_id'],
                $data['fullName'],
                $data['lawFirm'],
                $data['specialization'],
                $data['yearsExperience'],
                $data['biography']
            ]);
        }
        echo json_encode(["status" => "success", "message" => "Step 1 saved"]);
        break;

    case 'upload_doc':
        if (!isset($_POST['user_id']) || !isset($_FILES['file']) || !isset($_POST['doc_type'])) {
            echo json_encode(["status" => "error", "message" => "Missing data"]);
            exit;
        }

        $user_id = $_POST['user_id'];
        $doc_type = $_POST['doc_type']; // identity, license, oath, degree, skill
        $file = $_FILES['file'];

        // Limit 2MB
        if ($file['size'] > 2 * 1024 * 1024) {
            echo json_encode(["status" => "error", "message" => "File size exceeds 2MB"]);
            exit;
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = "user_" . $user_id . "_" . $doc_type . "_" . time() . "." . $ext;
        $target_path = "uploads/" . $filename;

        if (move_uploaded_file($file['tmp_name'], $target_path)) {
            // Update database
            $column = "";
            switch ($doc_type) {
                case 'identity': $column = "id_card_path"; break;
                case 'license': $column = "lawyer_license_path"; break;
                case 'oath': $column = "oath_doc_path"; break;
                case 'degree': $column = "degree_path"; break;
                case 'skill': $column = "skill_cert_path"; break;
            }

            if ($column) {
                $stmt = $conn->prepare("UPDATE lawyer_registrations SET $column = ? WHERE user_id = ? AND status = 'pending' ORDER BY id DESC LIMIT 1");
                $stmt->execute([$target_path, $user_id]);
                echo json_encode(["status" => "success", "file_path" => $target_path, "file_name" => $file['name'], "file_size" => $file['size']]);
            } else {
                echo json_encode(["status" => "error", "message" => "Invalid doc type"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to move file"]);
        }
        break;

    case 'save_face_scan':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['user_id']) || !isset($data['image'])) {
            echo json_encode(["status" => "error", "message" => "Missing data"]);
            exit;
        }

        $img = $data['image'];
        $img = str_replace('data:image/jpeg;base64,', '', $img);
        $img = str_replace(' ', '+', $img);
        $fileData = base64_decode($img);
        $filename = "user_" . $data['user_id'] . "_face_scan_" . time() . ".jpg";
        $target_path = "uploads/" . $filename;

        file_put_contents($target_path, $fileData);

        $stmt = $conn->prepare("UPDATE lawyer_registrations SET face_scan_path = ? WHERE user_id = ? AND status = 'pending' ORDER BY id DESC LIMIT 1");
        $stmt->execute([$target_path, $data['user_id']]);
        
        echo json_encode(["status" => "success", "face_scan_path" => $target_path]);
        break;

    case 'get_registration_data':
        $user_id = $_GET['user_id'];
        $stmt = $conn->prepare("SELECT * FROM lawyer_registrations WHERE user_id = ? AND status = 'pending' ORDER BY id DESC LIMIT 1");
        $stmt->execute([$user_id]);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $res]);
        break;

    case 'get_all_requests':
        $stmt = $conn->prepare("SELECT r.*, u.email as user_email FROM lawyer_registrations r JOIN users u ON r.user_id = u.id WHERE r.status = 'pending'");
        $stmt->execute();
        $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "requests" => $requests]);
        break;

    case 'approve_request':
        $data = json_decode(file_get_contents("php://input"), true);
        $reg_id = $data['registration_id'];
        
        $conn->beginTransaction();
        try {
            // Get user_id first
            $stmt = $conn->prepare("SELECT user_id FROM lawyer_registrations WHERE id = ?");
            $stmt->execute([$reg_id]);
            $reg = $stmt->fetch();
            
            if ($reg) {
                // Update registration status
                $stmt1 = $conn->prepare("UPDATE lawyer_registrations SET status = 'approved' WHERE id = ?");
                $stmt1->execute([$reg_id]);
                
                // Update user role
                $stmt2 = $conn->prepare("UPDATE users SET role = 'Lawyer' WHERE id = ?");
                $stmt2->execute([$reg['user_id']]);
                
                $conn->commit();
                echo json_encode(["status" => "success", "message" => "Request approved"]);
            } else {
                throw new Exception("Registration not found");
            }
        } catch (Exception $e) {
            $conn->rollBack();
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
        break;
}
?>
