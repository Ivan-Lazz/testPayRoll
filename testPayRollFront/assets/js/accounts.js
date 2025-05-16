/**
 * accounts.js - Employee account management functions
 */

// Document ready event
document.addEventListener('DOMContentLoaded', function() {
  // Initialize accounts page if on that page
  if (window.location.pathname.includes('accounts.html')) {
    initAccountsPage();
  }
  
  // Initialize account form page if on that page
  if (window.location.pathname.includes('account-form.html')) {
    initAccountFormPage();
  }
});

/**
 * Initialize accounts page
 */
function initAccountsPage() {
  // Require authentication
  if (AuthService) {
    AuthService.requireAuth();
  }
  
  // Load accounts data
  loadAccountsData();
  
  // Initialize event listeners
  initAccountsPageEvents();
}

/**
 * Load accounts data with pagination
 */
async function loadAccountsData(page = 1, perPage = 10, search = '', type = '') {
  try {
    const accountsTable = document.getElementById('accounts-table');
    const accountsTableBody = document.getElementById('accounts-table-body');
    
    if (!accountsTable || !accountsTableBody) {
      console.error('Accounts table elements not found');
      return;
    }
    
    // Show loading
    accountsTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
    
    // Fetch accounts data
    const response = await ApiService.getAccounts(page, perPage, search, type);
    
    if (response.success && response.data) {
      // Clear table
      accountsTableBody.innerHTML = '';
      
      if (response.data.length === 0) {
        accountsTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No accounts found</td></tr>';
        return;
      }
      
      // Populate table with accounts
      response.data.forEach(account => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${account.account_id}</td>
          <td>${account.employee_id}</td>
          <td>${account.firstname} ${account.lastname}</td>
          <td>${account.account_email}</td>
          <td>${account.account_type}</td>
          <td>${Utils.formatStatusBadge(account.account_status)}</td>
          <td>
            <div class="table-actions">
              <a href="account-form.html?id=${account.account_id}" class="action-btn edit" title="Edit">
                <i class="fas fa-edit"></i>
              </a>
              <button class="action-btn delete" title="Delete" data-id="${account.account_id}">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </td>
        `;
        
        accountsTableBody.appendChild(row);
      });
      
      // Initialize pagination
      if (response.pagination) {
        Pagination.init({
          totalItems: response.pagination.total_records,
          itemsPerPage: perPage,
          currentPage: page,
          onPageChange: (newPage) => {
            const typeFilter = document.getElementById('account-type-filter');
            const typeValue = typeFilter ? typeFilter.value : '';
            loadAccountsData(newPage, perPage, search, typeValue);
          }
        });
      }
    } else {
      // Show error
      accountsTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Error: ${response.message || 'Failed to load accounts'}</td></tr>`;
      Notification.error(response.message || 'Failed to load accounts');
    }
  } catch (error) {
    console.error('Error loading accounts:', error);
    
    // Show error in table
    const accountsTableBody = document.getElementById('accounts-table-body');
    if (accountsTableBody) {
      accountsTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Error: ${error.message || 'Failed to load accounts'}</td></tr>`;
    }
    
    Notification.error(error.message || 'Failed to load accounts');
  }
}

/**
 * Initialize accounts page events
 */
function initAccountsPageEvents() {
  // Search functionality
  const searchForm = document.getElementById('account-search-form');
  
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const searchInput = document.getElementById('account-search-input');
      const typeFilter = document.getElementById('account-type-filter');
      
      if (searchInput) {
        loadAccountsData(1, 10, searchInput.value, typeFilter ? typeFilter.value : '');
      }
    });
  }
  
  // Account type filter
  const accountTypeFilter = document.getElementById('account-type-filter');
  
  if (accountTypeFilter) {
    accountTypeFilter.addEventListener('change', () => {
      const searchInput = document.getElementById('account-search-input');
      loadAccountsData(1, 10, searchInput ? searchInput.value : '', accountTypeFilter.value);
    });
  }
  
  // Delete account functionality
  document.addEventListener('click', (e) => {
    if (e.target.closest('.delete')) {
      const deleteButton = e.target.closest('.delete');
      const accountId = deleteButton.dataset.id;
      
      if (accountId) {
        confirmDeleteAccount(accountId);
      }
    }
  });
  
  // Add account button
  const addAccountButton = document.getElementById('add-account-btn');
  
  if (addAccountButton) {
    addAccountButton.addEventListener('click', () => {
      window.location.href = 'account-form.html';
    });
  }
  
  // Reset filters button
  const resetFiltersButton = document.getElementById('reset-filters-btn');
  
  if (resetFiltersButton) {
    resetFiltersButton.addEventListener('click', () => {
      const searchInput = document.getElementById('account-search-input');
      const typeFilter = document.getElementById('account-type-filter');
      
      if (searchInput) searchInput.value = '';
      if (typeFilter) typeFilter.value = '';
      
      loadAccountsData();
    });
  }
}

/**
 * Confirm account deletion
 */
function confirmDeleteAccount(accountId) {
  if (typeof Modal !== 'undefined') {
    Modal.confirm({
      title: 'Delete Account',
      message: 'Are you sure you want to delete this account? This action cannot be undone.',
      icon: 'warning',
      confirmText: 'Delete',
      confirmClass: 'btn-danger',
      onConfirm: async () => {
        try {
          const response = await ApiService.deleteAccount(accountId);
          
          if (response.success) {
            Notification.success('Account deleted successfully');
            loadAccountsData(); // Reload accounts data
          } else {
            Notification.error(response.message || 'Failed to delete account');
          }
        } catch (error) {
          console.error('Error deleting account:', error);
          Notification.error(error.message || 'Failed to delete account');
        }
        
        Modal.close();
      }
    });
  } else {
    // Fallback to built-in confirm
    if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      deleteAccount(accountId);
    }
  }
}

/**
 * Delete account
 */
async function deleteAccount(accountId) {
  try {
    const response = await ApiService.deleteAccount(accountId);
    
    if (response.success) {
      Notification.success('Account deleted successfully');
      loadAccountsData(); // Reload accounts data
    } else {
      Notification.error(response.message || 'Failed to delete account');
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    Notification.error(error.message || 'Failed to delete account');
  }
}

/**
 * Initialize account form page
 */
function initAccountFormPage() {
  // Require authentication
  if (AuthService) {
    AuthService.requireAuth();
  }
  
  // Check if editing or creating
  const accountId = Utils.getUrlParam('id');
  const employeeId = Utils.getUrlParam('employee_id');
  const isEditing = !!accountId;
  
  // Update page title
  const formTitle = document.getElementById('account-form-title');
  if (formTitle) {
    formTitle.textContent = isEditing ? 'Edit Employee Account' : 'Add Employee Account';
  }
  
  // Initialize form
  const accountForm = document.getElementById('account-form');
  
  if (accountForm) {
    // Load employees for select dropdown
    loadEmployeesForSelect();
    
    // If editing, load account data
    if (isEditing) {
      loadAccountData(accountId);
    } else if (employeeId) {
      // If creating with employee ID, set the employee
      const employeeSelect = document.getElementById('employee_id');
      if (employeeSelect) {
        employeeSelect.value = employeeId;
        // Trigger change event to load employee details
        employeeSelect.dispatchEvent(new Event('change'));
      }
    }
    
    // Handle employee select change
    const employeeSelect = document.getElementById('employee_id');
    if (employeeSelect) {
      employeeSelect.addEventListener('change', async () => {
        const selectedEmployeeId = employeeSelect.value;
        
        if (selectedEmployeeId) {
          try {
            const response = await ApiService.getEmployee(selectedEmployeeId);
            
            if (response.success && response.data) {
              const firstNameField = document.getElementById('firstname');
              const lastNameField = document.getElementById('lastname');
              
              if (firstNameField) firstNameField.value = response.data.firstname;
              if (lastNameField) lastNameField.value = response.data.lastname;
            }
          } catch (error) {
            console.error('Error fetching employee details:', error);
          }
        }
      });
    }
    
    // Form submission
    accountForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Validate form
      if (typeof FormValidator !== 'undefined' && !FormValidator.validateForm(accountForm)) {
        return;
      }
      
      // Get form data
      const formData = typeof FormValidator !== 'undefined' ? 
        FormValidator.getFormData(accountForm) : 
        Object.fromEntries(new FormData(accountForm));
      
      // Remove firstname and lastname fields from form data
      delete formData.firstname;
      delete formData.lastname;
      
      try {
        let response;
        
        if (isEditing) {
          // Update account
          response = await ApiService.updateAccount(accountId, formData);
        } else {
          // Create account
          response = await ApiService.createAccount(formData);
        }
        
        if (response.success) {
          Notification.success(`Employee account ${isEditing ? 'updated' : 'created'} successfully`);
          
          // Redirect to accounts page
          setTimeout(() => {
            window.location.href = 'accounts.html';
          }, 1000);
        } else {
          Notification.error(response.message || `Failed to ${isEditing ? 'update' : 'create'} employee account`);
        }
      } catch (error) {
        console.error('Error saving employee account:', error);
        Notification.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} employee account`);
      }
    });
    
    // Cancel button
    const cancelButton = accountForm.querySelector('#cancel-btn');
    if (cancelButton) {
      cancelButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'accounts.html';
      });
    }
  }
}

/**
 * Load account data for editing
 */
async function loadAccountData(accountId) {
  try {
    const response = await ApiService.getAccount(accountId);
    
    if (response.success && response.data) {
      const accountForm = document.getElementById('account-form');
      const account = response.data;
      
      if (accountForm) {
        // Populate form with account data
        if (typeof FormValidator !== 'undefined') {
          FormValidator.setFormData(accountForm, account);
        } else {
          // Manual form population
          for (const key in account) {
            const field = accountForm.querySelector(`[name="${key}"]`);
            if (field) {
              field.value = account[key];
            }
          }
        }
        
        // Fetch employee details for first name and last name
        try {
          const employeeResponse = await ApiService.getEmployee(account.employee_id);
          
          if (employeeResponse.success && employeeResponse.data) {
            const firstNameField = document.getElementById('firstname');
            const lastNameField = document.getElementById('lastname');
            
            if (firstNameField) firstNameField.value = employeeResponse.data.firstname;
            if (lastNameField) lastNameField.value = employeeResponse.data.lastname;
          }
        } catch (error) {
          console.error('Error fetching employee details:', error);
        }
        
        // If editing, password is optional
        const passwordField = accountForm.querySelector('[name="account_password"]');
        if (passwordField) {
          passwordField.removeAttribute('required');
        }
      }
    } else {
      Notification.error(response.message || 'Failed to load account data');
    }
  } catch (error) {
    console.error('Error loading account data:', error);
    Notification.error(error.message || 'Failed to load account data');
  }
}

/**
 * Load employees for select dropdown
 */
async function loadEmployeesForSelect() {
  try {
    const employeeSelect = document.getElementById('employee_id');
    
    if (!employeeSelect) {
      console.error('Employee select not found');
      return;
    }
    
    // Fetch employees
    const response = await ApiService.getEmployees(1, 100);
    
    if (response.success && response.data) {
      // Clear select
      while (employeeSelect.options.length > 1) {
        employeeSelect.remove(1);
      }
      
      // Add options
      response.data.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.employee_id;
        option.textContent = `${employee.employee_id} - ${employee.firstname} ${employee.lastname}`;
        employeeSelect.appendChild(option);
      });
    } else {
      Notification.error(response.message || 'Failed to load employees');
    }
  } catch (error) {
    console.error('Error loading employees:', error);
    Notification.error(error.message || 'Failed to load employees');
  }
}