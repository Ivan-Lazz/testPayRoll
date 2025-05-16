<?php
class Employee {
    private $conn;
    private $table = 'employees';

    // Employee properties
    public $employee_id;
    public $firstname;
    public $lastname;
    public $contact_number;
    public $email;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all employees
    public function getAll() {
        $query = 'SELECT * FROM ' . $this->table . ' ORDER BY created_at DESC';
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Get employee by ID
    public function getOne() {
        $query = 'SELECT * FROM ' . $this->table . ' WHERE employee_id = ? LIMIT 0,1';
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->employee_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->firstname = $row['firstname'];
            $this->lastname = $row['lastname'];
            $this->contact_number = $row['contact_number'];
            $this->email = $row['email'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        return false;
    }

    // Create employee
    public function create() {
        // If employee_id is not provided, generate one
        if(empty($this->employee_id)) {
            $this->employee_id = $this->generateEmployeeId();
        }

        $query = 'INSERT INTO ' . $this->table . ' 
                  SET employee_id = :employee_id, 
                      firstname = :firstname, 
                      lastname = :lastname, 
                      contact_number = :contact_number, 
                      email = :email';
        
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->employee_id = htmlspecialchars(strip_tags($this->employee_id));
        $this->firstname = htmlspecialchars(strip_tags($this->firstname));
        $this->lastname = htmlspecialchars(strip_tags($this->lastname));
        $this->contact_number = htmlspecialchars(strip_tags($this->contact_number));
        $this->email = htmlspecialchars(strip_tags($this->email));
        
        // Bind data
        $stmt->bindParam(':employee_id', $this->employee_id);
        $stmt->bindParam(':firstname', $this->firstname);
        $stmt->bindParam(':lastname', $this->lastname);
        $stmt->bindParam(':contact_number', $this->contact_number);
        $stmt->bindParam(':email', $this->email);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    // Update employee
    public function update() {
        $query = 'UPDATE ' . $this->table . '
                  SET firstname = :firstname, 
                      lastname = :lastname, 
                      contact_number = :contact_number, 
                      email = :email
                  WHERE employee_id = :employee_id';
        
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->employee_id = htmlspecialchars(strip_tags($this->employee_id));
        $this->firstname = htmlspecialchars(strip_tags($this->firstname));
        $this->lastname = htmlspecialchars(strip_tags($this->lastname));
        $this->contact_number = htmlspecialchars(strip_tags($this->contact_number));
        $this->email = htmlspecialchars(strip_tags($this->email));
        
        // Bind data
        $stmt->bindParam(':employee_id', $this->employee_id);
        $stmt->bindParam(':firstname', $this->firstname);
        $stmt->bindParam(':lastname', $this->lastname);
        $stmt->bindParam(':contact_number', $this->contact_number);
        $stmt->bindParam(':email', $this->email);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    // Delete employee
    public function delete() {
        $query = 'DELETE FROM ' . $this->table . ' WHERE employee_id = :employee_id';
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->employee_id = htmlspecialchars(strip_tags($this->employee_id));
        
        // Bind data
        $stmt->bindParam(':employee_id', $this->employee_id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    // Generate Employee ID (format: EMP-YYYY-XXXX)
    private function generateEmployeeId() {
        $query = 'SELECT MAX(SUBSTRING(employee_id, 10)) as max_id 
                  FROM ' . $this->table . ' 
                  WHERE employee_id LIKE "EMP-' . date('Y') . '-%"';
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $max_id = $row['max_id'] ? intval($row['max_id']) : 0;
        $next_id = $max_id + 1;
        
        return 'EMP-' . date('Y') . '-' . sprintf('%04d', $next_id);
    }
}
?>