document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addUserBtn = document.getElementById('add-user-btn');
    const modal = document.getElementById('user-form-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const modalTitle = document.getElementById('modal-title');
    const userForm = document.getElementById('user-form');
    const usersTableBody = document.getElementById('users-table-body');

    // Form Fields
    const userIdField = document.getElementById('user-id');
    const firstNameField = document.getElementById('first_name');
    const middleNameField = document.getElementById('middle_name');
    const lastNameField = document.getElementById('last_name');
    const phoneField = document.getElementById('phone');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const passwordConfirmField = document.getElementById('password_confirm');
    const roleField = document.getElementById('role');
    const departmentField = document.getElementById('department_id');
    const branchField = document.getElementById('branch_id');
    const employeeIdField = document.getElementById('employee_id');

    // const API_ENDPOINT = '/api/admin/users'; // Assumed API endpoint
    const API_ENDPOINT = '/api';

    /**
     * Resets the form and prepares the modal for adding a new user.
     */
    const openAddModal = () => {
        userForm.reset();
        userIdField.value = '';
        modalTitle.textContent = 'Add New User';
        passwordField.required = true;
        passwordField.placeholder = 'Required for new user';
        emailField.disabled = false;
        modal.style.display = 'block';
    };

    /**
     * Fetches user data and populates the form for editing.
     * @param {string} id - The ID of the user to edit.
     */
    const openEditModal = async (id) => {
        try {
            // Assumed API call to fetch a single user's details by ID
            const response = await API.get(`/users/${id}`); 
            const user = response.data; 

            // console.log('Fetched user data for editing:', user);

            // Populate form fields
            userIdField.value = user.id;
            employeeIdField.value = user.employee_id || '';
            firstNameField.value = user.first_name;
            middleNameField.value = user.middle_name;
            lastNameField.value = user.last_name;
            emailField.value = user.email;
            emailField.disabled = true; // Prevent email change
            
            roleField.value = user.role_id;
            // The || '' handles null values from the server
            departmentField.value = user.departmnt_id || '';
            branchField.value = user.branch_id || '';
            phoneField.value = user.phone || '';
            // employeeField.value = user.employee_id || '';
            
            // For editing, password is not required unless explicitly resetting
            passwordField.value = ''; 
            passwordField.required = false;
            passwordField.placeholder = 'Leave blank to keep current password';

            modalTitle.textContent = `Edit User: ${user.username}`;
            modal.style.display = 'block';

        } catch (error) {
            console.error('Error fetching user data:', error);
            alert('Failed to load user data for editing.');
        }
    };

    /**
     * Handles password reset modal logic (simple version).
     * In a real app, this should be a dedicated small modal.
     * @param {string} id - The ID of the user whose password to reset.
     */
    const handleResetPassword = async (id) => {
        const newPassword = prompt("Enter new password for this user:");
        if (!newPassword || newPassword.length < 6) {
            if (newPassword !== null) alert("Password must be at least 6 characters.");
            return;
        }

        if (!confirm(`Are you sure you want to reset the password for user ID ${id}?`)) {
            return;
        }

        try {
            // API call to the password reset endpoint
            await API.post(`/users/reset-password/${id}`, { password: newPassword });
            alert('Password reset successfully!');
        } catch (error) {
            console.error('Password reset failed:', error);
            alert('Password reset failed. Check server logs.');
        }
    };

    /**
     * Toggles the active status of a user.
     */
    const handleToggleStatus = async (id, currentStatus, button) => {
        const newStatus = currentStatus === 'true' ? false : true;
        const action = newStatus ? 'Enable' : 'Disable';

        if (!confirm(`Are you sure you want to ${action} user ID ${id}?`)) {
            return;
        }

        try {
            // API call to toggle status endpoint
            await API.post(`/users/toggle-status/${id}`, { is_active: newStatus });
            
            alert(`User status changed to ${newStatus ? 'Active' : 'Disabled'}.`);
            
            // Optimistically update the UI
            const statusCell = button.closest('tr').children[6];
            statusCell.textContent = newStatus ? 'Active' : 'Disabled';
            statusCell.style.color = newStatus ? '#28a745' : '#dc3545';
            
            button.textContent = newStatus ? 'Disable' : 'Enable';
            button.dataset.status = newStatus;

        } catch (error) {
            console.error('Toggle status failed:', error);
            alert('Failed to change user status.');
        }
    };

    /**
     * Handles form submission for both creating and updating a user.
     */
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = userIdField.value;
        const isUpdate = !!id;

        const departmentText = departmentField.options[departmentField.selectedIndex].text;
        const branchText = branchField.options[branchField.selectedIndex].text;

        const formData = {
            "first_name": firstNameField.value,
            "middle_name": middleNameField.value,
            "last_name": lastNameField.value,
            "email": emailField.value,
            "phone": phoneField.value,
            "password": passwordField.value || undefined, // Send only if provided
            "role_id": roleField.value,
            "department_id": departmentField.value || null, // Send null if 'N/A' selected
            "department": departmentText || null,
            "branch_id": branchField.value || null,
            "branch_location": branchText || null,
            "employee_id": employeeIdField.value || null,
        };

        try {
            let response;
            if (passwordField.value && passwordField.value.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            } else if (passwordField.value !== passwordConfirmField.value) {
                alert('Password and confirmation do not match.');
                return;
            }
            
            // build payload without null or undefined values
            const payload = Object.fromEntries(
                Object.entries(formData).filter(([, v]) => v !== null && v !== undefined)
            );

            // console.log('Submitting user data:', payload);

            if (isUpdate) {
                // Update existing user
                response = await API.put(`/auth/update-user/${id}`, payload);
                alert(`User ${payload.email || id} updated successfully!`);
            } else {
                // Create new user
                response = await API.post(`/auth/register`, formData);
                alert(`User ${payload.email} created successfully!`);
            }
            
            // Close modal and reload the page or update table dynamically
            modal.style.display = 'none';
            window.location.reload(); // Simple reload for full update

        } catch (error) {
            console.error('User save failed:', error);
            alert('User save failed. Check the form data and server logs.');
        }
    });

    // --- Event Listeners ---
    
    // Open Add User Modal
    addUserBtn.addEventListener('click', openAddModal);

    // Close Modal
    closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (e) => { 
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Delegated Table Button Clicks (Edit, Reset, Toggle Status)
    usersTableBody.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        
        if (!id) return;

        if (target.classList.contains('btn-edit')) {
            openEditModal(id);
        } else if (target.classList.contains('btn-reset-password')) {
            handleResetPassword(id);
        } else if (target.classList.contains('btn-toggle-status')) {
            const currentStatus = target.dataset.status;
            handleToggleStatus(id, currentStatus, target);
        }
    });

    // --- Pagination Logic ---
    const usersTable = document.getElementById('users-table');
    const pageSizeSelect = document.getElementById('page-size');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');

    let currentPage = 1;
    let itemsPerPage = 10;
    let allUsers = [];

    // Store all user rows when page loads
    if (usersTableBody) {
        const rows = Array.from(usersTableBody.querySelectorAll('tr'));
        allUsers = rows;

        // Initialize pagination
        updatePagination();

        // Page size change handler
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                itemsPerPage = parseInt(e.target.value);
                currentPage = 1;
                updatePagination();
            });
        }

        // Previous button handler
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    updatePagination();
                }
            });
        }

        // Next button handler
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(allUsers.length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    updatePagination();
                }
            });
        }
    }

    function updatePagination() {
        // Filter out "No users found" row
        const validUsers = allUsers.filter(row => !row.textContent.includes('No users found'));
        
        const totalItems = validUsers.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        
        // Calculate start and end indices
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // Clear table body
        usersTableBody.innerHTML = '';
        
        if (totalItems === 0) {
            // Show no data message
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = '<td colspan="8" style="text-align:center;">No users found.</td>';
            usersTableBody.appendChild(noDataRow);
        } else {
            // Show only the rows for the current page
            const pageUsers = validUsers.slice(startIndex, endIndex);
            pageUsers.forEach(row => {
                usersTableBody.appendChild(row);
            });
        }
        
        // Update page info
        pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalItems} total)`;
        
        // Update button states
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage >= totalPages;
    }
});