<?php
// backend/midtrans_helper.php

if (!defined('MIDTRANS_SERVER_KEY')) {
    define('MIDTRANS_SERVER_KEY', 'YOUR_MIDTRANS_SERVER_KEY'); // Default Server Key, change this to your key
}
if (!defined('MIDTRANS_IS_PRODUCTION')) {
    define('MIDTRANS_IS_PRODUCTION', false);
}

function get_midtrans_api_base() {
    return MIDTRANS_IS_PRODUCTION 
        ? 'https://api.midtrans.com' 
        : 'https://api.sandbox.midtrans.com';
}

/**
 * Performs an HTTP Request using cURL if available,
 * with an automatic graceful fallback to PHP Native Streams (file_get_contents).
 * This ensures 100% compatibility even if the cURL extension is disabled in php.ini!
 */
function midtrans_http_request($url, $method, $payload = null, $headers = []) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        }
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return [
            'code' => $http_code,
            'body' => $response
        ];
    } else {
        // Fallback to PHP native streams
        $http_headers = [];
        foreach ($headers as $h) {
            $http_headers[] = $h;
        }

        $opts = [
            'http' => [
                'method'  => $method,
                'header'  => implode("\r\n", $http_headers) . "\r\n",
                'content' => $method === 'POST' ? json_encode($payload) : '',
                'ignore_errors' => true
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false
            ]
        ];
        
        $context = stream_context_create($opts);
        $response = file_get_contents($url, false, $context);
        
        // Extract HTTP response code
        $http_code = 500;
        if (isset($http_response_header) && is_array($http_response_header)) {
            foreach ($http_response_header as $header) {
                if (preg_match('/HTTP\/\S+\s+(\d+)/', $header, $matches)) {
                    $http_code = (int)$matches[1];
                    break;
                }
            }
        }
        
        return [
            'code' => $http_code,
            'body' => $response
        ];
    }
}

function midtrans_charge_qris($order_id, $amount, $item_name) {
    $url = get_midtrans_api_base() . '/v2/charge';
    
    $payload = [
        'payment_type' => 'qris',
        'transaction_details' => [
            'order_id' => $order_id,
            'gross_amount' => (int)$amount
        ],
        'item_details' => [
            [
                'id' => 'case-payment',
                'price' => (int)$amount,
                'quantity' => 1,
                'name' => substr($item_name, 0, 50)
            ]
        ],
        'qris' => [
            'acquirer' => 'gopay'
        ]
    ];
    
    $auth_header = 'Basic ' . base64_encode(MIDTRANS_SERVER_KEY . ':');
    
    $headers = [
        'Accept: application/json',
        'Content-Type: application/json',
        'Authorization: ' . $auth_header
    ];
    
    $req = midtrans_http_request($url, 'POST', $payload, $headers);
    $http_code = $req['code'];
    $response = $req['body'];
    
    $result = json_decode($response, true);
    if ($http_code >= 200 && $http_code < 300 && isset($result['status_code']) && ($result['status_code'] == '201' || $result['status_code'] == '200')) {
        return $result;
    } else {
        error_log("Midtrans Charge Error ($http_code): " . $response);
        return [
            'status' => 'error',
            'http_code' => $http_code,
            'response' => $result ?: $response
        ];
    }
}

function midtrans_get_status($order_id) {
    $url = get_midtrans_api_base() . '/v2/' . urlencode($order_id) . '/status';
    
    $auth_header = 'Basic ' . base64_encode(MIDTRANS_SERVER_KEY . ':');
    
    $headers = [
        'Accept: application/json',
        'Content-Type: application/json',
        'Authorization: ' . $auth_header
    ];
    
    $req = midtrans_http_request($url, 'GET', null, $headers);
    $http_code = $req['code'];
    $response = $req['body'];
    
    $result = json_decode($response, true);
    if ($http_code >= 200 && $http_code < 300) {
        return $result;
    } else {
        error_log("Midtrans Status Error ($http_code): " . $response);
        return [
            'status' => 'error',
            'http_code' => $http_code,
            'response' => $result ?: $response
        ];
    }
}
?>
