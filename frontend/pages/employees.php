<?php
// Employees page
$page_title = "Employees";
include_once '../includes/header.php';
?>

<div class="employees">
    <!-- Create Employee Modal -->
    <div class="modal" id="createEmployeeModal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Add New Employee</h2>
                <button class="close-modal" id="closeCreateEmployeeModal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="createEmployeeForm">
                    <div class="form-group">
                        <label for="employee_id">Employee ID</label>
                        <input type="text" id="employee_id" name="employee_id" class="form-control" readonly placeholder="Auto-generated">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-col">
                            <div class="form-group">
                                <label for="firstname">First Name</label>
                                <input type="text" id="firstname" name="firstname" class="form-control" required>
                            </div>
                        </div>
                        <div class="form-col">
                            <div class="form-group">
                                <label for="lastname">Last Name</label>
                                <input type="text" id="lastname" name="lastname" class="form-control" required>
                            </div>
                        </div>
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
                <button class="btn btn-secondary" id="cancelCreateEmployeeBtn">Cancel</button>
                <button class="btn btn-primary" id="saveEmployeeBtn">Save Employee</button>
            </div>
        </div>
    </div>

    <!-- Employees List Card -->
    <div class="card">
        <div class="card-header">
            <h2>Employees</h2>
            <button class="btn btn-primary" id="openCreateEmployeeModalBtn">Add New Employee</button>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Contact Number</th>
                            <th>Email</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="employeesList">
                        <tr>
                            <td colspan="6" class="text-center">
                                <div class="loading">
                                    <div class="loader"></div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div id="employeesPagination" class="mt-20"></div>
        </div>
    </div>
</div>

<?php
// Set page script
$page_script = "../assets/js/employees.js";
include_once '../includes/footer.php';
?>