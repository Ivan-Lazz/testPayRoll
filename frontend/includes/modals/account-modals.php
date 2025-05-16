<?php
/**
 * Account Modal Templates
 * Include this file in accounts.php to add modal functionality
 */
?>

<!-- Create Account Modal -->
<div class="modal" id="createAccountModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">Add Employee Account</h3>
            <span class="modal-close" data-dismiss="modal">&times;</span>
        </div>
        <div class="modal-body">
            <form id="createAccountForm">
                <!-- Hidden employee_id for when coming from employee profile -->
                <input type="hidden" id="employee_id_hidden" name="employee_id_hidden" value="<?php echo isset($_GET['employee_id']) ? htmlspecialchars($_GET['employee_id']) : ''; ?>">
                
                <div class="form-group">
                    <label for="employee_id">Employee ID</label>
                    <select id="employee_id" name="employee_id" class="form-control" required onchange="updateEmployeeDetails(this)">
                        <option value="">Select Employee</option>
                        <!-- Options will be populated via JavaScript -->
                    </select>
                </div>
                <div class="form-group">
                    <label for="employee_firstname">First Name</label>
                    <input type="text" id="employee_firstname" class="form-control" readonly>
                </div>
                <div class="form-group">
                    <label for="employee_lastname">Last Name</label>
                    <input type="text" id="employee_lastname" class="form-control" readonly>
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
                    </select>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" data-modal-save>Save Account</button>
        </div>
    </div>
</div>

<!-- Edit Account Modal -->
<div class="modal" id="editAccountModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">Edit Employee Account</h3>
            <span class="modal-close" data-dismiss="modal">&times;</span>
        </div>
        <div class="modal-body">
            <form id="editAccountForm">
                <input type="hidden" id="edit_account_id" name="account_id">
                <div class="form-group">
                    <label for="edit_employee_id">Employee ID</label>
                    <input type="text" id="edit_employee_id" name="employee_id" class="form-control" readonly>
                </div>
                <div class="form-group">
                    <label for="edit_employee_firstname">First Name</label>
                    <input type="text" id="edit_employee_firstname" class="form-control" readonly>
                </div>
                <div class="form-group">
                    <label for="edit_employee_lastname">Last Name</label>
                    <input type="text" id="edit_employee_lastname" class="form-control" readonly>
                </div>
                <div class="form-group">
                    <label for="edit_account_email">Account Email</label>
                    <input type="email" id="edit_account_email" name="account_email" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="edit_account_password">Account Password</label>
                    <input type="password" id="edit_account_password" name="account_password" class="form-control" placeholder="Leave blank to keep current password">
                </div>
                <div class="form-group">
                    <label for="edit_account_type">Account Type</label>
                    <select id="edit_account_type" name="account_type" class="form-control" required>
                        <option value="Team Leader">Team Leader</option>
                        <option value="Overflow">Overflow</option>
                        <option value="Auto-Warranty">Auto-Warranty</option>
                        <option value="Commissions">Commissions</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit_account_status">Account Status</label>
                    <select id="edit_account_status" name="account_status" class="form-control" required>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" data-modal-save>Update Account</button>
        </div>
    </div>
</div>