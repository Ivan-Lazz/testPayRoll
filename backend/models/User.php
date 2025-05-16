<?php
class User {
    private $conn;
    private $table = 'users';

    // User properties
    public $id;
    public $firstname;
    public $lastname;
    public $username;
    public $password;
    public $email;
    public $role;
    public $status;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all users
    public function getAll() {
        $query = 'SELECT * FROM ' . $this->table . ' ORDER BY created_at DESC';
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Get user by ID
    public function getOne() {
        $query = 'SELECT * FROM ' . $this->table . ' WHERE id = ? LIMIT 0,1';
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->firstname = $row['firstname'];
            $this->lastname = $row['lastname'];
            $this->username = $row['username'];
            // Don't return password
            $this->email = $row['email'];
            $this->role = $row['role'];
            $this->status = $row['status'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        return false;
    }

    // Create user
    public function create() {
        $query = 'INSERT INTO ' . $this->table . ' 
                  SET firstname = :firstname, 
                      lastname = :lastname, 
                      username = :username, 
                      password = :password, 
                      email = :email, 
                      role = :role, 
                      status = :status';
        
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->firstname = htmlspecialchars(strip_tags($this->firstname));
        $this->lastname = htmlspecialchars(strip_tags($this->lastname));
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->role = htmlspecialchars(strip_tags($this->role));
        $this->status = htmlspecialchars(strip_tags($this->status));
        
        // Hash password
        $this->password = password_hash($this->password, PASSWORD_DEFAULT);
        
        // Bind data
        $stmt->bindParam(':firstname', $this->firstname);
        $stmt->bindParam(':lastname', $this->lastname);
        $stmt->bindParam(':username', $this->username);
        $stmt->bindParam(':password', $this->password);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':role', $this->role);
        $stmt->bindParam(':status', $this->status);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    // Update user
    public function update() {
        $query = 'UPDATE ' . $this->table . '
                  SET firstname = :firstname, 
                      lastname = :lastname, 
                      username = :username,';
        
        // Only update password if it's provided
        if(!empty($this->password)) {
            $query .= ' password = :password,';
        }
        
        $query .= ' email = :email, 
                    role = :role, 
                    status = :status
                  WHERE id = :id';
        
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->firstname = htmlspecialchars(strip_tags($this->firstname));
        $this->lastname = htmlspecialchars(strip_tags($this->lastname));
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->role = htmlspecialchars(strip_tags($this->role));
        $this->status = htmlspecialchars(strip_tags($this->status));
        
        // Bind data
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':firstname', $this->firstname);
        $stmt->bindParam(':lastname', $this->lastname);
        $stmt->bindParam(':username', $this->username);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':role', $this->role);
        $stmt->bindParam(':status', $this->status);
        
        // Bind password if it's provided
        if(!empty($this->password)) {
            $this->password = password_hash($this->password, PASSWORD_DEFAULT);
            $stmt->bindParam(':password', $this->password);
        }
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    // Delete user
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

    // Login
    public function login() {
        // Modified to add debug output
        error_log("Login attempt for username: {$this->username}");
        
        $query = 'SELECT id, firstname, lastname, username, password, email, role, status 
                  FROM ' . $this->table . ' 
                  WHERE username = :username 
                  LIMIT 0,1';
        
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->username = htmlspecialchars(strip_tags($this->username));
        
        // Bind data
        $stmt->bindParam(':username', $this->username);
        
        // Execute query
        $stmt->execute();
        
        // Check if user exists
        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->id = $row['id'];
            $this->firstname = $row['firstname'];
            $this->lastname = $row['lastname'];
            $this->email = $row['email'];
            $this->role = $row['role'];
            $this->status = $row['status'];
            $hashed_password = $row['password'];
            
            error_log("User found, status: {$row['status']}");
            
            // Check status
            if($row['status'] !== 'active') {
                error_log("User account not active");
                return false;
            }
            
            // Verify password
            $password_verified = password_verify($this->password, $hashed_password);
            error_log("Password verification result: " . ($password_verified ? 'success' : 'failed'));
            
            if($password_verified) {
                return true;
            }
        } else {
            error_log("No user found with username: {$this->username}");
        }
        
        return false;
    }
}
?>