/**
 * Updated Banking JavaScript
 * This file has been updated to work with the new modal system
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load employees for dropdown
    loadEmployees();
    
    // Check if employee_id is provided from PHP
    const urlParams = new URLSearchParams(window.location.search);
    const employeeId = urlParams.get('employee_id');
    
    if (employeeId) {
        // Load specific employee's banking details
        loadBankingDetails(1, employeeId);
        
        // Set the hidden employee ID for use in the create form
        const hiddenEmployeeIdInput = document.getElementById('employee_id_hidden');
        if (hiddenEmployeeIdInput) {
            hiddenEmployeeIdInput.value = employeeId;
        }
    } else {
        // Load all banking details
        loadBankingDetails();
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
    
    try {
        const response = await apiRequest(`employees/get/${employeeId}`);
        if (response.status === 'success') {
            const employee = response.data;
            
            // Check which modal is currently visible
            if (document.getElementById('createBankingModal').classList.contains('show')) {
                document.getElementById('employee_name').value = `${employee.firstname} ${employee.lastname}`;
            } else if (document.getElementById('editBankingModal').classList.contains('show')) {
                document.getElementById('edit_employee_name').value = `${employee.firstname} ${employee.lastname}`;
            }
            
            return employee;
        } else {
            showAlert('Employee not found', 'danger');
        }
    } catch (error) {
        console.error('Error getting employee details:', error);
        showAlert('Error loading employee details', 'danger');
    }
    
    return null;
}

/**
 * Load banking details with pagination
 * @param {number} page - Page number
 * @param {string} empId - Employee ID (optional)
 */
async function loadBankingDetails(page = 1, empId = null) {
    const bankingList = document.getElementById('bankingList');
    const paginationContainer = document.getElementById('bankingPagination');
    
    if (!bankingList) return;
    
    showLoader(bankingList);
    
    try {
        let response;
        
        if (empId) {
            // Fetch banking details for specific employee
            response = await apiRequest(`banking/employee/${empId}/accounts`);
        } else {
            // Fetch all banking details
            response = await apiRequest('banking');
        }
        
        if (response.status === 'success') {
            const bankingDetails = response.data;
            
            // Paginate banking details
            const itemsPerPage = 10;
            const totalPages = Math.ceil(bankingDetails.length / itemsPerPage);
            
            // Make sure page is valid
            page = Math.max(1, Math.min(page, totalPages || 1));
            
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedBankingDetails = bankingDetails.slice(startIndex, endIndex);
            
            // Clear the list
            bankingList.innerHTML = '';
            
            if (paginatedBankingDetails.length === 0) {
                bankingList.innerHTML = `<tr><td colspan="${empId ? 5 : 7}" class="text-center">No banking details found</td></tr>`;
            } else {
                paginatedBankingDetails.forEach(banking => {
                    let row = `
                        <tr>
                            <td>${banking.id}</td>
                    `;
                    
                    // Only show employee info if not filtering by employee
                    if (!empId) {
                        row += `
                            <td>${banking.employee_id}</td>
                            <td>${banking.employee_firstname} ${banking.employee_lastname}</td>
                        `;
                    }
                    
                    row += `
                            <td>${banking.preferred_bank}</td>
                            <td>${banking.bank_account_number}</td>
                            <td>${banking.bank_account_name}</td>
                            <td>${formatDate(banking.created_at)}</td>
                            <td class="actions">
                                <button class="btn btn-secondary btn-sm" onclick="editBankingDetails(${banking.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteBankingDetails(${banking.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    
                    bankingList.innerHTML += row;
                });
            }
            
            // Create pagination if needed
            if (totalPages > 1) {
                const paginationEl = createPagination(page, totalPages, function(newPage) {
                    loadBankingDetails(newPage, empId);
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
        console.error('Error loading banking details:', error);
        showAlert('Error loading banking details. Please try again.', 'danger');
    }
}

/**
 * Create banking details
 */
async function createBankingDetails() {
    // Get the actual employee ID (from hidden input if using pre-selected)
    let employeeId;
    const hiddenEmployeeIdInput = document.getElementById('employee_id_hidden');
    
    if (hiddenEmployeeIdInput && hiddenEmployeeIdInput.value) {
        employeeId = hiddenEmployeeIdInput.value;
    } else {
        employeeId = document.getElementById('employee_id').value;
    }
    
    const preferredBank = document.getElementById('preferred_bank').value;
    const bankAccountNumber = document.getElementById('bank_account_number').value;
    const bankAccountName = document.getElementById('bank_account_name').value;
    
    // Validate required fields
    if (!employeeId || !preferredBank || !bankAccountNumber || !bankAccountName) {
        showAlert('Please fill all required fields.', 'danger');
        return;
    }
    
    // Prepare data
    const data = {
        employee_id: employeeId,
        preferred_bank: preferredBank,
        bank_account_number: bankAccountNumber,
        bank_account_name: bankAccountName
    };
    
    try {
        // Send create request
        const response = await apiRequest('banking/create', 'POST', data);
        if (response.status === 'success') {
            showAlert('Banking details added successfully!', 'success');
            
            // Close modal and reset form
            modalManager.closeModal('createBankingModal');
            
            // Reload banking details
            const urlParams = new URLSearchParams(window.location.search);
            const empId = urlParams.get('employee_id');
            loadBankingDetails(1, empId);
        } else {
            showAlert('Error adding banking details: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error adding banking details:', error);
        showAlert('Error adding banking details. Please try again.', 'danger');
    }
}

/**
 * Edit banking details - load data and open modal
 * @param {number} id - Banking details ID
 */
async function editBankingDetails(id) {
    try {
        const response = await apiRequest(`banking/get/${id}`);
        if (response.status === 'success') {
            // Open modal with data
            modalManager.openModal('editBankingModal', response.data);
        } else {
            showAlert('Error loading banking details: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error loading banking details:', error);
        showAlert('Error loading banking details. Please try again.', 'danger');
    }
}

/**
 * Update banking details
 */
async function updateBankingDetails() {
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
    
    try {
        const response = await apiRequest(`banking/update/${id}`, 'PUT', data);
        if (response.status === 'success') {
            showAlert('Banking details updated successfully!', 'success');
            modalManager.closeModal('editBankingModal');
            
            // Reload banking details
            const urlParams = new URLSearchParams(window.location.search);
            const empId = urlParams.get('employee_id');
            loadBankingDetails(1, empId);
        } else {
            showAlert('Error updating banking details: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error updating banking details:', error);
        showAlert('Error updating banking details. Please try again.', 'danger');
    }
}

/**
 * Delete banking details
 * @param {number} id - Banking details ID
 */
async function deleteBankingDetails(id) {
    if (!confirm('Are you sure you want to delete these banking details?')) {
        return;
    }
    
    try {
        const response = await apiRequest(`banking/delete/${id}`, 'DELETE');
        if (response.status === 'success') {
            showAlert('Banking details deleted successfully!', 'success');
            
            // Reload banking details
            const urlParams = new URLSearchParams(window.location.search);
            const empId = urlParams.get('employee_id');
            loadBankingDetails(1, empId);
        } else {
            showAlert('Error deleting banking details: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error deleting banking details:', error);
        showAlert('Error deleting banking details. Please try again.', 'danger');
    }
}