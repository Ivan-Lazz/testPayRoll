<?php
require_once __DIR__ . '/../models/Banking.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

class BankingController {
    private $db;
    private $banking;
    
    public function __construct() {
        $this->db = (new Database())->connect();
        $this->banking = new Banking($this->db);
    }
    
    // Get all banking details
    public function getAll() {
        $result = $this->banking->getAll();
        $num = $result->rowCount();
        
        if($num > 0) {
            $banking_arr = array();
            
            while($row = $result->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                $banking_item = array(
                    'id' => $id,
                    'employee_id' => $employee_id,
                    'employee_name' => $employee_firstname . ' ' . $employee_lastname,
                    'preferred_bank' => $preferred_bank,
                    'bank_account_number' => $bank_account_number,
                    'bank_account_name' => $bank_account_name,
                    'created_at' => $created_at,
                    'updated_at' => $updated_at
                );
                
                array_push($banking_arr, $banking_item);
            }
            
            Response::success('Banking details retrieved successfully', $banking_arr);
        } else {
            Response::success('No banking details found', array());
        }
    }
    
    // Get banking details by employee ID
    public function getByEmployeeId($id) {
        $this->banking->employee_id = $id;
        $result = $this->banking->getByEmployeeId();
        $num = $result->rowCount();
        
        if($num > 0) {
            $banking_arr = array();
            
            while($row = $result->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                $banking_item = array(
                    'id' => $id,
                    'employee_id' => $employee_id,
                    'employee_name' => $employee_firstname . ' ' . $employee_lastname,
                    'preferred_bank' => $preferred_bank,
                    'bank_account_number' => $bank_account_number,
                    'bank_account_name' => $bank_account_name,
                    'created_at' => $created_at,
                    'updated_at' => $updated_at
                );
                
                array_push($banking_arr, $banking_item);
            }
            
            Response::success('Banking details retrieved successfully', $banking_arr);
        } else {
            Response::success('No banking details found for this employee', array());
        }
    }
    
    // Get single banking detail
    public function getOne($id) {
        $this->banking->id = $id;
        
        if($this->banking->getOne()) {
            $banking_arr = array(
                'id' => $this->banking->id,
                'employee_id' => $this->banking->employee_id,
                'employee_name' => $this->banking->employee_firstname . ' ' . $this->banking->employee_lastname,
                'preferred_bank' => $this->banking->preferred_bank,
                'bank_account_number' => $this->banking->bank_account_number,
                'bank_account_name' => $this->banking->bank_account_name,
                'created_at' => $this->banking->created_at,
                'updated_at' => $this->banking->updated_at
            );
            
            Response::success('Banking details retrieved successfully', $banking_arr);
        } else {
            Response::error('Banking details not found', 404);
        }
    }
    
    // Create banking details
    public function create() {
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"));
        
        if(
            !isset($data->employee_id) || 
            !isset($data->preferred_bank) || 
            !isset($data->bank_account_number) || 
            !isset($data->bank_account_name)
        ) {
            Response::error('Missing required parameters', 400);
            return;
        }
        
        $this->banking->employee_id = $data->employee_id;
        
        // Check if employee exists
        if(!$this->banking->employeeExists()) {
            Response::error('Employee not found', 404);
            return;
        }
        
        $this->banking->preferred_bank = $data->preferred_bank;
        $this->banking->bank_account_number = $data->bank_account_number;
        $this->banking->bank_account_name = $data->bank_account_name;
        
        $banking_id = $this->banking->create();
        
        if($banking_id) {
            // Get employee details for response
            $this->banking->getEmployeeDetails();
            
            $response_data = array(
                'id' => $banking_id,
                'employee_id' => $this->banking->employee_id,
                'employee_name' => $this->banking->employee_firstname . ' ' . $this->banking->employee_lastname,
                'preferred_bank' => $this->banking->preferred_bank,
                'bank_account_number' => $this->banking->bank_account_number,
                'bank_account_name' => $this->banking->bank_account_name
            );
            
            Response::success('Banking details created successfully', $response_data);
        } else {
            Response::error('Banking details creation failed');
        }
    }
    
    // Update banking details
    public function update($id) {
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"));
        
        if(
            !isset($data->preferred_bank) || 
            !isset($data->bank_account_number) || 
            !isset($data->bank_account_name)
        ) {
            Response::error('Missing required parameters', 400);
            return;
        }
        
        $this->banking->id = $id;
        
        // Check if banking details exist
        if(!$this->banking->getOne()) {
            Response::error('Banking details not found', 404);
            return;
        }
        
        $this->banking->preferred_bank = $data->preferred_bank;
        $this->banking->bank_account_number = $data->bank_account_number;
        $this->banking->bank_account_name = $data->bank_account_name;
        
        if($this->banking->update()) {
            Response::success('Banking details updated successfully');
        } else {
            Response::error('Banking details update failed');
        }
    }
    
    // Delete banking details
    public function delete($id) {
        $this->banking->id = $id;
        
        if($this->banking->delete()) {
            Response::success('Banking details deleted successfully');
        } else {
            Response::error('Banking details deletion failed');
        }
    }
}
?>