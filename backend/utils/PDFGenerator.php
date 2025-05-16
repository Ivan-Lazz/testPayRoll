<?php
// If using manual installation, include the libraries directly
// Update these paths to match your actual library locations
if (file_exists(__DIR__ . '/../../vendor/fpdf/fpdf.php')) {
    require_once __DIR__ . '/../../vendor/fpdf/fpdf.php';
} elseif (file_exists(__DIR__ . '/../../vendor/setasign/fpdf/fpdf.php')) {
    require_once __DIR__ . '/../../vendor/setasign/fpdf/fpdf.php';
} else {
    // Fallback to direct inclusion from a libraries folder
    require_once __DIR__ . '/../../libraries/fpdf/fpdf.php';
}

if (file_exists(__DIR__ . '/../../vendor/fpdi/src/autoload.php')) {
    require_once __DIR__ . '/../../vendor/fpdi/src/autoload.php';
} elseif (file_exists(__DIR__ . '/../../vendor/setasign/fpdi/src/autoload.php')) {
    require_once __DIR__ . '/../../vendor/setasign/fpdi/src/autoload.php';
} else {
    // Fallback to direct inclusion from a libraries folder
    require_once __DIR__ . '/../../libraries/fpdi/src/autoload.php';
}

// If you don't have FPDI's autoloader, you'll need to include required files individually
if (!class_exists('setasign\Fpdi\Fpdi')) {
    // Include FPDI files directly - update paths as needed
    require_once __DIR__ . '/../../libraries/fpdi/src/Fpdi.php';
    require_once __DIR__ . '/../../libraries/fpdi/src/PdfParser/PdfParser.php';
    require_once __DIR__ . '/../../libraries/fpdi/src/PdfParser/StreamReader.php';
    // Add other necessary FPDI files here
}

use setasign\Fpdi\Fpdi;

class PDFGenerator {
    private $pdf;
    private $company_name = 'My Company';
    private $logo_path = __DIR__ . '/../../frontend/assets/img/logo.png';
    
    public function __construct() {
        $this->pdf = new Fpdi();
    }
    
    // Generate Agent Payslip (Variation 1)
    public function generateAgentPayslip($data) {
        $this->pdf->AddPage();
        $this->pdf->SetAutoPageBreak(true, 10);
        
        // Add company info
        $this->addCompanyHeader();
        
        // Add payslip title
        $this->pdf->SetFont('Arial', 'B', 16);
        $this->pdf->Cell(0, 15, 'AGENT PAYSLIP', 0, 1, 'C');
        
        // Add employee info
        $this->pdf->SetFont('Arial', '', 12);
        $this->pdf->Cell(40, 10, 'Agent Name:', 0);
        $this->pdf->Cell(0, 10, $data['firstname'] . ' ' . $data['lastname'], 0, 1);
        
        $this->pdf->Cell(40, 10, 'Employee ID:', 0);
        $this->pdf->Cell(0, 10, $data['employee_id'], 0, 1);
        
        $this->pdf->Cell(40, 10, 'Date:', 0);
        $this->pdf->Cell(0, 10, date('F d, Y', strtotime($data['payment_date'])), 0, 1);
        
        // Add salary details
        $this->pdf->Ln(10);
        $this->pdf->SetFont('Arial', 'B', 12);
        $this->pdf->Cell(0, 10, 'PAYMENT DETAILS', 0, 1, 'C');
        
        $this->pdf->SetFont('Arial', '', 12);
        $this->pdf->Cell(100, 10, 'Salary:', 0);
        $this->pdf->Cell(0, 10, '₱ ' . number_format($data['salary'], 2), 0, 1, 'R');
        
        $this->pdf->Cell(100, 10, 'Bonus:', 0);
        $this->pdf->Cell(0, 10, '₱ ' . number_format($data['bonus'], 2), 0, 1, 'R');
        
        $this->pdf->SetFont('Arial', 'B', 12);
        $this->pdf->Cell(100, 10, 'Total Salary:', 0);
        $this->pdf->Cell(0, 10, '₱ ' . number_format($data['total_salary'], 2), 0, 1, 'R');
        
        $filepath = 'payslips/agent_' . $data['payslip_no'] . '.pdf';
        $dir = __DIR__ . '/../../uploads/' . dirname($filepath);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        $fullpath = __DIR__ . '/../../uploads/' . $filepath;
        $this->pdf->Output($fullpath, 'F');
        
        return $filepath;
    }
    
    // Generate Admin Payslip (Variation 2)
    public function generateAdminPayslip($data) {
        $this->pdf->AddPage();
        $this->pdf->SetAutoPageBreak(true, 10);
        
        // Add company info
        $this->addCompanyHeader();
        
        // Add payslip title
        $this->pdf->SetFont('Arial', 'B', 16);
        $this->pdf->Cell(0, 15, 'ADMIN PAYSLIP', 0, 1, 'C');
        
        // Add employee info
        $this->pdf->SetFont('Arial', '', 12);
        $this->pdf->Cell(40, 10, 'Agent Name:', 0);
        $this->pdf->Cell(0, 10, $data['firstname'] . ' ' . $data['lastname'], 0, 1);
        
        $this->pdf->Cell(40, 10, 'Employee ID:', 0);
        $this->pdf->Cell(0, 10, $data['employee_id'], 0, 1);
        
        $this->pdf->Cell(40, 10, 'Bank Details:', 0);
        $this->pdf->Cell(0, 10, $data['bank_account_number'] . ' / ' . $data['bank_account_name'], 0, 1);
        
        $this->pdf->Cell(40, 10, 'Person In Charge:', 0);
        $this->pdf->Cell(0, 10, $data['person_in_charge'], 0, 1);
        
        $this->pdf->Cell(40, 10, 'Date:', 0);
        $this->pdf->Cell(0, 10, date('F d, Y', strtotime($data['payment_date'])), 0, 1);
        
        // Add salary details
        $this->pdf->Ln(10);
        $this->pdf->SetFont('Arial', 'B', 12);
        $this->pdf->Cell(0, 10, 'PAYMENT DETAILS', 0, 1, 'C');
        
        $this->pdf->SetFont('Arial', '', 12);
        $this->pdf->Cell(100, 10, 'Salary:', 0);
        $this->pdf->Cell(0, 10, '₱ ' . number_format($data['salary'], 2), 0, 1, 'R');
        
        $this->pdf->Cell(100, 10, 'Bonus:', 0);
        $this->pdf->Cell(0, 10, '₱ ' . number_format($data['bonus'], 2), 0, 1, 'R');
        
        $this->pdf->SetFont('Arial', 'B', 12);
        $this->pdf->Cell(100, 10, 'Total Salary:', 0);
        $this->pdf->Cell(0, 10, '₱ ' . number_format($data['total_salary'], 2), 0, 1, 'R');
        
        $filepath = 'payslips/admin_' . $data['payslip_no'] . '.pdf';
        $dir = __DIR__ . '/../../uploads/' . dirname($filepath);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        $fullpath = __DIR__ . '/../../uploads/' . $filepath;
        $this->pdf->Output($fullpath, 'F');
        
        return $filepath;
    }
    
    private function addCompanyHeader() {
        // Add logo if exists
        if (file_exists($this->logo_path)) {
            $this->pdf->Image($this->logo_path, 10, 10, 30);
            $this->pdf->SetFont('Arial', 'B', 14);
            $this->pdf->Cell(0, 15, $this->company_name, 0, 1, 'R');
            $this->pdf->Ln(20);
        } else {
            $this->pdf->SetFont('Arial', 'B', 14);
            $this->pdf->Cell(0, 15, $this->company_name, 0, 1, 'C');
            $this->pdf->Ln(10);
        }
    }
}
?>