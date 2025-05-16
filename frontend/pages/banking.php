<?php
// Banking details page
$page_title = "Banking Details";
include_once '../includes/header.php';

// Check if employee ID is provided
$employee_id = isset($_GET['employee']) ? $_GET['employee'] : '';
?>

<div class="banking">
    <!-- Create Banking Details Modal -->
    <div class="modal" id="createBankingModal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Add Banking Details</h2>
                <button class="close-modal" id="closeCreateBankingModal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="createBankingForm">
                    <div class="form-group">
                        <label for="employee_id">Employee ID</label>
                        <select id="employee_id" name="employee_id" class="form-control" required <?php echo $employee_id ? 'disabled' : ''; ?>>
                            <option value="">Select Employee</option>
                            <!-- Employees will be loaded via JavaScript -->
                        </select>
                        <?php if ($employee_id): ?>
                        <input type="hidden" id="employee_id_hidden" name="employee_id_hidden" value="<?php echo $employee_id; ?>">
                        <?php endif; ?>
                    </div>
                    
                    <div class="form-group">
                        <label for="employee_name">Employee Name</label>
                        <input type="text" id="employee_name" name="employee_name" class="form-control" readonly>
                    </div>
                    
                    <div class="form-group">
                        <label for="preferred_bank">Preferred Bank</label>
                        <input type="text" id="preferred_bank" name="preferred_bank" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="bank_account_number">Bank Account Number</label>
                        <input type="text" id="bank_account_number" name="bank_account_number" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="bank_account_name">Bank Account Name/Holder</label>
                        <input type="text" id="bank_account_name" name="bank_account_name" class="form-control" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancelCreateBankingBtn">Cancel</button>
                <button class="btn btn-primary" id="saveBankingBtn">Save Banking Details</button>
            </div>
        </div>
    </div>

    <!-- Banking List Card -->
    <div class="card">
        <div class="card-header">
            <h2>Banking Details<?php echo $employee_id ? ' - ' . $employee_id : ''; ?></h2>
            <button class="btn btn-primary" id="openCreateBankingModalBtn">Add Banking Details</button>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Employee</th>
                            <th>Bank</th>
                            <th>Account Number</th>
                            <th>Account Name</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="bankingList">
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
            <div id="bankingPagination" class="mt-20"></div>
        </div>
    </div>
</div>

<script>
    // Set employee ID if provided
    const employeeId = '<?php echo $employee_id; ?>';
</script>

<?php
// Set page script
$page_script = "../assets/js/banking.js";
include_once '../includes/footer.php';
?>