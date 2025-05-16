/**
 * payslips.js - Payslip management functions
 */

// Document ready event
document.addEventListener('DOMContentLoaded', function() {
  // Initialize payslips page if on that page
  if (window.location.pathname.includes('payslips.html')) {
    initPayslipsPage();
  }
});

/**
 * Initialize payslips page
 */
function initPayslipsPage() {
  // Require authentication
  if (AuthService) {
    AuthService.requireAuth();
  }
  
  // Load payslips data
  loadPayslipsData();
  
  // Initialize event listeners
  initPayslipsPageEvents();
}

/**
 * Load payslips data with pagination
 */
async function loadPayslipsData(page = 1, perPage = 10, search = '', status = '', startDate = '', endDate = '') {
  try {
    const payslipsTable = document.getElementById('payslips-table');
    const payslipsTableBody = document.getElementById('payslips-table-body');
    
    if (!payslipsTable || !payslipsTableBody) {
      console.error('Payslips table elements not found');
      return;
    }
    
    // Show loading
    payslipsTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
    
    // Fetch payslips data
    const response = await ApiService.getPayslips(page, perPage, search, status, startDate, endDate);
    
    if (response.success && response.data) {
      // Clear table
      payslipsTableBody.innerHTML = '';
      
      if (response.data.length === 0) {
        payslipsTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No payslips found</td></tr>';
        return;
      }
      
      // Populate table with payslips
      response.data.forEach(payslip => {
        const row = document.createElement('tr');
        
        // Format date for display
        const paymentDate = Utils.formatDate(payslip.payment_date, 'date');
        
        // Format total salary
        const totalSalary = Utils.formatCurrency(payslip.total_salary);
        
        // PDF links
        const pdfLinks = `
          <a href="${payslip.agent_pdf_path}" target="_blank" class="action-btn view" title="Agent PDF">
            <i class="fas fa-file-pdf"></i> Agent
          </a>
          <a href="${payslip.admin_pdf_path}" target="_blank" class="action-btn view" title="Admin PDF">
            <i class="fas fa-file-pdf"></i> Admin
          </a>
        `;
        
        row.innerHTML = `
          <td>${payslip.payslip_no}</td>
          <td>${payslip.employee_name}</td>
          <td>${paymentDate}</td>
          <td>${totalSalary}</td>
          <td>${Utils.formatStatusBadge(payslip.payment_status)}</td>
          <td>${pdfLinks}</td>
          <td>
            <div class="table-actions">
              <button class="action-btn view" title="View Details" data-id="${payslip.id}">
                <i class="fas fa-eye"></i>
              </button>
              <a href="payslip-form.html?id=${payslip.id}" class="action-btn edit" title="Edit">
                <i class="fas fa-edit"></i>
              </a>
              <button class="action-btn delete" title="Delete" data-id="${payslip.id}">
                <i class="fas fa-trash-alt"></i>
              </button>
              <button class="action-btn regenerate" title="Regenerate PDFs" data-id="${payslip.id}">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </td>
        `;
        
        payslipsTableBody.appendChild(row);
      });
      
      // Initialize pagination
      if (response.pagination) {
        Pagination.init({
          totalItems: response.pagination.total_records,
          itemsPerPage: perPage,
          currentPage: page,
          onPageChange: (newPage) => {
            const statusFilter = document.getElementById('status-filter');
            const startDateFilter = document.getElementById('start-date-filter');
            const endDateFilter = document.getElementById('end-date-filter');
            
            loadPayslipsData(
              newPage,
              perPage,
              search,
              statusFilter ? statusFilter.value : '',
              startDateFilter ? startDateFilter.value : '',
              endDateFilter ? endDateFilter.value : ''
            );
          }
        });
      }
    } else {
      // Show error
      payslipsTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Error: ${response.message || 'Failed to load payslips'}</td></tr>`;
      Notification.error(response.message || 'Failed to load payslips');
    }
  } catch (error) {
    console.error('Error loading payslips:', error);
    
    // Show error in table
    const payslipsTableBody = document.getElementById('payslips-table-body');
    if (payslipsTableBody) {
      payslipsTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Error: ${error.message || 'Failed to load payslips'}</td></tr>`;
    }
    
    Notification.error(error.message || 'Failed to load payslips');
  }
}

/**
 * Initialize payslips page events
 */
function initPayslipsPageEvents() {
  // Search functionality
  const searchForm = document.getElementById('payslip-search-form');
  
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const searchInput = document.getElementById('payslip-search-input');
      const statusFilter = document.getElementById('status-filter');
      const startDateFilter = document.getElementById('start-date-filter');
      const endDateFilter = document.getElementById('end-date-filter');
      
      loadPayslipsData(
        1,
        10,
        searchInput ? searchInput.value : '',
        statusFilter ? statusFilter.value : '',
        startDateFilter ? startDateFilter.value : '',
        endDateFilter ? endDateFilter.value : ''
      );
    });
  }
  
  // Status filter
  const statusFilter = document.getElementById('status-filter');
  
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      const searchInput = document.getElementById('payslip-search-input');
      const startDateFilter = document.getElementById('start-date-filter');
      const endDateFilter = document.getElementById('end-date-filter');
      
      loadPayslipsData(
        1,
        10,
        searchInput ? searchInput.value : '',
        statusFilter.value,
        startDateFilter ? startDateFilter.value : '',
        endDateFilter ? endDateFilter.value : ''
      );
    });
  }
  
  // Date range filters
  const startDateFilter = document.getElementById('start-date-filter');
  const endDateFilter = document.getElementById('end-date-filter');
  
  if (startDateFilter && endDateFilter) {
    startDateFilter.addEventListener('change', () => {
      applyFilters();
    });
    
    endDateFilter.addEventListener('change', () => {
      applyFilters();
    });
    
    function applyFilters() {
      const searchInput = document.getElementById('payslip-search-input');
      const statusFilter = document.getElementById('status-filter');
      
      loadPayslipsData(
        1,
        10,
        searchInput ? searchInput.value : '',
        statusFilter ? statusFilter.value : '',
        startDateFilter.value,
        endDateFilter.value
      );
    }
  }
  
  // Add click event listeners for table actions
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.action-btn');
    if (!target) return;
    
    const payslipId = target.dataset.id;
    if (!payslipId) return;
    
    // Handle different action buttons
    if (target.classList.contains('delete')) {
      confirmDeletePayslip(payslipId);
    } else if (target.classList.contains('regenerate')) {
      confirmRegeneratePDFs(payslipId);
    } else if (target.classList.contains('view')) {
      viewPayslipDetails(payslipId);
    }
  });
  
  // Add payslip button
  const addPayslipButton = document.getElementById('add-payslip-btn');
  
  if (addPayslipButton) {
    addPayslipButton.addEventListener('click', () => {
      window.location.href = 'payslip-form.html';
    });
  }
  
  // Reset filters button
  const resetFiltersButton = document.getElementById('reset-filters-btn');
  
  if (resetFiltersButton) {
    resetFiltersButton.addEventListener('click', () => {
      const searchInput = document.getElementById('payslip-search-input');
      const statusFilter = document.getElementById('status-filter');
      const startDateFilter = document.getElementById('start-date-filter');
      const endDateFilter = document.getElementById('end-date-filter');
      
      if (searchInput) searchInput.value = '';
      if (statusFilter) statusFilter.value = '';
      if (startDateFilter) startDateFilter.value = '';
      if (endDateFilter) endDateFilter.value = '';
      
      loadPayslipsData();
    });
  }
}

/**
 * Confirm payslip deletion
 */
function confirmDeletePayslip(payslipId) {
  if (typeof Modal !== 'undefined') {
    Modal.confirm({
      title: 'Delete Payslip',
      message: 'Are you sure you want to delete this payslip? This action cannot be undone.',
      icon: 'warning',
      confirmText: 'Delete',
      confirmClass: 'btn-danger',
      onConfirm: async () => {
        try {
          const response = await ApiService.deletePayslip(payslipId);
          
          if (response.success) {
            Notification.success('Payslip deleted successfully');
            loadPayslipsData(); // Reload payslips data
          } else {
            Notification.error(response.message || 'Failed to delete payslip');
          }
        } catch (error) {
          console.error('Error deleting payslip:', error);
          Notification.error(error.message || 'Failed to delete payslip');
        }
        
        Modal.close();
      }
    });
  } else {
    // Fallback to built-in confirm
    if (confirm('Are you sure you want to delete this payslip? This action cannot be undone.')) {
      deletePayslip(payslipId);
    }
  }
}

/**
 * Delete payslip
 */
async function deletePayslip(payslipId) {
  try {
    const response = await ApiService.deletePayslip(payslipId);
    
    if (response.success) {
      Notification.success('Payslip deleted successfully');
      loadPayslipsData(); // Reload payslips data
    } else {
      Notification.error(response.message || 'Failed to delete payslip');
    }
  } catch (error) {
    console.error('Error deleting payslip:', error);
    Notification.error(error.message || 'Failed to delete payslip');
  }
}

/**
 * Confirm regenerate PDFs
 */
function confirmRegeneratePDFs(payslipId) {
  if (typeof Modal !== 'undefined') {
    Modal.confirm({
      title: 'Regenerate PDFs',
      message: 'Are you sure you want to regenerate the PDFs for this payslip?',
      icon: 'info',
      confirmText: 'Regenerate',
      confirmClass: 'btn-primary',
      onConfirm: async () => {
        try {
          const response = await ApiService.regeneratePayslipPDF(payslipId);
          
          if (response.success) {
            Notification.success('PDFs regenerated successfully');
            loadPayslipsData(); // Reload payslips data
          } else {
            Notification.error(response.message || 'Failed to regenerate PDFs');
          }
        } catch (error) {
          console.error('Error regenerating PDFs:', error);
          Notification.error(error.message || 'Failed to regenerate PDFs');
        }
        
        Modal.close();
      }
    });
  } else {
    // Fallback to built-in confirm
    if (confirm('Are you sure you want to regenerate the PDFs for this payslip?')) {
      regeneratePDFs(payslipId);
    }
  }
}

/**
 * Regenerate PDFs
 */
async function regeneratePDFs(payslipId) {
  try {
    const response = await ApiService.regeneratePayslipPDF(payslipId);
    
    if (response.success) {
      Notification.success('PDFs regenerated successfully');
      loadPayslipsData(); // Reload payslips data
    } else {
      Notification.error(response.message || 'Failed to regenerate PDFs');
    }
  } catch (error) {
    console.error('Error regenerating PDFs:', error);
    Notification.error(error.message || 'Failed to regenerate PDFs');
  }
}

/**
 * View payslip details
 */
function viewPayslipDetails(payslipId) {
  // Fetch payslip details and show in a modal
  if (typeof Modal !== 'undefined') {
    (async () => {
      try {
        const response = await ApiService.getPayslip(payslipId);
        
        if (response.success && response.data) {
          const payslip = response.data;
          
          // Format dates and amounts for display
          const paymentDate = Utils.formatDate(payslip.payment_date, 'date');
          const cutoffDate = Utils.formatDate(payslip.cutoff_date, 'date');
          const salary = Utils.formatCurrency(payslip.salary);
          const bonus = Utils.formatCurrency(payslip.bonus);
          const totalSalary = Utils.formatCurrency(payslip.total_salary);
          
          // Create modal content
          const content = `
            <div class="payslip-details">
              <div class="detail-row">
                <div class="detail-label">Payslip No:</div>
                <div class="detail-value">${payslip.payslip_no}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Employee:</div>
                <div class="detail-value">${payslip.employee_id} - ${payslip.employee_name}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Bank Details:</div>
                <div class="detail-value">
                  ${payslip.bank_details.preferred_bank}<br>
                  Acc No: ${payslip.bank_details.bank_account_number}<br>
                  Acc Name: ${payslip.bank_details.bank_account_name}
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Payment Date:</div>
                <div class="detail-value">${paymentDate}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Cutoff Date:</div>
                <div class="detail-value">${cutoffDate}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Salary:</div>
                <div class="detail-value">${salary}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Bonus:</div>
                <div class="detail-value">${bonus}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Total Salary:</div>
                <div class="detail-value total-salary">${totalSalary}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value">${Utils.formatStatusBadge(payslip.payment_status)}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Person In Charge:</div>
                <div class="detail-value">${payslip.person_in_charge}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">PDFs:</div>
                <div class="detail-value">
                  <a href="${payslip.agent_pdf_path}" target="_blank" class="btn btn-sm btn-primary">
                    <i class="fas fa-file-pdf"></i> Agent PDF
                  </a>
                  <a href="${payslip.admin_pdf_path}" target="_blank" class="btn btn-sm btn-primary">
                    <i class="fas fa-file-pdf"></i> Admin PDF
                  </a>
                </div>
              </div>
            </div>
            <style>
              .payslip-details {
                margin-top: 1rem;
              }
              .detail-row {
                display: flex;
                margin-bottom: 0.75rem;
                border-bottom: 1px solid #eee;
                padding-bottom: 0.75rem;
              }
              .detail-label {
                font-weight: bold;
                width: 150px;
                color: var(--text-light);
              }
              .detail-value {
                flex: 1;
              }
              .total-salary {
                font-weight: bold;
                color: var(--primary-color);
              }
            </style>
          `;
          
          Modal.open({
            title: `Payslip Details - ${payslip.payslip_no}`,
            content: content,
            size: 'lg',
            confirmText: 'Close',
            showCancel: false
          });
        } else {
          Notification.error(response.message || 'Failed to load payslip details');
        }
      } catch (error) {
        console.error('Error loading payslip details:', error);
        Notification.error(error.message || 'Failed to load payslip details');
      }
    })();
  }
}