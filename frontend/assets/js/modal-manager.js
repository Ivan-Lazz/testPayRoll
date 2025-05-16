/**
 * Enhanced Modal Implementation for Pay Slip Generator System
 * 
 * This file provides comprehensive modal functionality for all forms across
 * the application including users, employees, banking details, and accounts.
 */

/**
 * Modal Manager - Handles creation, opening, and closing of modals
 */
class ModalManager {
  constructor() {
    // Store references to active modals
    this.activeModals = {};
    
    // Initialize event listeners for global modal behaviors
    this.initGlobalListeners();
  }

  /**
   * Initialize global event listeners for modal behavior
   */
  initGlobalListeners() {
    // Close modal when clicking outside content (on backdrop)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal') && e.target.classList.contains('show')) {
        this.closeModal(e.target.id);
      }
    });

    // Handle Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.querySelector('.modal.show')) {
        const activeModal = document.querySelector('.modal.show');
        if (activeModal) {
          this.closeModal(activeModal.id);
        }
      }
    });
  }

  /**
   * Register a modal for management
   * @param {string} modalId - ID of the modal element
   * @param {object} options - Configuration options for the modal
   * @param {function} options.onOpen - Callback function when modal opens
   * @param {function} options.onClose - Callback function when modal closes
   * @param {function} options.onSave - Callback function for save/submit action
   */
  register(modalId, options = {}) {
    const modal = document.getElementById(modalId);
    
    if (!modal) {
      console.error(`Modal element with ID "${modalId}" not found.`);
      return;
    }
    
    // Store modal reference and options
    this.activeModals[modalId] = {
      element: modal,
      options: options
    };
    
    // Find buttons in the modal
    const openButtons = document.querySelectorAll(`[data-open-modal="${modalId}"]`);
    const closeButtons = modal.querySelectorAll('.modal-close, [data-dismiss="modal"]');
    const saveButton = modal.querySelector('[data-modal-save]');
    
    // Add event listeners to open buttons
    openButtons.forEach(btn => {
      btn.addEventListener('click', () => this.openModal(modalId));
    });
    
    // Add event listeners to close buttons
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.closeModal(modalId));
    });
    
    // Add event listener to save button if it exists
    if (saveButton && options.onSave) {
      saveButton.addEventListener('click', options.onSave);
    }
    
    // Handle form submission if there's a form
    const form = modal.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (options.onSave) {
          options.onSave(e);
        }
      });
    }
  }

  /**
   * Open a registered modal
   * @param {string} modalId - ID of the modal to open
   * @param {object} data - Optional data to pass to the onOpen callback
   */
  openModal(modalId, data = {}) {
    const modalInfo = this.activeModals[modalId];
    
    if (!modalInfo) {
      console.error(`Modal "${modalId}" is not registered.`);
      return;
    }
    
    // Show the modal
    modalInfo.element.classList.add('show');
    
    // Call onOpen callback if defined
    if (modalInfo.options.onOpen) {
      modalInfo.options.onOpen(data);
    }
    
    // Find the first input in the form and focus it
    const firstInput = modalInfo.element.querySelector('form input:not([type="hidden"]), form select');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  /**
   * Close a registered modal
   * @param {string} modalId - ID of the modal to close
   */
  closeModal(modalId) {
    const modalInfo = this.activeModals[modalId];
    
    if (!modalInfo) {
      // It might be a direct element ID, try to find it
      const element = document.getElementById(modalId);
      if (element && element.classList.contains('modal')) {
        element.classList.remove('show');
        return;
      }
      
      console.error(`Modal "${modalId}" is not registered.`);
      return;
    }
    
    // Hide the modal
    modalInfo.element.classList.remove('show');
    
    // Call onClose callback if defined
    if (modalInfo.options.onClose) {
      modalInfo.options.onClose();
    }
    
    // Reset form if present
    const form = modalInfo.element.querySelector('form');
    if (form) {
      form.reset();
    }
  }
}

// Create a global modal manager instance
const modalManager = new ModalManager();

/**
 * Initialize modals for a specific page
 * @param {string} pageType - Type of page ('users', 'employees', 'banking', 'accounts', 'payslips')
 */
function initPageModals(pageType) {
  switch (pageType) {
    case 'users':
      initUserModals();
      break;
    case 'employees':
      initEmployeeModals();
      break;
    case 'banking':
      initBankingModals();
      break;
    case 'accounts':
      initAccountModals();
      break;
    default:
      console.warn(`No modal initialization defined for page type: ${pageType}`);
  }
}

/**
 * Initialize user management modals
 */
function initUserModals() {
  // Register create user modal
  modalManager.register('createUserModal', {
    onOpen: () => {
      // Reset form and set default values
      document.getElementById('createUserForm').reset();
      document.getElementById('status').value = 'active';
      document.getElementById('role').value = 'user';
    },
    onSave: () => createUser()
  });
  
  // Register edit user modal
  modalManager.register('editUserModal', {
    onOpen: (userData) => {
      // Populate form with user data
      if (userData && userData.id) {
        document.getElementById('edit_id').value = userData.id;
        document.getElementById('edit_firstname').value = userData.firstname || '';
        document.getElementById('edit_lastname').value = userData.lastname || '';
        document.getElementById('edit_email').value = userData.email || '';
        document.getElementById('edit_username').value = userData.username || '';
        document.getElementById('edit_password').value = ''; // Don't show password
        document.getElementById('edit_role').value = userData.role || 'user';
        document.getElementById('edit_status').value = userData.status || 'active';
      }
    },
    onSave: () => updateUser()
  });
  
  // Replace old editUser function with one that uses the modal manager
  window.editUser = async function(id) {
    try {
      const response = await apiRequest(`users/get/${id}`);
      if (response.status === 'success') {
        modalManager.openModal('editUserModal', response.data);
      } else {
        showAlert('Error loading user details: ' + response.message, 'danger');
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      showAlert('Error loading user details. Please try again.', 'danger');
    }
  };
}

/**
 * Initialize employee management modals
 */
function initEmployeeModals() {
  // Register create employee modal
  modalManager.register('createEmployeeModal', {
    onOpen: () => {
      // Reset form and set default values
      document.getElementById('createEmployeeForm').reset();
      document.getElementById('employee_id').value = 'Auto-generated';
    },
    onSave: () => createEmployee()
  });
  
  // Register edit employee modal
  modalManager.register('editEmployeeModal', {
    onOpen: (employeeData) => {
      // Populate form with employee data
      if (employeeData && employeeData.employee_id) {
        document.getElementById('edit_employee_id').value = employeeData.employee_id;
        document.getElementById('edit_firstname').value = employeeData.firstname || '';
        document.getElementById('edit_lastname').value = employeeData.lastname || '';
        document.getElementById('edit_contact_number').value = employeeData.contact_number || '';
        document.getElementById('edit_email').value = employeeData.email || '';
      }
    },
    onSave: () => updateEmployee()
  });
  
  // Replace old editEmployee function with one that uses the modal manager
  window.editEmployee = async function(id) {
    try {
      const response = await apiRequest(`employees/get/${id}`);
      if (response.status === 'success') {
        modalManager.openModal('editEmployeeModal', response.data);
      } else {
        showAlert('Error loading employee details: ' + response.message, 'danger');
      }
    } catch (error) {
      console.error('Error loading employee details:', error);
      showAlert('Error loading employee details. Please try again.', 'danger');
    }
  };
}

/**
 * Initialize banking details modals
 */
function initBankingModals() {
  // Register create banking modal
  modalManager.register('createBankingModal', {
    onOpen: () => {
      // Reset form
      document.getElementById('createBankingForm').reset();
      
      // Check if employee_id is pre-populated (from query string)
      const hiddenEmployeeId = document.getElementById('employee_id_hidden');
      if (hiddenEmployeeId && hiddenEmployeeId.value) {
        const employeeId = hiddenEmployeeId.value;
        document.getElementById('employee_id').value = employeeId;
        // Get employee details
        getEmployeeDetails(employeeId);
      }
    },
    onSave: () => createBankingDetails()
  });
  
  // Register edit banking modal
  modalManager.register('editBankingModal', {
    onOpen: (bankingData) => {
      // Populate form with banking data
      if (bankingData && bankingData.id) {
        document.getElementById('edit_id').value = bankingData.id;
        document.getElementById('edit_employee_id').value = bankingData.employee_id || '';
        document.getElementById('edit_employee_name').value = 
          (bankingData.employee_firstname ? bankingData.employee_firstname + ' ' + bankingData.employee_lastname : '');
        document.getElementById('edit_preferred_bank').value = bankingData.preferred_bank || '';
        document.getElementById('edit_bank_account_number').value = bankingData.bank_account_number || '';
        document.getElementById('edit_bank_account_name').value = bankingData.bank_account_name || '';
      }
    },
    onSave: () => updateBankingDetails()
  });
  
  // Add editBankingDetails function
  window.editBankingDetails = async function(id) {
    try {
      const response = await apiRequest(`banking/get/${id}`);
      if (response.status === 'success') {
        modalManager.openModal('editBankingModal', response.data);
      } else {
        showAlert('Error loading banking details: ' + response.message, 'danger');
      }
    } catch (error) {
      console.error('Error loading banking details:', error);
      showAlert('Error loading banking details. Please try again.', 'danger');
    }
  };
}

/**
 * Initialize account management modals
 */
function initAccountModals() {
  // Register create account modal
  modalManager.register('createAccountModal', {
    onOpen: () => {
      // Reset form
      document.getElementById('createAccountForm').reset();
      document.getElementById('account_status').value = 'ACTIVE';
      
      // Check if employee_id is pre-populated (from query string)
      const hiddenEmployeeId = document.getElementById('employee_id_hidden');
      if (hiddenEmployeeId && hiddenEmployeeId.value) {
        const employeeId = hiddenEmployeeId.value;
        document.getElementById('employee_id').value = employeeId;
        // Get employee details
        getEmployeeDetails(employeeId);
      }
    },
    onSave: () => createAccount()
  });
  
  // Register edit account modal
  modalManager.register('editAccountModal', {
    onOpen: (accountData) => {
      // Populate form with account data
      if (accountData && accountData.account_id) {
        document.getElementById('edit_account_id').value = accountData.account_id;
        document.getElementById('edit_employee_id').value = accountData.employee_id || '';
        document.getElementById('edit_employee_firstname').value = accountData.employee_firstname || '';
        document.getElementById('edit_employee_lastname').value = accountData.employee_lastname || '';
        document.getElementById('edit_account_email').value = accountData.account_email || '';
        document.getElementById('edit_account_password').value = ''; // Don't show password
        document.getElementById('edit_account_type').value = accountData.account_type || '';
        document.getElementById('edit_account_status').value = accountData.account_status || 'ACTIVE';
      }
    },
    onSave: () => updateAccount()
  });
  
  // Add editAccount function
  window.editAccount = async function(id) {
    try {
      const response = await apiRequest(`accounts/get/${id}`);
      if (response.status === 'success') {
        modalManager.openModal('editAccountModal', response.data);
      } else {
        showAlert('Error loading account details: ' + response.message, 'danger');
      }
    } catch (error) {
      console.error('Error loading account details:', error);
      showAlert('Error loading account details. Please try again.', 'danger');
    }
  };
}

// Function to update employee details based on selection
async function updateEmployeeDetails(select) {
  const employeeId = select.value;
  if (employeeId) {
    try {
      const response = await apiRequest(`employees/get/${employeeId}`);
      if (response.status === 'success') {
        const employee = response.data;
        // Update related fields based on context (check which modal is open)
        const activeModal = document.querySelector('.modal.show');
        
        if (activeModal) {
          if (activeModal.id === 'createAccountModal' || activeModal.id === 'editAccountModal') {
            // Account modal fields
            const firstnameField = activeModal.querySelector('#employee_firstname, #edit_employee_firstname');
            const lastnameField = activeModal.querySelector('#employee_lastname, #edit_employee_lastname');
            
            if (firstnameField) firstnameField.value = employee.firstname || '';
            if (lastnameField) lastnameField.value = employee.lastname || '';
          } else if (activeModal.id === 'createBankingModal' || activeModal.id === 'editBankingModal') {
            // Banking modal fields
            const nameField = activeModal.querySelector('#employee_name, #edit_employee_name');
            
            if (nameField) {
              nameField.value = `${employee.firstname} ${employee.lastname}`;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  }
}

// Add updateEmployeeDetails function to window for access from HTML
window.updateEmployeeDetails = updateEmployeeDetails;

// Document ready function to initialize modals on each page
document.addEventListener('DOMContentLoaded', function() {
  // Detect current page type
  const pagePath = window.location.pathname;
  
  if (pagePath.includes('/users') || pagePath.endsWith('/users.php')) {
    initPageModals('users');
  } else if (pagePath.includes('/employees') || pagePath.endsWith('/employees.php')) {
    initPageModals('employees');
  } else if (pagePath.includes('/banking') || pagePath.endsWith('/banking.php')) {
    initPageModals('banking');
  } else if (pagePath.includes('/accounts') || pagePath.endsWith('/accounts.php')) {
    initPageModals('accounts');
  }
});

// Add the new functions to update/create for each entity if they don't already exist in the pages
// These are simplified implementations for demonstration - you'll need to adapt them to your actual data model

// Updates the banking details
function updateBankingDetails() {
  const id = document.getElementById('edit_id').value;
  const preferredBank = document.getElementById('edit_preferred_bank').value;
  const bankAccountNumber = document.getElementById('edit_bank_account_number').value;
  const bankAccountName = document.getElementById('edit_bank_account_name').value;
  
  if (!preferredBank || !bankAccountNumber || !bankAccountName) {
    showAlert('Please fill all required fields.', 'danger');
    return;
  }
  
  const data = {
    preferred_bank: preferredBank,
    bank_account_number: bankAccountNumber,
    bank_account_name: bankAccountName
  };
  
  apiRequest(`banking/update/${id}`, 'PUT', data)
    .then(response => {
      if (response.status === 'success') {
        showAlert('Banking details updated successfully!', 'success');
        modalManager.closeModal('editBankingModal');
        loadBankingDetails(); // Reload the banking details list
      } else {
        showAlert('Error updating banking details: ' + response.message, 'danger');
      }
    })
    .catch(error => {
      console.error('Error updating banking details:', error);
      showAlert('Error updating banking details. Please try again.', 'danger');
    });
}

// Updates an employee account
function updateAccount() {
  const accountId = document.getElementById('edit_account_id').value;
  const accountEmail = document.getElementById('edit_account_email').value;
  const accountPassword = document.getElementById('edit_account_password').value;
  const accountType = document.getElementById('edit_account_type').value;
  const accountStatus = document.getElementById('edit_account_status').value;
  
  if (!accountEmail || !accountType || !accountStatus) {
    showAlert('Please fill all required fields.', 'danger');
    return;
  }
  
  const data = {
    account_email: accountEmail,
    account_type: accountType,
    account_status: accountStatus
  };
  
  // Only include password if provided
  if (accountPassword) {
    data.account_password = accountPassword;
  }
  
  apiRequest(`accounts/update/${accountId}`, 'PUT', data)
    .then(response => {
      if (response.status === 'success') {
        showAlert('Account updated successfully!', 'success');
        modalManager.closeModal('editAccountModal');
        loadAccounts(); // Reload the accounts list
      } else {
        showAlert('Error updating account: ' + response.message, 'danger');
      }
    })
    .catch(error => {
      console.error('Error updating account:', error);
      showAlert('Error updating account. Please try again.', 'danger');
    });
}

// Updates an employee
function updateEmployee() {
  const employeeId = document.getElementById('edit_employee_id').value;
  const firstname = document.getElementById('edit_firstname').value;
  const lastname = document.getElementById('edit_lastname').value;
  const contactNumber = document.getElementById('edit_contact_number').value;
  const email = document.getElementById('edit_email').value;
  
  if (!firstname || !lastname || !contactNumber || !email) {
    showAlert('Please fill all required fields.', 'danger');
    return;
  }
  
  const data = {
    firstname: firstname,
    lastname: lastname,
    contact_number: contactNumber,
    email: email
  };
  
  apiRequest(`employees/update/${employeeId}`, 'PUT', data)
    .then(response => {
      if (response.status === 'success') {
        showAlert('Employee updated successfully!', 'success');
        modalManager.closeModal('editEmployeeModal');
        loadEmployees(); // Reload the employees list
      } else {
        showAlert('Error updating employee: ' + response.message, 'danger');
      }
    })
    .catch(error => {
      console.error('Error updating employee:', error);
      showAlert('Error updating employee. Please try again.', 'danger');
    });
}