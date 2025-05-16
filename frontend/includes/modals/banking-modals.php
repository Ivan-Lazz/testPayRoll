<?php
/**
 * Banking Modal Templates
 * Include this file in banking.php to add modal functionality
 */
?>

<!-- Create Banking Details Modal -->
<div class="modal" id="createBankingModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">Add Banking Details</h3>
            <span class="modal-close" data-dismiss="modal">&times;</span>
        </div>
        <div class="modal-body">
            <form id="createBankingForm">
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
                    <label for="employee_name">Employee Name</label>
                    <input type="text" id="employee_name" class="form-control" readonly>
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
                    <label for="bank_account_name">Bank Account Name</label>
                    <input type="text" id="bank_account_name" name="bank_account_name" class="form-control" required>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" data-modal-save>Save Banking Details</button>
        </div>
    </div>
</div>

<!-- Edit Banking Details Modal -->
<div class="modal" id="editBankingModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">Edit Banking Details</h3>
            <span class="modal-close" data-dismiss="modal">&times;</span>
        </div>
        <div class="modal-body">
            <form id="editBankingForm">
                <input type="hidden" id="edit_id" name="id">
                <div class="form-group">
                    <label for="edit_employee_id">Employee ID</label>
                    <input type="text" id="edit_employee_id" name="employee_id" class="form-control" readonly>
                </div>
                <div class="form-group">
                    <label for="edit_employee_name">Employee Name</label>
                    <input type="text" id="edit_employee_name" class="form-control" readonly>
                </div>
                <div class="form-group">
                    <label for="edit_preferred_bank">Preferred Bank</label>
                    <input type="text" id="edit_preferred_bank" name="preferred_bank" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="edit_bank_account_number">Bank Account Number</label>
                    <input type="text" id="edit_bank_account_number" name="bank_account_number" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="edit_bank_account_name">Bank Account Name</label>
                    <input type="text" id="edit_bank_account_name" name="bank_account_name" class="form-control" required>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" data-modal-save>Update Banking Details</button>
        </div>
    </div>
</div>