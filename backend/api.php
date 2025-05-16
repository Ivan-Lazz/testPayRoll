<?php
// Set headers for CORS and JSON
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Include necessary files
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Response.php';

// Include all controllers
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/EmployeeController.php';
require_once __DIR__ . '/controllers/AccountController.php';
require_once __DIR__ . '/controllers/BankingController.php';
require_once __DIR__ . '/controllers/PayslipController.php';

// Setup database
$database = new Database();
$database->setupDatabase();

// Get the requested URL
$url = isset($_GET['url']) ? $_GET['url'] : '';
$url = rtrim($url, '/');
$url = explode('/', $url);

// Get the controller and method
$controller = isset($url[0]) ? $url[0] : '';
$method = isset($url[1]) ? $url[1] : '';
$param = isset($url[2]) ? $url[2] : null;

// Route the request
switch ($controller) {
    case 'users':
        $userController = new UserController();
        handleRequest($userController, $method, $param);
        break;
    case 'employees':
        $employeeController = new EmployeeController();
        handleRequest($employeeController, $method, $param);
        break;
    case 'accounts':
        $accountController = new AccountController();
        handleRequest($accountController, $method, $param);
        break;
    case 'banking':
        $bankingController = new BankingController();
        handleRequest($bankingController, $method, $param);
        break;
    case 'payslips':
        $payslipController = new PayslipController();
        handleRequest($payslipController, $method, $param);
        break;
    default:
        Response::error('Invalid endpoint', 404);
}

// Helper function to handle request
function handleRequest($controller, $method, $param) {
    $requestMethod = $_SERVER['REQUEST_METHOD'];
    
    switch ($requestMethod) {
        case 'GET':
            if ($method === '') {
                $controller->getAll();
            } elseif ($method === 'get' && $param) {
                $controller->getOne($param);
            } else {
                Response::error('Invalid GET method', 400);
            }
            break;
        case 'POST':
            if ($method === 'create') {
                $controller->create();
            } elseif ($method === 'login' && $controller instanceof UserController) {
                $controller->login();
            } else {
                Response::error('Invalid POST method', 400);
            }
            break;
        case 'PUT':
            if ($method === 'update' && $param) {
                $controller->update($param);
            } else {
                Response::error('Invalid PUT method', 400);
            }
            break;
        case 'DELETE':
            if ($method === 'delete' && $param) {
                $controller->delete($param);
            } else {
                Response::error('Invalid DELETE method', 400);
            }
            break;
        default:
            Response::error('Invalid request method', 405);
    }
}
?>