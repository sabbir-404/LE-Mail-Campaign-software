<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");

// Database file path (will be created in the same folder)
$dbFile = __DIR__ . '/le_mail_tracker.sqlite';

// Initialize DB if it doesn't exist
$db = new PDO('sqlite:' . $dbFile);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->exec("CREATE TABLE IF NOT EXISTS tracking_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER,
    email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    opened_at DATETIME DEFAULT CURRENT_TIMESTAMP
)");

// Route: API to get analytics 
if (isset($_GET['action']) && $_GET['action'] == 'stats') {
    header('Content-Type: application/json');
    $stmt = $db->query("
        SELECT 
            campaign_id,
            email,
            COUNT(*) as open_count,
            MIN(opened_at) as first_opened,
            MAX(opened_at) as last_opened
        FROM tracking_logs
        GROUP BY campaign_id, email
        ORDER BY last_opened DESC
    ");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Also get total overview grouped by campaign
    $campStmt = $db->query("
        SELECT 
            campaign_id,
            COUNT(DISTINCT email) as unique_opens,
            COUNT(*) as total_opens
        FROM tracking_logs
        GROUP BY campaign_id
    ");
    $campaignData = $campStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'logs' => $data, 'campaigns' => $campaignData]);
    exit;
}

// Route: Tracking Pixel (Default)
$campaignId = isset($_GET['c']) ? intval($_GET['c']) : 0;
$email = isset($_GET['e']) ? $_GET['e'] : '';

if ($campaignId > 0 && !empty($email)) {
    // Record the open
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    $stmt = $db->prepare('INSERT INTO tracking_logs (campaign_id, email, ip_address, user_agent) VALUES (?, ?, ?, ?)');
    $stmt->execute([$campaignId, $email, $ip, $ua]);
}

// Serve a standard 1x1 transparent PNG
header('Content-Type: image/png');
header('Cache-Control: no-cache, no-store, must-revalidate'); // Ensure pixel is fetched every time
header('Pragma: no-cache');
header('Expires: 0');
echo base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
exit;
