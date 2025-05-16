<?php
class EmployeeAccount {
    private $conn;
    private $table = 'employee_accounts';

    // Employee Account properties
    public $account_id;
    public $employee_id;
    public $account_email;
    public $account_password;
    public $account_type;
    public $account_status;
    public $created_at;
    public $updated_at;

    // Employee details from join
    public $employee_firstname;
    public $employee_lastname;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all employee accounts
    public function getAll() {
        $query = 'SELECT a.*, e.firstname as employee_firstname, e.lastname as employee_lastname 
                  FROM ' . $this->table . ' a
                  LEFT JOIN employees e ON a.employee_id = e.employee_id
                  ORDER BY a.created_at DESC';
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Get employee accounts by employee ID
    public function getByEmployeeId() {
        $query = 'SELECT a.*, e.firstname as employee_firstname, e.lastname as employee_lastname 
                  FROM ' . $this->table . ' a
                  LEFT JOIN employees e ON a.employee_id = e.employee_id
                  WHERE a.employee_id = ?
                  ORDER BY a.created_at DESC';
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->employee_id);
        $stmt->execute();
        return $stmt;
    }

    // Get employee account by ID
    public function getOne() {
        $query = 'SELECT a.*, e.firstname as employee_firstname, e.lastname as employee_lastname 
                  FROM ' . $this->table . ' a
                  LEFT JOIN employees e ON a.employee_id = e.employee_id
                  WHERE a.account_id = ? 
                  LIMIT 0,1';
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->account_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->employee_id = $row['employee_id'];
            $this->account_email = $row['account_email'];
            // Don't return password
            $this->account_type = $row['account_type'];
            $this->account_status = $row['account_status'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            $this->employee_firstname = $row['employee_firstname'];
            $this->employee_lastname = $row['employee_lastname'];
            return true;
        }
        
        return false;
    }

    // Create employee account
    public function create() {
        $query = 'INSERT INTO ' . $this->table . ' 
                  SET employee_id = :employee_id, 
                      account_email = :account_email, 
                      account_password = :account_password, 
                      account_type = :account_type, 
                      account_status = :account_status';
        
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->employee_id = htmlspecialchars(strip_tags($this->employee_id));
        $this->account_email = htmlspecialchars(strip_tags($this->account_email));
        $this->account_type = htmlspecialchars(strip_tags($this->account_type));
        $this->account_status = htmlspecialchars(strip_tags($this->account_status));
        
        // Hash password
        $this->account_password = password_hash($this->account_password, PASSWORD_DEFAULT);
        
        // Bind data
        $stmt->bindParam(':employee_id', $this->employee_id);
        $stmt->bindParam(':account_email', $this->account_email);
        $stmt->bindParam(':account_password', $this->account_password);
        $stmt->bindParam(':account_type', $this->account_type);
        $stmt->bindParam(':account_status', $this->account_status);
        
        // Execute query
        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    // Update employee account
    public function update() {
        $query = 'UPDATE ' . $this->table . '
                  SET account_email = :account_email, ';
        
        // Only update password if it's provided
        if(!empty($this->account_password)) {
            $query .= 'account_password = :account_password, ';
        }
        
        $query .= 'account_type = :account_type, 
                  account_status = :account_status
                  WHERE account_id = :account_id';
        
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->account_id = htmlspecialchars(strip_tags($this->account_id));
        $this->account_email = htmlspecialchars(strip_tags($this->account_email));
        $this->account_type = htmlspecialchars(strip_tags($this->account_type));
        $this->account_status = htmlspecialchars(strip_tags($this->account_status));
        
        // Bind data
        $stmt->bindParam(':account_id', $this->account_id);
        $stmt->bindParam(':account_email', $this->account_email);
        $stmt->bindParam(':account_type', $this->account_type);
        $stmt->bindParam(':account_status', $this->account_status);
        
        // Bind password if it's provided
        if(!empty($this->account_password)) {
            $this->account_password = password_hash($this->account_password, PASSWORD_DEFAULT);
            $stmt->bindParam(':account_password', $this->account_password);
        }
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    // Delete employee account
    public function delete() {
        $query = 'DELETE FROM ' . $this->table . ' WHERE account_id = :account_id';
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->account_id = htmlspecialchars(strip_tags($this->account_id));
        
        // Bind data
        $stmt->bindParam(':account_id', $this->account_id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    // Check if employee exists
    public function employeeExists() {
        $query = 'SELECT COUNT(*) as count FROM employees WHERE employee_id = ?';
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->employee_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['count'] > 0;
    }

    // Get employee details
    public function getEmployeeDetails() {
        $query = 'SELECT firstname, lastname FROM employees WHERE employee_id = ?';
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->employee_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->employee_firstname = $row['firstname'];
            $this->employee_lastname = $row['lastname'];
            return true;
        }
        
        return false;
    }
}
?>