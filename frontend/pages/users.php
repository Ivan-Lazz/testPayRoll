<?php
// Users page
// Check if user has admin role
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    // Redirect to dashboard if not admin
    header('Location: ../index.php');
    exit;
}

// Set page script
$page_script = "users.js";
$page_title = "User Management";
include_once '../includes/header.php';
?>

<div class="main-content">
    <div class="header">
        <h1><i class="fas fa-users"></i> User Management</h1>
        <div class="user-info">
            <span><?php echo $_SESSION['firstname'] . ' ' . $_SESSION['lastname']; ?> (<?php echo $_SESSION['role']; ?>)</span>
            <a href="../logout.php" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
        </div>
    </div>

    <div class="card">
        <div class="card-header">
            <h2>Users List</h2>
            <button id="openCreateUserModalBtn" class="btn btn-primary" data-open-modal="createUserModal">
                <i class="fas fa-plus"></i> Add New User
            </button>
        </div>
        <div class="card-body">
            <div id="alert-container"></div>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="usersList">
                        <!-- User list will be populated here via JavaScript -->
                    </tbody>
                </table>
            </div>
            <div id="usersPagination" class="pagination">
                <!-- Pagination will be added here -->
            </div>
        </div>
    </div>
</div>

<!-- Include the user modal templates -->
<?php include_once '../includes/modals/user-modals.php'; ?>

<?php include_once '../includes/footer.php'; ?>

<!-- Add a small script to set the page type for modal initialization -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        initPageModals('users');
    });
</script>