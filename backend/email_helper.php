<?php
// backend/email_helper.php

/**
 * Sends a secure One-Time Password (OTP) verification email via Gmail SMTP
 * using pure PHP socket streaming (fsockopen). This eliminates external dependencies
 * like PHPMailer or Composer.
 * 
 * @param string $to Recipient email address
 * @param string $otp 6-digit verification code
 * @param string $type Either 'register' or 'forgot'
 * @return bool True if email sent successfully, false otherwise
 */
function send_otp_email($to, $otp, $type = 'forgot') {
    $smtp_host = "ssl://smtp.gmail.com";
    $smtp_port = 465;
    $smtp_user = "lawsy.app@gmail.com";
    
    // Read App Password from config.php constant
    $smtp_pass = defined('SMTP_PASSWORD') ? SMTP_PASSWORD : '';

    if (empty($smtp_pass) || $smtp_pass === 'xxxx xxxx xxxx xxxx') {
        error_log("[SMTP Error]: Gmail App Password not configured or still at placeholder.");
        return false;
    }

    $subject = $type === 'register' ? "Welcome to Lawsy - Registration OTP" : "Lawsy - Reset Password OTP";
    
    if ($type === 'register') {
        $body = "Dear User,\n\nWelcome to Lawsy! Thank you for signing up. Your One-Time Password (OTP) for registration is:\n\n$otp\n\nThis OTP is valid for 10 minutes. Please enter this code in the app to complete your registration.\n\nBest regards,\nLawsy Team";
    } else {
        $body = "Dear User,\n\nWe received a request to reset your password on your Lawsy account. Your One-Time Password (OTP) is:\n\n$otp\n\nThis OTP is valid for 10 minutes. Please enter this code in the app to set your new password.\n\nBest regards,\nLawsy Team";
    }

    $headers = [
        "From: Lawsy <" . $smtp_user . ">",
        "To: " . $to,
        "Subject: " . $subject,
        "Date: " . date("r"),
        "Content-Type: text/plain; charset=UTF-8",
        "MIME-Version: 1.0"
    ];

    try {
        $socket = fsockopen($smtp_host, $smtp_port, $errno, $errstr, 15);
        if (!$socket) {
            error_log("[SMTP Connection Error]: $errstr ($errno)");
            return false;
        }

        // Helper closures to read SMTP responses
        $read = function($socket, $expected_code) {
            $response = "";
            while ($str = fgets($socket, 515)) {
                $response .= $str;
                if (substr($str, 3, 1) == " ") break;
            }
            $code = substr($response, 0, 3);
            if ($code != $expected_code) {
                error_log("[SMTP Command Failed]: Expected $expected_code, got: $response");
                return false;
            }
            return true;
        };

        if (!$read($socket, "220")) { fclose($socket); return false; }

        fwrite($socket, "EHLO localhost\r\n");
        if (!$read($socket, "250")) { fclose($socket); return false; }

        fwrite($socket, "AUTH LOGIN\r\n");
        if (!$read($socket, "334")) { fclose($socket); return false; }

        fwrite($socket, base64_encode($smtp_user) . "\r\n");
        if (!$read($socket, "334")) { fclose($socket); return false; }

        fwrite($socket, base64_encode($smtp_pass) . "\r\n");
        if (!$read($socket, "235")) { fclose($socket); return false; }

        fwrite($socket, "MAIL FROM:<" . $smtp_user . ">\r\n");
        if (!$read($socket, "250")) { fclose($socket); return false; }

        fwrite($socket, "RCPT TO:<" . $to . ">\r\n");
        if (!$read($socket, "250")) { fclose($socket); return false; }

        fwrite($socket, "DATA\r\n");
        if (!$read($socket, "354")) { fclose($socket); return false; }

        $email_data = implode("\r\n", $headers) . "\r\n\r\n" . $body . "\r\n.\r\n";
        fwrite($socket, $email_data);
        if (!$read($socket, "250")) { fclose($socket); return false; }

        fwrite($socket, "QUIT\r\n");
        fclose($socket);
        return true;
    } catch (Exception $e) {
        error_log("[SMTP Exception]: " . $e->getMessage());
        return false;
    }
}
?>
