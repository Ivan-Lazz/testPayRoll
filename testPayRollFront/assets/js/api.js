/**
 * api.js - Core API communication functions
 * This file contains all the functions needed to communicate with the backend API
 */

// API base URL - change this to match your server configuration
const API_BASE_URL = 'http://localhost/testPayRoll/api';

// Default headers for all requests
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

/**
 * ApiService - Singleton for handling API requests
 */
const ApiService = {
  /**
   * Get the authentication token from storage
   * @returns {string|null} The authentication token or null if not found
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Get the CSRF token from storage
   * @returns {string|null} The CSRF token or null if not found
   */
  getCsrfToken() {
    return localStorage.getItem('csrf_token');
  },

  /**
   * Get authentication headers
   * @returns {Object} Headers object with authentication tokens
   */
  getAuthHeaders() {
    const headers = { ...DEFAULT_HEADERS };
    
    const token = this.getToken();
    const csrfToken = this.getCsrfToken();
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    return headers;
  },

  /**
   * Make an API request
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {Object} data - Request data (for POST/PUT)
   * @param {boolean} requiresAuth - Whether authentication is required
   * @returns {Promise} Promise resolving to the API response
   */
  async request(endpoint, method = 'GET', data = null, requiresAuth = true) {
    try {
      const url = `${API_BASE_URL}/${endpoint}`;
      const headers = requiresAuth ? this.getAuthHeaders() : DEFAULT_HEADERS;
      
      const options = {
        method,
        headers,
        credentials: 'include'
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }
      
      // Show loading indicator
      this.showLoading();
      
      const response = await fetch(url, options);
      const responseData = await response.json();
      
      // Hide loading indicator
      this.hideLoading();
      
      // Handle session timeout
      if (response.status === 401) {
        this.handleSessionTimeout();
        return Promise.reject(new Error('Session expired'));
      }
      
      // Handle API errors
      if (!response.ok) {
        throw new Error(responseData.message || 'API request failed');
      }
      
      return responseData;
    } catch (error) {
      // Hide loading indicator
      this.hideLoading();
      
      // Show error message
      this.showError(error.message);
      
      return Promise.reject(error);
    }
  },

  /**
   * Show loading indicator
   */
  showLoading() {
    // Check if loading overlay already exists
    if (document.querySelector('.loading-overlay')) {
      return;
    }
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="spinner"></div>';
    
    document.body.appendChild(loadingOverlay);
  },

  /**
   * Hide loading indicator
   */
  hideLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
  },

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    // Check if we have a notification system
    if (typeof Notification !== 'undefined') {
      Notification.error(message);
    } else {
      // Fallback to alert
      alert(`Error: ${message}`);
    }
  },

  /**
   * Handle session timeout
   */
  handleSessionTimeout() {
    // Check if session timeout dialog already exists
    if (document.querySelector('.session-timeout')) {
      return;
    }
    
    // Check if we have a modal system
    if (typeof Modal !== 'undefined') {
      Modal.confirm({
        title: 'Session Expired',
        message: 'Your session has expired. Please login again.',
        confirmText: 'Login',
        onConfirm: () => {
          // Clear local storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('csrf_token');
          
          // Redirect to login page
          window.location.href = 'index.html';
        }
      });
    } else {
      alert('Your session has expired. Please login again.');
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('csrf_token');
      
      // Redirect to login page
      window.location.href = 'index.html';
    }
  },

  /**
 * Login user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise} Promise resolving to the login response
 */
async login(username, password) {
  try {
    // For login, we need to skip CSRF token validation
    // Set up a special request with minimal headers
    const url = `${API_BASE_URL}/auth/login`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password })
    };
    
    // Show loading indicator
    this.showLoading();
    
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    // Hide loading indicator
    this.hideLoading();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Login failed');
    }
    
    if (responseData.success) {
      // Store authentication data
      if (responseData.data && responseData.data.token) {
        localStorage.setItem('token', responseData.data.token);
        localStorage.setItem('csrf_token', responseData.data.csrf_token);
        localStorage.setItem('user', JSON.stringify(responseData.data.user));
      }
    }
    
    return responseData;
  } catch (error) {
    // Hide loading indicator
    this.hideLoading();
    
    // Show error message
    this.showError(error.message);
    
    return Promise.reject(error);
  }
}

  // Add other API methods as defined in the original api.js file
  // (login, logout, user management, employee management, etc.)
};