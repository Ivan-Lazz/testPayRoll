/**
 * Accounts JavaScript
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load data
    loadEmployees();
    
    // Check if employee_id is provided from PHP
    if (typeof employeeId !== 'undefined' && employeeId) {
        // Load specific employee's accounts
        loadAccounts(1, employeeId);
        // Get employee details for autofill
        getEmployeeDetails(employeeId);
    } else {
        // Load all accounts
        loadAccounts();
    }

    // Add event listeners
    const openCreateAccountModalBtn = document.getElementById('openCreateAccountModalBtn');
    const closeCreateAccountModal = document.getElementById('closeCreateAccountModal');
    const cancelCreateAccountBtn = document.getElementById('cancelCreateAccountBtn');
    const saveAccountBtn = document.getElementById('saveAccountBtn');
    
    if (openCreateAccountModalBtn) {
        openCreateAccountModalBtn.addEventListener('click', function() {
            document.getElementById('createAccountModal').classList.add('show');
            document.getElementById('createAccountForm').reset();
            
            // If employee ID is set, use it and get employee details
            if (typeof employeeId !== 'undefined' && employeeId) {
                const employeeSelect = document.getElementById('employee_id');
                if (employeeSelect) {
                    employeeSelect.value = employeeId;
                    getEmployeeDetails(employeeId);
                }
            }
        });
    }
    
    if (closeCreateAccountModal) {
        closeCreateAccountModal.addEventListener('click', function() {
            document.getElementById('createAccountModal').classList.remove('show');
        });
    }
    
    if (cancelCreateAccountBtn) {
        cancelCreateAccountBtn.addEventListener('click', function() {
            document.getElementById('createAccountModal').classList.remove('show');
        });
    }
    
    if (saveAccountBtn) {
        saveAccountBtn.addEventListener('click', createAccount);
    }
    
    // Handle employee selection change
    const employeeSelect = document.getElementById('employee_id');
    if (employeeSelect) {
        employeeSelect.addEventListener('change', function() {
            const selectedEmployeeId = this.value;
            if (selectedEmployeeId) {
                getEmployeeDetails(selectedEmployeeId);
            } else {
                document.getElementById('employee_firstname').value = '';
                document.getElementById('employee_lastname').value = '';
            }
        });
    }
});

/**
 * Load employees for dropdown
 */
async function loadEmployees() {
    const employeeSelect = document.getElementById('employee_id');
    if (!employeeSelect) return;

    try {
        const response = await apiRequest('employees');
        
        if (response.status === 'success' && response.data.length > 0) {
            let options = '<option value="">Select Employee</option>';
            
            response.data.forEach(employee => {
                const selected = (typeof employeeId !== 'undefined' && employeeId === employee.employee_id) ? 'selected' : '';
                options += `<option value="${employee.employee_id}" ${selected}>${employee.employee_id} - ${employee.firstname} ${employee.lastname}</option>`;
            });
            
            employeeSelect.innerHTML = options;
            
            // If employee ID is provided, set it and get employee details
            if (typeof employeeId !== 'undefined' && employeeId) {
                employeeSelect.value = employeeId;
                getEmployeeDetails(employeeId);
            }
        } else {
            employeeSelect.innerHTML = '<option value="">No employees found</option>';
        }
    } catch (error) {
        console.error('Error loading employees:', error);
        employeeSelect.innerHTML = '<option value="">Error loading employees</option>';
    }
}

/**
 * Get employee details by ID
 * @param {string} employeeId - Employee ID
 */
async function getEmployeeDetails(employeeId) {
    const firstnameInput = document.getElementById('employee_firstname');
    const lastnameInput = document.getElementById('employee_lastname');
    
    if (!firstnameInput || !lastnameInput || !employeeId) return;

    try {
        const response = await apiRequest(`employees/get/${employeeId}`);
        
        if (response.status === 'success') {
            const employee = response.data;
            firstnameInput.value = employee.firstname;
            lastnameInput.value = employee.lastname;
        } else {
            firstnameInput.value = '';
            lastnameInput.value = '';
            showAlert('Employee not found', 'danger');
        }
    } catch (error) {
        console.error('Error getting employee details:', error);
        firstnameInput.value = '';
        lastnameInput.value = '';
        showAlert('Error loading employee details', 'danger');
    }
}

/**
 * Load accounts with pagination
 * @param {number} page - Page number
 * @param {string} employeeId - Employee ID (optional)
 */
async function loadAccounts(page = 1, empId = null) {
    const accountsList = document.getElementById('accountsList');
    const paginationContainer = document.getElementById('accountsPagination');
    
    if (!accountsList) return;
    
    showLoader(accountsList);
    
    try {
        let response;
        
        if (empId) {
            // Fetch accounts for specific employee
            response = await apiRequest(`accounts/employee/${empId}`);
        } else {
            // Fetch all accounts
            response = await apiRequest('accounts');
        }
        
        if (response.status === 'success') {
            const accounts = response.data;
            
            if (accounts.length === 0) {
                accountsList.innerHTML = '<tr><td colspan="7" class="text-center">No accounts found</td></tr>';
                return;
            }
            
            // Paginate accounts
            const itemsPerPage = 10;
            const totalPages = Math.ceil(accounts.length / itemsPerPage);
            
            // Make sure page is valid
            page = Math.max(1, Math.min(page, totalPages));
            
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedAccounts = accounts.slice(startIndex, endIndex);
            
            let accountsHTML = '';
            
            paginatedAccounts.forEach(account => {
                // Determine status class
                let statusClass = '';
                switch (account.account_status) {
                    case 'ACTIVE':
                        statusClass = 'text-success';
                        break;
                    case 'INACTIVE':
                        statusClass = 'text-warning';
                        break;
                    case 'SUSPENDED':
                        statusClass = 'text-danger';
                        break;
                    default:
                        statusClass = '';
                }
                
                accountsHTML += `
                    <tr>
                        <td>${account.account_id}</td>
                        <td>${account.employee_name}</td>
                        <td>${account.account_email}</td>
                        <td>${account.account_type}</td>
                        <td class="${statusClass}">${account.account_status}</td>
                        <td>${formatDate(account.created_at)}</td>
                        <td class="actions">
                            <button class="btn btn-danger" onclick="deleteAccount(${account.account_id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
            
            accountsList.innerHTML = accountsHTML;
            
            // Create pagination if needed
            if (totalPages > 1 && paginationContainer) {
                const paginationEl = createPagination(page, totalPages, function(newPage) {
                    loadAccounts(newPage, empId);
                });
                
                paginationContainer.innerHTML = '';
                paginationContainer.appendChild(paginationEl);
            } else if (paginationContainer) {
                paginationContainer.innerHTML = '';
            }
        } else {
            accountsList.innerHTML = '<tr><td colspan="7" class="text-center">No accounts found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading accounts:', error);
        accountsList.innerHTML = '<tr><td colspan="7" class="text-center">Error loading accounts. Please try again.</td></tr>';
    }
}

/**
 * Create account
 */
async function createAccount() {
    // Get the actual employee ID (from hidden input if using pre-selected)
    let employeeId;
    const hiddenEmployeeIdInput = document.getElementById('employee_id_hidden');
    
    if (hiddenEmployeeIdInput && hiddenEmployeeIdInput.value) {
        employeeId = hiddenEmployeeIdInput.value;
    } else {
        employeeId = document.getElementById('employee_id').value;
    }
    
    const accountEmail = document.getElementById('account_email').value;
    const accountPassword = document.getElementById('account_password').value;
    const accountType = document.getElementById('account_type').value;
    const accountStatus = document.getElementById('account_status').value;
    
    // Validate required fields
    if (!employeeId || !accountEmail || !accountPassword || !accountType || !accountStatus) {
        showAlert('Please fill all required fields.', 'danger');
        return;
    }
    
    try {
        // Prepare data
        const data = {
            employee_id: employeeId,
            account_email: accountEmail,
            account_password: accountPassword,
            account_type: accountType,
            account_status: accountStatus
        };
        
        // Send create request
        const response = await apiRequest('accounts/create', 'POST', data);
        
        if (response.status === 'success') {
            showAlert('Account created successfully!', 'success');
            
            // Close modal and reset form
            document.getElementById('createAccountModal').classList.remove('show');
            document.getElementById('createAccountForm').reset();
            
            // Reload accounts
            if (typeof employeeId !== 'undefined' && employeeId) {
                loadAccounts(1, employeeId);
            } else {
                loadAccounts();
            }
        } else {
            showAlert('Error creating account: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error creating account:', error);
        showAlert('Error creating account. Please try again.', 'danger');
    }
}

/**
 * Delete account
 * @param {number} id - Account ID
 */
async function deleteAccount(id) {
    if (!confirm('Are you sure you want to delete this account?')) {
        return;
    }
    
    try {
        const response = await apiRequest(`accounts/delete/${id}`, 'DELETE');
        
        if (response.status === 'success') {
            showAlert('Account deleted successfully!', 'success');
            
            // Reload accounts
            if (typeof employeeId !== 'undefined' && employeeId) {
                loadAccounts(1, employeeId);
            } else {
                loadAccounts();
            }
        } else {
            showAlert('Error deleting account: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        showAlert('Error deleting account. Please try again.', 'danger');
    }
}