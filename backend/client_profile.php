<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'save':
        if (!isset($_POST['user_id']) || !isset($_POST['applicant_type'])) {
            echo json_encode(["status" => "error", "message" => "Missing required user_id or applicant_type"]);
            exit;
        }

        $user_id = $_POST['user_id'];
        $applicant_type = $_POST['applicant_type'];
        $profile_title = isset($_POST['profile_title']) ? $_POST['profile_title'] : '';
        $profile_text = isset($_POST['profile_text']) ? $_POST['profile_text'] : '';
        
        // Decode the profile data text fields JSON
        $profile_data_json = isset($_POST['profile_data']) ? $_POST['profile_data'] : '{}';
        $profile_data = json_decode($profile_data_json, true);

        // Map main fields based on applicant_type
        $name = '';
        $identifier_no = '';
        $tax_no = '';
        $email = '';
        $phone = '';
        $address = '';

        if ($applicant_type === 'Individual') {
            $name = isset($profile_data['fullName']) ? $profile_data['fullName'] : '';
            $identifier_no = isset($profile_data['nik']) ? $profile_data['nik'] : '';
            $tax_no = isset($profile_data['npwp']) ? $profile_data['npwp'] : '';
            $email = isset($profile_data['email']) ? $profile_data['email'] : '';
            $phone = isset($profile_data['phone']) ? $profile_data['phone'] : '';
            $address = isset($profile_data['address']) ? $profile_data['address'] : '';
        } elseif ($applicant_type === 'Company') {
            $name = isset($profile_data['companyName']) ? $profile_data['companyName'] : '';
            $identifier_no = isset($profile_data['businessRegNo']) ? $profile_data['businessRegNo'] : '';
            $tax_no = isset($profile_data['companyNpwp']) ? $profile_data['companyNpwp'] : '';
            // For email/phone in company, use representative details or empty
            $email = isset($profile_data['email']) ? $profile_data['email'] : '';
            $phone = isset($profile_data['phone']) ? $profile_data['phone'] : '';
            $address = isset($profile_data['registeredAddress']) ? $profile_data['registeredAddress'] : '';
        } elseif ($applicant_type === 'Government') {
            $name = isset($profile_data['govtInstName']) ? $profile_data['govtInstName'] : '';
            $identifier_no = isset($profile_data['govtRegNo']) ? $profile_data['govtRegNo'] : '';
            $tax_no = isset($profile_data['govtNpwp']) ? $profile_data['govtNpwp'] : '';
            $email = isset($profile_data['govtEmail']) ? $profile_data['govtEmail'] : '';
            $phone = isset($profile_data['govtPhone']) ? $profile_data['govtPhone'] : '';
            $address = isset($profile_data['govtAddress']) ? $profile_data['govtAddress'] : '';
        } elseif ($applicant_type === 'Organization') {
            $name = isset($profile_data['orgName']) ? $profile_data['orgName'] : '';
            $identifier_no = isset($profile_data['orgRegNo']) ? $profile_data['orgRegNo'] : '';
            $tax_no = isset($profile_data['orgNpwp']) ? $profile_data['orgNpwp'] : '';
            $email = isset($profile_data['orgEmail']) ? $profile_data['orgEmail'] : '';
            $phone = isset($profile_data['orgPhone']) ? $profile_data['orgPhone'] : '';
            $address = isset($profile_data['orgRegAddress']) ? $profile_data['orgRegAddress'] : '';
        }

        // Process file uploads
        $file_paths = [
            'file_decree' => null,
            'file_appoint' => null,
            'file_npwp' => null,
            'file_other' => null,
            'file_deed' => null,
            'file_amendment' => null,
            'file_ministry' => null,
            'file_adart' => null,
            'file_poa' => null
        ];

        foreach ($file_paths as $key => &$path) {
            if (isset($_FILES[$key]) && $_FILES[$key]['error'] === UPLOAD_ERR_OK) {
                $file = $_FILES[$key];
                $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
                $filename = "client_" . $user_id . "_" . $key . "_" . time() . "." . $ext;
                $target_path = "uploads/" . $filename;
                
                if (move_uploaded_file($file['tmp_name'], $target_path)) {
                    $path = $target_path;
                    // Update inside the JSON profile_data array as well to refer to the uploaded URL path
                    $profile_data[$key] = $target_path;
                }
            }
        }

        // Prepare the SQL query to insert
        $sql = "INSERT INTO client_profiles (
            user_id, applicant_type, name, identifier_no, tax_no, email, phone, address, full_content, profile_data,
            file_decree, file_appoint, file_npwp, file_other, file_deed, file_amendment, file_ministry, file_adart, file_poa
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )";

        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $user_id,
            $applicant_type,
            $name,
            $identifier_no,
            $tax_no,
            $email,
            $phone,
            $address,
            $profile_text,
            json_encode($profile_data),
            $file_paths['file_decree'],
            $file_paths['file_appoint'],
            $file_paths['file_npwp'],
            $file_paths['file_other'],
            $file_paths['file_deed'],
            $file_paths['file_amendment'],
            $file_paths['file_ministry'],
            $file_paths['file_adart'],
            $file_paths['file_poa']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Client profile saved to database successfully",
            "profile_id" => $conn->lastInsertId()
        ]);
        break;

    case 'list':
        $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : '';
        if (!$user_id) {
            echo json_encode(["status" => "error", "message" => "Missing user_id"]);
            exit;
        }

        $stmt = $conn->prepare("SELECT * FROM client_profiles WHERE user_id = ? ORDER BY id DESC");
        $stmt->execute([$user_id]);
        $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "profiles" => $profiles
        ]);
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
        break;
}
?>
