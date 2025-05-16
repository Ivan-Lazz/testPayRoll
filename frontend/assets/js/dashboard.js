/**
 * Dashboard JavaScript
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load dashboard data
    loadDashboardStats();
    loadRecentPayslips();
});

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
    const statsContainer = document.getElementById('dashboard-stats');
    
    try {
        // Fetch employees count
        const employeesResponse = await apiRequest('employees');
        const employeesCount = employeesResponse.data.length;
        
        // Fetch payslips count
        const payslipsResponse = await apiRequest('payslips');
        const payslipsCount = payslipsResponse.data.length;
        
        // Calculate total paid amount and pending count
        let totalPaid = 0;
        let pendingCount = 0;
        
        payslipsResponse.data.forEach(payslip => {
            if (payslip.payment_status === 'Paid') {
                totalPaid += parseFloat(payslip.total_salary);
            } else if (payslip.payment_status === 'Pending') {
                pendingCount++;
            }
        });
        
        // Create stats HTML
        const statsHTML = `
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="fas fa-user-tie"></i>
                </div>
                <div class="stat-info">
                    <h3>${employeesCount}</h3>
                    <p>Total Employees</p>
                </div>
            </div>
            
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="fas fa-file-invoice-dollar"></i>
                </div>
                <div class="stat-info">
                    <h3>${payslipsCount}</h3>
                    <p>Total Payslips</p>
                </div>
            </div>
            
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="stat-info">
                    <h3>${formatCurrency(totalPaid)}</h3>
                    <p>Total Paid Amount</p>
                </div>
            </div>
            
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-info">
                    <h3>${pendingCount}</h3>
                    <p>Pending Payments</p>
                </div>
            </div>
        `;
        
        // Update container
        statsContainer.innerHTML = statsHTML;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        statsContainer.innerHTML = '<p class="text-center">Error loading statistics. Please try again.</p>';
    }
}

/**
 * Load recent payslips
 */
async function loadRecentPayslips() {
    const recentPayslips = document.getElementById('recent-payslips');
    
    try {
        // Fetch payslips
        const response = await apiRequest('payslips');
        
        // Sort by date (newest first) and take top 5
        const payslips = response.data
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
        
        if (payslips.length === 0) {
            recentPayslips.innerHTML = '<tr><td colspan="6" class="text-center">No payslips found</td></tr>';
            return;
        }
        
        // Create payslips HTML
        let payslipsHTML = '';
        
        payslips.forEach(payslip => {
            // Determine status class
            let statusClass = '';
            switch (payslip.payment_status) {
                case 'Paid':
                    statusClass = 'text-success';
                    break;
                case 'Pending':
                    statusClass = 'text-warning';
                    break;
                case 'Cancelled':
                    statusClass = 'text-danger';
                    break;
                default:
                    statusClass = '';
            }
            
            payslipsHTML += `
                <tr>
                    <td>${payslip.payslip_no}</td>
                    <td>${payslip.employee_name}</td>
                    <td>${formatDate(payslip.payment_date)}</td>
                    <td>${formatCurrency(payslip.total_salary)}</td>
                    <td class="${statusClass}">${payslip.payment_status}</td>
                    <td>
                        <a href="pages/payslips.php?view=${payslip.id}" class="btn btn-primary">View</a>
                    </td>
                </tr>
            `;
        });
        
        // Update container
        recentPayslips.innerHTML = payslipsHTML;
    } catch (error) {
        console.error('Error loading recent payslips:', error);
        recentPayslips.innerHTML = '<tr><td colspan="6" class="text-center">Error loading payslips. Please try again.</td></tr>';
    }
}