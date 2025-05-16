<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

class UserController {
    private $db;
    private $user;
    
    public function __construct() {
        $this->db = (new Database())->connect();
        $this->user = new User($this->db);
    }
    
    // Get all users
    public function getAll() {
        $result = $this->user->getAll();
        $num = $result->rowCount();
        
        if($num > 0) {
            $users_arr = array();
            
            while($row = $result->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                $user_item = array(
                    'id' => $id,
                    'firstname' => $firstname,
                    'lastname' => $lastname,
                    'username' => $username,
                    'email' => $email,
                    'role' => $role,
                    'status' => $status,
                    'created_at' => $created_at,
                    'updated_at' => $updated_at
                );
                
                array_push($users_arr, $user_item);
            }
            
            Response::success('Users retrieved successfully', $users_arr);
        } else {
            Response::success('No users found', array());
        }
    }
    
    // Get single user
    public function getOne($id) {
        $this->user->id = $id;
        
        if($this->user->getOne()) {
            $user_arr = array(
                'id' => $this->user->id,
                'firstname' => $this->user->firstname,
                'lastname' => $this->user->lastname,
                'username' => $this->user->username,
                'email' => $this->user->email,
                'role' => $this->user->role,
                'status' => $this->user->status,
                'created_at' => $this->user->created_at,
                'updated_at' => $this->user->updated_at
            );
            
            Response::success('User retrieved successfully', $user_arr);
        } else {
            Response::error('User not found', 404);
        }
    }
    
    // Create user
    public function create() {
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"));
        
        if(
            !isset($data->firstname) || 
            !isset($data->lastname) || 
            !isset($data->username) || 
            !isset($data->password)
        ) {
            Response::error('Missing required parameters', 400);
            return;
        }
        
        $this->user->firstname = $data->firstname;
        $this->user->lastname = $data->lastname;
        $this->user->username = $data->username;
        $this->user->password = $data->password;
        $this->user->email = isset($data->email) ? $data->email : '';
        $this->user->role = isset($data->role) ? $data->role : 'user';
        $this->user->status = isset($data->status) ? $data->status : 'active';
        
        if($this->user->create()) {
            Response::success('User created successfully');
        } else {
            Response::error('User creation failed');
        }
    }
    
    // Update user
    public function update($id) {
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"));
        
        if(
            !isset($data->firstname) || 
            !isset($data->lastname) || 
            !isset($data->username)
        ) {
            Response::error('Missing required parameters', 400);
            return;
        }
        
        $this->user->id = $id;
        $this->user->firstname = $data->firstname;
        $this->user->lastname = $data->lastname;
        $this->user->username = $data->username;
        $this->user->password = isset($data->password) ? $data->password : '';
        $this->user->email = isset($data->email) ? $data->email : '';
        $this->user->role = isset($data->role) ? $data->role : 'user';
        $this->user->status = isset($data->status) ? $data->status : 'active';
        
        if($this->user->update()) {
            Response::success('User updated successfully');
        } else {
            Response::error('User update failed');
        }
    }
    
    // Delete user
    public function delete($id) {
        $this->user->id = $id;
        
        if($this->user->delete()) {
            Response::success('User deleted successfully');
        } else {
            Response::error('User deletion failed');
        }
    }
    
    // Login user
    public function login() {
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"));
        
        if(!isset($data->username) || !isset($data->password)) {
            Response::error('Missing required parameters', 400);
            return;
        }
        
        $this->user->username = $data->username;
        $this->user->password = $data->password;
        
        if($this->user->login()) {
            // Create token
            $user_arr = array(
                'id' => $this->user->id,
                'firstname' => $this->user->firstname,
                'lastname' => $this->user->lastname,
                'username' => $this->user->username,
                'email' => $this->user->email,
                'role' => $this->user->role
            );
            
            Response::success('Login successful', $user_arr);
        } else {
            Response::error('Invalid credentials', 401);
        }
    }
}
?>