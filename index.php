<?php
// Start session for authentication
session_start();

// Load configuration
require_once __DIR__ . '/config/config.php';

// Load utilities
require_once __DIR__ . '/utils/ResponseHandler.php';
require_once __DIR__ . '/utils/InputValidator.php';
require_once __DIR__ . '/utils/TokenManager.php';

// Load middleware
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/middleware/CSRFMiddleware.php';

// Set headers for CORS and security
header("Access-Control-Allow-Origin: *");  // In production, set this to specific origin
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-CSRF-Token");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get request URI and method
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Parse URL path
$uri = parse_url($requestUri, PHP_URL_PATH);
$path = trim(str_replace('/api', '', $uri), '/');
$segments = explode('/', $path);

// Default values
$resource = $segments[0] ?? null;
$id = $segments[1] ?? null;
$subResource = $segments[2] ?? null;

// Log the request (in development mode)
if (APP_ENV === 'development') {
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/access.log';
    $logData = date('[Y-m-d H:i:s]') . ' ' . $requestMethod . ' ' . $requestUri . 
               ' - IP: ' . $_SERVER['REMOTE_ADDR'] . "\n";
    file_put_contents($logFile, $logData, FILE_APPEND);
}

// Router function
function routeRequest($resource, $id, $subResource, $method) {
    // Initialize database connection
    $db = (new Database())->getConnection();
    
    // Route to appropriate controller based on resource
    switch ($resource) {
        case 'users':
            require_once __DIR__ . '/controllers/UserController.php';
            $controller = new UserController($db);
            break;
            
        case 'employees':
            require_once __DIR__ . '/controllers/EmployeeController.php';
            $controller = new EmployeeController($db);
            break;
            
        case 'accounts':
            require_once __DIR__ . '/controllers/AccountController.php';
            $controller = new AccountController($db);
            break;
            
        case 'banking':
            require_once __DIR__ . '/controllers/BankingController.php';
            $controller = new BankingController($db);
            break;
            
        case 'payslips':
            require_once __DIR__ . '/controllers/PayslipController.php';
            $controller = new PayslipController($db);
            break;
            
        case 'auth':
            require_once __DIR__ . '/controllers/AuthController.php';
            $controller = new AuthController($db);
            break;
            
        case 'install':
            // Special case for installation
            require_once __DIR__ . '/install/InstallController.php';
            $controller = new InstallController($db);
            break;
            
        default:
            // Resource not found
            ResponseHandler::notFound('Endpoint not found');
            break;
    }
    
    // Call the controller's handleRequest method
    $controller->handleRequest($method, $id, $subResource);
}

// Main execution
try {
    // Skip CSRF and Auth for login/install endpoints
    if ($resource !== 'auth' && $resource !== 'install') {
        // Verify CSRF token (for state-changing requests)
        CSRFMiddleware::verifyToken();
        
        // Check authentication (except for public endpoints)
        if (!in_array("$resource/$id", ['users/create'])) {
            AuthMiddleware::requireAuth();
        }
    }
    
    // Route the request
    routeRequest($resource, $id, $subResource, $requestMethod);
} catch (Exception $e) {
    // Log the error
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/errors.log';
    $logData = date('[Y-m-d H:i:s]') . ' ' . $e->getMessage() . ' in ' . 
               $e->getFile() . ' on line ' . $e->getLine() . "\n";
    file_put_contents($logFile, $logData, FILE_APPEND);
    
    // Return error response (without exposing sensitive details in production)
    if (APP_ENV === 'development') {
        ResponseHandler::serverError('Server error: ' . $e->getMessage());
    } else {
        ResponseHandler::serverError('An unexpected error occurred. Please try again later.');
    }
}