<?php
require_once 'config.php';

class Database {
    private $host = "localhost";
    private $db_name = "bm_payroll"; // Ensure this database exists in your MySQL server
    private $username = "root";      // Default XAMPP username
    private $password = "";          // Default XAMPP password (blank)
    private $conn;
    private $options;

    public function __construct() {
        $this->options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password,
                $this->options
            );
            
            // For debugging purposes
            error_log("Database connection established successfully!");
            
            return $this->conn;
        } catch(PDOException $e) {
            $this->logError($e);
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }

    /**
     * Creates the database and tables if they don't exist
     * Used during installation
     */
    public function initializeDatabase() {
        try {
            // First connect without selecting a database
            $conn = new PDO(
                "mysql:host=" . $this->host,
                $this->username,
                $this->password,
                $this->options
            );
            
            // Create database if not exists
            $conn->exec("CREATE DATABASE IF NOT EXISTS `{$this->db_name}` 
                        CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            // Select the database
            $conn->exec("USE `{$this->db_name}`");
            
            // Now create tables
            $this->createTables($conn);
            
            return true;
        } catch(PDOException $e) {
            $this->logError($e);
            throw new Exception("Database initialization failed: " . $e->getMessage());
        }
    }

    /**
     * Create all required tables
     */
    private function createTables($conn) {
        $sql = file_get_contents(BASE_PATH . '/install/schema.sql');
        $conn->exec($sql);
    }

    /**
     * Log database errors
     */
    private function logError($exception) {
        $logDir = BASE_PATH . '/logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $logFile = $logDir . '/db_errors.log';
        $message = date('[Y-m-d H:i:s]') . ' ' . $exception->getMessage() . 
                   ' in ' . $exception->getFile() . ' on line ' . $exception->getLine() . "\n";
        
        file_put_contents($logFile, $message, FILE_APPEND);
    }
}