/**
 * payslip.js - Payslip generation functions
 * This file handles the payslip form and preview functionality
 */

// Document ready event
document.addEventListener('DOMContentLoaded', function() {
  // Initialize payslip form page if on that page
  if (window.location.pathname.includes('payslip-form.html')) {
    initPayslipFormPage();
  }
});

// Current payslip preview type ('agent' or 'admin')
let currentPreviewType = 'agent';

// Global payslip data
let payslipData = {
  employee_id: '',
  employee_name: '',
  bank_account_id: '',
  bank_details: {
    preferred_bank: '',
    bank_account_number: '',
    bank_account_name: ''
  },
  person_in_charge: '',
  payment_status: 'Pending',
  cutoff_date: '',
  payment_date: '',
  salary: 0,
  bonus: 0,
  total_salary: 0
};

/**
 * Initialize payslip form page
 */
function initPayslipFormPage() {
  // Require authentication
  if (AuthService) {
    AuthService.requireAuth();
  }
  
  // Load initial data
  loadInitialData();
  
  // Initialize form fields and event listeners
  initFormFields();
  
  // Initialize preview
  updatePreview();
  
  // Initialize preview toggle
  initPreviewToggle();
}

/**
 * Load initial data
 */
async function loadInitialData() {
  // Check if editing or creating
  const payslipId = Utils.getUrlParam('id');
  const isEditing = !!payslipId;
  
  // Load employees for select dropdown
  await loadEmployeesForSelect();
  
  // If editing, load payslip data
  if (isEditing) {
    await loadPayslipData(payslipId);
  } else {
    // Set default values
    const payslipForm = document.getElementById('payslip-form');
    
    if (payslipForm) {
      // Set current date for payment date and cutoff date
      const today = new Date();
      const cutoffDate = document.getElementById('cutoff_date');
      const paymentDate = document.getElementById('payment_date');
      
      if (cutoffDate) cutoffDate.value = Utils.formatDateForInput(today);
      if (paymentDate) paymentDate.value = Utils.formatDateForInput(today);
      
      // Set current user as person in charge
      const personInCharge = document.getElementById('person_in_charge');
      if (personInCharge) {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
          personInCharge.value = `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim();
        }
      }
    }
  }
}

/**
 * Initialize form fields and event listeners
 */
function initFormFields() {
  const payslipForm = document.getElementById('payslip-form');
  
  if (!payslipForm) return;
  
  // Add event listeners for employee select
  const employeeSelect = document.getElementById('employee_id');
  
  if (employeeSelect) {
    employeeSelect.addEventListener('change', handleEmployeeChange);
  }
  
  // Add event listeners for bank account select
  const bankAccountSelect = document.getElementById('bank_account_id');
  
  if (bankAccountSelect) {
    bankAccountSelect.addEventListener('change', handleBankAccountChange);
  }
  
  // Add event listeners for salary and bonus inputs
  const salaryInput = document.getElementById('salary');
  const bonusInput = document.getElementById('bonus');
  
  if (salaryInput && bonusInput) {
    salaryInput.addEventListener('input', calculateTotalSalary);
    bonusInput.addEventListener('input', calculateTotalSalary);
  }
  
  // Add event listeners for other inputs to update preview
  const formInputs = payslipForm.querySelectorAll('input, select');
  
  formInputs.forEach(input => {
    input.addEventListener('change', () => {
      updateFormData();
      updatePreview();
    });
    
    // For text inputs, also listen for input events
    if (input.type === 'text' || input.type === 'number' || input.type === 'date') {
      input.addEventListener('input', () => {
        updateFormData();
        updatePreview();
      });
    }
  });
  
  // Form submission
  payslipForm.addEventListener('submit', handleFormSubmit);
  
  // Cancel button
  const cancelButton = payslipForm.querySelector('#cancel-btn');
  if (cancelButton) {
    cancelButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'payslips.html';
    });
  }
}

/**
 * Initialize preview toggle
 */
function initPreviewToggle() {
  const agentPreviewBtn = document.getElementById('agent-preview-btn');
  const adminPreviewBtn = document.getElementById('admin-preview-btn');
  
  if (agentPreviewBtn && adminPreviewBtn) {
    agentPreviewBtn.addEventListener('click', () => {
      agentPreviewBtn.classList.add('active');
      adminPreviewBtn.classList.remove('active');
      currentPreviewType = 'agent';
      updatePreview();
    });
    
    adminPreviewBtn.addEventListener('click', () => {
      adminPreviewBtn.classList.add('active');
      agentPreviewBtn.classList.remove('active');
      currentPreviewType = 'admin';
      updatePreview();
    });
  }
}

/**
 * Handle employee select change
 */
async function handleEmployeeChange() {
  const employeeSelect = document.getElementById('employee_id');
  const employeeNameField = document.getElementById('employee_name');
  const bankAccountSelect = document.getElementById('bank_account_id');
  
  if (!employeeSelect || !employeeNameField || !bankAccountSelect) return;
  
  const employeeId = employeeSelect.value;
  
  if (!employeeId) {
    // Clear fields if no employee selected
    employeeNameField.value = '';
    
    // Clear bank account select
    while (bankAccountSelect.options.length > 1) {
      bankAccountSelect.remove(1);
    }
    
    return;
  }
  
  try {
    // Fetch employee details
    const response = await ApiService.getEmployee(employeeId);
    
    if (response.success && response.data) {
      const employee = response.data;
      
      // Set employee name
      employeeNameField.value = `${employee.firstname} ${employee.lastname}`;
      
      // Load bank accounts for this employee
      await loadBankAccountsForEmployee(employeeId);
      
      // Update global data
      payslipData.employee_id = employeeId;
      payslipData.employee_name = `${employee.firstname} ${employee.lastname}`;
      
      // Update preview
      updatePreview();
    } else {
      Notification.error(response.message || 'Failed to load employee details');
    }
  } catch (error) {
    console.error('Error fetching employee details:', error);
    Notification.error(error.message || 'Failed to load employee details');
  }
}

/**
 * Load bank accounts for employee
 */
async function loadBankAccountsForEmployee(employeeId) {
  const bankAccountSelect = document.getElementById('bank_account_id');
  
  if (!bankAccountSelect) return;
  
  try {
    // Fetch banking details for employee
    const response = await ApiService.getBankingDetailsByEmployee(employeeId);
    
    if (response.success && response.data) {
      // Clear select
      while (bankAccountSelect.options.length > 1) {
        bankAccountSelect.remove(1);
      }
      
      // Add options
      if (response.data.length === 0) {
        // No banking details available
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No banking details available';
        option.disabled = true;
        bankAccountSelect.appendChild(option);
      } else {
        response.data.forEach(bank => {
          const option = document.createElement('option');
          option.value = bank.id;
          option.textContent = `${bank.preferred_bank} - ${bank.bank_account_number}`;
          bankAccountSelect.appendChild(option);
        });
        
        // Select first option
        bankAccountSelect.selectedIndex = 1;
        
        // Trigger change event to update bank details
        bankAccountSelect.dispatchEvent(new Event('change'));
      }
    } else {
      Notification.error(response.message || 'Failed to load banking details');
    }
  } catch (error) {
    console.error('Error loading banking details:', error);
    Notification.error(error.message || 'Failed to load banking details');
  }
}

/**
 * Handle bank account select change
 */
async function handleBankAccountChange() {
  const bankAccountSelect = document.getElementById('bank_account_id');
  const bankDetailsField = document.getElementById('bank_details');
  
  if (!bankAccountSelect || !bankDetailsField) return;
  
  const bankAccountId = bankAccountSelect.value;
  
  if (!bankAccountId) {
    // Clear field if no bank account selected
    bankDetailsField.value = '';
    return;
  }
  
  try {
    // Fetch bank account details
    const response = await ApiService.getBankingDetail(bankAccountId);
    
    if (response.success && response.data) {
      const bank = response.data;
      
      // Set bank details
      bankDetailsField.value = `${bank.preferred_bank} - ${bank.bank_account_number} (${bank.bank_account_name})`;
      
      // Update global data
      payslipData.bank_account_id = bankAccountId;
      payslipData.bank_details = {
        preferred_bank: bank.preferred_bank,
        bank_account_number: bank.bank_account_number,
        bank_account_name: bank.bank_account_name
      };
      
      // Update preview
      updatePreview();
    } else {
      Notification.error(response.message || 'Failed to load bank details');
    }
  } catch (error) {
    console.error('Error fetching bank details:', error);
    Notification.error(error.message || 'Failed to load bank details');
  }
}

/**
 * Calculate total salary
 */
function calculateTotalSalary() {
  const salaryInput = document.getElementById('salary');
  const bonusInput = document.getElementById('bonus');
  const totalSalaryInput = document.getElementById('total_salary');
  
  if (!salaryInput || !bonusInput || !totalSalaryInput) return;
  
  const salary = parseFloat(salaryInput.value) || 0;
  const bonus = parseFloat(bonusInput.value) || 0;
  const total = salary + bonus;
  
  // Set total salary
  totalSalaryInput.value = total.toFixed(2);
  
  // Update global data
  payslipData.salary = salary;
  payslipData.bonus = bonus;
  payslipData.total_salary = total;
  
  // Update preview
  updatePreview();
}

/**
 * Update form data from form inputs
 */
function updateFormData() {
  const employeeSelect = document.getElementById('employee_id');
  const employeeNameField = document.getElementById('employee_name');
  const bankAccountSelect = document.getElementById('bank_account_id');
  const bankDetailsField = document.getElementById('bank_details');
  const personInChargeField = document.getElementById('person_in_charge');
  const paymentStatusSelect = document.getElementById('payment_status');
  const cutoffDateField = document.getElementById('cutoff_date');
  const paymentDateField = document.getElementById('payment_date');
  const salaryInput = document.getElementById('salary');
  const bonusInput = document.getElementById('bonus');
  const totalSalaryInput = document.getElementById('total_salary');
  
  // Update global data
  if (employeeSelect) payslipData.employee_id = employeeSelect.value;
  if (employeeNameField) payslipData.employee_name = employeeNameField.value;
  if (bankAccountSelect) payslipData.bank_account_id = bankAccountSelect.value;
  if (personInChargeField) payslipData.person_in_charge = personInChargeField.value;
  if (paymentStatusSelect) payslipData.payment_status = paymentStatusSelect.value;
  if (cutoffDateField) payslipData.cutoff_date = cutoffDateField.value;
  if (paymentDateField) payslipData.payment_date = paymentDateField.value;
  if (salaryInput) payslipData.salary = parseFloat(salaryInput.value) || 0;
  if (bonusInput) payslipData.bonus = parseFloat(bonusInput.value) || 0;
  if (totalSalaryInput) payslipData.total_salary = parseFloat(totalSalaryInput.value) || 0;
}

/**
 * Update payslip preview
 */
function updatePreview() {
  const previewContainer = document.getElementById('payslip-preview');
  
  if (!previewContainer) return;
  
  // Select the preview template based on current type
  if (currentPreviewType === 'agent') {
    previewContainer.innerHTML = generateAgentPreview();
  } else {
    previewContainer.innerHTML = generateAdminPreview();
  }
}

/**
 * Generate agent preview HTML
 */
function generateAgentPreview() {
  // Format values for display
  const formattedCutoffDate = payslipData.cutoff_date ? Utils.formatDate(payslipData.cutoff_date, 'date') : '-';
  const formattedPaymentDate = payslipData.payment_date ? Utils.formatDate(payslipData.payment_date, 'date') : '-';
  const formattedSalary = Utils.formatCurrency(payslipData.salary);
  const formattedBonus = Utils.formatCurrency(payslipData.bonus);
  const formattedTotalSalary = Utils.formatCurrency(payslipData.total_salary);
  
  return `
    <div class="preview-header">
      <div class="company-logo">
        <img src="../assets/img/logo.png" alt="Company Logo">
      </div>
      <div class="company-name">Your Company Name</div>
      <div class="preview-header-type">AGENT PAYSLIP</div>
    </div>
    
    <div class="preview-body">
      <div class="preview-section">
        <h3 class="preview-section-title">Employee Information</h3>
        
        <div class="preview-row">
          <div class="preview-label">Agent Name:</div>
          <div class="preview-value">${payslipData.employee_name || '-'}</div>
        </div>
        
        <div class="preview-row">
          <div class="preview-label">Employee ID:</div>
          <div class="preview-value">${payslipData.employee_id || '-'}</div>
        </div>
        
        <div class="preview-row">
          <div class="preview-label">Date:</div>
          <div class="preview-value">${formattedPaymentDate}</div>
        </div>
      </div>
      
      <div class="preview-section">
        <h3 class="preview-section-title">Payment Information</h3>
        
        <div class="preview-table">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Salary</td>
                <td>${formattedSalary}</td>
              </tr>
              <tr>
                <td>Bonus</td>
                <td>${formattedBonus}</td>
              </tr>
              <tr class="preview-total-row">
                <td>Total</td>
                <td>${formattedTotalSalary}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div class="preview-footer">
      <p>This is a system-generated document. No signature required.</p>
    </div>
  `;
}

/**
 * Generate admin preview HTML
 */
function generateAdminPreview() {
  // Format values for display
  const formattedCutoffDate = payslipData.cutoff_date ? Utils.formatDate(payslipData.cutoff_date, 'date') : '-';
  const formattedPaymentDate = payslipData.payment_date ? Utils.formatDate(payslipData.payment_date, 'date') : '-';
  const formattedSalary = Utils.formatCurrency(payslipData.salary);
  const formattedBonus = Utils.formatCurrency(payslipData.bonus);
  const formattedTotalSalary = Utils.formatCurrency(payslipData.total_salary);
  
  return `
    <div class="preview-header">
      <div class="company-logo">
        <img src="../assets/img/logo.png" alt="Company Logo">
      </div>
      <div class="company-name">Your Company Name</div>
      <div class="preview-header-type">ADMIN PAYSLIP</div>
    </div>
    
    <div class="preview-body">
      <div class="preview-section">
        <h3 class="preview-section-title">Employee Information</h3>
        
        <div class="preview-row">
          <div class="preview-label">Agent Name:</div>
          <div class="preview-value">${payslipData.employee_name || '-'}</div>
        </div>
        
        <div class="preview-row">
          <div class="preview-label">Employee ID:</div>
          <div class="preview-value">${payslipData.employee_id || '-'}</div>
        </div>
      </div>
      
      <div class="preview-section">
        <h3 class="preview-section-title">Banking Information</h3>
        
        <div class="preview-row">
          <div class="preview-label">Bank Name:</div>
          <div class="preview-value">${payslipData.bank_details.preferred_bank || '-'}</div>
        </div>
        
        <div class="preview-row">
          <div class="preview-label">Account Number:</div>
          <div class="preview-value">${payslipData.bank_details.bank_account_number || '-'}</div>
        </div>
        
        <div class="preview-row">
          <div class="preview-label">Account Name:</div>
          <div class="preview-value">${payslipData.bank_details.bank_account_name || '-'}</div>
        </div>
      </div>
      
      <div class="preview-section">
        <h3 class="preview-section-title">Payment Information</h3>
        
        <div class="preview-row">
          <div class="preview-label">Person In Charge:</div>
          <div class="preview-value">${payslipData.person_in_charge || '-'}</div>
        </div>
        
        <div class="preview-row">
          <div class="preview-label">Payment Date:</div>
          <div class="preview-value">${formattedPaymentDate}</div>
        </div>
        
        <div class="preview-table">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Salary</td>
                <td>${formattedSalary}</td>
              </tr>
              <tr>
                <td>Bonus</td>
                <td>${formattedBonus}</td>
              </tr>
              <tr class="preview-total-row">
                <td>Total</td>
                <td>${formattedTotalSalary}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="preview-row">
          <div class="preview-label">Status:</div>
          <div class="preview-value">${Utils.formatStatusBadge(payslipData.payment_status)}</div>
        </div>
      </div>
    </div>
    
    <div class="preview-footer">
      <p>Authorized by: _________________________</p>
      <p>Date: _________________________</p>
      <p>This is a system-generated document.</p>
    </div>
  `;
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const payslipForm = document.getElementById('payslip-form');
  
  if (!payslipForm) return;
  
  // Check if editing or creating
  const payslipId = Utils.getUrlParam('id');
  const isEditing = !!payslipId;
  
  // Validate form
  if (typeof FormValidator !== 'undefined' && !FormValidator.validateForm(payslipForm)) {
    return;
  }
  
  // Get form data
  const formData = typeof FormValidator !== 'undefined' ? 
    FormValidator.getFormData(payslipForm) : 
    Object.fromEntries(new FormData(payslipForm));
  
  // Remove employee_name and bank_details fields from form data (they're only for display)
  delete formData.employee_name;
  delete formData.bank_details;
  
  try {
    // Show loading
    const submitButton = payslipForm.querySelector('[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
    
    let response;
    
    if (isEditing) {
      // Update payslip
      response = await ApiService.updatePayslip(payslipId, formData);
    } else {
      // Create payslip
      response = await ApiService.createPayslip(formData);
    }
    
    if (response.success) {
      Notification.success(`Payslip ${isEditing ? 'updated' : 'generated'} successfully`);
      
      // Show PDF links
      showPDFLinks(response.data);
      
      // Reset submit button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Generate Payslip';
      }
    } else {
      Notification.error(response.message || `Failed to ${isEditing ? 'update' : 'generate'} payslip`);
      
      // Reset submit button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Generate Payslip';
      }
    }
  } catch (error) {
    console.error('Error saving payslip:', error);
    Notification.error(error.message || `Failed to ${isEditing ? 'update' : 'generate'} payslip`);
    
    // Reset submit button
    const submitButton = payslipForm.querySelector('[type="submit"]');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Generate Payslip';
    }
  }
}

/**
 * Show PDF links
 */
function showPDFLinks(payslipData) {
  const pdfLinksContainer = document.getElementById('pdf-links');
  
  if (!pdfLinksContainer) return;
  
  // Create PDF links HTML
  const pdfLinksHTML = `
    <h3 class="pdf-title">Generated Payslip PDFs</h3>
    <div class="pdf-links-container">
      <a href="${payslipData.agent_pdf_path}" target="_blank" class="pdf-link">
        <i class="fas fa-file-pdf"></i> Agent Payslip
      </a>
      <a href="${payslipData.admin_pdf_path}" target="_blank" class="pdf-link">
        <i class="fas fa-file-pdf"></i> Admin Payslip
      </a>
    </div>
  `;
  
  pdfLinksContainer.innerHTML = pdfLinksHTML;
  pdfLinksContainer.style.display = 'block';
}

/**
 * Load payslip data for editing
 */
async function loadPayslipData(payslipId) {
  try {
    const response = await ApiService.getPayslip(payslipId);
    
    if (response.success && response.data) {
      const payslip = response.data;
      
      // Set global payslip data
      payslipData = {
        employee_id: payslip.employee_id,
        employee_name: payslip.employee_name,
        bank_account_id: payslip.bank_account_id,
        bank_details: payslip.bank_details,
        person_in_charge: payslip.person_in_charge,
        payment_status: payslip.payment_status,
        cutoff_date: payslip.cutoff_date,
        payment_date: payslip.payment_date,
        salary: parseFloat(payslip.salary),
        bonus: parseFloat(payslip.bonus),
        total_salary: parseFloat(payslip.total_salary)
      };
      
      // Populate form fields
      const employeeSelect = document.getElementById('employee_id');
      const employeeNameField = document.getElementById('employee_name');
      const bankAccountSelect = document.getElementById('bank_account_id');
      const bankDetailsField = document.getElementById('bank_details');
      const personInChargeField = document.getElementById('person_in_charge');
      const paymentStatusSelect = document.getElementById('payment_status');
      const cutoffDateField = document.getElementById('cutoff_date');
      const paymentDateField = document.getElementById('payment_date');
      const salaryInput = document.getElementById('salary');
      const bonusInput = document.getElementById('bonus');
      const totalSalaryInput = document.getElementById('total_salary');
      
      // Set field values
      if (employeeSelect) employeeSelect.value = payslip.employee_id;
      if (employeeNameField) employeeNameField.value = payslip.employee_name;
      if (personInChargeField) personInChargeField.value = payslip.person_in_charge;
      if (paymentStatusSelect) paymentStatusSelect.value = payslip.payment_status;
      if (cutoffDateField) cutoffDateField.value = Utils.formatDateForInput(payslip.cutoff_date);
      if (paymentDateField) paymentDateField.value = Utils.formatDateForInput(payslip.payment_date);
      if (salaryInput) salaryInput.value = payslip.salary;
      if (bonusInput) bonusInput.value = payslip.bonus;
      if (totalSalaryInput) totalSalaryInput.value = payslip.total_salary;
      
      // Load bank accounts for this employee, then set the selected account
      await loadBankAccountsForEmployee(payslip.employee_id);
      
      if (bankAccountSelect) {
        bankAccountSelect.value = payslip.bank_account_id;
        
        // Set bank details text
        if (bankDetailsField) {
          const bank = payslip.bank_details;
          bankDetailsField.value = `${bank.preferred_bank} - ${bank.bank_account_number} (${bank.bank_account_name})`;
        }
      }
      
      // Show PDF links
      showPDFLinks(payslip);
      
      // Update preview
      updatePreview();
    } else {
      Notification.error(response.message || 'Failed to load payslip data');
    }
  } catch (error) {
    console.error('Error loading payslip data:', error);
    Notification.error(error.message || 'Failed to load payslip data');
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