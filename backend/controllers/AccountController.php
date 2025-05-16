<?php
require_once __DIR__ . '/../models/EmployeeAccount.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

class AccountController {
    private $db;
    private $account;
    
    public function __construct() {
        $this->db = (new Database())->connect();
        $this->account = new EmployeeAccount($this->db);
    }
    
    // Get all accounts
    public function getAll() {
        $result = $this->account->getAll();
        $num = $result->rowCount();
        
        if($num > 0) {
            $accounts_arr = array();
            
            while($row = $result->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                $account_item = array(
                    'account_id' => $account_id,
                    'employee_id' => $employee_id,
                    'employee_name' => $employee_firstname . ' ' . $employee_lastname,
                    'account_email' => $account_email,
                    'account_type' => $account_type,
                    'account_status' => $account_status,
                    'created_at' => $created_at,
                    'updated_at' => $updated_at
                );
                
                array_push($accounts_arr, $account_item);
            }
            
            Response::success('Accounts retrieved successfully', $accounts_arr);
        } else {
            Response::success('No accounts found', array());
        }
    }
    
    // Get accounts by employee ID
    public function getByEmployeeId($id) {
        $this->account->employee_id = $id;
        $result = $this->account->getByEmployeeId();
        $num = $result->rowCount();
        
        if($num > 0) {
            $accounts_arr = array();
            
            while($row = $result->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                $account_item = array(
                    'account_id' => $account_id,
                    'employee_id' => $employee_id,
                    'employee_name' => $employee_firstname . ' ' . $employee_lastname,
                    'account_email' => $account_email,
                    'account_type' => $account_type,
                    'account_status' => $account_status,
                    'created_at' => $created_at,
                    'updated_at' => $updated_at
                );
                
                array_push($accounts_arr, $account_item);
            }
            
            Response::success('Accounts retrieved successfully', $accounts_arr);
        } else {
            Response::success('No accounts found for this employee', array());
        }
    }
    
    // Get single account
    public function getOne($id) {
        $this->account->account_id = $id;
        
        if($this->account->getOne()) {
            $account_arr = array(
                'account_id' => $this->account->account_id,
                'employee_id' => $this->account->employee_id,
                'employee_name' => $this->account->employee_firstname . ' ' . $this->account->employee_lastname,
                'account_email' => $this->account->account_email,
                'account_type' => $this->account->account_type,
                'account_status' => $this->account->account_status,
                'created_at' => $this->account->created_at,
                'updated_at' => $this->account->updated_at
            );
            
            Response::success('Account retrieved successfully', $account_arr);
        } else {
            Response::error('Account not found', 404);
        }
    }
    
    // Create account
    public function create() {
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"));
        
        if(
            !isset($data->employee_id) || 
            !isset($data->account_email) || 
            !isset($data->account_password) || 
            !isset($data->account_type)
        ) {
            Response::error('Missing required parameters', 400);
            return;
        }
        
        $this->account->employee_id = $data->employee_id;
        
        // Check if employee exists
        if(!$this->account->employeeExists()) {
            Response::error('Employee not found', 404);
            return;
        }
        
        $this->account->account_email = $data->account_email;
        $this->account->account_password = $data->account_password;
        $this->account->account_type = $data->account_type;
        $this->account->account_status = isset($data->account_status) ? $data->account_status : 'ACTIVE';
        
        $account_id = $this->account->create();
        
        if($account_id) {
            // Get employee details for response
            $this->account->getEmployeeDetails();
            
            $response_data = array(
                'account_id' => $account_id,
                'employee_id' => $this->account->employee_id,
                'employee_name' => $this->account->employee_firstname . ' ' . $this->account->employee_lastname,
                'account_email' => $this->account->account_email,
                'account_type' => $this->account->account_type,
                'account_status' => $this->account->account_status
            );
            
            Response::success('Account created successfully', $response_data);
        } else {
            Response::error('Account creation failed');
        }
    }
    
    // Update account
    public function update($id) {
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"));
        
        if(
            !isset($data->account_email) || 
            !isset($data->account_type) || 
            !isset($data->account_status)
        ) {
            Response::error('Missing required parameters', 400);
            return;
        }
        
        $this->account->account_id = $id;
        
        // Check if account exists
        if(!$this->account->getOne()) {
            Response::error('Account not found', 404);
            return;
        }
        
        $this->account->account_email = $data->account_email;
        $this->account->account_password = isset($data->account_password) ? $data->account_password : '';
        $this->account->account_type = $data->account_type;
        $this->account->account_status = $data->account_status;
        
        if($this->account->update()) {
            Response::success('Account updated successfully');
        } else {
            Response::error('Account update failed');
        }
    }
    
    // Delete account
    public function delete($id) {
        $this->account->account_id = $id;
        
        if($this->account->delete()) {
            Response::success('Account deleted successfully');
        } else {
            Response::error('Account deletion failed');
        }
    }
}
?>