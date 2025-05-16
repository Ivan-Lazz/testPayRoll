/**
 * Updated Users JavaScript
 * This file has been updated to work with the new modal system
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load users
    loadUsers();
});

/**
 * Load users with pagination
 * @param {number} page - Page number
 */
async function loadUsers(page = 1) {
    const usersList = document.getElementById('usersList');
    const paginationContainer = document.getElementById('usersPagination');
    
    if (!usersList) return;
    
    showLoader(usersList);
    
    try {
        const response = await apiRequest('users');
        if (response.status === 'success') {
            const users = response.data;
            
            // Paginate users
            const itemsPerPage = 10;
            const totalPages = Math.ceil(users.length / itemsPerPage);
            
            // Make sure page is valid
            page = Math.max(1, Math.min(page, totalPages || 1));
            
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedUsers = users.slice(startIndex, endIndex);
            
            // Clear the list
            usersList.innerHTML = '';
            
            if (paginatedUsers.length === 0) {
                usersList.innerHTML = '<tr><td colspan="8" class="text-center">No users found</td></tr>';
            } else {
                paginatedUsers.forEach(user => {
                    // Determine status class
                    let statusClass = 'text-secondary';
                    if (user.status === 'active') {
                        statusClass = 'text-success';
                    } else if (user.status === 'inactive') {
                        statusClass = 'text-danger';
                    }
                    
                    // Get current user ID to prevent deleting your own account
                    const currentUserId = getCurrentUserId();
                    const deleteButton = user.id == currentUserId ? 
                        `<button class="btn btn-danger btn-sm" disabled title="Cannot delete your own account">
                            <i class="fas fa-trash"></i>
                        </button>` : 
                        `<button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>`;
                    
                    usersList.innerHTML += `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.firstname} ${user.lastname}</td>
                            <td>${user.username}</td>
                            <td>${user.email || '-'}</td>
                            <td>${user.role}</td>
                            <td class="${statusClass}">${user.status}</td>
                            <td>${formatDate(user.created_at)}</td>
                            <td class="actions">
                                <button class="btn btn-secondary btn-sm" onclick="editUser(${user.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                ${deleteButton}
                            </td>
                        </tr>
                    `;
                });
            }
            
            // Create pagination if needed
            if (totalPages > 1) {
                const paginationEl = createPagination(page, totalPages, function(newPage) {
                    loadUsers(newPage);
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
        console.error('Error loading users:', error);
        showAlert('Error loading users. Please try again.', 'danger');
    }
}

/**
 * Create user
 */
async function createUser() {
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const status = document.getElementById('status').value;
    
    // Validate required fields
    if (!firstname || !lastname || !username || !password) {
        showAlert('Please fill all required fields.', 'danger');
        return;
    }
    
    // Validate email format if provided
    if (email && !isValidEmail(email)) {
        showAlert('Please enter a valid email address.', 'danger');
        return;
    }
    
    // Prepare data
    const data = {
        firstname: firstname,
        lastname: lastname,
        email: email,
        username: username,
        password: password,
        role: role,
        status: status
    };
    
    try {
        // Send create request
        const response = await apiRequest('users/create', 'POST', data);
        if (response.status === 'success') {
            showAlert('User created successfully!', 'success');
            
            // Close modal and reset form
            modalManager.closeModal('createUserModal');
            
            // Reload users
            loadUsers();
        } else {
            showAlert('Error creating user: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error creating user:', error);
        showAlert('Error creating user. Please try again.', 'danger');
    }
}

/**
 * Edit user - load user data and open edit modal
 * @param {number} id - User ID
 */
async function editUser(id) {
    try {
        const response = await apiRequest(`users/get/${id}`);
        if (response.status === 'success') {
            // Open modal with user data
            modalManager.openModal('editUserModal', response.data);
        } else {
            showAlert('Error loading user details: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error loading user details:', error);
        showAlert('Error loading user details. Please try again.', 'danger');
    }
}

/**
 * Update user
 */
async function updateUser() {
    const id = document.getElementById('edit_id').value;
    const firstname = document.getElementById('edit_firstname').value;
    const lastname = document.getElementById('edit_lastname').value;
    const email = document.getElementById('edit_email').value;
    const username = document.getElementById('edit_username').value;
    const password = document.getElementById('edit_password').value;
    const role = document.getElementById('edit_role').value;
    const status = document.getElementById('edit_status').value;
    
    // Validate required fields
    if (!firstname || !lastname || !username) {
        showAlert('Please fill all required fields.', 'danger');
        return;
    }
    
    // Validate email format if provided
    if (email && !isValidEmail(email)) {
        showAlert('Please enter a valid email address.', 'danger');
        return;
    }
    
    // Prepare data
    const data = {
        firstname: firstname,
        lastname: lastname,
        email: email,
        username: username,
        role: role,
        status: status
    };
    
    // Only include password if provided
    if (password) {
        data.password = password;
    }
    
    try {
        // Send update request
        const response = await apiRequest(`users/update/${id}`, 'PUT', data);
        if (response.status === 'success') {
            showAlert('User updated successfully!', 'success');
            
            // Close modal
            modalManager.closeModal('editUserModal');
            
            // Reload users
            loadUsers();
        } else {
            showAlert('Error updating user: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showAlert('Error updating user. Please try again.', 'danger');
    }
}

/**
 * Delete user
 * @param {number} id - User ID
 */
async function deleteUser(id) {
    // Prevent deleting your own account
    const currentUserId = getCurrentUserId();
    if (id == currentUserId) {
        showAlert('You cannot delete your own account.', 'danger');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await apiRequest(`users/delete/${id}`, 'DELETE');
        if (response.status === 'success') {
            showAlert('User deleted successfully!', 'success');
            loadUsers();
        } else {
            showAlert('Error deleting user: ' + response.message, 'danger');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('Error deleting user. Please try again.', 'danger');
    }
}

/**
 * Get current user ID
 * @returns {number} - Current user ID
 */
function getCurrentUserId() {
    // This is a simple implementation that assumes the user ID is stored in a data attribute
    // You might need to adjust this based on how you're storing the current user's information
    return parseInt(document.querySelector('body').getAttribute('data-user-id')) || 0;
}