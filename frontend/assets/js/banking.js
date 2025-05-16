/**
 * Banking JavaScript
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load data
    loadEmployees();
    
    // Check if employee_id is provided from PHP
    if (typeof employeeId !== 'undefined' && employeeId) {
        // Load specific employee's banking details
        loadBankingDetails(1, employeeId);
        // Get employee details for autofill
        getEmployeeDetails(employeeId);
    } else {
        // Load all banking details
        loadBankingDetails();
    }

    // Add event listeners
    const openCreateBankingModalBtn = document.getElementById('openCreateBankingModalBtn');
    const closeCreateBankingModal = document.getElementById('closeCreateBankingModal');
    const cancelCreateBankingBtn = document.getElementById('cancelCreateBankingBtn');
    const saveBankingBtn = document.getElementById('saveBankingBtn');
    
    if (openCreateBankingModalBtn) {
        openCreateBankingModalBtn.addEventListener('click', function() {
            document.getElementById('createBankingModal').classList.add('show');
            document.getElementById('createBankingForm').reset();
            
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
    
    if (closeCreateBankingModal) {
        closeCreateBankingModal.addEventListener('click', function() {
            document.getElementById('createBankingModal').classList.remove('show');
        });
    }
    
    if (cancelCreateBankingBtn) {
        cancelCreateBankingBtn.addEventListener('click', function() {
            document.getElementById('createBankingModal').classList.remove('show');
        });
    }
    
    if (saveBankingBtn) {
        saveBankingBtn.addEventListener('click', createBankingDetails);
    }
    
    // Handle employee selection change
    const employeeSelect = document.getElementById('employee_id');
    if (employeeSelect) {
        employeeSelect.addEventListener('change', function() {
            const selectedEmployeeId = this.value;
            if (selectedEmployeeId) {
                getEmployeeDetails(selectedEmployeeId);
            } else {
                document.getElementById('employee_name').value = '';
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
    const employeeNameInput = document.getElementById('employee_name');
    if (!employeeNameInput || !employeeId) return;

    try {
        const response = await apiRequest(`employees/get/${employeeId}`);
        
        if (response.status === 'success') {
            const employee = response.data;
            employeeNameInput.value = `${employee.firstname} ${employee.lastname}`;
        } else {
            employeeNameInput.value = 'Employee not found';
        }
    } catch (error) {
        console.error('Error getting employee details:', error);
        employeeNameInput.value = 'Error loading employee details';
    }
}

/**
 * Load banking details with pagination
 * @param {number} page - Page number
 * @param {string} employeeId - Employee ID (optional)
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
            
            if (bankingDetails.length === 0) {
                bankingList.innerHTML = '<tr><td colspan="7" class="text-center">No banking details found</td></tr>';
                return;
            }
            
            // Paginate banking details
            const itemsPerPage = 10;
            const totalPages = Math.ceil(bankingDetails.length / itemsPerPage);
            
            // Make sure page is valid
            page = Math.max(1, Math.min(page, totalPages));
            
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedBankingDetails = bankingDetails.slice(startIndex, endIndex);
            
            let bankingHTML = '';
            
            paginatedBankingDetails.forEach(banking => {
                bankingHTML += `
                    <tr>
                        <td>${banking.id}</td>
                        <td>${banking.employee_name}</td>
                        <td>${banking.preferred_bank}</td>
                        <td>${banking.bank_account_number}</td>
                        <td>${banking.bank_account_name}</td>
                        <td>${formatDate(banking.created_at)}</td>
                        <td class="actions">
                            <button class="btn btn-danger" onclick="deleteBankingDetails(${banking.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
            
            bankingList.innerHTML = bankingHTML;
            
            // Create pagination if needed
            if (totalPages > 1 && paginationContainer) {
                const paginationEl = createPagination(page, totalPages, function(newPage) {
                    loadBankingDetails(newPage, empId);
                });
                
                paginationContainer.innerHTML = '';
                paginationContainer.appendChild(paginationEl);
            } else if (paginationContainer) {
                paginationContainer.innerHTML = '';
            }
        } else {
            bankingList.innerHTML = '<tr><td colspan="7" class="text-center">No banking details found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading banking details:', error);
        bankingList.innerHTML = '<tr><td colspan="7" class="text-center">Error loading banking details. Please try again.</td></tr>';
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
    
    try {
        // Prepare data
        const data = {
            employee_id: employeeId,
            preferred_bank: preferredBank,
            bank_account_number: bankAccountNumber,
            bank_account_name: bankAccountName
        };
        
        // Send create request
        const response = await apiRequest('banking/create', 'POST', data);
        
        if (response.status === 'success') {
            showAlert('Banking details added successfully!', 'success');
            
            // Close modal and reset form
            document.getElementById('createBankingModal').classList.remove('show');
            document.getElementById('createBankingForm').reset();
            
            // Reload banking details
            if (typeof employeeId !== 'undefined' && employeeId) {
                loadBankingDetails(1, employeeId);
            } else {
                loadBankingDetails();
            }
        } else {
            showAlert('Error adding banking details: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error adding banking details:', error);
        showAlert('Error adding banking details. Please try again.', 'danger');
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
            if (typeof employeeId !== 'undefined' && employeeId) {
                loadBankingDetails(1, employeeId);
            } else {
                loadBankingDetails();
            }
        } else {
            showAlert('Error deleting banking details: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error deleting banking details:', error);
        showAlert('Error deleting banking details. Please try again.', 'danger');
    }
}