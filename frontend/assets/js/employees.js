/**
 * Updated Employees JavaScript
 * This file has been updated to work with the new modal system
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load employees
    loadEmployees();
});

/**
 * Load employees with pagination
 * @param {number} page - Page number
 */
async function loadEmployees(page = 1) {
    const employeesList = document.getElementById('employeesList');
    const paginationContainer = document.getElementById('employeesPagination');

    if (!employeesList) return;

    showLoader(employeesList);

    try {
        const response = await apiRequest('employees');
        if (response.status === 'success') {
            const employees = response.data;

            // Paginate employees
            const itemsPerPage = 10;
            const totalPages = Math.ceil(employees.length / itemsPerPage);

            // Make sure page is valid
            page = Math.max(1, Math.min(page, totalPages));

            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedEmployees = employees.slice(startIndex, endIndex);

            // Clear the list
            employeesList.innerHTML = '';

            if (paginatedEmployees.length === 0) {
                employeesList.innerHTML = '<tr><td colspan="6" class="text-center">No employees found</td></tr>';
            } else {
                paginatedEmployees.forEach(employee => {
                    employeesList.innerHTML += `
                        <tr>
                            <td>${employee.employee_id}</td>
                            <td>${employee.firstname} ${employee.lastname}</td>
                            <td>${employee.contact_number}</td>
                            <td>${employee.email}</td>
                            <td>${formatDate(employee.created_at)}</td>
                            <td class="actions">
                                <button class="btn btn-secondary btn-sm" onclick="editEmployee('${employee.employee_id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteEmployee('${employee.employee_id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <a href="accounts.php?employee_id=${employee.employee_id}" class="btn btn-info btn-sm">
                                    <i class="fas fa-id-card"></i>
                                </a>
                                <a href="banking.php?employee_id=${employee.employee_id}" class="btn btn-success btn-sm">
                                    <i class="fas fa-university"></i>
                                </a>
                            </td>
                        </tr>
                    `;
                });
            }

            // Create pagination if needed
            if (totalPages > 1) {
                const paginationEl = createPagination(page, totalPages, function(newPage) {
                    loadEmployees(newPage);
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
        console.error('Error loading employees:', error);
        showAlert('Error loading employees. Please try again.', 'danger');
    }
}

/**
 * Create employee
 */
async function createEmployee() {
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const contact_number = document.getElementById('contact_number').value;
    const email = document.getElementById('email').value;

    // Validate required fields
    if (!firstname || !lastname || !contact_number || !email) {
        showAlert('Please fill all required fields.', 'danger');
        return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address.', 'danger');
        return;
    }

    // Prepare data
    const data = {
        firstname: firstname,
        lastname: lastname,
        contact_number: contact_number,
        email: email
    };

    try {
        // Send create request
        const response = await apiRequest('employees/create', 'POST', data);
        if (response.status === 'success') {
            showAlert('Employee created successfully!', 'success');

            // Close modal and reset form
            modalManager.closeModal('createEmployeeModal');

            // Reload employees
            loadEmployees();
        } else {
            showAlert('Error creating employee: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error creating employee:', error);
        showAlert('Error creating employee. Please try again.', 'danger');
    }
}

/**
 * Edit employee - load employee data and open edit modal
 * @param {string} id - Employee ID
 */
async function editEmployee(id) {
    try {
        const response = await apiRequest(`employees/get/${id}`);
        if (response.status === 'success') {
            // Open modal with employee data
            modalManager.openModal('editEmployeeModal', response.data);
        } else {
            showAlert('Error loading employee details: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error loading employee details:', error);
        showAlert('Error loading employee details. Please try again.', 'danger');
    }
}

/**
 * Update employee
 */
async function updateEmployee() {
    const employeeId = document.getElementById('edit_employee_id').value;
    const firstname = document.getElementById('edit_firstname').value;
    const lastname = document.getElementById('edit_lastname').value;
    const contactNumber = document.getElementById('edit_contact_number').value;
    const email = document.getElementById('edit_email').value;
    
    if (!firstname || !lastname || !contactNumber || !email) {
        showAlert('Please fill all required fields.', 'danger');
        return;
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address.', 'danger');
        return;
    }
    
    const data = {
        firstname: firstname,
        lastname: lastname,
        contact_number: contactNumber,
        email: email
    };
    
    try {
        const response = await apiRequest(`employees/update/${employeeId}`, 'PUT', data);
        if (response.status === 'success') {
            showAlert('Employee updated successfully!', 'success');
            modalManager.closeModal('editEmployeeModal');
            loadEmployees();
        } else {
            showAlert('Error updating employee: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error updating employee:', error);
        showAlert('Error updating employee. Please try again.', 'danger');
    }
}

/**
 * Delete employee
 * @param {string} id - Employee ID
 */
async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee? This will also delete all associated accounts and banking details.')) {
        return;
    }
    
    try {
        const response = await apiRequest(`employees/delete/${id}`, 'DELETE');
        if (response.status === 'success') {
            showAlert('Employee deleted successfully!', 'success');
            loadEmployees();
        } else {
            showAlert('Error deleting employee: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        showAlert('Error deleting employee. Please try again.', 'danger');
    }
}