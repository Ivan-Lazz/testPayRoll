<?php
// Dashboard page
$page_title = "Dashboard";
include_once 'includes/header.php';



?>

<div class="dashboard">
    <div class="card">
        <div class="card-header">
            <h2>Dashboard</h2>
        </div>
        <div class="card-body">
            <div class="dashboard-stats">
                <div class="stats-container" id="dashboard-stats">
                    <div class="loading">
                        <div class="loader"></div>
                    </div>
                </div>
            </div>

            <div class="dashboard-recent">
                <h3 class="mt-20 mb-20">Recent Payslips</h3>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Payslip No</th>
                                <th>Employee</th>
                                <th>Date</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="recent-payslips">
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
                
                <div class="text-right mt-20">
                    <a href="pages/payslips.php" class="btn btn-primary">View All Payslips</a>
                </div>
            </div>
        </div>
    </div>
</div>

<?php
// Set page script
$page_script = "assets/js/dashboard.js";
include_once 'includes/footer.php';
?>