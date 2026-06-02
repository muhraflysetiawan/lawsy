<?php
// Suppress warnings and errors in output to ensure clean JSON responses
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'config.php';

// Auto-migrate / Self-healing database check
try {
    // Check if table exists
    $tableCheck = $conn->query("SHOW TABLES LIKE 'legal_dictionary'");
    $tableExists = $tableCheck->rowCount() > 0;
    
    $needsImport = !$tableExists;
    if ($tableExists) {
        // If table contains generic English words (like 'A' or 'An') from the previous migration, force clean re-import
        $unfilteredCheck = $conn->query("SELECT COUNT(*) FROM legal_dictionary WHERE title = 'A' OR title = 'An' OR title = 'The'");
        $unfilteredCount = $unfilteredCheck->fetchColumn();
        
        $countCheck = $conn->query("SELECT COUNT(*) FROM legal_dictionary");
        $rowCount = $countCheck->fetchColumn();
        if ($rowCount == 0 || $unfilteredCount > 0) {
            $needsImport = true;
        }
    }
    
    if ($needsImport) {
        // Create table with indexes
        $sql = "CREATE TABLE IF NOT EXISTS legal_dictionary (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            translation VARCHAR(255) DEFAULT NULL,
            category VARCHAR(100) NOT NULL,
            summary TEXT,
            definition TEXT,
            articles VARCHAR(255) DEFAULT NULL,
            INDEX(category),
            FULLTEXT(title, translation, summary, definition)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $conn->exec($sql);
        
        // Truncate any existing junk terms to perform a clean Indonesian import
        $conn->exec("TRUNCATE TABLE legal_dictionary;");
        
        // Fetch and import CSV from GitHub
        $url = 'https://raw.githubusercontent.com/raydendi/kamus-hukum/master/kamus_hukum_full_id-en.csv';
        $ctx = stream_context_create([
            'http' => [
                'timeout' => 15,
                'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\n"
            ]
        ]);
        
        $data = file_get_contents($url, false, $ctx);
        if ($data !== false) {
            // Split rows safely
            $lines = preg_split('/\r\n|\r|\n/', $data);
            // Remove header
            array_shift($lines);
            
            $conn->beginTransaction();
            
            $insert_sql = "INSERT INTO legal_dictionary (title, translation, category, summary, definition, articles) 
                           VALUES (:title, :translation, :category, :summary, :definition, :articles)";
            $stmt = $conn->prepare($insert_sql);
            
            foreach ($lines as $line) {
                if (empty(trim($line))) continue;
                $row = str_getcsv($line);
                if (count($row) < 2) continue;
                
                $term = trim($row[0]);
                $definition = trim($row[1]);
                
                // QUALITY FILTERS FOR PURE INDONESIAN LEGAL TERMS:
                // 1. Exclude titles <= 2 characters (excludes single letters, "A", "B", "Or", "If")
                if (strlen($term) <= 2) continue;
                
                // 2. Exclude common generic English terms
                if (in_array(strtolower($term), ['the', 'and', 'for', 'but', 'not', 'yes', 'out', 'off', 'him', 'her', 'its', 'an', 'a 1', 'a 2', 'a 3'])) continue;
                
                // 3. Verify definition is in Indonesian (definition contains common Indonesian words)
                if (!preg_match('/\b(adalah|merupakan|yang|dalam|dengan|untuk|hukum|pidana|perdata|atas|oleh|dari|bagi|atau)\b/i', $definition)) continue;
                
                // 4. Filter generic alphanumeric codes (excludes "A 1", "B 2", etc.)
                if (preg_match('/^[a-z]\s+\d+$/i', $term)) continue;
                
                // Clean up term and parse translation
                $title = $term;
                $translation = '';
                
                if (strpos($term, '/') !== false) {
                    $parts = explode('/', $term);
                    $title = trim($parts[0]);
                    array_shift($parts);
                    $translation = implode(' / ', array_map('trim', $parts));
                }
                
                // Categorize
                $category = 'Civil Law';
                $def_lower = strtolower($definition);
                $term_lower = strtolower($term);
                
                $criminal_keywords = ["pidana", "kriminal", "kejahatan", "penjara", "tersangka", "terdakwa", "polisi", "jaksa", "delik", "sanksi", "suap", "sogok", "korupsi", "bunuh", "aniaya", "ancaman", "tangkap", "tahan", "sel", "bui", "kuhp", "kuhap", "saksi", "bukti"];
                $business_keywords = ["bisnis", "dagang", "perusahaan", "saham", "investasi", "paten", "merek", "pailit", "kurator", "akrual", "pajak", "bank", "keuangan", "fiskal", "anggaran", "biaya", "saham", "obligasi", "transaksi", "audit", "fraud", "kredit", "utang", "debitur", "kreditur"];
                $constitutional_keywords = ["konstitusi", "tata negara", "pemerintah", "presiden", "dpr", "mpr", "mahkamah", "uud", "negara", "peraturan", "keputusan", "uu", "perpres", "perda", "otonomi", "wewenang", "otoritas"];
                $civil_keywords = ["perdata", "kontrak", "perjanjian", "somasi", "wanprestasi", "waris", "nikah", "cerai", "keluarga", "harta", "benda", "hak milik", "gadai", "sewa", "pinjam", "hibah", "wasiat", "ganti rugi", "pmh", "domisili", "prestasi"];

                $criminal_score = 0;
                foreach ($criminal_keywords as $kw) {
                    if (strpos($def_lower, $kw) !== false || strpos($term_lower, $kw) !== false) $criminal_score++;
                }
                
                $business_score = 0;
                foreach ($business_keywords as $kw) {
                    if (strpos($def_lower, $kw) !== false || strpos($term_lower, $kw) !== false) $business_score++;
                }
                
                $constitutional_score = 0;
                foreach ($constitutional_keywords as $kw) {
                    if (strpos($def_lower, $kw) !== false || strpos($term_lower, $kw) !== false) $constitutional_score++;
                }
                
                $civil_score = 0;
                foreach ($civil_keywords as $kw) {
                    if (strpos($def_lower, $kw) !== false || strpos($term_lower, $kw) !== false) $civil_score++;
                }
                
                $max_score = max($criminal_score, $business_score, $constitutional_score, $civil_score);
                if ($max_score > 0) {
                    if ($max_score === $criminal_score) {
                        $category = 'Criminal Law';
                    } elseif ($max_score === $business_score) {
                        $category = 'Business Law';
                    } elseif ($max_score === $constitutional_score) {
                        $category = 'Constitutional Law';
                    } else {
                        $category = 'Civil Law';
                    }
                } else {
                    $hash = crc32($term);
                    $cats = ['Civil Law', 'Business Law', 'Criminal Law', 'Constitutional Law'];
                    $category = $cats[abs($hash) % 4];
                }
                
                // Create clean 2-line summary
                $summary = $definition;
                if (strlen($summary) > 150) {
                    $summary = substr($summary, 0, 150);
                    $last_space = strrpos($summary, ' ');
                    if ($last_space !== false) {
                        $summary = substr($summary, 0, $last_space);
                    }
                    $summary .= '...';
                }
                
                // Set governing articles
                $articles = 'Referensi Hukum Indonesia';
                if ($category === 'Civil Law') {
                    $articles = 'Kitab Undang-Undang Hukum Perdata (KUHPerdata)';
                } elseif ($category === 'Criminal Law') {
                    $articles = 'Kitab Undang-Undang Hukum Pidana (KUHP) / KUHAP';
                } elseif ($category === 'Business Law') {
                    $articles = 'Undang-Undang Perseroan Terbatas / UU Kepailitan';
                } elseif ($category === 'Constitutional Law') {
                    $articles = 'Undang-Undang Dasar Negara Republik Indonesia Tahun 1945';
                }

                $stmt->execute([
                    ':title' => $title,
                    ':translation' => !empty($translation) ? $translation : 'Glosarium Hukum',
                    ':category' => $category,
                    ':summary' => $summary,
                    ':definition' => $definition,
                    ':articles' => $articles
                ]);
            }
            
            $conn->commit();
        }
    }
} catch (Exception $e) {
    // Fail silently in response headers to ensure API remains functional
    header("X-Migration-Status: Failed - " . $e->getMessage());
}

// Route operations
$action = isset($_GET['action']) ? $_GET['action'] : 'list';

switch ($action) {
    case 'random':
        try {
            // High-performance random row retrieval (avoiding slow ORDER BY RAND())
            $stmt = $conn->query("SELECT id FROM legal_dictionary ORDER BY id DESC LIMIT 1");
            $maxId = $stmt->fetchColumn();
            
            $randomTerm = null;
            if ($maxId) {
                // Retry a few times if there are gaps in auto-increment IDs
                for ($i = 0; $i < 5; $i++) {
                    $randId = rand(1, $maxId);
                    $stmt = $conn->prepare("SELECT * FROM legal_dictionary WHERE id >= :id LIMIT 1");
                    $stmt->execute([':id' => $randId]);
                    $randomTerm = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($randomTerm) break;
                }
            }
            
            // Fallback if random retrieval failed
            if (!$randomTerm) {
                $stmt = $conn->query("SELECT * FROM legal_dictionary LIMIT 1");
                $randomTerm = $stmt->fetch(PDO::FETCH_ASSOC);
            }
            
            echo json_encode([
                "status" => "success",
                "term" => $randomTerm
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Database error: " . $e->getMessage()
            ]);
        }
        break;

    case 'list':
        $category = isset($_GET['category']) ? $_GET['category'] : 'All';
        
        try {
            if ($category === 'All') {
                $stmt = $conn->prepare("SELECT * FROM legal_dictionary ORDER BY title ASC LIMIT 100");
                $stmt->execute();
            } else {
                $stmt = $conn->prepare("SELECT * FROM legal_dictionary WHERE category = :category ORDER BY title ASC LIMIT 100");
                $stmt->execute([':category' => $category]);
            }
            
            $terms = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                "status" => "success",
                "terms" => $terms
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Database error: " . $e->getMessage()
            ]);
        }
        break;

    case 'search':
        $query = isset($_GET['query']) ? trim($_GET['query']) : '';
        
        if (empty($query)) {
            try {
                $stmt = $conn->query("SELECT * FROM legal_dictionary ORDER BY title ASC LIMIT 100");
                $terms = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode([
                    "status" => "success",
                    "terms" => $terms
                ]);
            } catch (Exception $e) {
                echo json_encode([
                    "status" => "error",
                    "message" => "Database error: " . $e->getMessage()
                ]);
            }
            exit;
        }

        try {
            $wildcard = '%' . $query . '%';
            
            // Smarter query ordering exact matches first, followed by prefix matches, then substring matches
            $sql = "SELECT * FROM legal_dictionary 
                    WHERE title LIKE :query 
                       OR translation LIKE :query 
                       OR summary LIKE :query 
                       OR definition LIKE :query 
                    ORDER BY (CASE 
                        WHEN title = :exact_query THEN 0 
                        WHEN title LIKE :prefix_query THEN 1 
                        ELSE 2 
                    END) ASC, title ASC 
                    LIMIT 100";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                ':query' => $wildcard,
                ':exact_query' => $query,
                ':prefix_query' => $query . '%'
            ]);
            
            $terms = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                "status" => "success",
                "terms" => $terms
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Database error: " . $e->getMessage()
            ]);
        }
        break;

    default:
        echo json_encode([
            "status" => "error",
            "message" => "Invalid action"
        ]);
        break;
}
?>
