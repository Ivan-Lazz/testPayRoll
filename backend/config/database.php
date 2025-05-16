<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'bm_payroll';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                'mysql:host=' . $this->host . ';dbname=' . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            echo 'Connection Error: ' . $e->getMessage();
        }

        return $this->conn;
    }

    // Function to create database and tables if they don't exist
    public function setupDatabase() {
        try {
            // First connect without database name
            $conn = new PDO(
                'mysql:host=' . $this->host,
                $this->username,
                $this->password
            );
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Create database if it doesn't exist
            $conn->exec("CREATE DATABASE IF NOT EXISTS `$this->db_name` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");
            
            // Connect to the newly created database
            $conn->exec("USE `$this->db_name`");
            
            // Read schema file
            $schemaPath = __DIR__ . '/../../database/schema.sql';
            
            // Check if file exists and is readable
            if (!file_exists($schemaPath)) {
                throw new Exception("Schema file not found: $schemaPath");
            }
            
            // Read schema file content
            $sql = file_get_contents($schemaPath);
            
            // Make sure we have SQL content
            if (empty($sql)) {
                throw new Exception("Schema file is empty: $schemaPath");
            }
            
            // Execute SQL script - split into statements to handle each separately
            $statements = explode(';', $sql);
            foreach ($statements as $statement) {
                $statement = trim($statement);
                if (!empty($statement)) {
                    $conn->exec($statement);
                }
            }
            
            return true;
        } catch(Exception $e) {
            echo 'Setup Error: ' . $e->getMessage();
            return false;
        }
    }
}
?>