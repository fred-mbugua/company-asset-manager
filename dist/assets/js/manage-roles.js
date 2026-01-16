/**
 * Manage Roles Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addBtn = document.getElementById('add-role-btn');
    const modal = document.getElementById('role-form-modal');
    const deleteModal = document.getElementById('delete-modal');
    const closeModalBtns = document.querySelectorAll('.close-btn');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('role-form');
    const tableBody = document.getElementById('roles-table-body');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');

    // Form Fields
    const idField = document.getElementById('role-id');
    const nameField = document.getElementById('role-name');
    const descriptionField = document.getElementById('role-description');
    const isActiveField = document.getElementById('role-is-active');

    // Pagination Variables
    let currentPage = 1;
    let pageSize = 10;
    let allData = [];
    let filteredData = [];
    let roleToDelete = null;

    // Core roles that cannot be deleted/deactivated
    const CORE_ROLES = ['Admin', 'Standard User'];

    /**
     * Fetch all roles from the server
     */
    const fetchData = async () => {
        try {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;"><i class="uil-spinner-alt spin"></i> Loading roles...</td></tr>';
            
            const response = await API.get('/roles?include_inactive=true');
            allData = response.data || [];
            filteredData = [...allData];
            applyFilters();
        } catch (error) {
            console.error('Error fetching roles:', error);
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Failed to load roles.</td></tr>';
        }
    };

    /**
     * Apply search and status filters
     */
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;

        filteredData = allData.filter(role => {
            // Search filter
            const matchesSearch = role.name.toLowerCase().includes(searchTerm) ||
                (role.description && role.description.toLowerCase().includes(searchTerm));

            // Handle is_active as boolean or string
            const isActive = role.is_active === true || role.is_active === 'true';
            
            // Status filter
            let matchesStatus = true;
            if (statusValue === 'active') {
                matchesStatus = isActive;
            } else if (statusValue === 'inactive') {
                matchesStatus = !isActive;
            }

            return matchesSearch && matchesStatus;
        });

        currentPage = 1;
        updatePagination();
        renderTable();
    };

    /**
     * Render table with current page data
     */
    const renderTable = () => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageData = filteredData.slice(startIndex, endIndex);

        tableBody.innerHTML = '';
        
        if (pageData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No roles found.</td></tr>';
            return;
        }

        pageData.forEach(role => {
            const isCoreRole = CORE_ROLES.includes(role.name);
            const coreBadge = isCoreRole ? '<span class="core-badge">Core</span>' : '';
            
            // Handle is_active as boolean or string
            const isActive = role.is_active === true || role.is_active === 'true';
            const statusBadge = isActive 
                ? '<span class="status-badge active">Active</span>' 
                : '<span class="status-badge inactive">Inactive</span>';
            
            // Toggle button (not for core roles)
            const toggleBtn = !isCoreRole ? `
                <button class="btn btn-sm btn-toggle ${isActive ? '' : 'inactive'}" data-id="${role.id}" data-active="${isActive}">
                    ${isActive ? 'Deactivate' : 'Activate'}
                </button>
            ` : '';
            
            // Delete button (not for core roles)
            const deleteBtn = !isCoreRole ? `
                <button class="btn btn-sm btn-delete" data-id="${role.id}" data-name="${escapeHtml(role.name)}" data-users="${role.user_count || 0}">Delete</button>
            ` : '';

            const row = document.createElement('tr');
            row.dataset.roleId = role.id;
            row.innerHTML = `
                <td data-label="ID">${role.id}</td>
                <td data-label="Name">${escapeHtml(role.name)}${coreBadge}</td>
                <td data-label="Description">${escapeHtml(role.description) || 'N/A'}</td>
                <td data-label="Users">
                    <span class="user-count-badge">
                        <i class="uil-users-alt"></i> ${role.user_count || 0}
                    </span>
                </td>
                <td data-label="Status">${statusBadge}</td>
                <td data-label="Actions">
                    <button class="btn btn-sm btn-edit" data-id="${role.id}">Edit</button>
                    ${toggleBtn}
                    ${deleteBtn}
                </td>
            `;
            tableBody.appendChild(row);
        });

        attachEventListeners();
    };

    /**
     * Update pagination controls
     */
    const updatePagination = () => {
        const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
        const pageInfo = document.getElementById('page-info');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${filteredData.length} total)`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    };

    /**
     * Search input handler
     */
    searchInput.addEventListener('input', () => {
        applyFilters();
    });

    /**
     * Status filter handler
     */
    statusFilter.addEventListener('change', () => {
        applyFilters();
    });

    /**
     * Page size change
     */
    document.getElementById('page-size').addEventListener('change', (e) => {
        pageSize = parseInt(e.target.value);
        currentPage = 1;
        updatePagination();
        renderTable();
    });

    /**
     * Pagination buttons
     */
    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
            renderTable();
        }
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
            renderTable();
        }
    });

    /**
     * Open modal for adding
     */
    const openAddModal = () => {
        form.reset();
        idField.value = '';
        isActiveField.checked = true; // Default to active for new roles
        modalTitle.textContent = 'Add New Role';
        modal.style.display = 'block';
    };

    /**
     * Open modal for editing
     */
    const openEditModal = async (id) => {
        try {
            const response = await API.get(`/roles/${id}`);
            const role = response.data;

            idField.value = role.id;
            nameField.value = role.name;
            descriptionField.value = role.description || '';
            
            // Handle is_active as boolean or string
            const isActive = role.is_active === true || role.is_active === 'true';
            isActiveField.checked = isActive;

            modalTitle.textContent = `Edit Role: ${role.name}`;
            modal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching role data:', error);
            alert('Failed to load role data for editing.');
        }
    };

    /**
     * Handle form submission
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = idField.value;
        const isUpdate = !!id;

        const formData = {
            name: nameField.value.trim(),
            description: descriptionField.value.trim() || null,
            is_active: isActiveField.checked,
        };

        if (!formData.name) {
            alert('Role name is required.');
            return;
        }

        try {
            if (isUpdate) {
                await API.put(`/roles/${id}`, formData);
                alert('Role updated successfully!');
            } else {
                await API.post('/roles', formData);
                alert('Role created successfully!');
            }
            
            modal.style.display = 'none';
            fetchData();
        } catch (error) {
            console.error('Save failed:', error);
            alert(error.response?.data?.message || 'Failed to save role.');
        }
    });

    /**
     * Toggle role active status
     */
    const handleToggle = async (id, currentStatus) => {
        const action = currentStatus === 'true' ? 'deactivate' : 'activate';
        
        if (!confirm(`Are you sure you want to ${action} this role?`)) {
            return;
        }

        try {
            await API.patch(`/roles/${id}/toggle`);
            alert(`Role ${action}d successfully!`);
            fetchData();
        } catch (error) {
            console.error('Toggle failed:', error);
            alert(error.response?.data?.message || `Failed to ${action} role.`);
        }
    };

    /**
     * Open delete confirmation modal
     */
    const openDeleteModal = (id, name, userCount) => {
        roleToDelete = { id, name, userCount: parseInt(userCount) };
        
        const deleteMessage = document.getElementById('delete-message');
        const confirmBtn = document.getElementById('confirm-delete-btn');

        if (roleToDelete.userCount > 0) {
            deleteMessage.innerHTML = `
                Are you sure you want to delete the role "<strong>${escapeHtml(name)}</strong>"?
                <p class="delete-warning">
                    <i class="uil-exclamation-triangle"></i> Warning: ${roleToDelete.userCount} user(s) are assigned to this role. 
                    You must reassign them before deleting.
                </p>
            `;
            confirmBtn.disabled = true;
            confirmBtn.title = 'Cannot delete role with assigned users';
        } else {
            deleteMessage.innerHTML = `Are you sure you want to delete the role "<strong>${escapeHtml(name)}</strong>"?`;
            confirmBtn.disabled = false;
            confirmBtn.title = '';
        }

        deleteModal.style.display = 'block';
    };

    /**
     * Confirm delete
     */
    document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
        if (!roleToDelete || roleToDelete.userCount > 0) return;

        try {
            await API.delete(`/roles/${roleToDelete.id}`);
            alert('Role deleted successfully!');
            deleteModal.style.display = 'none';
            roleToDelete = null;
            fetchData();
        } catch (error) {
            console.error('Delete failed:', error);
            alert(error.response?.data?.message || 'Failed to delete role.');
        }
    });

    /**
     * Cancel delete
     */
    document.getElementById('cancel-delete-btn').addEventListener('click', () => {
        deleteModal.style.display = 'none';
        roleToDelete = null;
    });

    /**
     * Attach event listeners to table buttons
     */
    const attachEventListeners = () => {
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id));
        });

        document.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.addEventListener('click', () => handleToggle(btn.dataset.id, btn.dataset.active));
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => openDeleteModal(btn.dataset.id, btn.dataset.name, btn.dataset.users));
        });
    };

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Modal controls
    addBtn.addEventListener('click', openAddModal);
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
            deleteModal.style.display = 'none';
            roleToDelete = null;
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
            roleToDelete = null;
        }
    });

    // Initial load
    fetchData();
});
