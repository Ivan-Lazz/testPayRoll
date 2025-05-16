/**
 * banking.js - Banking details management functions
 */

// Document ready event
document.addEventListener('DOMContentLoaded', function() {
  // Initialize banking page if on that page
  if (window.location.pathname.includes('banking.html')) {
    initBankingPage();
  }
  
  // Initialize banking form page if on that page
  if (window.location.pathname.includes('banking-form.html')) {
    initBankingFormPage();
  }
});

/**
 * Initialize banking page
 */
function initBankingPage() {
  // Require authentication
  if (AuthService) {
    AuthService.requireAuth();
  }
  
  // Load banking data
  loadBankingData();
  
  // Initialize event listeners
  initBankingPageEvents();
}

/**
 * Load banking data with pagination
 */
async function loadBankingData(page = 1, perPage = 10, search = '') {
  try {
    const bankingTable = document.getElementById('banking-table');
    const bankingTableBody = document.getElementById('banking-table-body');
    
    if (!bankingTable || !bankingTableBody) {
      console.error('Banking table elements not found');
      return;
    }
    
    // Show loading
    bankingTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
    
    // Fetch banking data
    const response = await ApiService.getBankingDetails(page, perPage, search);
    
    if (response.success && response.data) {
      // Clear table
      bankingTableBody.innerHTML = '';
      
      if (response.data.length === 0) {
        bankingTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No banking details found</td></tr>';
        return;
      }
      
      // Populate table with banking details
      response.data.forEach(banking => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${banking.id}</td>
          <td>${banking.employee_id}</td>
          <td>${banking.firstname} ${banking.lastname}</td>
          <td>${banking.preferred_bank}</td>
          <td>${banking.bank_account_number}</td>
          <td>${banking.bank_account_name}</td>
          <td>
            <div class="table-actions">
              <a href="banking-form.html?id=${banking.id}" class="action-btn edit" title="Edit">
                <i class="fas fa-edit"></i>
              </a>
              <button class="action-btn delete" title="Delete" data-id="${banking.id}">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </td>
        `;
        
        bankingTableBody.appendChild(row);
      });
      
      // Initialize pagination
      if (response.pagination) {
        Pagination.init({
          totalItems: response.pagination.total_records,
          itemsPerPage: perPage,
          currentPage: page,
          onPageChange: (newPage) => {
            loadBankingData(newPage, perPage, search);
          }
        });
      }
    } else {
      // Show error
      bankingTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Error: ${response.message || 'Failed to load banking details'}</td></tr>`;
      Notification.error(response.message || 'Failed to load banking details');
    }
  } catch (error) {
    console.error('Error loading banking details:', error);
    
    // Show error in table
    const bankingTableBody = document.getElementById('banking-table-body');
    if (bankingTableBody) {
      bankingTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Error: ${error.message || 'Failed to load banking details'}</td></tr>`;
    }
    
    Notification.error(error.message || 'Failed to load banking details');
  }
}

/**
 * Initialize banking page events
 */
function initBankingPageEvents() {
  // Search functionality
  const searchForm = document.getElementById('banking-search-form');
  
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const searchInput = document.getElementById('banking-search-input');
      if (searchInput) {
        loadBankingData(1, 10, searchInput.value);
      }
    });
  }
  
  // Delete banking detail functionality
  document.addEventListener('click', (e) => {
    if (e.target.closest('.delete')) {
      const deleteButton = e.target.closest('.delete');
      const bankingId = deleteButton.dataset.id;
      
      if (bankingId) {
        confirmDeleteBankingDetail(bankingId);
      }
    }
  });
  
  // Add banking detail button
  const addBankingButton = document.getElementById('add-banking-btn');
  
  if (addBankingButton) {
    addBankingButton.addEventListener('click', () => {
      window.location.href = 'banking-form.html';
    });
  }
  
  // Reset filters button
  const resetFiltersButton = document.getElementById('reset-filters-btn');
  
  if (resetFiltersButton) {
    resetFiltersButton.addEventListener('click', () => {
      const searchInput = document.getElementById('banking-search-input');
      
      if (searchInput) searchInput.value = '';
      
      loadBankingData();
    });
  }
}

/**
 * Confirm banking detail deletion
 */
function confirmDeleteBankingDetail(bankingId) {
  if (typeof Modal !== 'undefined') {
    Modal.confirm({
      title: 'Delete Banking Detail',
      message: 'Are you sure you want to delete this banking detail? This action cannot be undone.',
      icon: 'warning',
      confirmText: 'Delete',
      confirmClass: 'btn-danger',
      onConfirm: async () => {
        try {
          const response = await ApiService.deleteBankingDetail(bankingId);
          
          if (response.success) {
            Notification.success('Banking detail deleted successfully');
            loadBankingData(); // Reload banking data
          } else {
            Notification.error(response.message || 'Failed to delete banking detail');
          }
        } catch (error) {
          console.error('Error deleting banking detail:', error);
          Notification.error(error.message || 'Failed to delete banking detail');
        }
        
        Modal.close();
      }
    });
  } else {
    // Fallback to built-in confirm
    if (confirm('Are you sure you want to delete this banking detail? This action cannot be undone.')) {
      deleteBankingDetail(bankingId);
    }
  }
}

/**
 * Delete banking detail
 */
async function deleteBankingDetail(bankingId) {
  try {
    const response = await ApiService.deleteBankingDetail(bankingId);
    
    if (response.success) {
      Notification.success('Banking detail deleted successfully');
      loadBankingData(); // Reload banking data
    } else {
      Notification.error(response.message || 'Failed to delete banking detail');
    }
  } catch (error) {
    console.error('Error deleting banking detail:', error);
    Notification.error(error.message || 'Failed to delete banking detail');
  }
}

/**
 * Initialize banking form page
 */
function initBankingFormPage() {
  // Require authentication
  if (AuthService) {
    AuthService.requireAuth();
  }
  
  // Check if editing or creating
  const bankingId = Utils.getUrlParam('id');
  const employeeId = Utils.getUrlParam('employee_id');
  const isEditing = !!bankingId;
  
  // Update page title
  const formTitle = document.getElementById('banking-form-title');
  if (formTitle) {
    formTitle.textContent = isEditing ? 'Edit Banking Detail' : 'Add Banking Detail';
  }
  
  // Initialize form
  const bankingForm = document.getElementById('banking-form');
  
  if (bankingForm) {
    // Load employees for select dropdown
    loadEmployeesForSelect();
    
    // If editing, load banking data
    if (isEditing) {
      loadBankingDetailData(bankingId);
    } else if (employeeId) {
      // If creating with employee ID, set the employee
      const employeeSelect = document.getElementById('employee_id');
      if (employeeSelect) {
        employeeSelect.value = employeeId;
        // Trigger change event to load employee details
        employeeSelect.dispatchEvent(new Event('change'));
        
        // Disable select if employee ID is provided
        employeeSelect.disabled = true;
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
              const employeeNameField = document.getElementById('employee_name');
              
              if (employeeNameField) {
                employeeNameField.value = `${response.data.firstname} ${response.data.lastname}`;
              }
            }
          } catch (error) {
            console.error('Error fetching employee details:', error);
          }
        }
      });
    }
    
    // Form submission
    bankingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Validate form
      if (typeof FormValidator !== 'undefined' && !FormValidator.validateForm(bankingForm)) {
        return;
      }
      
      // Get form data
      const formData = typeof FormValidator !== 'undefined' ? 
        FormValidator.getFormData(bankingForm) : 
        Object.fromEntries(new FormData(bankingForm));
      
      // Remove employee_name field from form data (it's only for display)
      delete formData.employee_name;
      
      try {
        let response;
        
        if (isEditing) {
          // Update banking detail
          response = await ApiService.updateBankingDetail(bankingId, formData);
        } else {
          // Create banking detail
          response = await ApiService.createBankingDetail(formData);
        }
        
        if (response.success) {
          Notification.success(`Banking detail ${isEditing ? 'updated' : 'created'} successfully`);
          
          // Redirect to banking page
          setTimeout(() => {
            window.location.href = 'banking.html';
          }, 1000);
        } else {
          Notification.error(response.message || `Failed to ${isEditing ? 'update' : 'create'} banking detail`);
        }
      } catch (error) {
        console.error('Error saving banking detail:', error);
        Notification.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} banking detail`);
      }
    });
    
    // Cancel button
    const cancelButton = bankingForm.querySelector('#cancel-btn');
    if (cancelButton) {
      cancelButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'banking.html';
      });
    }
  }
}

/**
 * Load banking detail data for editing
 */
async function loadBankingDetailData(bankingId) {
  try {
    const response = await ApiService.getBankingDetail(bankingId);
    
    if (response.success && response.data) {
      const bankingForm = document.getElementById('banking-form');
      const bankingDetail = response.data;
      
      if (bankingForm) {
        // Populate form with banking data
        if (typeof FormValidator !== 'undefined') {
          FormValidator.setFormData(bankingForm, bankingDetail);
        } else {
          // Manual form population
          for (const key in bankingDetail) {
            const field = bankingForm.querySelector(`[name="${key}"]`);
            if (field) {
              field.value = bankingDetail[key];
            }
          }
        }
        
        // Set employee name
        const employeeNameField = document.getElementById('employee_name');
        if (employeeNameField) {
          employeeNameField.value = `${bankingDetail.firstname} ${bankingDetail.lastname}`;
        }
        
        // Disable employee select for editing
        const employeeSelect = document.getElementById('employee_id');
        if (employeeSelect) {
          employeeSelect.disabled = true;
        }
      }
    } else {
      Notification.error(response.message || 'Failed to load banking detail data');
    }
  } catch (error) {
    console.error('Error loading banking detail data:', error);
    Notification.error(error.message || 'Failed to load banking detail data');
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