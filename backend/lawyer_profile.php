<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($action) {
        case 'update_profile':
            $data = json_decode(file_get_contents("php://input"), true);
            if (!isset($data['user_id'])) {
                echo json_encode(["status" => "error", "message" => "Unauthorized"]);
                exit;
            }

            $user_id = $data['user_id'];
            $location = isset($data['location']) ? $data['location'] : '';
            $expertise = json_encode(isset($data['expertise']) ? $data['expertise'] : []);
            $about_me = isset($data['about_me']) ? $data['about_me'] : '';
            $certifications = json_encode(isset($data['certifications']) ? $data['certifications'] : []);
            $latitude = isset($data['latitude']) ? $data['latitude'] : null;
            $longitude = isset($data['longitude']) ? $data['longitude'] : null;

            // Check if exists
            $stmt = $conn->prepare("SELECT id FROM lawyer_profiles WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $existing = $stmt->fetch();

            if ($existing) {
                $sql = "UPDATE lawyer_profiles SET location = ?, latitude = ?, longitude = ?, expertise = ?, about_me = ?, certifications = ? WHERE user_id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->execute([$location, $latitude, $longitude, $expertise, $about_me, $certifications, $user_id]);
            } else {
                $sql = "INSERT INTO lawyer_profiles (user_id, location, latitude, longitude, expertise, about_me, certifications, cases_solved, clients_served, legal_consultations, rating, review_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                // Default stats for new profile: 124 cases, 150 clients, 4.8 rating, 52 reviews
                $stmt->execute([$user_id, $location, $latitude, $longitude, $expertise, $about_me, $certifications, 124, 150, 85, 4.8, 52]); 
            }
            echo json_encode(["status" => "success", "message" => "Profile updated"]);
            break;

        case 'get_profile':
            $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : 0;
            $stmt = $conn->prepare("SELECT lp.*, u.name, u.email, u.profile_image, lr.specialization, lr.years_experience 
                                    FROM lawyer_profiles lp 
                                    JOIN users u ON lp.user_id = u.id 
                                    LEFT JOIN lawyer_registrations lr ON lp.user_id = lr.user_id 
                                    WHERE lp.user_id = ?");
            $stmt->execute([$user_id]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($profile) {
                $profile['expertise'] = json_decode($profile['expertise']);
                $profile['certifications'] = json_decode($profile['certifications']);
                echo json_encode(["status" => "success", "data" => $profile]);
            } else {
                // Return default profile data if not found in lawyer_profiles but user is a lawyer
                $stmt = $conn->prepare("SELECT u.name, lr.specialization, lr.years_experience 
                                        FROM users u 
                                        JOIN lawyer_registrations lr ON u.id = lr.user_id 
                                        WHERE u.id = ?");
                $stmt->execute([$user_id]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($user) {
                    echo json_encode(["status" => "success", "data" => [
                        "user_id" => $user_id,
                        "name" => $user['name'],
                        "location" => "",
                        "expertise" => [],
                        "about_me" => "",
                        "certifications" => [],
                        "specialization" => $user['specialization'],
                        "years_experience" => $user['years_experience'],
                        "cases_solved" => 0,
                        "clients_served" => 0,
                        "legal_consultations" => 0,
                        "rating" => 0,
                        "review_count" => 0
                    ]]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Profile not found"]);
                }
            }
            break;

        case 'get_top_rated':
            $stmt = $conn->prepare("SELECT lp.*, u.name, u.profile_image, lr.specialization, lr.years_experience
                                    FROM lawyer_profiles lp 
                                    JOIN users u ON lp.user_id = u.id 
                                    LEFT JOIN lawyer_registrations lr ON lp.user_id = lr.user_id 
                                    ORDER BY lp.rating DESC LIMIT 10");
            $stmt->execute();
            $lawyers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($lawyers as &$l) {
                $l['expertise'] = json_decode($l['expertise']);
                $l['certifications'] = json_decode($l['certifications']);
            }
            
            echo json_encode(["status" => "success", "data" => $lawyers]);
            break;

        case 'get_all':
            $category = isset($_GET['category']) ? trim($_GET['category']) : '';
            $search   = isset($_GET['search'])   ? trim($_GET['search'])   : '';

            $params = [];
            $where  = [];

            if (!empty($category)) {
                $where[]  = "lr.specialization LIKE :category";
                $params[':category'] = '%' . $category . '%';
            }
            if (!empty($search)) {
                $where[]  = "(u.name LIKE :search OR lr.specialization LIKE :search)";
                $params[':search'] = '%' . $search . '%';
            }

            $whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

            $sql = "SELECT lp.*, u.name, u.profile_image, lr.specialization, lr.years_experience
                    FROM lawyer_profiles lp 
                    JOIN users u ON lp.user_id = u.id 
                    LEFT JOIN lawyer_registrations lr ON lp.user_id = lr.user_id 
                    $whereClause
                    ORDER BY lp.rating DESC";

            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $lawyers = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($lawyers as &$l) {
                $l['expertise']       = json_decode($l['expertise']);
                $l['certifications']  = json_decode($l['certifications']);
            }

            echo json_encode(["status" => "success", "data" => $lawyers]);
            break;



        default:
            echo json_encode(["status" => "error", "message" => "Invalid action"]);
            break;
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
