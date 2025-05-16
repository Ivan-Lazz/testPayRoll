/**
 * utils.js - Utility functions
 * This file contains common utility functions used throughout the application
 */

/**
 * Utility functions
 */
const Utils = {
  /**
   * Format date to string
   * @param {string|Date} date - Date to format
   * @param {string} format - Output format (date, datetime, time)
   * @returns {string} Formatted date string
   */
  formatDate(date, format = 'date') {
    if (!date) {
      return '';
    }
    
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
      return '';
    }
    
    const pad = (num) => String(num).padStart(2, '0');
    
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    
    switch (format) {
      case 'datetime':
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      case 'time':
        return `${hours}:${minutes}:${seconds}`;
      case 'date':
      default:
        return `${year}-${month}-${day}`;
    }
  },
  
  /**
   * Format date for input fields
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date for input fields (YYYY-MM-DD)
   */
  formatDateForInput(date) {
    if (!date) {
      return '';
    }
    
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
      return '';
    }
    
    const pad = (num) => String(num).padStart(2, '0');
    
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  },
  
  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: PHP)
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount, currency = 'PHP') {
    if (amount === null || amount === undefined) {
      return '';
    }
    
    const formatter = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
    
    return formatter.format(amount);
  },
  
  /**
   * Format number
   * @param {number} value - Number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted number string
   */
  formatNumber(value, decimals = 2) {
    if (value === null || value === undefined) {
      return '';
    }
    
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    
    return formatter.format(value);
  },
  
  /**
   * Format status as badge
   * @param {string} status - Status string
   * @returns {string} HTML for status badge
   */
  formatStatusBadge(status) {
    if (!status) {
      return '';
    }
    
    const statusLower = status.toLowerCase();
    let statusClass = '';
    
    switch (statusLower) {
      case 'active':
      case 'paid':
        statusClass = 'status-active';
        break;
      case 'inactive':
      case 'cancelled':
        statusClass = 'status-inactive';
        break;
      case 'pending':
        statusClass = 'status-pending';
        break;
      default:
        statusClass = '';
    }
    
    return `<span class="status-badge ${statusClass}">${status}</span>`;
  },
  
  /**
   * Truncate text to a certain length and add ellipsis
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length
   * @returns {string} Truncated text
   */
  truncateText(text, length = 50) {
    if (!text) {
      return '';
    }
    
    if (text.length <= length) {
      return text;
    }
    
    return text.substring(0, length) + '...';
  },
  
  /**
   * Parse URL query parameters
   * @returns {Object} Query parameters as object
   */
  getQueryParams() {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
    
    return params;
  },
  
  /**
   * Get URL parameter by name
   * @param {string} name - Parameter name
   * @returns {string|null} Parameter value or null if not found
   */
  getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  },
  
  /**
   * Generate random string (for IDs, etc.)
   * @param {number} length - Length of string
   * @returns {string} Random string
   */
  randomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  },
  
  /**
   * Debounce function to limit how often a function can be called
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait = 300) {
    let timeout;
    
    return function(...args) {
      const context = this;
      
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  },
  
  /**
   * Load HTML component into element
   * @param {string} elementId - ID of element to load into
   * @param {string} componentPath - Path to component HTML file
   * @param {Function} callback - Callback after component is loaded
   */
  loadComponent(elementId, componentPath, callback = null) {
    const element = document.getElementById(elementId);
    
    if (!element) {
      console.error(`Element with ID '${elementId}' not found`);
      return;
    }
    
    fetch(componentPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load component: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then(html => {
        element.innerHTML = html;
        
        // Execute scripts in the component
        const scripts = element.querySelectorAll('script');
        scripts.forEach(script => {
          const newScript = document.createElement('script');
          
          if (script.src) {
            newScript.src = script.src;
          } else {
            newScript.textContent = script.textContent;
          }
          
          document.head.appendChild(newScript);
          script.remove();
        });
        
        // Call callback if provided
        if (callback && typeof callback === 'function') {
          callback();
        }
      })
      .catch(error => {
        console.error('Error loading component:', error);
        element.innerHTML = `<div class="alert alert-danger">Error loading component: ${error.message}</div>`;
      });
  },
  
  /**
   * Create notification elements
   */
  createNotificationElements() {
    // Check if notification container already exists
    if (document.getElementById('notification-container')) {
      return;
    }
    
    // Create notification container
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    
    // Add container to body
    document.body.appendChild(container);
    
    // Add style if not already added
    if (!document.getElementById('notification-style')) {
      const style = document.createElement('style');
      style.id = 'notification-style';
      style.textContent = `
        .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
        }
        
        .notification {
          width: 300px;
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          animation: notification-slide-in 0.3s ease;
          position: relative;
        }
        
        .notification-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .notification-error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        .notification-warning {
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeeba;
        }
        
        .notification-info {
          background-color: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }
        
        .notification-close {
          position: absolute;
          top: 5px;
          right: 5px;
          cursor: pointer;
          font-size: 16px;
          opacity: 0.5;
        }
        
        .notification-close:hover {
          opacity: 1;
        }
        
        @keyframes notification-slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes notification-slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .notification-slide-out {
          animation: notification-slide-out 0.3s ease forwards;
        }
      `;
      
      document.head.appendChild(style);
    }
  },
  
  /**
   * Format bytes to human readable size
   * @param {number} bytes - Number of bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted size string
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },
  
  /**
   * Get file extension from file name
   * @param {string} filename - File name
   * @returns {string} File extension
   */
  getFileExtension(filename) {
    if (!filename) return '';
    
    return filename.split('.').pop().toLowerCase();
  },
  
  /**
   * Check if file is an image
   * @param {string} filename - File name
   * @returns {boolean} Whether file is an image
   */
  isImageFile(filename) {
    const ext = this.getFileExtension(filename);
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext);
  },
  
  /**
   * Check if file is a PDF
   * @param {string} filename - File name
   * @returns {boolean} Whether file is a PDF
   */
  isPdfFile(filename) {
    const ext = this.getFileExtension(filename);
    return ext === 'pdf';
  },
  
  /**
   * Format file name to be displayed
   * @param {string} filename - File name
   * @param {number} maxLength - Maximum length
   * @returns {string} Formatted file name
   */
  formatFileName(filename, maxLength = 20) {
    if (!filename) {
      return '';
    }
    
    if (filename.length <= maxLength) {
      return filename;
    }
    
    const ext = this.getFileExtension(filename);
    const nameWithoutExt = filename.substring(0, filename.length - ext.length - 1);
    
    const truncatedName = nameWithoutExt.substring(0, maxLength - ext.length - 4) + '...';
    
    return `${truncatedName}.${ext}`;
  }
};

/**
 * Notification system
 */
const Notification = {
  /**
   * Initialize notification system
   */
  init() {
    Utils.createNotificationElements();
  },
  
  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning, info)
   * @param {number} duration - Duration in milliseconds (0 for no auto-close)
   */
  show(message, type = 'info', duration = 5000) {
    // Initialize if not already
    this.init();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span class="notification-close">&times;</span>
      ${message}
    `;
    
    // Add notification to container
    const container = document.getElementById('notification-container');
    container.appendChild(notification);
    
    // Add close button event
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
      this.close(notification);
    });
    
    // Auto-close if duration is set
    if (duration > 0) {
      setTimeout(() => {
        this.close(notification);
      }, duration);
    }
    
    return notification;
  },
  
  /**
   * Close notification
   * @param {Element} notification - Notification element
   */
  close(notification) {
    notification.classList.add('notification-slide-out');
    
    notification.addEventListener('animationend', () => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
  },
  
  /**
   * Show success notification
   * @param {string} message - Notification message
   * @param {number} duration - Duration in milliseconds
   */
  success(message, duration = 5000) {
    return this.show(message, 'success', duration);
  },
  
  /**
   * Show error notification
   * @param {string} message - Notification message
   * @param {number} duration - Duration in milliseconds
   */
  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  },
  
  /**
   * Show warning notification
   * @param {string} message - Notification message
   * @param {number} duration - Duration in milliseconds
   */
  warning(message, duration = 5000) {
    return this.show(message, 'warning', duration);
  },
  
  /**
   * Show info notification
   * @param {string} message - Notification message
   * @param {number} duration - Duration in milliseconds
   */
  info(message, duration = 5000) {
    return this.show(message, 'info', duration);
  }
};

/**
 * Form validation utilities
 */
const FormValidator = {
  /**
   * Validate form
   * @param {HTMLFormElement} form - Form element
   * @returns {boolean} Whether form is valid
   */
  validateForm(form) {
    const elements = form.elements;
    let isValid = true;
    
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      
      // Skip elements that don't need validation
      if (!element.name || element.disabled || element.type === 'button' || 
          element.type === 'submit' || element.type === 'reset') {
        continue;
      }
      
      // Get validation rules from attributes
      const isRequired = element.hasAttribute('required');
      const minLength = element.getAttribute('minlength');
      const maxLength = element.getAttribute('maxlength');
      const pattern = element.getAttribute('pattern');
      const type = element.getAttribute('type');
      
      // Remove existing error messages
      this.removeError(element);
      
      // Validate based on type and rules
      let fieldValid = true;
      let errorMessage = '';
      
      // Required field
      if (isRequired && !element.value.trim()) {
        fieldValid = false;
        errorMessage = 'This field is required';
      } 
      // Email validation
      else if (type === 'email' && element.value.trim() && !this.isValidEmail(element.value)) {
        fieldValid = false;
        errorMessage = 'Please enter a valid email address';
      }
      // Number validation
      else if (type === 'number' && element.value.trim()) {
        const min = parseFloat(element.getAttribute('min'));
        const max = parseFloat(element.getAttribute('max'));
        const value = parseFloat(element.value);
        
        if (isNaN(value)) {
          fieldValid = false;
          errorMessage = 'Please enter a valid number';
        } else if (!isNaN(min) && value < min) {
          fieldValid = false;
          errorMessage = `Value must be at least ${min}`;
        } else if (!isNaN(max) && value > max) {
          fieldValid = false;
          errorMessage = `Value must not exceed ${max}`;
        }
      }
      // Min length validation
      else if (minLength && element.value.length < parseInt(minLength)) {
        fieldValid = false;
        errorMessage = `Must be at least ${minLength} characters`;
      }
      // Max length validation
      else if (maxLength && element.value.length > parseInt(maxLength)) {
        fieldValid = false;
        errorMessage = `Must not exceed ${maxLength} characters`;
      }
      // Pattern validation
      else if (pattern && element.value.trim() && !new RegExp(pattern).test(element.value)) {
        fieldValid = false;
        errorMessage = element.getAttribute('title') || 'Please match the requested format';
      }
      
      // If field is invalid, show error and set form as invalid
      if (!fieldValid) {
        this.showError(element, errorMessage);
        isValid = false;
      }
    }
    
    return isValid;
  },
  
  /**
   * Show error message for form field
   * @param {HTMLElement} element - Form element
   * @param {string} message - Error message
   */
  showError(element, message) {
    element.classList.add('is-invalid');
    
    // Create error element if it doesn't exist
    let errorElement = element.nextElementSibling;
    
    if (!errorElement || !errorElement.classList.contains('form-error')) {
      errorElement = document.createElement('div');
      errorElement.className = 'form-error';
      element.parentNode.insertBefore(errorElement, element.nextSibling);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  },
  
  /**
   * Remove error message from form field
   * @param {HTMLElement} element - Form element
   */
  removeError(element) {
    element.classList.remove('is-invalid');
    
    // Remove error element if it exists
    const errorElement = element.nextElementSibling;
    
    if (errorElement && errorElement.classList.contains('form-error')) {
      errorElement.style.display = 'none';
    }
  },
  
  /**
   * Check if email is valid
   * @param {string} email - Email to validate
   * @returns {boolean} Whether email is valid
   */
  isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  },
  
  /**
   * Get form data as object
   * @param {HTMLFormElement} form - Form element
   * @returns {Object} Form data as object
   */
  getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      // Handle number fields
      if (form.elements[key].type === 'number') {
        data[key] = value === '' ? null : parseFloat(value);
      } else {
        data[key] = value;
      }
    }
    
    return data;
  },
  
  /**
   * Set form data from object
   * @param {HTMLFormElement} form - Form element
   * @param {Object} data - Data to set
   */
  setFormData(form, data) {
    for (const key in data) {
      if (form.elements[key]) {
        const element = form.elements[key];
        
        // Handle different element types
        if (element.type === 'checkbox') {
          element.checked = !!data[key];
        } else if (element.type === 'radio') {
          const radio = form.querySelector(`input[name="${key}"][value="${data[key]}"]`);
          if (radio) {
            radio.checked = true;
          }
        } else if (element.tagName === 'SELECT' && element.multiple) {
          // Handle multi-select
          const values = Array.isArray(data[key]) ? data[key] : [data[key]];
          
          for (let i = 0; i < element.options.length; i++) {
            element.options[i].selected = values.includes(element.options[i].value);
          }
        } else {
          // Handle regular inputs
          element.value = data[key] !== null && data[key] !== undefined ? data[key] : '';
        }
      }
    }
  },
  
  /**
   * Reset form
   * @param {HTMLFormElement} form - Form element
   */
  resetForm(form) {
    form.reset();
    
    // Clear all errors
    const elements = form.elements;
    
    for (let i = 0; i < elements.length; i++) {
      this.removeError(elements[i]);
    }
  }
};

// Export utilities
window.Utils = Utils;
window.Notification = Notification;
window.FormValidator = FormValidator;

// Initialize notification system
document.addEventListener('DOMContentLoaded', function() {
  Notification.init();
});