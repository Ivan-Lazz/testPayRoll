<?php
// Accounts page
// Set page script
$page_script = "accounts.js";
$page_title = "Employee Accounts";

// Check if employee ID is provided
$employee_id = isset($_GET['employee_id']) ? $_GET['employee_id'] : null;

include_once '../includes/header.php';
?>

<div class="main-content">
    <div class="header">
        <h1><i class="fas fa-id-card"></i> Employee Accounts</h1>
        <div class="user-info">
            <span><?php echo $_SESSION['firstname'] . ' ' . $_SESSION['lastname']; ?> (<?php echo $_SESSION['role']; ?>)</span>
            <a href="../logout.php" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
        </div>
    </div>

    <?php if ($employee_id): ?>
    <div class="card mb-20">
        <div class="card-header">
            <h2>Accounts for Employee: <span id="employee-name-display">Loading...</span></h2>
            <a href="employees.php" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i> Back to Employees
            </a>
        </div>
    </div>
    <?php endif; ?>

    <div class="card">
        <div class="card-header">
            <h2><?php echo $employee_id ? 'Employee Accounts' : 'All Accounts'; ?></h2>
            <button id="openCreateAccountModalBtn" class="btn btn-primary" data-open-modal="createAccountModal">
                <i class="fas fa-plus"></i> Add New Account
            </button>
        </div>
        <div class="card-body">
            <div id="alert-container"></div>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Account ID</th>
                            <?php if (!$employee_id): ?>
                            <th>Employee ID</th>
                            <th>Employee Name</th>
                            <?php endif; ?>
                            <th>Account Email</th>
                            <th>Account Type</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="accountsList">
                        <!-- Account list will be populated here via JavaScript -->
                    </tbody>
                </table>
            </div>
            <div id="accountsPagination" class="pagination">
                <!-- Pagination will be added here -->
            </div>
        </div>
    </div>
</div>

<!-- Include the account modal templates -->
<?php include_once '../includes/modals/account-modals.php'; ?>

<?php include_once '../includes/footer.php'; ?>

<!-- Add script to initialize the page and pass employee ID if available -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        initPageModals('accounts');
        
        <?php if ($employee_id): ?>
        // If viewing for a specific employee, load their details and accounts
        const employeeId = '<?php echo $employee_id; ?>';
        
        // Load employee details first
        apiRequest(`employees/get/${employeeId}`)
            .then(response => {
                if (response.status === 'success') {
                    const employee = response.data;
                    document.getElementById('employee-name-display').textContent = 
                        `${employee.firstname} ${employee.lastname} (${employee.employee_id})`;
                }
            })
            .catch(error => {
                console.error('Error fetching employee details:', error);
            });
        <?php endif; ?>
    });
</script>