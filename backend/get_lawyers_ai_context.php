<?php
require_once 'config.php';

try {
    // Fetch only approved lawyers with their profile and registration details
    $query = "SELECT u.id as user_id, u.name, lr.specialization, lr.years_experience, lr.law_firm, lp.rating, lp.location 
              FROM users u 
              JOIN lawyer_registrations lr ON u.id = lr.user_id 
              LEFT JOIN lawyer_profiles lp ON u.id = lp.user_id 
              WHERE u.role = 'Lawyer' AND lr.status = 'approved'";
              
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $lawyers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $context = "Here is a list of available lawyers. If you recommend one, you MUST include the tag [LAWYER_CARD:ID] (replace ID with the lawyer's user_id) at the end of your message so the system can show their profile card.\n";
    foreach ($lawyers as $l) {
        $context .= "- ID: {$l['user_id']}, Name: {$l['name']}, Specialty: {$l['specialization']}, Experience: {$l['years_experience']} years, Firm: {$l['law_firm']}, Rating: {$l['rating']}, Location: {$l['location']}\n";
    }
    
    echo json_encode([
        "status" => "success", 
        "context" => $context,
        "raw_data" => $lawyers
    ]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
