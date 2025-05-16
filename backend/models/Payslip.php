<?php
class Payslip {
    private $conn;
    private $table = 'payslips';

    // Payslip properties
    public $id;
    public $payslip_no;
    public $employee_id;
    public $bank_account_id;
    public $salary;
    public $bonus;
    public $total_salary;
    public $person_in_charge;
    public $cutoff_date;
    public $payment_date;
    public $payment_status;
    public $agent_pdf_path;
    public $admin_pdf_path;
    public $created_at;
    public $updated_at;

    // Join properties
    public $employee_firstname;
    public $employee_lastname;
    public $bank_account_number;
    public $bank_account_name;
    public $preferred_bank;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all payslips
    public function getAll() {
        $query = 'SELECT p.*, e.firstname as employee_firstname, e.lastname as employee_lastname,
                  b.bank_account_number, b.bank_account_name, b.preferred_bank
                  FROM ' . $this->table . ' p
                  LEFT JOIN employees e ON p.employee_id = e.employee_id
                  LEFT JOIN employee_banking_details b ON p.bank_account_id = b.id
                  ORDER BY p.created_at DESC';
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Get payslips by employee ID
    public function getByEmployeeId() {
        $query = 'SELECT p.*, e.firstname as employee_firstname, e.lastname as employee_lastname,
                  b.bank_account_number, b.bank_account_name, b.preferred_bank
                  FROM ' . $this->table . ' p
                  LEFT JOIN employees e ON p.employee_id = e.employee_id
                  LEFT JOIN employee_banking_details b ON p.bank_account_id = b.id
                  WHERE p.employee_id = ?
                  ORDER BY p.created_at DESC';
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->employee_id);
        $stmt->execute();
        return $stmt;
    }

    // Get payslip by ID
    public function getOne() {
        $query = 'SELECT p.*, e.firstname as employee_firstname, e.lastname as employee_lastname,
                  b.bank_account_number, b.bank_account_name, b.preferred_bank
                  FROM ' . $this->table . ' p
                  LEFT JOIN employees e ON p.employee_id = e.employee_id
                  LEFT JOIN employee_banking_details b ON p.bank_account_id = b.id
                  WHERE p.id = ? 
                  LIMIT 0,1';
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->payslip_no = $row['payslip_no'];
            $this->employee_id = $row['employee_id'];
            $this->bank_account_id = $row['bank_account_id'];
            $this->salary = $row['salary'];
            $this->bonus = $row['bonus'];
            $this->total_salary = $row['total_salary'];
            $this->person_in_charge = $row['person_in_charge'];
            $this->cutoff_date = $row['cutoff_date'];
            $this->payment_date = $row['payment_date'];
            $this->payment_status = $row['payment_status'];
            $this->agent_pdf_path = $row['agent_pdf_path'];
            $this->admin_pdf_path = $row['admin_pdf_path'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            $this->employee_firstname = $row['employee_firstname'];
            $this->employee_lastname = $row['employee_lastname'];
            $this->bank_account_number = $row['bank_account_number'];
            $this->bank_account_name = $row['bank_account_name'];
            $this->preferred_bank = $row['preferred_bank'];
            return true;
        }
        
        return false;
    }

    // Create payslip
    public function create() {
        // Generate payslip number if not provided
        if(empty($this->payslip_no)) {
            $this->payslip_no = $this->generatePayslipNo();
        }

        $query = 'INSERT INTO ' . $this->table . ' 
                  SET payslip_no = :payslip_no, 
                      employee_id = :employee_id, 
                      bank_account_id = :bank_account_id, 
                      salary = :salary, 
                      bonus = :bonus, 
                      total_salary = :total_salary, 
                      person_in_charge = :person_in_charge, 
                      cutoff_date = :cutoff_date, 
                      payment_date = :payment_date, 
                      payment_status = :payment_status';
        
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->payslip_no = htmlspecialchars(strip_tags($this->payslip_no));
        $this->employee_id = htmlspecialchars(strip_tags($this->employee_id));
        $this->bank_account_id = htmlspecialchars(strip_tags($this->bank_account_id));
        $this->salary = htmlspecialchars(strip_tags($this->salary));
        $this->bonus = htmlspecialchars(strip_tags($this->bonus));
        $this->total_salary = htmlspecialchars(strip_tags($this->total_salary));
        $this->person_in_charge = htmlspecialchars(strip_tags($this->person_in_charge));
        $this->cutoff_date = htmlspecialchars(strip_tags($this->cutoff_date));
        $this->payment_date = htmlspecialchars(strip_tags($this->payment_date));
        $this->payment_status = htmlspecialchars(strip_tags($this->payment_status));
        
        // Bind data
        $stmt->bindParam(':payslip_no', $this->payslip_no);
        $stmt->bindParam(':employee_id', $this->employee_id);
        $stmt->bindParam(':bank_account_id', $this->bank_account_id);
        $stmt->bindParam(':salary', $this->salary);
        $stmt->bindParam(':bonus', $this->bonus);
        $stmt->bindParam(':total_salary', $this->total_salary);
        $stmt->bindParam(':person_in_charge', $this->person_in_charge);
        $stmt->bindParam(':cutoff_date', $this->cutoff_date);
        $stmt->bindParam(':payment_date', $this->payment_date);
        $stmt->bindParam(':payment_status', $this->payment_status);
        
        // Execute query
        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    // Update payslip
    public function update() {
        $query = 'UPDATE ' . $this->table . '
                  SET bank_account_id = :bank_account_id, 
                      salary = :salary, 
                      bonus = :bonus, 
                      total_salary = :total_salary, 
                      person_in_charge = :person_in_charge, 
                      cutoff_date = :cutoff_date, 
                      payment_date = :payment_date, 
                      payment_status = :payment_status';
        
        // Add PDF paths if they are set
        if(!empty($this->agent_pdf_path)) {
            $query .= ', agent_pdf_path = :agent_pdf_path';
        }
        
        if(!empty($this->admin_pdf_path)) {
            $query .= ', admin_pdf_path = :admin_pdf_path';
        }
        
        $query .= ' WHERE id = :id';
        
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->bank_account_id = htmlspecialchars(strip_tags($this->bank_account_id));
        $this->salary = htmlspecialchars(strip_tags($this->salary));
        $this->bonus = htmlspecialchars(strip_tags($this->bonus));
        $this->total_salary = htmlspecialchars(strip_tags($this->total_salary));
        $this->person_in_charge = htmlspecialchars(strip_tags($this->person_in_charge));
        $this->cutoff_date = htmlspecialchars(strip_tags($this->cutoff_date));
        $this->payment_date = htmlspecialchars(strip_tags($this->payment_date));
        $this->payment_status = htmlspecialchars(strip_tags($this->payment_status));
        
        // Bind data
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':bank_account_id', $this->bank_account_id);
        $stmt->bindParam(':salary', $this->salary);
        $stmt->bindParam(':bonus', $this->bonus);
        $stmt->bindParam(':total_salary', $this->total_salary);
        $stmt->bindParam(':person_in_charge', $this->person_in_charge);
        $stmt->bindParam(':cutoff_date', $this->cutoff_date);
        $stmt->bindParam(':payment_date', $this->payment_date);
        $stmt->bindParam(':payment_status', $this->payment_status);
        
        // Bind PDF paths if they are set
        if(!empty($this->agent_pdf_path)) {
            $this->agent_pdf_path = htmlspecialchars(strip_tags($this->agent_pdf_path));
            $stmt->bindParam(':agent_pdf_path', $this->agent_pdf_path);
        }
        
        if(!empty($this->admin_pdf_path)) {
            $this->admin_pdf_path = htmlspecialchars(strip_tags($this->admin_pdf_path));
            $stmt->bindParam(':admin_pdf_path', $this->admin_pdf_path);
        }
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    // Delete payslip
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

    // Update PDF paths
    public function updatePdfPaths() {
        $query = 'UPDATE ' . $this->table . '
                  SET agent_pdf_path = :agent_pdf_path, 
                      admin_pdf_path = :admin_pdf_path
                  WHERE id = :id';
        
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->agent_pdf_path = htmlspecialchars(strip_tags($this->agent_pdf_path));
        $this->admin_pdf_path = htmlspecialchars(strip_tags($this->admin_pdf_path));
        
        // Bind data
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':agent_pdf_path', $this->agent_pdf_path);
        $stmt->bindParam(':admin_pdf_path', $this->admin_pdf_path);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    // Generate Payslip Number (format: PSL-YYYYMMDD-XXXX)
    private function generatePayslipNo() {
        $date_part = date('Ymd');
        
        $query = 'SELECT MAX(SUBSTRING(payslip_no, 14)) as max_id 
                  FROM ' . $this->table . ' 
                  WHERE payslip_no LIKE "PSL-' . $date_part . '-%"';
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $max_id = $row['max_id'] ? intval($row['max_id']) : 0;
        $next_id = $max_id + 1;
        
        return 'PSL-' . $date_part . '-' . sprintf('%04d', $next_id);
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

    // Check if bank account exists
    public function bankAccountExists() {
        $query = 'SELECT COUNT(*) as count FROM employee_banking_details WHERE id = ?';
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->bank_account_id);
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

    // Get bank account details
    public function getBankAccountDetails() {
        $query = 'SELECT bank_account_number, bank_account_name, preferred_bank 
                  FROM employee_banking_details WHERE id = ?';
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->bank_account_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->bank_account_number = $row['bank_account_number'];
            $this->bank_account_name = $row['bank_account_name'];
            $this->preferred_bank = $row['preferred_bank'];
            return true;
        }
        
        return false;
    }
}
?>