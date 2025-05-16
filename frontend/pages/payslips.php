<?php
// Payslips page
$page_title = "Payslips";
include_once '../includes/header.php';
?>

<div class="payslips">
    <!-- View Payslip Modal -->
    <div class="modal" id="viewPayslipModal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">View Payslip</h2>
                <button class="close-modal" id="closeViewPayslipModal">&times;</button>
            </div>
            <div class="modal-body" id="viewPayslipModalBody">
                <div class="loading">
                    <div class="loader"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="closeViewPayslipModalBtn">Close</button>
                <a href="#" class="btn btn-primary" id="downloadAgentPdfBtn" target="_blank">Download Agent PDF</a>
                <a href="#" class="btn btn-primary" id="downloadAdminPdfBtn" target="_blank">Download Admin PDF</a>
            </div>
        </div>
    </div>

    <!-- Create Payslip Card -->
    <div class="card">
        <div class="card-header">
            <h2>Generate Payslip</h2>
        </div>
        <div class="card-body">
            <div class="payslip-generator">
                <!-- Input Form -->
                <div class="payslip-form">
                    <form id="payslipForm">
                        <div class="form-group">
                            <label for="employee_id">Employee</label>
                            <select id="employee_id" name="employee_id" class="form-control" required>
                                <option value="">Select Employee</option>
                                <!-- Employees will be loaded via JavaScript -->
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="bank_account_id">Bank Account</label>
                            <select id="bank_account_id" name="bank_account_id" class="form-control" required>
                                <option value="">Select Bank Account</option>
                                <!-- Bank accounts will be loaded via JavaScript -->
                            </select>
                        </div>

                        <div class="form-row">
                            <div class="form-col">
                                <div class="form-group">
                                    <label for="salary">Salary</label>
                                    <input type="number" id="salary" name="salary" class="form-control" required min="0" step="0.01">
                                </div>
                            </div>
                            <div class="form-col">
                                <div class="form-group">
                                    <label for="bonus">Bonus</label>
                                    <input type="number" id="bonus" name="bonus" class="form-control" required min="0" step="0.01" value="0">
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="total_salary">Total Salary</label>
                            <input type="number" id="total_salary" name="total_salary" class="form-control" readonly>
                        </div>

                        <div class="form-group">
                            <label for="person_in_charge">Person In Charge</label>
                            <input type="text" id="person_in_charge" name="person_in_charge" class="form-control" required value="<?php echo $_SESSION['firstname'] . ' ' . $_SESSION['lastname']; ?>">
                        </div>

                        <div class="form-row">
                            <div class="form-col">
                                <div class="form-group">
                                    <label for="cutoff_date">Cutoff Date</label>
                                    <input type="date" id="cutoff_date" name="cutoff_date" class="form-control" required value="<?php echo date('Y-m-d'); ?>">
                                </div>
                            </div>
                            <div class="form-col">
                                <div class="form-group">
                                    <label for="payment_date">Payment Date</label>
                                    <input type="date" id="payment_date" name="payment_date" class="form-control" required value="<?php echo date('Y-m-d'); ?>">
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="payment_status">Payment Status</label>
                            <select id="payment_status" name="payment_status" class="form-control" required>
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <button type="submit" class="btn btn-primary mt-20">Generate Payslip</button>
                    </form>
                </div>

                <!-- Preview -->
                <div class="payslip-preview">
                    <h3>Payslip Preview</h3>
                    <div class="preview-content" id="payslipPreview">
                        <p class="text-center">Fill the form to generate a preview</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Payslips List Card -->
    <div class="card mt-20">
        <div class="card-header">
            <h2>Payslips</h2>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Payslip No</th>
                            <th>Employee</th>
                            <th>Bank Account</th>
                            <th>Payment Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="payslipsList">
                        <tr>
                            <td colspan="7" class="text-center">
                                <div class="loading">
                                    <div class="loader"></div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div id="payslipsPagination" class="mt-20"></div>
        </div>
    </div>
</div>

<?php
// Set page script
$page_script = "../assets/js/payslips.js";
include_once '../includes/footer.php';
?>