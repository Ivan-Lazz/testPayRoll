/**
 * dashboard.js - Dashboard functionality
 * This file handles loading and displaying dashboard statistics and data
 */

// Document ready event
document.addEventListener('DOMContentLoaded', function() {
  // Initialize dashboard page if on that page
  if (window.location.pathname.includes('dashboard.html') || window.location.pathname.endsWith('/')) {
    initDashboardPage();
  }
});

/**
 * Initialize dashboard page
 */
function initDashboardPage() {
  // Require authentication
  if (AuthService) {
    AuthService.requireAuth();
  }
  
  // Load dashboard data
  loadDashboardData();
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
  try {
    // Load statistics
    await loadStatistics();
    
    // Load recent payslips
    await loadRecentPayslips();
    
    // Update last activity
    updateLastActivity();
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    Notification.error('Error loading dashboard data. Please refresh the page to try again.');
  }
}

/**
 * Load dashboard statistics
 */
async function loadStatistics() {
  try {
    // Get statistics elements
    const employeeCount = document.getElementById('employee-count');
    const payslipCount = document.getElementById('payslip-count');
    const userCount = document.getElementById('user-count');
    
    // If elements don't exist, return
    if (!employeeCount || !payslipCount || !userCount) {
      console.error('Statistics elements not found');
      return;
    }
    
    // Show loading
    employeeCount.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    payslipCount.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    userCount.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    // Load employee count
    try {
      const employeesResponse = await ApiService.getEmployees(1, 1);
      if (employeesResponse.success && employeesResponse.pagination) {
        employeeCount.textContent = employeesResponse.pagination.total_records;
      } else {
        employeeCount.textContent = 'Error';
      }
    } catch (error) {
      console.error('Error loading employee count:', error);
      employeeCount.textContent = 'Error';
    }
    
    // Load payslip count
    try {
      const payslipsResponse = await ApiService.getPayslips(1, 1);
      if (payslipsResponse.success && payslipsResponse.pagination) {
        payslipCount.textContent = payslipsResponse.pagination.total_records;
      } else {
        payslipCount.textContent = 'Error';
      }
    } catch (error) {
      console.error('Error loading payslip count:', error);
      payslipCount.textContent = 'Error';
    }
    
    // Load user count
    try {
      const usersResponse = await ApiService.getUsers(1, 1);
      if (usersResponse.success && usersResponse.pagination) {
        userCount.textContent = usersResponse.pagination.total_records;
      } else {
        userCount.textContent = 'Error';
      }
    } catch (error) {
      console.error('Error loading user count:', error);
      userCount.textContent = 'Error';
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
    Notification.error('Error loading dashboard statistics');
  }
}

/**
 * Load recent payslips
 */
async function loadRecentPayslips() {
  try {
    const recentPayslipsContainer = document.getElementById('recent-payslips');
    
    if (!recentPayslipsContainer) {
      console.error('Recent payslips container not found');
      return;
    }
    
    // Show loading
    recentPayslipsContainer.innerHTML = '<p class="text-center">Loading recent payslips...</p>';
    
    // Fetch recent payslips
    const response = await ApiService.getPayslips(1, 5); // Get 5 most recent payslips
    
    if (response.success && response.data) {
      // Check if there are any payslips
      if (response.data.length === 0) {
        recentPayslipsContainer.innerHTML = '<p class="text-center">No payslips found</p>';
        return;
      }
      
      // Create HTML for recent payslips
      let html = '<div class="recent-payslips">';
      
      response.data.forEach(payslip => {
        // Format date and amount
        const paymentDate = Utils.formatDate(payslip.payment_date, 'date');
        const totalSalary = Utils.formatCurrency(payslip.total_salary);
        
        html += `
          <div class="payslip-item">
            <div class="payslip-info">
              <div class="payslip-employee">${payslip.employee_name}</div>
              <div class="payslip-details">
                <span class="payslip-number">${payslip.payslip_no}</span>
                <span class="payslip-date">${paymentDate}</span>
                <span class="payslip-status">${Utils.formatStatusBadge(payslip.payment_status)}</span>
              </div>
            </div>
            <div class="payslip-amount">${totalSalary}</div>
          </div>
        `;
      });
      
      html += '</div>';
      
      recentPayslipsContainer.innerHTML = html;
      
      // Add click event to payslip items to navigate to payslip details
      const payslipItems = recentPayslipsContainer.querySelectorAll('.payslip-item');
      payslipItems.forEach((item, index) => {
        item.addEventListener('click', () => {
          const payslipId = response.data[index].id;
          window.location.href = `payslip-form.html?id=${payslipId}`;
        });
      });
    } else {
      recentPayslipsContainer.innerHTML = `<p class="text-center">Error: ${response.message || 'Failed to load recent payslips'}</p>`;
    }
  } catch (error) {
    console.error('Error loading recent payslips:', error);
    
    // Show error
    const recentPayslipsContainer = document.getElementById('recent-payslips');
    if (recentPayslipsContainer) {
      recentPayslipsContainer.innerHTML = `<p class="text-center">Error: ${error.message || 'Failed to load recent payslips'}</p>`;
    }
  }
}

/**
 * Update last activity section with recent system activities
 */
function updateLastActivity() {
  // This function would ideally fetch recent system activity from an API endpoint
  // For now, it's just setting some static data since we don't have that API endpoint
  
  // Example of how it would work with an actual API:
  /*
  try {
    const response = await ApiService.getRecentActivities(5);
    
    if (response.success && response.data) {
      // Update UI with recent activities
    }
  } catch (error) {
    console.error('Error loading recent activities:', error);
  }
  */
  
  // Just update the timestamp for "Last updated" on the System Version card
  const systemVersionTime = document.querySelector('.activity-item:nth-child(2) .activity-time');
  if (systemVersionTime) {
    systemVersionTime.textContent = `Last updated: ${Utils.formatDate(new Date(), 'datetime')}`;
  }
}

/**
 * Initialize user data on dashboard
 */
function initUserData() {
  // Get user data from localStorage
  const userData = AuthService.getCurrentUser();
  
  if (userData) {
    // Update welcome message
    const welcomeMessage = document.querySelector('.dashboard-subtitle');
    if (welcomeMessage) {
      welcomeMessage.textContent = `Welcome back, ${userData.firstname} ${userData.lastname}!`;
    }
  }
}

/**
 * Handle quick link clicks
 */
document.addEventListener('click', function(e) {
  const quickLink = e.target.closest('.quick-link');
  
  if (quickLink) {
    const href = quickLink.getAttribute('href');
    
    if (href) {
      window.location.href = href;
    }
  }
});