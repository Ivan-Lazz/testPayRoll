/**
 * Employees JavaScript
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load employees
    loadEmployees();

    // Add event listeners
    const openCreateEmployeeModalBtn = document.getElementById('openCreateEmployeeModalBtn');
    const closeCreateEmployeeModal = document.getElementById('closeCreateEmployeeModal');
    const cancelCreateEmployeeBtn = document.getElementById('cancelCreateEmployeeBtn');
    const saveEmployeeBtn = document.getElementById('saveEmployeeBtn');
    
    if (openCreateEmployeeModalBtn) {
        openCreateEmployeeModalBtn.addEventListener('click', function() {
            document.getElementById('createEmployeeModal').classList.add('show');
            document.getElementById('createEmployeeForm').reset();
            // Auto-fill employee ID field with placeholder
            document.getElementById('employee_id').value = 'Auto-generated';
        });
    }
    
    if (closeCreateEmployeeModal) {
        closeCreateEmployeeModal.addEventListener('click', function() {
            document.getElementById('createEmployeeModal').classList.remove('show');
        });
    }
    
    if (cancelCreateEmployeeBtn) {
        cancelCreateEmployeeBtn.addEventListener('click', function() {
            document.getElementById('createEmployeeModal').classList.remove('show');
        });
    }
    
    if (saveEmployeeBtn) {
        saveEmployeeBtn.addEventListener('click', createEmployee);
    }
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
            
            if (employees.length === 0) {
                employeesList.innerHTML = '<tr><td colspan="6" class="text-center">No employees found</td></tr>';
                return;
            }
            
            // Paginate employees
            const itemsPerPage = 10;
            const totalPages = Math.ceil(employees.length / itemsPerPage);
            
            // Make sure page is valid
            page = Math.max(1, Math.min(page, totalPages));
            
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedEmployees = employees.slice(startIndex, endIndex);
            
            let employeesHTML = '';
            
            paginatedEmployees.forEach(employee => {
                employeesHTML += `
                    <tr>
                        <td>${employee.employee_id}</td>
                        <td>${employee.firstname} ${employee.lastname}</td>
                        <td>${employee.contact_number}</td>
                        <td>${employee.email}</td>
                        <td>${formatDate(employee.created_at)}</td>
                        <td class="actions">
                            <a href="banking.php?employee=${employee.employee_id}" class="btn btn-primary">Banking</a>
                            <a href="accounts.php?employee=${employee.employee_id}" class="btn btn-primary">Accounts</a>
                            <a href="payslips.php?employee=${employee.employee_id}" class="btn btn-primary">Payslips</a>
                        </td>
                    </tr>
                `;
            });
            
            employeesList.innerHTML = employeesHTML;
            
            // Create pagination if needed
            if (totalPages > 1 && paginationContainer) {
                const paginationEl = createPagination(page, totalPages, function(newPage) {
                    loadEmployees(newPage);
                });
                
                paginationContainer.innerHTML = '';
                paginationContainer.appendChild(paginationEl);
            } else if (paginationContainer) {
                paginationContainer.innerHTML = '';
            }
        } else {
            employeesList.innerHTML = '<tr><td colspan="6" class="text-center">No employees found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading employees:', error);
        employeesList.innerHTML = '<tr><td colspan="6" class="text-center">Error loading employees. Please try again.</td></tr>';
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
    
    try {
        // Prepare data
        const data = {
            firstname,
            lastname,
            contact_number,
            email
        };
        
        // Send create request
        const response = await apiRequest('employees/create', 'POST', data);
        
        if (response.status === 'success') {
            showAlert('Employee created successfully!', 'success');
            
            // Close modal and reset form
            document.getElementById('createEmployeeModal').classList.remove('show');
            document.getElementById('createEmployeeForm').reset();
            
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