<?php
// Application configuration

// Environment settings - change to 'production' for live site
define('APP_ENV', 'development');

// Base paths and URLs
define('BASE_PATH', realpath(dirname(__FILE__) . '/..'));
define('FRONTEND_PATH', realpath(BASE_PATH . '/../frontend'));
define('PDF_PATH', FRONTEND_PATH . '/pdfs');
define('API_URL', '/api');

// Security settings
define('JWT_SECRET', 'your_strong_secret_key_here_change_in_production'); // Change this in production!
define('JWT_EXPIRY', 3600); // Token validity in seconds (1 hour)
define('PASSWORD_COST', 12); // Cost factor for password_hash
define('SESSION_TIMEOUT', 1800); // Session timeout in seconds (30 minutes)

// CSRF Protection
define('CSRF_TOKEN_NAME', 'csrf_token');
define('CSRF_TOKEN_LENGTH', 32);
define('CSRF_TOKEN_EXPIRY', 3600); // 1 hour

// PDF Generation settings
define('COMPANY_NAME', 'Your Company Name');
define('COMPANY_LOGO', FRONTEND_PATH . '/assets/img/logo.png');
define('PDF_AGENT_PATH', PDF_PATH . '/agent');
define('PDF_ADMIN_PATH', PDF_PATH . '/admin');

// Pagination defaults
define('DEFAULT_PAGE_SIZE', 10);
define('MAX_PAGE_SIZE', 100);

// Error reporting based on environment
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Application settings
$config = [
    'app_name' => 'Pay Slip Generator',
    'version' => '1.0.0',
    'default_timezone' => 'Asia/Manila',
    'currency' => 'PHP',
    'date_format' => 'Y-m-d',
    'datetime_format' => 'Y-m-d H:i:s'
];

// Set default timezone
date_default_timezone_set($config['default_timezone']);

// Initialize required directories
function initDirectories() {
    $dirs = [
        PDF_PATH,
        PDF_AGENT_PATH,
        PDF_ADMIN_PATH
    ];
    
    foreach ($dirs as $dir) {
        if (!file_exists($dir)) {
            mkdir($dir, 0755, true);
            
            // Create .htaccess to protect PDF directories
            if (strpos($dir, '/pdfs') !== false) {
                $htaccess = $dir . '/.htaccess';
                file_put_contents($htaccess, 
                    "Options -Indexes\n" .
                    "<FilesMatch \"\.(?i:pdf)$\">\n" .
                    "    Order allow,deny\n" .
                    "    Allow from all\n" .
                    "</FilesMatch>\n"
                );
            }
        }
    }
}

// Initialize directories when config is loaded
initDirectories();

return $config;