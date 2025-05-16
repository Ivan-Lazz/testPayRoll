/**
 * auth.js - Authentication functions
 * This file contains functions for authentication, session management, and access control
 */

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Time before timeout to show warning (5 minutes)
const WARNING_TIMEOUT = 25 * 60 * 1000;

// Session timer
let sessionTimer;
let warningTimer;

/**
 * AuthService - Singleton for handling authentication
 */
const AuthService = {
  /**
   * Initialize authentication
   */
  init() {
    // Check if user is already logged in
    if (this.isLoggedIn()) {
      // Start session timer
      this.startSessionTimer();

      // Add activity listener
      this.addActivityListener();
    }
  },

  /**
   * Check if user is logged in
   * @returns {boolean} Whether user is logged in
   */
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  /**
   * Get current user data
   * @returns {Object|null} User data or null if not logged in
   */
  getCurrentUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Check if user has specified role
   * @param {string|Array} roles - Role(s) to check
   * @returns {boolean} Whether user has the specified role
   */
  hasRole(roles) {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (!user.role) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  },

  /**
   * Login user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise} Promise resolving to login status
   */
  async login(username, password) {
    try {
      const response = await ApiService.login(username, password);

      // Start session management
      this.startSessionTimer();
      this.addActivityListener();

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await ApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear timers
    this.clearTimers();

    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('csrf_token');
    localStorage.removeItem('last_activity');

    // Redirect to login page
    window.location.href = 'index.html';
  },

  /**
   * Start session timer
   */
  startSessionTimer() {
    // Clear any existing timers
    this.clearTimers();

    // Set last activity time if not exists
    if (!localStorage.getItem('last_activity')) {
      localStorage.setItem('last_activity', Date.now().toString());
    }

    // Set session timeout timer
    sessionTimer = setTimeout(() => {
      this.logout();
    }, SESSION_TIMEOUT);

    // Set warning timer
    warningTimer = setTimeout(() => {
      this.showTimeoutWarning();
    }, WARNING_TIMEOUT);
  },

  /**
   * Reset session timer on user activity
   */
  resetSessionTimer() {
    // Update last activity time
    localStorage.setItem('last_activity', Date.now().toString());

    // Restart timers
    this.startSessionTimer();
  },

  /**
   * Clear session timers
   */
  clearTimers() {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
    }
  },

  /**
   * Add activity listener to reset session timer on user activity
   */
  addActivityListener() {
    // List of events to monitor
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, () => this.resetSessionTimer());
    });
  },

  /**
   * Show timeout warning
   */
  showTimeoutWarning() {
    // Check if we have a modal system
    if (typeof Modal !== 'undefined') {
      Modal.confirm({
        title: 'Session Timeout',
        message: 'Your session is about to expire due to inactivity. Do you want to continue?',
        confirmText: 'Continue Session',
        cancelText: 'Logout',
        onConfirm: () => {
          this.refreshToken();
        },
        onCancel: () => {
          this.logout();
        }
      });
    } else {
      // Fallback to built-in confirm
      const continueSession = confirm('Your session will expire in 5 minutes due to inactivity. Click OK to continue working or Cancel to logout.');
      if (continueSession) {
        this.refreshToken();
      } else {
        this.logout();
      }
    }
  },

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      await ApiService.refreshToken();
      this.resetSessionTimer();
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
    }
  },

  /**
   * Redirect to login page if not authenticated
   */
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'index.html';
    }
  },

  /**
   * Check if token is close to expiry
   * @returns {boolean} Whether token needs refreshing
   */
  needsTokenRefresh() {
    const lastActivity = localStorage.getItem('last_activity');
    if (!lastActivity) return true;

    const elapsed = Date.now() - parseInt(lastActivity);
    return elapsed > 20 * 60 * 1000; // Refresh if more than 20 minutes have passed
  },

  /**
   * Refresh token if needed
   */
  async refreshTokenIfNeeded() {
    if (this.needsTokenRefresh()) {
      await this.refreshToken();
    }
  }
};

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  AuthService.init();
});