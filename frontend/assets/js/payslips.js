/**
 * Payslips JavaScript
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load employees and payslips
    loadEmployees();
    loadPayslips();

    // Add event listeners
    const employeeSelect = document.getElementById('employee_id');
    if (employeeSelect) {
        employeeSelect.addEventListener('change', function() {
            loadBankAccounts(this.value);
            updatePreview();
        });
    }

    const bankAccountSelect = document.getElementById('bank_account_id');
    if (bankAccountSelect) {
        bankAccountSelect.addEventListener('change', updatePreview);
    }

    const salaryInput = document.getElementById('salary');
    const bonusInput = document.getElementById('bonus');
    const totalSalaryInput = document.getElementById('total_salary');

    if (salaryInput && bonusInput && totalSalaryInput) {
        // Calculate total salary
        function calculateTotal() {
            const salary = parseFloat(salaryInput.value) || 0;
            const bonus = parseFloat(bonusInput.value) || 0;
            totalSalaryInput.value = (salary + bonus).toFixed(2);
            updatePreview();
        }

        salaryInput.addEventListener('input', calculateTotal);
        bonusInput.addEventListener('input', calculateTotal);
    }

    // Form submission
    const payslipForm = document.getElementById('payslipForm');
    if (payslipForm) {
        payslipForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createPayslip();
        });
    }

    // Other form fields for preview update
    const personInChargeInput = document.getElementById('person_in_charge');
    const cutoffDateInput = document.getElementById('cutoff_date');
    const paymentDateInput = document.getElementById('payment_date');
    const paymentStatusSelect = document.getElementById('payment_status');

    if (personInChargeInput) personInChargeInput.addEventListener('input', updatePreview);
    if (cutoffDateInput) cutoffDateInput.addEventListener('change', updatePreview);
    if (paymentDateInput) paymentDateInput.addEventListener('change', updatePreview);
    if (paymentStatusSelect) paymentStatusSelect.addEventListener('change', updatePreview);

    // Modal close buttons
    const closeViewPayslipModal = document.getElementById('closeViewPayslipModal');
    const closeViewPayslipModalBtn = document.getElementById('closeViewPayslipModalBtn');
    
    if (closeViewPayslipModal) {
        closeViewPayslipModal.addEventListener('click', function() {
            document.getElementById('viewPayslipModal').classList.remove('show');
        });
    }
    
    if (closeViewPayslipModalBtn) {
        closeViewPayslipModalBtn.addEventListener('click', function() {
            document.getElementById('viewPayslipModal').classList.remove('show');
        });
    }

    // Check for view parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const viewPayslipId = urlParams.get('view');
    
    if (viewPayslipId) {
        viewPayslip(viewPayslipId);
    }
});

/**
 * Load employees
 */
async function loadEmployees() {
    const employeeSelect = document.getElementById('employee_id');
    if (!employeeSelect) return;

    try {
        const response = await apiRequest('employees');
        
        if (response.status === 'success' && response.data.length > 0) {
            let options = '<option value="">Select Employee</option>';
            
            response.data.forEach(employee => {
                options += `<option value="${employee.employee_id}">${employee.employee_id} - ${employee.firstname} ${employee.lastname}</option>`;
            });
            
            employeeSelect.innerHTML = options;
        } else {
            employeeSelect.innerHTML = '<option value="">No employees found</option>';
        }
    } catch (error) {
        console.error('Error loading employees:', error);
        employeeSelect.innerHTML = '<option value="">Error loading employees</option>';
    }
}

/**
 * Load bank accounts for selected employee
 * @param {string} employeeId - Employee ID
 */
async function loadBankAccounts(employeeId) {
    const bankAccountSelect = document.getElementById('bank_account_id');
    if (!bankAccountSelect || !employeeId) {
        bankAccountSelect.innerHTML = '<option value="">Select Bank Account</option>';
        return;
    }

    try {
        const response = await apiRequest(`banking/employee/${employeeId}/accounts`);
        
        if (response.status === 'success' && response.data.length > 0) {
            let options = '<option value="">Select Bank Account</option>';
            
            response.data.forEach(account => {
                options += `<option value="${account.id}">${account.preferred_bank} - ${account.bank_account_number}</option>`;
            });
            
            bankAccountSelect.innerHTML = options;
        } else {
            bankAccountSelect.innerHTML = '<option value="">No bank accounts found</option>';
        }
    } catch (error) {
        console.error('Error loading bank accounts:', error);
        bankAccountSelect.innerHTML = '<option value="">Error loading bank accounts</option>';
    }
}

/**
 * Load payslips with pagination
 * @param {number} page - Page number
 */
async function loadPayslips(page = 1) {
    const payslipsList = document.getElementById('payslipsList');
    const paginationContainer = document.getElementById('payslipsPagination');
    
    if (!payslipsList) return;
    
    showLoader(payslipsList);
    
    try {
        const response = await apiRequest('payslips');
        
        if (response.status === 'success') {
            const payslips = response.data;
            
            if (payslips.length === 0) {
                payslipsList.innerHTML = '<tr><td colspan="7" class="text-center">No payslips found</td></tr>';
                return;
            }
            
            // Paginate payslips
            const itemsPerPage = 10;
            const totalPages = Math.ceil(payslips.length / itemsPerPage);
            
            // Make sure page is valid
            page = Math.max(1, Math.min(page, totalPages));
            
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedPayslips = payslips.slice(startIndex, endIndex);
            
            let payslipsHTML = '';
            
            paginatedPayslips.forEach(payslip => {
                // Determine status class
                let statusClass = '';
                switch (payslip.payment_status) {
                    case 'Paid':
                        statusClass = 'text-success';
                        break;
                    case 'Pending':
                        statusClass = 'text-warning';
                        break;
                    case 'Cancelled':
                        statusClass = 'text-danger';
                        break;
                    default:
                        statusClass = '';
                }
                
                payslipsHTML += `
                    <tr>
                        <td>${payslip.payslip_no}</td>
                        <td>${payslip.employee_name}</td>
                        <td>${payslip.bank_account_details}</td>
                        <td>${formatDate(payslip.payment_date)}</td>
                        <td>${formatCurrency(payslip.total_salary)}</td>
                        <td class="${statusClass}">${payslip.payment_status}</td>
                        <td class="actions">
                            <button class="btn btn-primary" onclick="viewPayslip(${payslip.id})">View</button>
                        </td>
                    </tr>
                `;
            });
            
            payslipsList.innerHTML = payslipsHTML;
            
            // Create pagination if needed
            if (totalPages > 1 && paginationContainer) {
                const paginationEl = createPagination(page, totalPages, function(newPage) {
                    loadPayslips(newPage);
                });
                
                paginationContainer.innerHTML = '';
                paginationContainer.appendChild(paginationEl);
            } else if (paginationContainer) {
                paginationContainer.innerHTML = '';
            }
        } else {
            payslipsList.innerHTML = '<tr><td colspan="7" class="text-center">No payslips found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading payslips:', error);
        payslipsList.innerHTML = '<tr><td colspan="7" class="text-center">Error loading payslips. Please try again.</td></tr>';
    }
}

/**
 * Update payslip preview
 */
function updatePreview() {
    const previewContainer = document.getElementById('payslipPreview');
    if (!previewContainer) return;
    
    // Get form values
    const employeeSelect = document.getElementById('employee_id');
    const bankAccountSelect = document.getElementById('bank_account_id');
    const salary = document.getElementById('salary').value || '0';
    const bonus = document.getElementById('bonus').value || '0';
    const totalSalary = document.getElementById('total_salary').value || '0';
    const personInCharge = document.getElementById('person_in_charge').value || '';
    const cutoffDate = document.getElementById('cutoff_date').value || '';
    const paymentDate = document.getElementById('payment_date').value || '';
    const paymentStatus = document.getElementById('payment_status').value || '';
    
    // Get selected employee and bank account text
    const employeeText = employeeSelect.options[employeeSelect.selectedIndex]?.text || '';
    const bankAccountText = bankAccountSelect.options[bankAccountSelect.selectedIndex]?.text || '';
    
    // Check if we have enough data for preview
    if (!employeeText || employeeText === 'Select Employee') {
        previewContainer.innerHTML = '<p class="text-center">Select an employee to generate preview</p>';
        return;
    }
    
    // Format dates
    const formattedCutoffDate = cutoffDate ? formatDate(cutoffDate) : '';
    const formattedPaymentDate = paymentDate ? formatDate(paymentDate) : '';
    
    // Create preview HTML
    const previewHTML = `
        <div class="preview-header">
            <h2>Company Name</h2>
            <p class="text-right">Payslip</p>
        </div>
        
        <div class="preview-employee-info">
            <p><strong>Employee:</strong> ${employeeText}</p>
            ${bankAccountText ? `<p><strong>Bank Account:</strong> ${bankAccountText}</p>` : ''}
            <p><strong>Person In Charge:</strong> ${personInCharge}</p>
        </div>
        
        <div class="preview-dates">
            ${formattedCutoffDate ? `<p><strong>Cutoff Date:</strong> ${formattedCutoffDate}</p>` : ''}
            ${formattedPaymentDate ? `<p><strong>Payment Date:</strong> ${formattedPaymentDate}</p>` : ''}
            <p><strong>Status:</strong> ${paymentStatus}</p>
        </div>
        
        <div class="preview-payment">
            <table style="width: 100%; margin-top: 20px;">
                <tr>
                    <td><strong>Salary:</strong></td>
                    <td class="text-right">${formatCurrency(parseFloat(salary))}</td>
                </tr>
                <tr>
                    <td><strong>Bonus:</strong></td>
                    <td class="text-right">${formatCurrency(parseFloat(bonus))}</td>
                </tr>
                <tr>
                    <td><strong>Total:</strong></td>
                    <td class="text-right"><strong>${formatCurrency(parseFloat(totalSalary))}</strong></td>
                </tr>
            </table>
        </div>
    `;
    
    previewContainer.innerHTML = previewHTML;
}

/**
 * Create payslip
 */
async function createPayslip() {
    // Get form values
    const employeeId = document.getElementById('employee_id').value;
    const bankAccountId = document.getElementById('bank_account_id').value;
    const salary = document.getElementById('salary').value;
    const bonus = document.getElementById('bonus').value;
    const personInCharge = document.getElementById('person_in_charge').value;
    const cutoffDate = document.getElementById('cutoff_date').value;
    const paymentDate = document.getElementById('payment_date').value;
    const paymentStatus = document.getElementById('payment_status').value;
    
    // Validate required fields
    if (!employeeId || !bankAccountId || !salary || !personInCharge || !cutoffDate || !paymentDate || !paymentStatus) {
        showAlert('Please fill all required fields.', 'danger');
        return;
    }
    
    try {
        // Prepare data
        const data = {
            employee_id: employeeId,
            bank_account_id: bankAccountId,
            salary: parseFloat(salary),
            bonus: parseFloat(bonus || 0),
            person_in_charge: personInCharge,
            cutoff_date: cutoffDate,
            payment_date: paymentDate,
            payment_status: paymentStatus
        };
        
        // Send create request
        const response = await apiRequest('payslips/create', 'POST', data);
        
        if (response.status === 'success') {
            showAlert('Payslip created successfully!', 'success');
            
            // Reset form
            document.getElementById('payslipForm').reset();
            document.getElementById('person_in_charge').value = '<?php echo $_SESSION[\'firstname\'] . " " . $_SESSION[\'lastname\']; ?>';
            document.getElementById('cutoff_date').value = new Date().toISOString().slice(0, 10);
            document.getElementById('payment_date').value = new Date().toISOString().slice(0, 10);
            
            // Reset preview
            const previewContainer = document.getElementById('payslipPreview');
            if (previewContainer) {
                previewContainer.innerHTML = '<p class="text-center">Fill the form to generate a preview</p>';
            }
            
            // Reload payslips
            loadPayslips();
            
            // Show the newly created payslip
            viewPayslip(response.data.id);
        } else {
            showAlert('Error creating payslip: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error creating payslip:', error);
        showAlert('Error creating payslip. Please try again.', 'danger');
    }
}

/**
 * View payslip
 * @param {number} id - Payslip ID
 */
async function viewPayslip(id) {
    const modal = document.getElementById('viewPayslipModal');
    const modalBody = document.getElementById('viewPayslipModalBody');
    const downloadAgentPdfBtn = document.getElementById('downloadAgentPdfBtn');
    const downloadAdminPdfBtn = document.getElementById('downloadAdminPdfBtn');
    
    if (!modal || !modalBody) return;
    
    // Show modal
    modal.classList.add('show');
    
    // Show loader
    showLoader(modalBody);
    
    try {
        // Fetch payslip
        const response = await apiRequest(`payslips/get/${id}`);
        
        if (response.status === 'success') {
            const payslip = response.data;
            
            // Determine status class
            let statusClass = '';
            switch (payslip.payment_status) {
                case 'Paid':
                    statusClass = 'text-success';
                    break;
                case 'Pending':
                    statusClass = 'text-warning';
                    break;
                case 'Cancelled':
                    statusClass = 'text-danger';
                    break;
                default:
                    statusClass = '';
            }
            
            // Create payslip details HTML
            const payslipHTML = `
                <div class="payslip-details">
                    <div class="payslip-header">
                        <h3>Payslip #${payslip.payslip_no}</h3>
                        <p class="${statusClass}"><strong>Status:</strong> ${payslip.payment_status}</p>
                    </div>
                    
                    <div class="payslip-info">
                        <div class="row">
                            <div class="col">
                                <p><strong>Employee:</strong> ${payslip.employee_name}</p>
                                <p><strong>Employee ID:</strong> ${payslip.employee_id}</p>
                                <p><strong>Bank Account:</strong> ${payslip.bank_account_details}</p>
                                <p><strong>Bank:</strong> ${payslip.preferred_bank}</p>
                            </div>
                            <div class="col">
                                <p><strong>Person In Charge:</strong> ${payslip.person_in_charge}</p>
                                <p><strong>Cutoff Date:</strong> ${formatDate(payslip.cutoff_date)}</p>
                                <p><strong>Payment Date:</strong> ${formatDate(payslip.payment_date)}</p>
                                <p><strong>Created:</strong> ${formatDate(payslip.created_at)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="payslip-payment">
                        <table style="width: 100%; margin-top: 20px;">
                            <tr>
                                <td><strong>Salary:</strong></td>
                                <td class="text-right">${formatCurrency(parseFloat(payslip.salary))}</td>
                            </tr>
                            <tr>
                                <td><strong>Bonus:</strong></td>
                                <td class="text-right">${formatCurrency(parseFloat(payslip.bonus))}</td>
                            </tr>
                            <tr>
                                <td><strong>Total:</strong></td>
                                <td class="text-right"><strong>${formatCurrency(parseFloat(payslip.total_salary))}</strong></td>
                            </tr>
                        </table>
                    </div>
                </div>
            `;
            
            // Update modal body
            modalBody.innerHTML = payslipHTML;
            
            // Update PDF download links
            if (downloadAgentPdfBtn && payslip.agent_pdf_path) {
                downloadAgentPdfBtn.href = `/payslip-generator/backend/payslips/download/${id}/agent`;
                downloadAgentPdfBtn.classList.remove('hidden');
            } else if (downloadAgentPdfBtn) {
                downloadAgentPdfBtn.classList.add('hidden');
            }
            
            if (downloadAdminPdfBtn && payslip.admin_pdf_path) {
                downloadAdminPdfBtn.href = `/payslip-generator/backend/payslips/download/${id}/admin`;
                downloadAdminPdfBtn.classList.remove('hidden');
            } else if (downloadAdminPdfBtn) {
                downloadAdminPdfBtn.classList.add('hidden');
            }
        } else {
            modalBody.innerHTML = '<p class="text-center">Error loading payslip details.</p>';
        }
    } catch (error) {
        console.error('Error loading payslip details:', error);
        modalBody.innerHTML = '<p class="text-center">Error loading payslip details. Please try again.</p>';
    }
}