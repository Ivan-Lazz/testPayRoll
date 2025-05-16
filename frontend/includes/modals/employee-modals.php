<?php
/**
 * Employee Modal Templates
 * Include this file in employees.php to add modal functionality
 */
?>

<!-- Create Employee Modal -->
<div class="modal" id="createEmployeeModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">Add New Employee</h3>
            <span class="modal-close" data-dismiss="modal">&times;</span>
        </div>
        <div class="modal-body">
            <form id="createEmployeeForm">
                <div class="form-group">
                    <label for="employee_id">Employee ID</label>
                    <input type="text" id="employee_id" name="employee_id" class="form-control" value="Auto-generated" readonly>
                </div>
                <div class="form-group">
                    <label for="firstname">First Name</label>
                    <input type="text" id="firstname" name="firstname" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="lastname">Last Name</label>
                    <input type="text" id="lastname" name="lastname" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="contact_number">Contact Number</label>
                    <input type="text" id="contact_number" name="contact_number" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" class="form-control" required>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" data-modal-save>Save Employee</button>
        </div>
    </div>
</div>

<!-- Edit Employee Modal -->
<div class="modal" id="editEmployeeModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">Edit Employee</h3>
            <span class="modal-close" data-dismiss="modal">&times;</span>
        </div>
        <div class="modal-body">
            <form id="editEmployeeForm">
                <div class="form-group">
                    <label for="edit_employee_id">Employee ID</label>
                    <input type="text" id="edit_employee_id" name="employee_id" class="form-control" readonly>
                </div>
                <div class="form-group">
                    <label for="edit_firstname">First Name</label>
                    <input type="text" id="edit_firstname" name="firstname" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="edit_lastname">Last Name</label>
                    <input type="text" id="edit_lastname" name="lastname" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="edit_contact_number">Contact Number</label>
                    <input type="text" id="edit_contact_number" name="contact_number" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="edit_email">Email Address</label>
                    <input type="email" id="edit_email" name="email" class="form-control" required>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" data-modal-save>Update Employee</button>
        </div>
    </div>
</div>