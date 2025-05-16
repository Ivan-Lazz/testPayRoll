/**
 * Users JavaScript
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load users
    loadUsers();

    // Event handlers for the save and update buttons
    const saveUserBtn = document.getElementById('saveUserBtn');
    const updateUserBtn = document.getElementById('updateUserBtn');
    
    if (saveUserBtn) {
        saveUserBtn.addEventListener('click', createUser);
    }
    
    if (updateUserBtn) {
        updateUserBtn.addEventListener('click', updateUser);
    }
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
            
            if (users.length === 0) {
                usersList.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
                return;
            }
            
            // Paginate users
            const itemsPerPage = 10;
            const totalPages = Math.ceil(users.length / itemsPerPage);
            
            // Make sure page is valid
            page = Math.max(1, Math.min(page, totalPages));
            
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedUsers = users.slice(startIndex, endIndex);
            
            let usersHTML = '';
            
            paginatedUsers.forEach(user => {
                // Determine status class
                let statusClass = '';
                switch (user.status) {
                    case 'active':
                        statusClass = 'text-success';
                        break;
                    case 'inactive':
                        statusClass = 'text-danger';
                        break;
                    default:
                        statusClass = '';
                }
                
                usersHTML += `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.firstname} ${user.lastname}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td class="${statusClass}">${user.status}</td>
                        <td class="actions">
                            <button class="btn btn-primary" onclick="editUser(${user.id})">Edit</button>
                            <button class="btn btn-danger" onclick="deleteUser(${user.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
            
            usersList.innerHTML = usersHTML;
            
            // Create pagination if needed
            if (totalPages > 1 && paginationContainer) {
                const paginationEl = createPagination(page, totalPages, function(newPage) {
                    loadUsers(newPage);
                });
                
                paginationContainer.innerHTML = '';
                paginationContainer.appendChild(paginationEl);
            } else if (paginationContainer) {
                paginationContainer.innerHTML = '';
            }
        } else {
            usersList.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        usersList.innerHTML = '<tr><td colspan="7" class="text-center">Error loading users. Please try again.</td></tr>';
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
    if (!firstname || !lastname || !email || !username || !password || !role || !status) {
        showAlert('Please fill all required fields.', 'danger');
        return;
    }
    
    try {
        // Prepare data
        const data = {
            firstname,
            lastname,
            email,
            username,
            password,
            role,
            status
        };
        
        // Send create request
        const response = await apiRequest('users/create', 'POST', data);
        
        if (response.status === 'success') {
            showAlert('User created successfully!', 'success');
            
            // Close modal and reset form
            document.getElementById('createUserModal').classList.remove('show');
            document.getElementById('createUserForm').reset();
            
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
 * Edit user - open edit modal and populate form
 * @param {number} id - User ID
 */
async function editUser(id) {
    try {
        const response = await apiRequest(`users/get/${id}`);
        
        if (response.status === 'success') {
            const user = response.data;
            
            // Populate form
            document.getElementById('edit_id').value = user.id;
            document.getElementById('edit_firstname').value = user.firstname;
            document.getElementById('edit_lastname').value = user.lastname;
            document.getElementById('edit_email').value = user.email;
            document.getElementById('edit_username').value = user.username;
            document.getElementById('edit_password').value = ''; // Don't show password
            document.getElementById('edit_role').value = user.role;
            document.getElementById('edit_status').value = user.status;
            
            // Show modal
            document.getElementById('editUserModal').classList.add('show');
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
    if (!id || !firstname || !lastname || !email || !username || !role || !status) {
        showAlert('Please fill all required fields.', 'danger');
        return;
    }
    
    try {
        // Prepare data
        const data = {
            firstname,
            lastname,
            email,
            username,
            role,
            status
        };
        
        // Only include password if provided
        if (password) {
            data.password = password;
        }
        
        // Send update request
        const response = await apiRequest(`users/update/${id}`, 'PUT', data);
        
        if (response.status === 'success') {
            showAlert('User updated successfully!', 'success');
            
            // Close modal
            document.getElementById('editUserModal').classList.remove('show');
            
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
    if (id === currentUserId) {
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
            
            // Reload users
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