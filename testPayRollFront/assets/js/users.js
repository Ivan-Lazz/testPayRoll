/**
 * users.js - User management functions
 */

// Document ready event
document.addEventListener('DOMContentLoaded', function() {
  // Initialize users page if on that page
  if (window.location.pathname.includes('users.html')) {
    initUsersPage();
  }
  
  // Initialize user form page if on that page
  if (window.location.pathname.includes('user-form.html')) {
    initUserFormPage();
  }
});

/**
 * Initialize users page
 */
function initUsersPage() {
  // Require authentication
  if (AuthService) {
    AuthService.requireAuth();
  }
  
  // Load users data
  loadUsersData();
  
  // Initialize event listeners
  initUsersPageEvents();
}

/**
 * Load users data with pagination
 */
async function loadUsersData(page = 1, perPage = 10, search = '') {
  try {
    const usersTable = document.getElementById('users-table');
    const usersTableBody = document.getElementById('users-table-body');
    
    if (!usersTable || !usersTableBody) {
      console.error('Users table elements not found');
      return;
    }
    
    // Show loading
    usersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
    
    // Fetch users data
    const response = await ApiService.getUsers(page, perPage, search);
    
    if (response.success && response.data) {
      // Clear table
      usersTableBody.innerHTML = '';
      
      if (response.data.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
        return;
      }
      
      // Populate table with users
      response.data.forEach(user => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.firstname} ${user.lastname}</td>
          <td>${user.username}</td>
          <td>${user.email || '-'}</td>
          <td>${user.role}</td>
          <td>${Utils.formatStatusBadge(user.status)}</td>
          <td>
            <div class="table-actions">
              <a href="user-form.html?id=${user.id}" class="action-btn edit" title="Edit">
                <i class="fas fa-edit"></i>
              </a>
              <button class="action-btn delete" title="Delete" data-id="${user.id}">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </td>
        `;
        
        usersTableBody.appendChild(row);
      });
      
      // Initialize pagination
      if (response.pagination) {
        Pagination.init({
          totalItems: response.pagination.total_records,
          itemsPerPage: perPage,
          currentPage: page,
          onPageChange: (newPage) => {
            loadUsersData(newPage, perPage, search);
          }
        });
      }
    } else {
      // Show error
      usersTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Error: ${response.message || 'Failed to load users'}</td></tr>`;
      Notification.error(response.message || 'Failed to load users');
    }
  } catch (error) {
    console.error('Error loading users:', error);
    
    // Show error in table
    const usersTableBody = document.getElementById('users-table-body');
    if (usersTableBody) {
      usersTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Error: ${error.message || 'Failed to load users'}</td></tr>`;
    }
    
    Notification.error(error.message || 'Failed to load users');
  }
}

/**
 * Initialize users page events
 */
function initUsersPageEvents() {
  // Search functionality
  const searchForm = document.getElementById('user-search-form');
  
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const searchInput = document.getElementById('user-search-input');
      if (searchInput) {
        loadUsersData(1, 10, searchInput.value);
      }
    });
  }
  
  // Delete user functionality
  document.addEventListener('click', (e) => {
    if (e.target.closest('.delete')) {
      const deleteButton = e.target.closest('.delete');
      const userId = deleteButton.dataset.id;
      
      if (userId) {
        confirmDeleteUser(userId);
      }
    }
  });
  
  // Add user button
  const addUserButton = document.getElementById('add-user-btn');
  
  if (addUserButton) {
    addUserButton.addEventListener('click', () => {
      window.location.href = 'user-form.html';
    });
  }
  
  // Reset filters button
  const resetFiltersButton = document.getElementById('reset-filters-btn');
  
  if (resetFiltersButton) {
    resetFiltersButton.addEventListener('click', () => {
      const searchInput = document.getElementById('user-search-input');
      
      if (searchInput) searchInput.value = '';
      
      loadUsersData();
    });
  }
}

/**
 * Confirm user deletion
 */
function confirmDeleteUser(userId) {
  if (typeof Modal !== 'undefined') {
    Modal.confirm({
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      icon: 'warning',
      confirmText: 'Delete',
      confirmClass: 'btn-danger',
      onConfirm: async () => {
        try {
          const response = await ApiService.deleteUser(userId);
          
          if (response.success) {
            Notification.success('User deleted successfully');
            loadUsersData(); // Reload users data
          } else {
            Notification.error(response.message || 'Failed to delete user');
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          Notification.error(error.message || 'Failed to delete user');
        }
        
        Modal.close();
      }
    });
  } else {
    // Fallback to built-in confirm
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser(userId);
    }
  }
}

/**
 * Delete user
 */
async function deleteUser(userId) {
  try {
    const response = await ApiService.deleteUser(userId);
    
    if (response.success) {
      Notification.success('User deleted successfully');
      loadUsersData(); // Reload users data
    } else {
      Notification.error(response.message || 'Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    Notification.error(error.message || 'Failed to delete user');
  }
}

/**
 * Initialize user form page
 */
function initUserFormPage() {
  // Require authentication
  if (AuthService) {
    AuthService.requireAuth();
  }
  
  // Check if editing or creating
  const userId = Utils.getUrlParam('id');
  const isEditing = !!userId;
  
  // Update page title
  const formTitle = document.getElementById('user-form-title');
  if (formTitle) {
    formTitle.textContent = isEditing ? 'Edit User' : 'Add User';
  }
  
  // Initialize form
  const userForm = document.getElementById('user-form');
  
  if (userForm) {
    // If editing, load user data
    if (isEditing) {
      loadUserData(userId);
    }
    
    // Form submission
    userForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Validate form
      if (typeof FormValidator !== 'undefined' && !FormValidator.validateForm(userForm)) {
        return;
      }
      
      // Get form data
      const formData = typeof FormValidator !== 'undefined' ? 
        FormValidator.getFormData(userForm) : 
        Object.fromEntries(new FormData(userForm));
      
      try {
        let response;
        
        if (isEditing) {
          // Update user
          response = await ApiService.updateUser(userId, formData);
        } else {
          // Create user
          response = await ApiService.createUser(formData);
        }
        
        if (response.success) {
          Notification.success(`User ${isEditing ? 'updated' : 'created'} successfully`);
          
          // Redirect to users page
          setTimeout(() => {
            window.location.href = 'users.html';
          }, 1000);
        } else {
          Notification.error(response.message || `Failed to ${isEditing ? 'update' : 'create'} user`);
        }
      } catch (error) {
        console.error('Error saving user:', error);
        Notification.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} user`);
      }
    });
    
    // Cancel button
    const cancelButton = userForm.querySelector('#cancel-btn');
    if (cancelButton) {
      cancelButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'users.html';
      });
    }
  }
}

/**
 * Load user data for editing
 */
async function loadUserData(userId) {
  try {
    const response = await ApiService.getUser(userId);
    
    if (response.success && response.data) {
      const userForm = document.getElementById('user-form');
      
      if (userForm) {
        // Populate form with user data
        if (typeof FormValidator !== 'undefined') {
          FormValidator.setFormData(userForm, response.data);
        } else {
          // Manual form population
          for (const key in response.data) {
            const field = userForm.querySelector(`[name="${key}"]`);
            if (field) {
              field.value = response.data[key];
            }
          }
        }
        
        // If editing, password is optional
        const passwordField = userForm.querySelector('[name="password"]');
        if (passwordField) {
          passwordField.removeAttribute('required');
        }
      }
    } else {
      Notification.error(response.message || 'Failed to load user data');
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    Notification.error(error.message || 'Failed to load user data');
  }
}