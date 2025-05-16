/**
 * Handle form submission
 * @param {HTMLFormElement} form - Form element
 * @param {function} callback - Callback function
 */
function handleFormSubmit(form, callback) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const data = formToObject(form);
        callback(data);
    });
}/**
 * Main JavaScript file for Pay Slip Generator System
 */

// The API_BASE_URL is now set in the footer.php file

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Logout functionality is now handled in footer.php
    
    // Add current user ID to body for reference
    const userId = getUserIdFromSession();
    if (userId) {
        document.querySelector('body').setAttribute('data-user-id', userId);
    }

    // Set up global AJAX error handler
    setupAjaxErrorHandler();
    
    // Setup global modal functionality
    setupModals();
});

/**
 * Get user ID from session
 * @returns {string|null} - User ID from session
 */
function getUserIdFromSession() {
    // This implementation assumes you're storing the user ID in a JavaScript variable
    // populated from PHP session. Adjust as needed for your application.
    return typeof USER_ID !== 'undefined' ? USER_ID : null;
}

/**
 * Setup AJAX error handler
 */
function setupAjaxErrorHandler() {
    // This can be used to handle global AJAX errors, like session timeouts
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        
        // Check if it's a 401 Unauthorized error (session timeout)
        if (event.reason && event.reason.status === 401) {
            showAlert('Your session has expired. Please log in again.', 'warning');
            setTimeout(() => {
                window.location.href = 'login.php';
            }, 2000);
        }
    });
}

/**
 * Show alert message
 * @param {string} message - Alert message
 * @param {string} type - Alert type (success, danger, warning, info)
 * @param {number} duration - Duration in milliseconds to show the alert
 */
function showAlert(message, type = 'info', duration = 5000) {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;

    // Create alert element
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type}`;
    alertEl.innerHTML = message;

    // Add alert to container
    alertContainer.appendChild(alertEl);

    // Remove alert after duration
    setTimeout(() => {
        if (alertContainer.contains(alertEl)) {
            alertContainer.removeChild(alertEl);
        }
    }, duration);
}

/**
 * Make API request
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} data - Request data
 * @returns {Promise} - Promise with response data
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error('API Request Error:', error);
        showAlert(error.message, 'danger');
        throw error;
    }
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}

/**
 * Format date
 * @param {string} dateString - Date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Create pagination controls
 * @param {number} currentPage - Current page
 * @param {number} totalPages - Total pages
 * @param {function} onPageChange - Callback function when page changes
 * @returns {HTMLElement} - Pagination element
 */
function createPagination(currentPage, totalPages, onPageChange) {
    const paginationEl = document.createElement('div');
    paginationEl.className = 'pagination';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.innerText = 'Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    });
    paginationEl.appendChild(prevBtn);

    // Page buttons
    const maxButtons = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.innerText = i;
        if (i === currentPage) {
            pageBtn.className = 'active';
        }
        pageBtn.addEventListener('click', () => {
            onPageChange(i);
        });
        paginationEl.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    });
    paginationEl.appendChild(nextBtn);

    return paginationEl;
}

/**
 * Show loader
 * @param {HTMLElement} container - Container element to show loader
 */
function showLoader(container) {
    // Clear container first
    container.innerHTML = '';
    
    // Create loader element
    const loaderEl = document.createElement('div');
    loaderEl.className = 'loading';
    
    const loader = document.createElement('div');
    loader.className = 'loader';
    
    loaderEl.appendChild(loader);
    container.appendChild(loaderEl);
}

/**
 * Hide loader
 * @param {HTMLElement} container - Container element with loader
 */
function hideLoader(container) {
    const loaderEl = container.querySelector('.loading');
    if (loaderEl) {
        container.removeChild(loaderEl);
    }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Convert form data to object
 * @param {HTMLFormElement} form - Form element
 * @returns {object} - Form data object
 */
function formToObject(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} - Random string
 */
function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

/**
 * Debounce function
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {function} - Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}

/**
 * Calculate total from multiple inputs
 * @param {array} inputIds - Array of input IDs
 * @param {string} totalId - ID of total input
 */
function calculateTotal(inputIds, totalId) {
    const total = inputIds.reduce((sum, id) => {
        const input = document.getElementById(id);
        return sum + (parseFloat(input.value) || 0);
    }, 0);
    
    document.getElementById(totalId).value = total.toFixed(2);
}

/**
 * Toggle element visibility
 * @param {string} elementId - Element ID
 * @param {boolean} show - Whether to show element
 */
function toggleElement(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = show ? 'block' : 'none';
    }
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} - Current date in YYYY-MM-DD format
 */
function getCurrentDate() {
    const date = new Date();
    return date.toISOString().slice(0, 10);
}

/**
 * Setup modal functionality
 */
function setupModals() {
    // Find all open modal buttons (using any button with an ID starting with 'open' and ending with 'ModalBtn')
    const openModalBtns = document.querySelectorAll('[id^="open"][id$="ModalBtn"]');
    
    openModalBtns.forEach(btn => {
        // Extract modal ID from button ID
        // e.g., openCreateUserModalBtn -> createUserModal
        const modalId = btn.id.replace('open', '').replace('ModalBtn', '');
        const modal = document.getElementById(modalId);
        
        if (modal) {
            // Add click event to open modal
            btn.addEventListener('click', () => {
                console.log(`Opening modal: ${modalId}`);
                modal.classList.add('show');
                
                // Reset form if present
                const form = modal.querySelector('form');
                if (form) {
                    form.reset();
                }
            });
            
            // Find all close buttons for this modal
            const closeBtns = modal.querySelectorAll('[id^="close"], [id^="cancel"]');
            closeBtns.forEach(closeBtn => {
                closeBtn.addEventListener('click', () => {
                    console.log(`Closing modal: ${modalId}`);
                    modal.classList.remove('show');
                });
            });
        } else {
            console.error(`Modal not found: ${modalId}`);
        }
    });
    
    // Close modal when clicking outside content (on backdrop)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') && e.target.classList.contains('show')) {
            e.target.classList.remove('show');
        }
    });
}