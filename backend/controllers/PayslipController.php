<?php
require_once __DIR__ . '/../models/Payslip.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/PDFGenerator.php';

class PayslipController {
    private $db;
    private $payslip;
    private $pdfGenerator;
    
    public function __construct() {
        $this->db = (new Database())->connect();
        $this->payslip = new Payslip($this->db);
        $this->pdfGenerator = new PDFGenerator();
    }
    
    // Get all payslips
    public function getAll() {
        $result = $this->payslip->getAll();
        $num = $result->rowCount();
        
        if($num > 0) {
            $payslips_arr = array();
            
            while($row = $result->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                $payslip_item = array(
                    'id' => $id,
                    'payslip_no' => $payslip_no,
                    'employee_id' => $employee_id,
                    'employee_name' => $employee_firstname . ' ' . $employee_lastname,
                    'bank_account_id' => $bank_account_id,
                    'bank_account_details' => $bank_account_number . ' / ' . $bank_account_name,
                    'preferred_bank' => $preferred_bank,
                    'salary' => $salary,
                    'bonus' => $bonus,
                    'total_salary' => $total_salary,
                    'person_in_charge' => $person_in_charge,
                    'cutoff_date' => $cutoff_date,
                    'payment_date' => $payment_date,
                    'payment_status' => $payment_status,
                    'agent_pdf_path' => $agent_pdf_path,
                    'admin_pdf_path' => $admin_pdf_path,
                    'created_at' => $created_at,
                    'updated_at' => $updated_at
                );
                
                array_push($payslips_arr, $payslip_item);
            }
            
            Response::success('Payslips retrieved successfully', $payslips_arr);
        } else {
            Response::success('No payslips found', array());
        }
    }
    
    // Get payslips by employee ID
    public function getByEmployeeId($id) {
        $this->payslip->employee_id = $id;
        $result = $this->payslip->getByEmployeeId();
        $num = $result->rowCount();
        
        if($num > 0) {
            $payslips_arr = array();
            
            while($row = $result->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                $payslip_item = array(
                    'id' => $id,
                    'payslip_no' => $payslip_no,
                    'employee_id' => $employee_id,
                    'employee_name' => $employee_firstname . ' ' . $employee_lastname,
                    'bank_account_id' => $bank_account_id,
                    'bank_account_details' => $bank_account_number . ' / ' . $bank_account_name,
                    'preferred_bank' => $preferred_bank,
                    'salary' => $salary,
                    'bonus' => $bonus,
                    'total_salary' => $total_salary,
                    'person_in_charge' => $person_in_charge,
                    'cutoff_date' => $cutoff_date,
                    'payment_date' => $payment_date,
                    'payment_status' => $payment_status,
                    'agent_pdf_path' => $agent_pdf_path,
                    'admin_pdf_path' => $admin_pdf_path,
                    'created_at' => $created_at,
                    'updated_at' => $updated_at
                );
                
                array_push($payslips_arr, $payslip_item);
            }
            
            Response::success('Payslips retrieved successfully', $payslips_arr);
        } else {
            Response::success('No payslips found for this employee', array());
        }
    }
    
    // Get single payslip
    public function getOne($id) {
        $this->payslip->id = $id;
        
        if($this->payslip->getOne()) {
            $payslip_arr = array(
                'id' => $this->payslip->id,
                'payslip_no' => $this->payslip->payslip_no,
                'employee_id' => $this->payslip->employee_id,
                'employee_name' => $this->payslip->employee_firstname . ' ' . $this->payslip->employee_lastname,
                'bank_account_id' => $this->payslip->bank_account_id,
                'bank_account_details' => $this->payslip->bank_account_number . ' / ' . $this->payslip->bank_account_name,
                'preferred_bank' => $this->payslip->preferred_bank,
                'salary' => $this->payslip->salary,
                'bonus' => $this->payslip->bonus,
                'total_salary' => $this->payslip->total_salary,
                'person_in_charge' => $this->payslip->person_in_charge,
                'cutoff_date' => $this->payslip->cutoff_date,
                'payment_date' => $this->payslip->payment_date,
                'payment_status' => $this->payslip->payment_status,
                'agent_pdf_path' => $this->payslip->agent_pdf_path,
                'admin_pdf_path' => $this->payslip->admin_pdf_path,
                'created_at' => $this->payslip->created_at,
                'updated_at' => $this->payslip->updated_at
            );
            
            Response::success('Payslip retrieved successfully', $payslip_arr);
        } else {
            Response::error('Payslip not found', 404);
        }
    }
    
    // Create payslip
    public function create() {
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"));
        
        if(
            !isset($data->employee_id) || 
            !isset($data->bank_account_id) || 
            !isset($data->salary) || 
            !isset($data->bonus) || 
            !isset($data->person_in_charge) || 
            !isset($data->payment_status)
        ) {
            Response::error('Missing required parameters', 400);
            return;
        }
        
        $this->payslip->employee_id = $data->employee_id;
        $this->payslip->bank_account_id = $data->bank_account_id;
        
        // Check if employee exists
        if(!$this->payslip->employeeExists()) {
            Response::error('Employee not found', 404);
            return;
        }
        
        // Check if bank account exists
        if(!$this->payslip->bankAccountExists()) {
            Response::error('Bank account not found', 404);
            return;
        }
        
        $this->payslip->salary = $data->salary;
        $this->payslip->bonus = $data->bonus;
        $this->payslip->total_salary = $data->salary + $data->bonus;
        $this->payslip->person_in_charge = $data->person_in_charge;
        $this->payslip->cutoff_date = isset($data->cutoff_date) ? $data->cutoff_date : date('Y-m-d');
        $this->payslip->payment_date = isset($data->payment_date) ? $data->payment_date : date('Y-m-d');
        $this->payslip->payment_status = $data->payment_status;
        
        $payslip_id = $this->payslip->create();
        
        if($payslip_id) {
            // Set the payslip ID for further operations
            $this->payslip->id = $payslip_id;
            
            // Get payslip details for PDF generation
            $this->payslip->getOne();
            
            // Generate PDFs
            $pdf_data = array(
                'payslip_no' => $this->payslip->payslip_no,
                'employee_id' => $this->payslip->employee_id,
                'firstname' => $this->payslip->employee_firstname,
                'lastname' => $this->payslip->employee_lastname,
                'bank_account_number' => $this->payslip->bank_account_number,
                'bank_account_name' => $this->payslip->bank_account_name,
                'preferred_bank' => $this->payslip->preferred_bank,
                'salary' => $this->payslip->salary,
                'bonus' => $this->payslip->bonus,
                'total_salary' => $this->payslip->total_salary,
                'person_in_charge' => $this->payslip->person_in_charge,
                'cutoff_date' => $this->payslip->cutoff_date,
                'payment_date' => $this->payslip->payment_date,
                'payment_status' => $this->payslip->payment_status
            );
            
            // Generate and save PDFs
            $agent_pdf_path = $this->pdfGenerator->generateAgentPayslip($pdf_data);
            $admin_pdf_path = $this->pdfGenerator->generateAdminPayslip($pdf_data);
            
            // Update payslip with PDF paths
            $this->payslip->agent_pdf_path = $agent_pdf_path;
            $this->payslip->admin_pdf_path = $admin_pdf_path;
            $this->payslip->updatePdfPaths();
            
            $response_data = array(
                'id' => $payslip_id,
                'payslip_no' => $this->payslip->payslip_no,
                'employee_id' => $this->payslip->employee_id,
                'employee_name' => $this->payslip->employee_firstname . ' ' . $this->payslip->employee_lastname,
                'bank_account_id' => $this->payslip->bank_account_id,
                'bank_account_details' => $this->payslip->bank_account_number . ' / ' . $this->payslip->bank_account_name,
                'preferred_bank' => $this->payslip->preferred_bank,
                'salary' => $this->payslip->salary,
                'bonus' => $this->payslip->bonus,
                'total_salary' => $this->payslip->total_salary,
                'person_in_charge' => $this->payslip->person_in_charge,
                'cutoff_date' => $this->payslip->cutoff_date,
                'payment_date' => $this->payslip->payment_date,
                'payment_status' => $this->payslip->payment_status,
                'agent_pdf_path' => $agent_pdf_path,
                'admin_pdf_path' => $admin_pdf_path
            );
            
            Response::success('Payslip created successfully', $response_data);
        } else {
            Response::error('Payslip creation failed');
        }
    }
    
    // Update payslip
    public function update($id) {
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"));
        
        if(
            !isset($data->bank_account_id) || 
            !isset($data->salary) || 
            !isset($data->bonus) || 
            !isset($data->person_in_charge) || 
            !isset($data->payment_status)
        ) {
            Response::error('Missing required parameters', 400);
            return;
        }
        
        $this->payslip->id = $id;
        
        // Check if payslip exists
        if(!$this->payslip->getOne()) {
            Response::error('Payslip not found', 404);
            return;
        }
        
        $this->payslip->bank_account_id = $data->bank_account_id;
        
        // Check if bank account exists
        if(!$this->payslip->bankAccountExists()) {
            Response::error('Bank account not found', 404);
            return;
        }
        
        $this->payslip->salary = $data->salary;
        $this->payslip->bonus = $data->bonus;
        $this->payslip->total_salary = $data->salary + $data->bonus;
        $this->payslip->person_in_charge = $data->person_in_charge;
        $this->payslip->cutoff_date = isset($data->cutoff_date) ? $data->cutoff_date : $this->payslip->cutoff_date;
        $this->payslip->payment_date = isset($data->payment_date) ? $data->payment_date : $this->payslip->payment_date;
        $this->payslip->payment_status = $data->payment_status;
        
        if($this->payslip->update()) {
            // Get updated bank account details
            $this->payslip->getBankAccountDetails();
            
            // Generate PDFs
            $pdf_data = array(
                'payslip_no' => $this->payslip->payslip_no,
                'employee_id' => $this->payslip->employee_id,
                'firstname' => $this->payslip->employee_firstname,
                'lastname' => $this->payslip->employee_lastname,
                'bank_account_number' => $this->payslip->bank_account_number,
                'bank_account_name' => $this->payslip->bank_account_name,
                'preferred_bank' => $this->payslip->preferred_bank,
                'salary' => $this->payslip->salary,
                'bonus' => $this->payslip->bonus,
                'total_salary' => $this->payslip->total_salary,
                'person_in_charge' => $this->payslip->person_in_charge,
                'cutoff_date' => $this->payslip->cutoff_date,
                'payment_date' => $this->payslip->payment_date,
                'payment_status' => $this->payslip->payment_status
            );
            
            // Generate and save PDFs
            $agent_pdf_path = $this->pdfGenerator->generateAgentPayslip($pdf_data);
            $admin_pdf_path = $this->pdfGenerator->generateAdminPayslip($pdf_data);
            
            // Update payslip with PDF paths
            $this->payslip->agent_pdf_path = $agent_pdf_path;
            $this->payslip->admin_pdf_path = $admin_pdf_path;
            $this->payslip->updatePdfPaths();
            
            Response::success('Payslip updated successfully');
        } else {
            Response::error('Payslip update failed');
        }
    }
    
    // Delete payslip
    public function delete($id) {
        $this->payslip->id = $id;
        
        if($this->payslip->delete()) {
            Response::success('Payslip deleted successfully');
        } else {
            Response::error('Payslip deletion failed');
        }
    }
    
    // Download payslip PDF
    public function downloadPdf($id, $type) {
        $this->payslip->id = $id;
        
        if($this->payslip->getOne()) {
            $filepath = '';
            
            if($type === 'agent') {
                $filepath = $this->payslip->agent_pdf_path;
            } elseif($type === 'admin') {
                $filepath = $this->payslip->admin_pdf_path;
            } else {
                Response::error('Invalid PDF type', 400);
                return;
            }
            
            if(empty($filepath)) {
                Response::error('PDF file not found', 404);
                return;
            }
            
            $fullpath = __DIR__ . '/../../uploads/' . $filepath;
            
            if(file_exists($fullpath)) {
                header('Content-Type: application/pdf');
                header('Content-Disposition: attachment; filename="' . basename($filepath) . '"');
                header('Content-Length: ' . filesize($fullpath));
                readfile($fullpath);
                exit;
            } else {
                Response::error('PDF file not found', 404);
            }
        } else {
            Response::error('Payslip not found', 404);
        }
    }
}
?>