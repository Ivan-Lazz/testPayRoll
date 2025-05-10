<?php
require_once __DIR__ . '/../utils/ResponseHandler.php';

/**
 * InstallController - Handles database installation
 */
class InstallController {
    private $db;
    
    /**
     * Constructor
     *
     * @param PDO $db Database connection
     */
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Handle API request
     *
     * @param string $method HTTP method
     * @param string|null $id Resource identifier
     * @param string|null $subResource Sub-resource name
     */
    public function handleRequest($method, $id = null, $subResource = null) {
        // Only allow POST method for installation
        if ($method !== 'POST') {
            ResponseHandler::badRequest('Only POST method is allowed for installation');
        }
        
        $this->install();
    }
    
    /**
     * Install the database
     */
    private function install() {
        try {
            // Check if installation has already been done
            $userTableExists = $this->tableExists('users');
            if ($userTableExists) {
                ResponseHandler::badRequest('Installation has already been completed');
            }
            
            // Get SQL schema
            $sql = file_get_contents(__DIR__ . '/schema.sql');
            
            // Execute SQL
            $this->db->exec($sql);
            
            // Create required directories
            $this->createDirectories();
            
            ResponseHandler::success('Installation completed successfully');
        } catch (Exception $e) {
            ResponseHandler::serverError('Installation failed: ' . $e->getMessage());
        }
    }
    
    /**
     * Check if a table exists
     *
     * @param string $tableName Table name
     * @return bool Whether table exists
     */
    private function tableExists($tableName) {
        try {
            $result = $this->db->query("SHOW TABLES LIKE '{$tableName}'");
            return $result->rowCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Create required directories
     */
    private function createDirectories() {
        $directories = [
            PDF_PATH,
            PDF_AGENT_PATH,
            PDF_ADMIN_PATH
        ];
        
        foreach ($directories as $dir) {
            if (!file_exists($dir)) {
                mkdir($dir, 0755, true);
                
                // Create .htaccess to protect directories
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
}