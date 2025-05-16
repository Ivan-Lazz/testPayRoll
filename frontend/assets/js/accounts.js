/**
 * Updated Accounts JavaScript
 * This file has been updated to work with the new modal system
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load employees for dropdown
    loadEmployees();
    
    // Check if employee_id is provided from PHP
    const urlParams = new URLSearchParams(window.location.search);
    const employeeId = urlParams.get('employee_id');
    
    if (employeeId) {
        // Load specific employee's accounts
        loadAccounts(1, employeeId);
        
        // Set the hidden employee ID for use in the create form
        const hiddenEmployeeIdInput = document.getElementById('employee_id_hidden');
        if (hiddenEmployeeIdInput) {
            hiddenEmployeeIdInput.value = employeeId;
        }
    } else {
        // Load all accounts
        loadAccounts();
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
        if (response.status === 'success') {
            employeeSelect.innerHTML = '<option value="">Select Employee</option>';
            
            response.data.forEach(employee => {
                employeeSelect.innerHTML += `
                    <option value="${employee.employee_id}">${employee.firstname} ${employee.lastname} (${employee.employee_id})</option>
                `;
            });
            
            // If employee ID is provided in URL, set it in the dropdown
            const urlParams = new URLSearchParams(window.location.search);
            const employeeId = urlParams.get('employee_id');
            
            if (employeeId) {
                employeeSelect.value = employeeId;
                // Trigger change event to update employee details
                updateEmployeeDetails(employeeSelect);
            }
        }
    } catch (error) {
        console.error('Error loading employees:', error);
        showAlert('Error loading employees. Please try again.', 'danger');
    }
}

/**
 * Get employee details by ID
 * @param {string} employeeId - Employee ID
 */
async function getEmployeeDetails(employeeId) {
    if (!employeeId) return;
    
    const firstnameInput = document.getElementById('employee_firstname');
    const lastnameInput = document.getElementById('employee_lastname');
    
    if (!firstnameInput || !lastnameInput) return;
    
    try {
        const response = await apiRequest(`employees/get/${employeeId}`);
        if (response.status === 'success') {
            const employee = response.data;
            firstnameInput.value = employee.firstname;
            lastnameInput.value = employee.lastname;
            return employee;
        } else {
            showAlert('Employee not found', 'danger');
        }
    } catch (error) {
        console.error('Error getting employee details:', error);
        showAlert('Error loading employee details', 'danger');
    }
    
    // Clear inputs if employee not found
    firstnameInput.value = '';
    lastnameInput.value = '';
    return null;
}

/**
 * Load accounts with pagination
 * @param {number} page - Page number
 * @param {string} empId - Employee ID (optional)
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
            
            // Paginate accounts
            const itemsPerPage = 10;
            const totalPages = Math.ceil(accounts.length / itemsPerPage);
            
            // Make sure page is valid
            page = Math.max(1, Math.min(page, totalPages || 1));
            
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedAccounts = accounts.slice(startIndex, endIndex);
            
            // Clear the list
            accountsList.innerHTML = '';
            
            if (paginatedAccounts.length === 0) {
                accountsList.innerHTML = `<tr><td colspan="${empId ? 5 : 7}" class="text-center">No accounts found</td></tr>`;
            } else {
                paginatedAccounts.forEach(account => {
                    // Determine status class
                    let statusClass = 'text-secondary';
                    if (account.account_status === 'ACTIVE') {
                        statusClass = 'text-success';
                    } else if (account.account_status === 'INACTIVE') {
                        statusClass = 'text-danger';
                    }
                    
                    let row = `
                        <tr>
                            <td>${account.account_id}</td>
                    `;
                    
                    // Only show employee info if not filtering by employee
                    if (!empId) {
                        row += `
                            <td>${account.employee_id}</td>
                            <td>${account.employee_firstname} ${account.employee_lastname}</td>
                        `;
                    }
                    
                    row += `
                            <td>${account.account_email}</td>
                            <td>${account.account_type}</td>
                            <td class="${statusClass}">${account.account_status}</td>
                            <td>${formatDate(account.created_at)}</td>
                            <td class="actions">
                                <button class="btn btn-secondary btn-sm" onclick="editAccount(${account.account_id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteAccount(${account.account_id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    
                    accountsList.innerHTML += row;
                });
            }
            
            // Create pagination if needed
            if (totalPages > 1) {
                const paginationEl = createPagination(page, totalPages, function(newPage) {
                    loadAccounts(newPage, empId);
                });
                paginationContainer.innerHTML = '';
                paginationContainer.appendChild(paginationEl);
            } else {
                paginationContainer.innerHTML = '';
            }
        } else {
            showAlert(response.message, 'danger');
        }
    } catch (error) {
        console.error('Error loading accounts:', error);
        showAlert('Error loading accounts. Please try again.', 'danger');
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
    
    // Validate email format
    if (!isValidEmail(accountEmail)) {
        showAlert('Please enter a valid email address.', 'danger');
        return;
    }
    
    // Prepare data
    const data = {
        employee_id: employeeId,
        account_email: accountEmail,
        account_password: accountPassword,
        account_type: accountType,
        account_status: accountStatus
    };
    
    try {
        // Send create request
        const response = await apiRequest('accounts/create', 'POST', data);
        if (response.status === 'success') {
            showAlert('Account created successfully!', 'success');
            
            // Close modal and reset form
            modalManager.closeModal('createAccountModal');
            
            // Reload accounts
            const urlParams = new URLSearchParams(window.location.search);
            const empId = urlParams.get('employee_id');
            loadAccounts(1, empId);
        } else {
            showAlert('Error creating account: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error creating account:', error);
        showAlert('Error creating account. Please try again.', 'danger');
    }
}

/**
 * Edit account - load data and open modal
 * @param {number} id - Account ID
 */
async function editAccount(id) {
    try {
        const response = await apiRequest(`accounts/get/${id}`);
        if (response.status === 'success') {
            // Open modal with data
            modalManager.openModal('editAccountModal', response.data);
        } else {
            showAlert('Error loading account details: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error loading account details:', error);
        showAlert('Error loading account details. Please try again.', 'danger');
    }
}

/**
 * Update account
 */
async function updateAccount() {
    const accountId = document.getElementById('edit_account_id').value;
    const accountEmail = document.getElementById('edit_account_email').value;
    const accountPassword = document.getElementById('edit_account_password').value;
    const accountType = document.getElementById('edit_account_type').value;
    const accountStatus = document.getElementById('edit_account_status').value;
    
    if (!accountEmail || !accountType || !accountStatus) {
        showAlert('Please fill all required fields.', 'danger');
        return;
    }
    
    // Validate email format
    if (!isValidEmail(accountEmail)) {
        showAlert('Please enter a valid email address.', 'danger');
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
    
    try {
        const response = await apiRequest(`accounts/update/${accountId}`, 'PUT', data);
        if (response.status === 'success') {
            showAlert('Account updated successfully!', 'success');
            modalManager.closeModal('editAccountModal');
            
            // Reload accounts
            const urlParams = new URLSearchParams(window.location.search);
            const empId = urlParams.get('employee_id');
            loadAccounts(1, empId);
        } else {
            showAlert('Error updating account: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error updating account:', error);
        showAlert('Error updating account. Please try again.', 'danger');
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
            const urlParams = new URLSearchParams(window.location.search);
            const empId = urlParams.get('employee_id');
            loadAccounts(1, empId);
        } else {
            showAlert('Error deleting account: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        showAlert('Error deleting account. Please try again.', 'danger');
    }
}