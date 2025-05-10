<?php
require_once __DIR__ . '/../utils/TokenManager.php';
require_once __DIR__ . '/../utils/ResponseHandler.php';

/**
 * CSRFMiddleware - Handles CSRF protection
 */
class CSRFMiddleware {
    /**
     * Verify CSRF token on state-changing requests
     */
    public static function verifyToken() {
        // Only check on state-changing requests
        $method = strtoupper($_SERVER['REQUEST_METHOD']);
        $stateMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
        
        if (!in_array($method, $stateMethods)) {
            return true;
        }
        
        // API requests with Bearer token are exempt from CSRF
        $headers = getallheaders();
        if (isset($headers['Authorization']) && strpos($headers['Authorization'], 'Bearer') === 0) {
            return true;
        }
        
        // Find the token from various sources
        $token = self::getCSRFToken();
        
        if (!$token || !TokenManager::validateCSRFToken($token)) {
            ResponseHandler::forbidden('CSRF token validation failed');
        }
        
        return true;
    }
    
    /**
     * Get the CSRF token from various sources
     *
     * @return string|null CSRF token or null if not found
     */
    private static function getCSRFToken() {
        // From POST/PUT data
        if (isset($_POST[CSRF_TOKEN_NAME])) {
            return $_POST[CSRF_TOKEN_NAME];
        }
        
        // From request headers
        $headers = getallheaders();
        if (isset($headers['X-CSRF-Token'])) {
            return $headers['X-CSRF-Token'];
        }
        
        // From JSON request body
        $jsonData = json_decode(file_get_contents('php://input'), true);
        if (is_array($jsonData) && isset($jsonData[CSRF_TOKEN_NAME])) {
            return $jsonData[CSRF_TOKEN_NAME];
        }
        
        return null;
    }
    
    /**
     * Generate a new CSRF token and return it
     *
     * @return string New CSRF token
     */
    public static function generateToken() {
        return TokenManager::generateCSRFToken();
    }
}