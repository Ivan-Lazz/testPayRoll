<?php
class Banking {
    private $conn;
    private $table = 'employee_banking_details';

    // Banking properties
    public $id;
    public $employee_id;
    public $preferred_bank;
    public $bank_account_number;
    public $bank_account_name;
    public $created_at;
    public $updated_at;

    // Employee details from join
    public $employee_firstname;
    public $employee_lastname;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all banking details
    public function getAll() {
        $query = 'SELECT b.*, e.firstname as employee_firstname, e.lastname as employee_lastname 
                  FROM ' . $this->table . ' b
                  LEFT JOIN employees e ON b.employee_id = e.employee_id
                  ORDER BY b.created_at DESC';
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Get banking details by employee ID
    public function getByEmployeeId() {
        $query = 'SELECT b.*, e.firstname as employee_firstname, e.lastname as employee_lastname 
                  FROM ' . $this->table . ' b
                  LEFT JOIN employees e ON b.employee_id = e.employee_id
                  WHERE b.employee_id = ?
                  ORDER BY b.created_at DESC';
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->employee_id);
        $stmt->execute();
        return $stmt;
    }

    // Get banking details by ID
    public function getOne() {
        $query = 'SELECT b.*, e.firstname as employee_firstname, e.lastname as employee_lastname 
                  FROM ' . $this->table . ' b
                  LEFT JOIN employees e ON b.employee_id = e.employee_id
                  WHERE b.id = ? 
                  LIMIT 0,1';
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->employee_id = $row['employee_id'];
            $this->preferred_bank = $row['preferred_bank'];
            $this->bank_account_number = $row['bank_account_number'];
            $this->bank_account_name = $row['bank_account_name'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            $this->employee_firstname = $row['employee_firstname'];
            $this->employee_lastname = $row['employee_lastname'];
            return true;
        }
        
        return false;
    }

    // Create banking details
    public function create() {
        $query = 'INSERT INTO ' . $this->table . ' 
                  SET employee_id = :employee_id, 
                      preferred_bank = :preferred_bank, 
                      bank_account_number = :bank_account_number, 
                      bank_account_name = :bank_account_name';
        
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->employee_id = htmlspecialchars(strip_tags($this->employee_id));
        $this->preferred_bank = htmlspecialchars(strip_tags($this->preferred_bank));
        $this->bank_account_number = htmlspecialchars(strip_tags($this->bank_account_number));
        $this->bank_account_name = htmlspecialchars(strip_tags($this->bank_account_name));
        
        // Bind data
        $stmt->bindParam(':employee_id', $this->employee_id);
        $stmt->bindParam(':preferred_bank', $this->preferred_bank);
        $stmt->bindParam(':bank_account_number', $this->bank_account_number);
        $stmt->bindParam(':bank_account_name', $this->bank_account_name);
        
        // Execute query
        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    // Update banking details
    public function update() {
        $query = 'UPDATE ' . $this->table . '
                  SET preferred_bank = :preferred_bank, 
                      bank_account_number = :bank_account_number, 
                      bank_account_name = :bank_account_name
                  WHERE id = :id';
        
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->preferred_bank = htmlspecialchars(strip_tags($this->preferred_bank));
        $this->bank_account_number = htmlspecialchars(strip_tags($this->bank_account_number));
        $this->bank_account_name = htmlspecialchars(strip_tags($this->bank_account_name));
        
        // Bind data
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':preferred_bank', $this->preferred_bank);
        $stmt->bindParam(':bank_account_number', $this->bank_account_number);
        $stmt->bindParam(':bank_account_name', $this->bank_account_name);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    // Delete banking details
    public function delete() {
        $query = 'DELETE FROM ' . $this->table . ' WHERE id = :id';
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->id = htmlspecialchars(strip_tags($this->id));
        
        // Bind data
        $stmt->bindParam(':id', $this->id);
        
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