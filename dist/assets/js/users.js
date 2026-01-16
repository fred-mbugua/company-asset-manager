// public/assets/js/users.js

const userForm = document.getElementById('user-form');
let isEditing = false; // Flag to determine if we are creating or updating

userForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const userId = document.getElementById('user_id').value;
    const isNewUser = userId === '';
    
    const url = isNewUser ? '/auth/register' : `/users/${userId}`;
    const method = isNewUser ? 'POST' : 'PUT';

    const formData = {
        first_name: document.getElementById('first_name').value,
        middle_name: document.getElementById('middle_name').value,
        last_name: document.getElementById('last_name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role_id: parseInt(document.getElementById('role_id').value),
        department_id: parseInt(document.getElementById('department_id').value),
        branch_id: parseInt(document.getElementById('branch_id').value),
    };

    // Remove password if it's an update and the field is empty
    if (!isNewUser && !formData.password) {
        delete formData.password;
    }

    try {
        const response = await API.request(method, url, formData);
        showMessage('success', response.message || (isNewUser ? 'User created.' : 'User updated.'));
        
        // Reload page to update the table (simple non-SPA approach)
        window.location.reload(); 
    } catch (error) {
        showMessage('error', error.message || 'Operation failed.');
    }
});

function resetForm() {
    userForm.reset();
    document.getElementById('user_id').value = '';
    document.querySelector('.btn-save').textContent = 'Create User';
    document.getElementById('password').placeholder = '';
    isEditing = false;
}

// Function to populate form for editing (simple non-SPA approach)
async function editUser(id) {
    try {
        const response = await API.get(`/users/${id}`);
        const user = response.data;
        
        document.getElementById('user_id').value = user.id;
        document.getElementById('first_name').value = user.first_name;
        document.getElementById('middle_name').value = user.middle_name || '';
        document.getElementById('last_name').value = user.last_name;
        document.getElementById('email').value = user.email;
        document.getElementById('role_id').value = user.role_id;
        document.getElementById('department_id').value = user.department_id;
        document.getElementById('branch_id').value = user.branch_id;
        
        document.querySelector('.btn-save').textContent = 'Update User';
        document.getElementById('password').placeholder = 'Enter new password to change';
        isEditing = true;

    } catch (error) {
        showMessage('error', error.message || 'Failed to fetch user details.');
    }
}

// Attach edit/delete handlers to the window (required for EJS onclick events)
window.editUser = editUser;
window.deleteUser = async function(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
        const response = await API.delete(`/users/${id}`);
        showMessage('success', response.message || 'User deleted successfully.');
        window.location.reload();
    } catch (error) {
        showMessage('error', error.message || 'Failed to delete user.');
    }
};
window.resetForm = resetForm;