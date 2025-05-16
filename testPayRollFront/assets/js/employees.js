/**
 * employees.js - Employee management functions
 */

// Document ready event
document.addEventListener('DOMContentLoaded', function() {
  // Initialize employees page if on that page
  if (window.location.pathname.includes('employees.html')) {
    initEmployeesPage();
  }
  
  // Initialize employee form page if on that page
  if (window.location.pathname.includes('employee-form.html')) {
    initEmployeeFormPage();
  }
});

/**
 * Initialize employees page
 */
function initEmployeesPage() {
  // Require authentication
  if (AuthService) {
    AuthService.requireAuth();
  }
  
  // Load employees data
  loadEmployeesData();
  
  // Initialize event listeners
  initEmployeesPageEvents();
}

/**
 * Load employees data with pagination
 */
async function loadEmployeesData(page = 1, perPage = 10, search = '') {
  try {
    const employeesTable = document.getElementById('employees-table');
    const employeesTableBody = document.getElementById('employees-table-body');
    
    if (!employeesTable || !employeesTableBody) {
      console.error('Employees table elements not found');
      return;
    }
    
    // Show loading
    employeesTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
    
    // Fetch employees data
    const response = await ApiService.getEmployees(page, perPage, search);
    
    if (response.success && response.data) {
      // Clear table
      employeesTableBody.innerHTML = '';
      
      if (response.data.length === 0) {
        employeesTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No employees found</td></tr>';
        return;
      }
      
      // Populate table with employees
      response.data.forEach(employee => {
        const row = document.createElement('tr');
        
        // Format date for display
        const createdAt = Utils.formatDate(employee.created_at, 'date');
        
        row.innerHTML = `
          <td>${employee.employee_id}</td>
          <td>${employee.firstname} ${employee.lastname}</td>
          <td>${employee.contact_number}</td>
          <td>${employee.email}</td>
          <td>${createdAt}</td>
          <td>
            <div class="table-actions">
              <a href="employee-form.html?id=${employee.employee_id}" class="action-btn edit" title="Edit">
                <i class="fas fa-edit"></i>
              </a>
              <button class="action-btn delete" title="Delete" data-id="${employee.employee_id}">
                <i class="fas fa-trash-alt"></i>
              </button>
              <div class="action-dropdown">
                <button class="action-btn more" title="More Actions">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="action-dropdown-menu">
                  <a href="account-form.html?employee_id=${employee.employee_id}" class="dropdown-item">
                    <i class="fas fa-user-tag"></i> Add Account
                  </a>
                  <a href="banking-form.html?employee_id=${employee.employee_id}" class="dropdown-item">
                    <i class="fas fa-university"></i> Add Banking
                  </a>
                  <a href="payslip-form.html?employee_id=${employee.employee_id}" class="dropdown-item">
                    <i class="fas fa-file-invoice-dollar"></i> Generate Payslip
                  </a>
                </div>
              </div>
            </div>
          </td>
        `;
        
        employeesTableBody.appendChild(row);
      });
      
      // Initialize dropdown menus for actions
      initActionDropdowns();
      
      // Initialize pagination
      if (response.pagination) {
        Pagination.init({
          totalItems: response.pagination.total_records,
          itemsPerPage: perPage,
          currentPage: page,
          onPageChange: (newPage) => {
            loadEmployeesData(newPage, perPage, search);
          }
        });
      }
    } else {
      // Show error
      employeesTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Error: ${response.message || 'Failed to load employees'}</td></tr>`;
      Notification.error(response.message || 'Failed to load employees');
    }
  } catch (error) {
    console.error('Error loading employees:', error);
    
    // Show error in table
    const employeesTableBody = document.getElementById('employees-table-body');
    if (employeesTableBody) {
      employeesTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Error: ${error.message || 'Failed to load employees'}</td></tr>`;
    }
    
    Notification.error(error.message || 'Failed to load employees');
  }
}

/**
 * Initialize action dropdowns
 */
function initActionDropdowns() {
  const moreButtons = document.querySelectorAll('.action-btn.more');
  
  moreButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Close all other dropdowns
      document.querySelectorAll('.action-dropdown-menu.active').forEach(menu => {
        if (menu !== button.nextElementSibling) {
          menu.classList.remove('active');
        }
      });
      
      // Toggle current dropdown
      const dropdown = button.nextElementSibling;
      dropdown.classList.toggle('active');
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.action-dropdown-menu.active').forEach(menu => {
      menu.classList.remove('active');
    });
  });
}

/**
 * Initialize employees page events
 */
function initEmployeesPageEvents() {
  // Search functionality
  const searchForm = document.getElementById('employee-search-form');
  
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const searchInput = document.getElementById('employee-search-input');
      if (searchInput) {
        loadEmployeesData(1, 10, searchInput.value);
      }
    });
  }
  
  // Delete employee functionality
  document.addEventListener('click', (e) => {
    if (e.target.closest('.delete')) {
      const deleteButton = e.target.closest('.delete');
      const employeeId = deleteButton.dataset.id;
      
      if (employeeId) {
        confirmDeleteEmployee(employeeId);
      }
    }
  });
  
  // Add employee button
  const addEmployeeButton = document.getElementById('add-employee-btn');
  
  if (addEmployeeButton) {
    addEmployeeButton.addEventListener('click', () => {
      window.location.href = 'employee-form.html';
    });
  }
  
  // Reset filters button
  const resetFiltersButton = document.getElementById('reset-filters-btn');
  
  if (resetFiltersButton) {
    resetFiltersButton.addEventListener('click', () => {
      const searchInput = document.getElementById('employee-search-input');
      
      if (searchInput) searchInput.value = '';
      
      loadEmployeesData();
    });
  }
}

/**
 * Confirm employee deletion
 */
function confirmDeleteEmployee(employeeId) {
  if (typeof Modal !== 'undefined') {
    Modal.confirm({
      title: 'Delete Employee',
      message: 'Are you sure you want to delete this employee? This will also delete all associated accounts, banking details, and payslips. This action cannot be undone.',
      icon: 'warning',
      confirmText: 'Delete',
      confirmClass: 'btn-danger',
      onConfirm: async () => {
        try {
          const response = await ApiService.deleteEmployee(employeeId);
          
          if (response.success) {
            Notification.success('Employee deleted successfully');
            loadEmployeesData(); // Reload employees data
          } else {
            Notification.error(response.message || 'Failed to delete employee');
          }
        } catch (error) {
          console.error('Error deleting employee:', error);
          Notification.error(error.message || 'Failed to delete employee');
        }
        
        Modal.close();
      }
    });
  } else {
    // Fallback to built-in confirm
    if (confirm('Are you sure you want to delete this employee? This will also delete all associated accounts, banking details, and payslips. This action cannot be undone.')) {
      deleteEmployee(employeeId);
    }
  }
}

/**
 * Delete employee
 */
async function deleteEmployee(employeeId) {
  try {
    const response = await ApiService.deleteEmployee(employeeId);
    
    if (response.success) {
      Notification.success('Employee deleted successfully');
      loadEmployeesData(); // Reload employees data
    } else {
      Notification.error(response.message || 'Failed to delete employee');
    }
  } catch (error) {
    console.error('Error deleting employee:', error);
    Notification.error(error.message || 'Failed to delete employee');
  }
}

/**
 * Initialize employee form page
 */
function initEmployeeFormPage() {
  // Require authentication
  if (AuthService) {
    AuthService.requireAuth();
  }
  
  // Check if editing or creating
  const employeeId = Utils.getUrlParam('id');
  const isEditing = !!employeeId;
  
  // Update page title
  const formTitle = document.getElementById('employee-form-title');
  if (formTitle) {
    formTitle.textContent = isEditing ? 'Edit Employee' : 'Add Employee';
  }
  
  // Initialize form
  const employeeForm = document.getElementById('employee-form');
  
  if (employeeForm) {
    // If editing, load employee data
    if (isEditing) {
      loadEmployeeData(employeeId);
    } else {
      // For new employees, disable employee_id field (will be auto-generated)
      const employeeIdField = document.getElementById('employee_id');
      if (employeeIdField) {
        employeeIdField.disabled = true;
        employeeIdField.placeholder = 'Auto-generated for new employees';
      }
    }
    
    // Form submission
    employeeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Validate form
      if (typeof FormValidator !== 'undefined' && !FormValidator.validateForm(employeeForm)) {
        return;
      }
      
      // Get form data
      const formData = typeof FormValidator !== 'undefined' ? 
        FormValidator.getFormData(employeeForm) : 
        Object.fromEntries(new FormData(employeeForm));
      
      // If creating new employee, remove employee_id field (will be auto-generated)
      if (!isEditing) {
        delete formData.employee_id;
      }
      
      try {
        let response;
        
        if (isEditing) {
          // Update employee
          response = await ApiService.updateEmployee(employeeId, formData);
        } else {
          // Create employee
          response = await ApiService.createEmployee(formData);
        }
        
        if (response.success) {
          Notification.success(`Employee ${isEditing ? 'updated' : 'created'} successfully`);
          
          // Redirect to employees page
          setTimeout(() => {
            window.location.href = 'employees.html';
          }, 1000);
        } else {
          Notification.error(response.message || `Failed to ${isEditing ? 'update' : 'create'} employee`);
        }
      } catch (error) {
        console.error('Error saving employee:', error);
        Notification.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} employee`);
      }
    });
    
    // Cancel button
    const cancelButton = employeeForm.querySelector('#cancel-btn');
    if (cancelButton) {
      cancelButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'employees.html';
      });
    }
  }
}

/**
 * Load employee data for editing
 */
async function loadEmployeeData(employeeId) {
  try {
    const response = await ApiService.getEmployee(employeeId);
    
    if (response.success && response.data) {
      const employeeForm = document.getElementById('employee-form');
      
      if (employeeForm) {
        // Populate form with employee data
        if (typeof FormValidator !== 'undefined') {
          FormValidator.setFormData(employeeForm, response.data);
        } else {
          // Manual form population
          for (const key in response.data) {
            const field = employeeForm.querySelector(`[name="${key}"]`);
            if (field) {
              field.value = response.data[key];
            }
          }
        }
        
        // Disable employee ID field (cannot be changed)
        const employeeIdField = document.getElementById('employee_id');
        if (employeeIdField) {
          employeeIdField.disabled = true;
        }
      }
    } else {
      Notification.error(response.message || 'Failed to load employee data');
    }
  } catch (error) {
    console.error('Error loading employee data:', error);
    Notification.error(error.message || 'Failed to load employee data');
  }
}