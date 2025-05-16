<?php
require_once __DIR__ . '/../models/Employee.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

class EmployeeController {
    private $db;
    private $employee;
    
    public function __construct() {
        $this->db = (new Database())->connect();
        $this->employee = new Employee($this->db);
    }
    
    // Get all employees
    public function getAll() {
        $result = $this->employee->getAll();
        $num = $result->rowCount();
        
        if($num > 0) {
            $employees_arr = array();
            
            while($row = $result->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                $employee_item = array(
                    'employee_id' => $employee_id,
                    'firstname' => $firstname,
                    'lastname' => $lastname,
                    'contact_number' => $contact_number,
                    'email' => $email,
                    'created_at' => $created_at,
                    'updated_at' => $updated_at
                );
                
                array_push($employees_arr, $employee_item);
            }
            
            Response::success('Employees retrieved successfully', $employees_arr);
        } else {
            Response::success('No employees found', array());
        }
    }
    
    // Get single employee
    public function getOne($id) {
        $this->employee->employee_id = $id;
        
        if($this->employee->getOne()) {
            $employee_arr = array(
                'employee_id' => $this->employee->employee_id,
                'firstname' => $this->employee->firstname,
                'lastname' => $this->employee->lastname,
                'contact_number' => $this->employee->contact_number,
                'email' => $this->employee->email,
                'created_at' => $this->employee->created_at,
                'updated_at' => $this->employee->updated_at
            );
            
            Response::success('Employee retrieved successfully', $employee_arr);
        } else {
            Response::error('Employee not found', 404);
        }
    }
    
    // Create employee
    public function create() {
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"));
        
        if(
            !isset($data->firstname) || 
            !isset($data->lastname) || 
            !isset($data->contact_number) || 
            !isset($data->email)
        ) {
            Response::error('Missing required parameters', 400);
            return;
        }
        
        $this->employee->employee_id = isset($data->employee_id) ? $data->employee_id : '';
        $this->employee->firstname = $data->firstname;
        $this->employee->lastname = $data->lastname;
        $this->employee->contact_number = $data->contact_number;
        $this->employee->email = $data->email;
        
        if($this->employee->create()) {
            Response::success('Employee created successfully', ['employee_id' => $this->employee->employee_id]);
        } else {
            Response::error('Employee creation failed');
        }
    }
    
    // Update employee
    public function update($id) {
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"));
        
        if(
            !isset($data->firstname) || 
            !isset($data->lastname) || 
            !isset($data->contact_number) ||
            !isset($data->email)
        ) {
            Response::error('Missing required parameters', 400);
            return;
        }
        
        $this->employee->employee_id = $id;
        $this->employee->firstname = $data->firstname;
        $this->employee->lastname = $data->lastname;
        $this->employee->contact_number = $data->contact_number;
        $this->employee->email = $data->email;
        
        if($this->employee->update()) {
            Response::success('Employee updated successfully');
        } else {
            Response::error('Employee update failed');
        }
    }
    
    // Delete employee
    public function delete($id) {
        $this->employee->employee_id = $id;
        
        if($this->employee->delete()) {
            Response::success('Employee deleted successfully');
        } else {
            Response::error('Employee deletion failed');
        }
    }
}
?>