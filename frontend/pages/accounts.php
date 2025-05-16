<?php
// Accounts page
$page_title = "Employee Accounts";
include_once '../includes/header.php';

// Check if employee ID is provided
$employee_id = isset($_GET['employee']) ? $_GET['employee'] : '';
?>

<div class="accounts">
    <!-- Create Account Modal -->
    <div class="modal" id="createAccountModal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Add Employee Account</h2>
                <button class="close-modal" id="closeCreateAccountModal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="createAccountForm">
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
                    
                    <div class="form-row">
                        <div class="form-col">
                            <div class="form-group">
                                <label for="employee_firstname">First Name</label>
                                <input type="text" id="employee_firstname" name="employee_firstname" class="form-control" readonly>
                            </div>
                        </div>
                        <div class="form-col">
                            <div class="form-group">
                                <label for="employee_lastname">Last Name</label>
                                <input type="text" id="employee_lastname" name="employee_lastname" class="form-control" readonly>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="account_email">Account Email</label>
                        <input type="email" id="account_email" name="account_email" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="account_password">Account Password</label>
                        <input type="password" id="account_password" name="account_password" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="account_type">Account Type</label>
                        <select id="account_type" name="account_type" class="form-control" required>
                            <option value="">Select Account Type</option>
                            <option value="Team Leader">Team Leader</option>
                            <option value="Overflow">Overflow</option>
                            <option value="Auto-Warranty">Auto-Warranty</option>
                            <option value="Commissions">Commissions</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="account_status">Account Status</label>
                        <select id="account_status" name="account_status" class="form-control" required>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancelCreateAccountBtn">Cancel</button>
                <button class="btn btn-primary" id="saveAccountBtn">Save Account</button>
            </div>
        </div>
    </div>

    <!-- Accounts List Card -->
    <div class="card">
        <div class="card-header">
            <h2>Employee Accounts<?php echo $employee_id ? ' - ' . $employee_id : ''; ?></h2>
            <button class="btn btn-primary" id="openCreateAccountModalBtn">Add Account</button>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Employee</th>
                            <th>Email</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="accountsList">
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
            <div id="accountsPagination" class="mt-20"></div>
        </div>
    </div>
</div>

<script>
    // Set employee ID if provided
    const employeeId = '<?php echo $employee_id; ?>';
</script>

<?php
// Set page script
$page_script = "../assets/js/accounts.js";
include_once '../includes/footer.php';
?>