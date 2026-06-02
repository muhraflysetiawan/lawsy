<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

date_default_timezone_set('Asia/Jakarta');

$host = 'localhost';
$db_name = 'lawsy';
$username = 'root';
$password = '';

// SMTP Configuration for Email OTP (lawsy.app@gmail.com)
define('SMTP_EMAIL', 'lawsy.app@gmail.com');
define('SMTP_PASSWORD', 'ykyc jshd unuz gupd'); // Default Gmail App Password, replace with your own once deployed!

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    echo json_encode(["status" => "error", "message" => "Connection error: " . $exception->getMessage()]);
    exit;
}
?>
