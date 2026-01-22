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
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No roles found.</td></tr>';
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

            // Permissions button - available for all roles
            const permissionsBtn = `
                <button class="btn btn-sm btn-permissions" data-id="${role.id}" data-name="${escapeHtml(role.name)}">
                    <i class="uil-shield-check"></i> Permissions
                </button>
            `;

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
                <td data-label="Permissions">
                    ${permissionsBtn}
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
        document.body.style.overflow = 'hidden';
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
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error('Error fetching role data:', error);
            AppNotify.error('Failed to load role data for editing.');
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
            AppNotify.warning('Role name is required.');
            return;
        }

        try {
            if (isUpdate) {
                await API.put(`/roles/${id}`, formData);
                AppNotify.success('Role updated successfully!');
            } else {
                await API.post('/roles', formData);
                AppNotify.success('Role created successfully!');
            }
            
            modal.style.display = 'none';
            document.body.style.overflow = '';
            fetchData();
        } catch (error) {
            console.error('Save failed:', error);
            AppNotify.error(error.response?.data?.message || 'Failed to save role.');
        }
    });

    /**
     * Toggle role active status
     */
    const handleToggle = async (id, currentStatus) => {
        const action = currentStatus === 'true' ? 'deactivate' : 'activate';
        
        const confirmed = await AppConfirm.warn(`Are you sure you want to ${action} this role?`);
        if (!confirmed) {
            return;
        }

        try {
            await API.patch(`/roles/${id}/toggle`);
            AppNotify.success(`Role ${action}d successfully!`);
            fetchData();
        } catch (error) {
            console.error('Toggle failed:', error);
            AppNotify.error(error.response?.data?.message || `Failed to ${action} role.`);
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
        document.body.style.overflow = 'hidden';
    };

    /**
     * Confirm delete
     */
    document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
        if (!roleToDelete || roleToDelete.userCount > 0) return;

        try {
            await API.delete(`/roles/${roleToDelete.id}`);
            AppNotify.success('Role deleted successfully!');
            deleteModal.style.display = 'none';
            document.body.style.overflow = '';
            roleToDelete = null;
            fetchData();
        } catch (error) {
            console.error('Delete failed:', error);
            AppNotify.error(error.response?.data?.message || 'Failed to delete role.');
        }
    });

    /**
     * Cancel delete
     */
    document.getElementById('cancel-delete-btn').addEventListener('click', () => {
        deleteModal.style.display = 'none';
        document.body.style.overflow = '';
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

        document.querySelectorAll('.btn-permissions').forEach(btn => {
            btn.addEventListener('click', () => openPermissionsModal(btn.dataset.id, btn.dataset.name));
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

    // =====================================================
    // PERMISSIONS MODAL FUNCTIONALITY
    // =====================================================
    const permissionsModal = document.getElementById('permissions-modal');
    const permissionsGrid = document.getElementById('permissions-grid');
    const permissionsLoading = document.getElementById('permissions-loading');
    const permissionsRoleName = document.getElementById('permissions-role-name');
    const savePermissionsBtn = document.getElementById('save-permissions-btn');
    const cancelPermissionsBtn = document.getElementById('cancel-permissions-btn');
    
    let currentPermissionsRoleId = null;
    let allModules = [];
    let allPermissions = [];
    let currentRolePermissions = [];

    /**
     * Open permissions modal for a role
     */
    const openPermissionsModal = async (roleId, roleName) => {
        currentPermissionsRoleId = roleId;
        permissionsRoleName.textContent = roleName;
        permissionsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Show loading
        permissionsLoading.style.display = 'block';
        permissionsGrid.innerHTML = '';
        
        try {
            // Fetch modules, all permissions, and role permissions in parallel
            const [modulesRes, permissionsRes, rolePermissionsRes] = await Promise.all([
                API.get('/permissions/modules?hierarchy=true'),
                API.get('/permissions'),
                API.get(`/permissions/roles/${roleId}`)
            ]);
            
            allModules = modulesRes.data || [];
            allPermissions = permissionsRes.data || [];
            currentRolePermissions = rolePermissionsRes.data || [];
            
            renderPermissionsGrid();
        } catch (error) {
            console.error('Failed to load permissions:', error);
            permissionsGrid.innerHTML = `
                <div class="permissions-error">
                    <i class="uil-exclamation-circle"></i>
                    Failed to load permissions. Please try again.
                </div>
            `;
        } finally {
            permissionsLoading.style.display = 'none';
        }
    };

    /**
     * Render the permissions grid
     */
    const renderPermissionsGrid = () => {
        if (!allModules.length) {
            permissionsGrid.innerHTML = '<div class="no-modules">No modules found.</div>';
            return;
        }

        // Create a map for quick permission lookup by module_id and action
        const permissionIdMap = {};
        allPermissions.forEach(p => {
            const key = `${p.module_id}_${p.action}`;
            permissionIdMap[key] = p.id;
        });

        // Create a map for role's current permissions
        const rolePermissionMap = {};
        currentRolePermissions.forEach(p => {
            rolePermissionMap[p.permission_id] = {
                has_permission: true,
                branch_level_access: p.branch_level_access
            };
        });

        let html = '';

        // Handle hierarchical modules
        const parentModules = allModules.filter(m => !m.parent_id);
        
        parentModules.forEach(parentModule => {
            const children = parentModule.children || allModules.filter(m => m.parent_id === parentModule.id);
            const hasChildren = children && children.length > 0;

            html += `
                <div class="module-group">
                    <div class="module-header">
                        <div class="module-info">
                            <i class="${parentModule.icon || 'uil-cube'}"></i>
                            <span class="module-name">${escapeHtml(parentModule.name)}</span>
                            ${hasChildren ? `<span class="child-count">(${children.length} sub-modules)</span>` : ''}
                        </div>
                        ${!hasChildren ? renderPermissionToggles(parentModule, permissionIdMap, rolePermissionMap) : ''}
                    </div>
                    ${hasChildren ? `
                        <div class="module-children">
                            ${children.map(child => `
                                <div class="child-module">
                                    <div class="child-module-name">
                                        <i class="${child.icon || 'uil-angle-right'}"></i>
                                        ${escapeHtml(child.name)}
                                    </div>
                                    ${renderPermissionToggles(child, permissionIdMap, rolePermissionMap)}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });

        permissionsGrid.innerHTML = html;

        // Attach toggle event listeners
        attachPermissionToggleListeners();
    };

    /**
     * Render permission toggle buttons for a module
     */
    const renderPermissionToggles = (module, permissionIdMap, rolePermissionMap) => {
        const actions = ['read', 'create', 'update', 'delete'];
        const actionIcons = {
            read: 'uil-eye',
            create: 'uil-plus',
            update: 'uil-edit',
            delete: 'uil-trash-alt'
        };

        let html = '<div class="permission-toggles">';
        
        actions.forEach(action => {
            const key = `${module.id}_${action}`;
            const permissionId = permissionIdMap[key];
            const hasPermission = permissionId && rolePermissionMap[permissionId];
            const isActive = hasPermission ? rolePermissionMap[permissionId].has_permission : false;

            html += `
                <button class="permission-toggle ${isActive ? 'active' : ''}" 
                        data-module-code="${module.code}"
                        data-module-id="${module.id}"
                        data-action="${action}"
                        data-permission-id="${permissionId || ''}"
                        title="${action.charAt(0).toUpperCase() + action.slice(1)}"
                        ${!permissionId ? 'disabled' : ''}>
                    <i class="${actionIcons[action]}"></i>
                    <span>${action.charAt(0).toUpperCase()}</span>
                </button>
            `;
        });

        html += '</div>';
        return html;
    };

    /**
     * Attach event listeners to permission toggles
     */
    const attachPermissionToggleListeners = () => {
        permissionsGrid.querySelectorAll('.permission-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
            });
        });
    };

    /**
     * Save role permissions
     */
    const saveRolePermissions = async () => {
        if (!currentPermissionsRoleId) return;

        const permissions = [];
        
        permissionsGrid.querySelectorAll('.permission-toggle').forEach(btn => {
            const permissionId = btn.dataset.permissionId;
            const isActive = btn.classList.contains('active');
            
            if (permissionId && isActive) {
                permissions.push({
                    permission_id: parseInt(permissionId),
                    branch_level_access: false // Default, can be enhanced later
                });
            }
        });

        try {
            savePermissionsBtn.disabled = true;
            savePermissionsBtn.textContent = 'Saving...';

            await API.put(`/permissions/roles/${currentPermissionsRoleId}/bulk`, { permissions });
            
            AppNotify.success('Permissions saved successfully!');
            closePermissionsModal();
        } catch (error) {
            console.error('Failed to save permissions:', error);
            AppNotify.error(error.response?.data?.message || 'Failed to save permissions.');
        } finally {
            savePermissionsBtn.disabled = false;
            savePermissionsBtn.textContent = 'Save Permissions';
        }
    };

    /**
     * Close permissions modal
     */
    const closePermissionsModal = () => {
        permissionsModal.style.display = 'none';
        document.body.style.overflow = '';
        currentPermissionsRoleId = null;
        allModules = [];
        allPermissions = [];
        currentRolePermissions = [];
    };

    // Permissions modal event listeners
    if (savePermissionsBtn) {
        savePermissionsBtn.addEventListener('click', saveRolePermissions);
    }

    if (cancelPermissionsBtn) {
        cancelPermissionsBtn.addEventListener('click', closePermissionsModal);
    }

    // Close permissions modal on X button
    const closePermissionsModalBtn = permissionsModal?.querySelector('.close-btn');
    if (closePermissionsModalBtn) {
        closePermissionsModalBtn.addEventListener('click', closePermissionsModal);
    }

    // Close permissions modal when clicking outside
    // Prevent modal closing when clicking inside modal content
    permissionsModal?.querySelector('.modal-content')?.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Modal controls
    addBtn.addEventListener('click', openAddModal);
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
            deleteModal.style.display = 'none';
            document.body.style.overflow = '';
            roleToDelete = null;
        });
    });

    // Prevent modal closing when clicking inside modal content
    if (modal) {
        modal.querySelector('.modal-content')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    if (deleteModal) {
        deleteModal.querySelector('.modal-content')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
            if (deleteModal.style.display === 'block') {
                deleteModal.style.display = 'none';
                document.body.style.overflow = '';
                roleToDelete = null;
            }
            if (permissionsModal?.style.display === 'block') {
                closePermissionsModal();
            }
        }
    });

    // Initial load
    fetchData();
});
