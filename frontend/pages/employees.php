<?php
// Employees page
// Set page script
$page_script = "employees.js";
$page_title = "Employee Management";
include_once '../includes/header.php';
?>

<div class="main-content">
    <div class="header">
        <h1><i class="fas fa-user-tie"></i> Employee Management</h1>
        <div class="user-info">
            <span><?php echo $_SESSION['firstname'] . ' ' . $_SESSION['lastname']; ?> (<?php echo $_SESSION['role']; ?>)</span>
            <a href="../logout.php" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
        </div>
    </div>

    <div class="card">
        <div class="card-header">
            <h2>Employees List</h2>
            <button id="openCreateEmployeeModalBtn" class="btn btn-primary" data-open-modal="createEmployeeModal">
                <i class="fas fa-plus"></i> Add New Employee
            </button>
        </div>
        <div class="card-body">
            <div id="alert-container"></div>
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
                        <!-- Employee list will be populated here via JavaScript -->
                    </tbody>
                </table>
            </div>
            <div id="employeesPagination" class="pagination">
                <!-- Pagination will be added here -->
            </div>
        </div>
    </div>
</div>

<!-- Include the employee modal templates -->
<?php include_once '../includes/modals/employee-modals.php'; ?>

<?php include_once '../includes/footer.php'; ?>

<!-- Add a small script to set the page type for modal initialization -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        initPageModals('employees');
    });
</script>