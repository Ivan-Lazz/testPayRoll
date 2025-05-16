/**
 * main.js - Main JavaScript functions
 * This file contains the main JavaScript functions and initialization code
 */

/**
 * Main App Object
 */
const App = {
  // Current payslip preview type
  currentPreviewType: 'agent',

  /**
   * Initialize the application
   */
  init() {
    // Load common components
    this.loadComponents();

    // Initialize event listeners
    this.initEventListeners();

    // Initialize route handling
    this.initRouteHandling();

    console.log('App initialized');
  },

  /**
   * Load common components
   */
  loadComponents() {
    // Get the current page
    const pagePath = window.location.pathname;
    const isLoginPage = pagePath.includes('index.html') || pagePath.endsWith('/');

    // Don't load components on login page
    if (isLoginPage) return;

    // Load header
    Utils.loadComponent('header-container', '../components/header.html');

    // Load sidebar
    Utils.loadComponent('sidebar-container', '../components/sidebar.html');

    // Load footer
    Utils.loadComponent('footer-container', '../components/footer.html');

    // Initialize modal (if available)
    Utils.loadComponent('modal-container', '../components/modal.html', () => {
      if (typeof Modal !== 'undefined') {
        Modal.init();
      }
    });
  },

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Add event listeners for global app functionality
    document.addEventListener('click', this.handleGlobalClick.bind(this));

    // Session timeout handling
    if (typeof AuthService !== 'undefined' && AuthService.isLoggedIn()) {
      this.initSessionTimeoutHandling();
    }
  },

  /**
   * Initialize session timeout handling
   */
  initSessionTimeoutHandling() {
    // Check token validity periodically
    setInterval(() => {
      if (typeof AuthService !== 'undefined' && AuthService.needsTokenRefresh()) {
        AuthService.refreshTokenIfNeeded();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  },

  /**
   * Handle global click events
   * @param {Event} event - Click event
   */
  handleGlobalClick(event) {
    // Example of global click handler
    // Can be used for handling specific elements across pages
  },

  /**
   * Initialize route handling
   */
  initRouteHandling() {
    // Get current page
    const pagePath = window.location.pathname;

    // Initialize page-specific functions
    if (pagePath.includes('index.html') || pagePath.endsWith('/') || pagePath.endsWith('/testPayRollFront/')) {
      // Login page
      this.initLoginPage();
    } else if (pagePath.includes('dashboard.html')) {
      // Dashboard page - Use the direct function instead of this.initDashboardPage
      if (typeof initDashboardPage === 'function') {
        initDashboardPage();
      } else {
        console.log('Dashboard initialization function not available');
      }
    }
    // Handle other pages initialization through their specific JS files
  },

  /**
   * Initialize login page
   */
  initLoginPage() {
    // Check if already logged in
    if (typeof AuthService !== 'undefined' && AuthService.isLoggedIn()) {
      window.location.href = 'dashboard.html';
      return;
    }

    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate form
      if (typeof FormValidator !== 'undefined' && !FormValidator.validateForm(loginForm)) {
        return;
      }

      // Get form data
      const username = loginForm.querySelector('[name="username"]').value;
      const password = loginForm.querySelector('[name="password"]').value;

      // Show loading
      const submitButton = loginForm.querySelector('[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Signing in...';

      try {
        // Attempt login
        const response = await AuthService.login(username, password);

        if (response.success) {
          // Show success notification
          if (typeof Notification !== 'undefined') {
            Notification.success('Login successful');
          }

          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1000);
        } else {
          // Show error
          const errorElement = document.getElementById('login-error');
          if (errorElement) {
            errorElement.textContent = response.message || 'Login failed';
            errorElement.style.display = 'block';
          }

          if (typeof Notification !== 'undefined') {
            Notification.error(response.message || 'Login failed');
          }
        }
      } catch (error) {
        console.error('Login error:', error);

        // Show error notification
        if (typeof Notification !== 'undefined') {
          Notification.error(error.message || 'Login failed');
        }
      } finally {
        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = 'Sign In';
      }
    });
  }
};

// Initialize application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  App.init();
});