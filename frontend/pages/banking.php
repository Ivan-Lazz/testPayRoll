<?php
// Banking details page
// Set page script
$page_script = "banking.js";
$page_title = "Banking Details";

// Check if employee ID is provided
$employee_id = isset($_GET['employee_id']) ? $_GET['employee_id'] : null;

include_once '../includes/header.php';
?>

<div class="main-content">
    <div class="header">
        <h1><i class="fas fa-university"></i> Banking Details</h1>
        <div class="user-info">
            <span><?php echo $_SESSION['firstname'] . ' ' . $_SESSION['lastname']; ?> (<?php echo $_SESSION['role']; ?>)</span>
            <a href="../logout.php" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
        </div>
    </div>

    <?php if ($employee_id): ?>
    <div class="card mb-20">
        <div class="card-header">
            <h2>Banking Details for Employee: <span id="employee-name-display">Loading...</span></h2>
            <a href="employees.php" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i> Back to Employees
            </a>
        </div>
    </div>
    <?php endif; ?>

    <div class="card">
        <div class="card-header">
            <h2><?php echo $employee_id ? 'Banking Accounts' : 'All Banking Details'; ?></h2>
            <button id="openCreateBankingModalBtn" class="btn btn-primary" data-open-modal="createBankingModal">
                <i class="fas fa-plus"></i> Add Banking Details
            </button>
        </div>
        <div class="card-body">
            <div id="alert-container"></div>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <?php if (!$employee_id): ?>
                            <th>Employee ID</th>
                            <th>Employee Name</th>
                            <?php endif; ?>
                            <th>Bank</th>
                            <th>Account Number</th>
                            <th>Account Name</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="bankingList">
                        <!-- Banking details will be populated here via JavaScript -->
                    </tbody>
                </table>
            </div>
            <div id="bankingPagination" class="pagination">
                <!-- Pagination will be added here -->
            </div>
        </div>
    </div>
</div>

<!-- Include the banking modal templates -->
<?php include_once '../includes/modals/banking-modals.php'; ?>

<?php include_once '../includes/footer.php'; ?>

<!-- Add script to initialize the page and pass employee ID if available -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        initPageModals('banking');
        
        <?php if ($employee_id): ?>
        // If viewing for a specific employee, load their details and banking info
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