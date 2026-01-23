/**
 * Manage Permissions - Table-Based UI
 */
(function() {
    'use strict';

    // State
    let roles = [];
    let selectedRoleId = null;
    let rolePermissions = [];
    let pendingChanges = new Map();
    let dropdownOpen = false;

    // DOM Elements
    const roleSelect = document.getElementById('role-select');
    const roleSearch = document.getElementById('role-search');
    const roleDropdown = document.getElementById('role-dropdown');
    const roleList = document.getElementById('role-list');
    const roleInfo = document.getElementById('role-info');
    const roleNameEl = document.getElementById('role-name');
    const roleDescEl = document.getElementById('role-desc');
    const permCountEl = document.getElementById('perm-count');
    const moduleCountEl = document.getElementById('module-count');
    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');
    const tableWrapper = document.getElementById('table-wrapper');
    const tableBody = document.getElementById('permissions-tbody');
    const saveBar = document.getElementById('save-bar');
    const selectAllBtn = document.getElementById('select-all-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    // Initialize
    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        await loadRoles();
        setupEventListeners();
        setupSearchableDropdown();
    }

    function setupEventListeners() {
        selectAllBtn.addEventListener('click', selectAll);
        clearAllBtn.addEventListener('click', clearAll);
        saveBtn.addEventListener('click', saveChanges);
        cancelBtn.addEventListener('click', cancelChanges);
    }

    // Searchable Dropdown Setup
    function setupSearchableDropdown() {
        // Open dropdown on input focus/click
        roleSearch.addEventListener('focus', openDropdown);
        roleSearch.addEventListener('click', openDropdown);
        
        // Filter on input
        roleSearch.addEventListener('input', filterRoles);
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!roleDropdown.contains(e.target)) {
                closeDropdown();
            }
        });
        
        // Keyboard navigation
        roleSearch.addEventListener('keydown', handleKeyboard);
    }

    function openDropdown() {
        dropdownOpen = true;
        roleDropdown.classList.add('open');
        filterRoles();
    }

    function closeDropdown() {
        dropdownOpen = false;
        roleDropdown.classList.remove('open');
    }

    function filterRoles() {
        const search = roleSearch.value.toLowerCase().trim();
        const filtered = roles.filter(role => 
            role.name.toLowerCase().includes(search) ||
            (role.description && role.description.toLowerCase().includes(search))
        );
        renderDropdownList(filtered);
    }

    function renderDropdownList(filteredRoles) {
        if (filteredRoles.length === 0) {
            roleList.innerHTML = '<div class="dropdown-empty">No roles found</div>';
            return;
        }

        roleList.innerHTML = filteredRoles.map(role => `
            <div class="dropdown-item ${role.id === selectedRoleId ? 'selected' : ''}" 
                 data-id="${role.id}">
                <div class="role-icon">${role.name.charAt(0).toUpperCase()}</div>
                <div class="role-details">
                    <div class="role-title">${escapeHtml(role.name)}</div>
                    <div class="role-subtitle">${escapeHtml(role.description || 'No description')}</div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        roleList.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', () => selectRole(parseInt(item.dataset.id)));
        });
    }

    function handleKeyboard(e) {
        const items = roleList.querySelectorAll('.dropdown-item');
        const currentIndex = Array.from(items).findIndex(item => item.classList.contains('highlighted'));

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            openDropdown();
            const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            highlightItem(items, nextIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            highlightItem(items, prevIndex);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const highlighted = roleList.querySelector('.dropdown-item.highlighted');
            if (highlighted) {
                selectRole(parseInt(highlighted.dataset.id));
            } else if (items.length === 1) {
                selectRole(parseInt(items[0].dataset.id));
            }
        } else if (e.key === 'Escape') {
            closeDropdown();
        }
    }

    function highlightItem(items, index) {
        items.forEach(item => item.classList.remove('highlighted'));
        if (items[index]) {
            items[index].classList.add('highlighted');
            items[index].scrollIntoView({ block: 'nearest' });
        }
    }

    async function selectRole(roleId) {
        selectedRoleId = roleId;
        roleSelect.value = roleId;
        
        const role = roles.find(r => r.id === roleId);
        if (role) {
            roleSearch.value = role.name;
            roleNameEl.textContent = role.name;
            roleDescEl.textContent = role.description || 'No description';
            roleInfo.classList.add('show');
        }
        
        closeDropdown();
        await loadPermissions();
    }

    // Handle session expiry
    function handleSessionExpired(message = 'Your session has expired. Please login again.') {
        if (typeof AppNotify !== 'undefined') {
            AppNotify.warning(message);
            setTimeout(() => { window.location.href = '/login'; }, 2000);
        } else if (typeof toastr !== 'undefined') {
            toastr.warning(message, 'Session Expired', {
                timeOut: 3000,
                onHidden: () => { window.location.href = '/login'; }
            });
        } else {
            AppNotify.warning(message);
            window.location.href = '/login';
        }
    }

    // API Helper with session expiry handling
    const PermAPI = {
        async request(url, options = {}) {
            const response = await fetch('/api' + url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                }
            });
            
            // Handle 401 Unauthorized - session expired
            if (response.status === 401) {
                let message = 'Your session has expired. Please login again.';
                try {
                    const data = await response.json();
                    message = data.message || message;
                } catch (e) {}
                handleSessionExpired(message);
                throw new Error('Session expired');
            }
            
            return response.json();
        },
        async get(url) {
            return this.request(url);
        },
        async post(url, data) {
            return this.request(url, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },
        async put(url, data) {
            return this.request(url, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },
        async delete(url) {
            return this.request(url, { method: 'DELETE' });
        }
    };
    
    // Use PermAPI for local requests (alias for backward compatibility)
    const API = PermAPI;

    // Load roles
    async function loadRoles() {
        try {
            const response = await API.get('/roles');
            roles = response.data || [];
            populateRoleSelect();
        } catch (error) {
            console.error('Error loading roles:', error);
            if (!error.message.includes('Session expired')) {
                showToast('Failed to load roles', 'error');
            }
        }
    }

    function populateRoleSelect() {
        // Initial render of dropdown list
        renderDropdownList(roles);
    }

    // Load permissions for role
    async function loadPermissions() {
        showLoading();
        
        try {
            const response = await API.get(`/permissions/roles/${selectedRoleId}?grouped=true`);
            rolePermissions = response.data || [];
            
            console.log('Loaded permissions:', rolePermissions.length, 'modules');
            
            renderTable();
            updateStats();
            pendingChanges.clear();
            updateSaveBar();
            
        } catch (error) {
            console.error('Error loading permissions:', error);
            showToast('Failed to load permissions', 'error');
            showEmpty();
        }
    }

    // Render permissions table
    function renderTable() {
        if (!rolePermissions || rolePermissions.length === 0) {
            showEmpty();
            return;
        }

        tableBody.innerHTML = '';

        rolePermissions.forEach(module => {
            const row = document.createElement('tr');
            row.dataset.moduleCode = module.module_code;

            // Find actions
            const readAction = findAction(module.actions, 'read');
            const createAction = findAction(module.actions, 'create');
            const updateAction = findAction(module.actions, 'update');
            const deleteAction = findAction(module.actions, 'delete');

            row.innerHTML = `
                <td>
                    <div class="module-cell">
                        <div class="module-icon">
                            <i class="${getModuleIcon(module.module_code)}"></i>
                        </div>
                        <div class="module-details">
                            <span class="module-name">${escapeHtml(module.module_name)}</span>
                            <span class="module-code">${escapeHtml(module.module_code)}</span>
                        </div>
                    </div>
                </td>
                <td class="action-col">
                    ${renderCheckbox(readAction, 'read', module.module_code)}
                </td>
                <td class="action-col">
                    ${renderCheckbox(createAction, 'create', module.module_code)}
                </td>
                <td class="action-col">
                    ${renderCheckbox(updateAction, 'update', module.module_code)}
                </td>
                <td class="action-col">
                    ${renderCheckbox(deleteAction, 'delete', module.module_code)}
                </td>
                <td class="action-col">
                    ${renderBranchCheckbox(module)}
                </td>
                <td class="action-col">
                    ${renderCompanyCheckbox(module)}
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Attach event listeners to checkboxes
        tableBody.querySelectorAll('.perm-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', onPermissionChange);
        });

        showTable();
    }

    function findAction(actions, actionType) {
        return actions ? actions.find(a => a.action === actionType) : null;
    }

    function renderCheckbox(action, actionType, moduleCode) {
        if (!action) {
            return '<span class="no-perm">-</span>';
        }

        const checked = action.has_permission ? 'checked' : '';
        return `
            <label class="perm-checkbox ${actionType}">
                <input type="checkbox" 
                       data-permission-id="${action.permission_id}"
                       data-action="${actionType}"
                       data-module="${moduleCode}"
                       ${checked}>
                <span class="checkmark"></span>
            </label>
        `;
    }

    function renderBranchCheckbox(module) {
        const hasBranch = module.actions && module.actions.some(a => a.branch_level_access);
        const hasAnyPerm = module.actions && module.actions.some(a => a.has_permission);
        
        if (!hasAnyPerm) {
            return '<span class="no-perm">-</span>';
        }

        return `
            <label class="perm-checkbox branch">
                <input type="checkbox" 
                       data-branch="true"
                       data-module="${module.module_code}"
                       ${hasBranch ? 'checked' : ''}>
                <span class="checkmark"></span>
            </label>
        `;
    }

    function renderCompanyCheckbox(module) {
        const hasCompany = module.actions && module.actions.some(a => a.company_level_access);
        const hasAnyPerm = module.actions && module.actions.some(a => a.has_permission);
        
        if (!hasAnyPerm) {
            return '<span class="no-perm">-</span>';
        }

        return `
            <label class="perm-checkbox company">
                <input type="checkbox" 
                       data-company="true"
                       data-module="${module.module_code}"
                       ${hasCompany ? 'checked' : ''}>
                <span class="checkmark"></span>
            </label>
        `;
    }

    // Handle permission change
    function onPermissionChange(e) {
        const checkbox = e.target;
        const permId = checkbox.dataset.permissionId;
        const isBranch = checkbox.dataset.branch === 'true';
        const isCompany = checkbox.dataset.company === 'true';
        const moduleCode = checkbox.dataset.module;
        const isChecked = checkbox.checked;

        if (isBranch) {
            // Branch level change
            const key = `branch_${moduleCode}`;
            pendingChanges.set(key, {
                type: 'branch',
                moduleCode: moduleCode,
                value: isChecked
            });
        } else if (isCompany) {
            // Company level change
            const key = `company_${moduleCode}`;
            pendingChanges.set(key, {
                type: 'company',
                moduleCode: moduleCode,
                value: isChecked
            });
        } else {
            // Permission change
            const key = `perm_${permId}`;
            pendingChanges.set(key, {
                type: 'permission',
                permissionId: parseInt(permId),
                moduleCode: moduleCode,
                action: checkbox.dataset.action,
                value: isChecked
            });
        }

        updateSaveBar();
    }

    // Select all permissions
    function selectAll() {
        tableBody.querySelectorAll('.perm-checkbox input:not([data-branch]):not([data-company])').forEach(cb => {
            if (!cb.checked) {
                cb.checked = true;
                cb.dispatchEvent(new Event('change'));
            }
        });
    }

    // Clear all permissions
    function clearAll() {
        tableBody.querySelectorAll('.perm-checkbox input').forEach(cb => {
            if (cb.checked) {
                cb.checked = false;
                cb.dispatchEvent(new Event('change'));
            }
        });
    }

    // Save changes
    async function saveChanges() {
        if (pendingChanges.size === 0) return;

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="uil-spinner-alt spin"></i> Saving...';

        try {
            // Collect all permission changes
            const permissionsToAdd = [];
            const permissionsToRemove = [];
            const branchChanges = [];
            const companyChanges = [];

            pendingChanges.forEach((change, key) => {
                if (change.type === 'permission') {
                    if (change.value) {
                        permissionsToAdd.push({
                            permission_id: change.permissionId,
                            branch_level_access: false,
                            company_level_access: false
                        });
                    } else {
                        permissionsToRemove.push(change.permissionId);
                    }
                } else if (change.type === 'branch') {
                    branchChanges.push({
                        moduleCode: change.moduleCode,
                        value: change.value
                    });
                } else if (change.type === 'company') {
                    companyChanges.push({
                        moduleCode: change.moduleCode,
                        value: change.value
                    });
                }
            });

            // Use bulk update endpoint
            const response = await API.put(`/permissions/roles/${selectedRoleId}/bulk`, {
                add: permissionsToAdd,
                remove: permissionsToRemove,
                branch_updates: branchChanges,
                company_updates: companyChanges
            });

            if (response.success) {
                showToast('Permissions saved successfully!', 'success');
                pendingChanges.clear();
                updateSaveBar();
                await loadPermissions();
            } else {
                throw new Error(response.message || 'Failed to save');
            }

        } catch (error) {
            console.error('Error saving:', error);
            showToast('Failed to save permissions: ' + error.message, 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="uil-save"></i> Save Changes';
        }
    }

    // Cancel changes
    function cancelChanges() {
        pendingChanges.clear();
        loadPermissions();
    }

    // Update stats
    function updateStats() {
        let activeCount = 0;
        let moduleCount = rolePermissions.length;

        rolePermissions.forEach(module => {
            if (module.actions) {
                module.actions.forEach(action => {
                    if (action.has_permission) activeCount++;
                });
            }
        });

        permCountEl.textContent = activeCount;
        moduleCountEl.textContent = moduleCount;
    }

    // Update save bar visibility
    function updateSaveBar() {
        if (pendingChanges.size > 0) {
            saveBar.classList.add('show');
        } else {
            saveBar.classList.remove('show');
        }
    }

    // UI State helpers
    function showLoading() {
        emptyState.style.display = 'none';
        tableWrapper.classList.remove('show');
        loadingState.classList.add('show');
    }

    function showEmpty() {
        loadingState.classList.remove('show');
        tableWrapper.classList.remove('show');
        emptyState.style.display = 'block';
    }

    function showTable() {
        loadingState.classList.remove('show');
        emptyState.style.display = 'none';
        tableWrapper.classList.add('show');
    }

    function hideAll() {
        loadingState.classList.remove('show');
        emptyState.style.display = 'block';
        tableWrapper.classList.remove('show');
        roleInfo.classList.remove('show');
        saveBar.classList.remove('show');
    }

    // Toast notification
    function showToast(message, type = 'info') {
        // Remove existing toast
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="uil-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i> ${message}`;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Helper: Get module icon
    function getModuleIcon(code) {
        const icons = {
            'dashboard': 'uil-estate',
            'assets': 'uil-box',
            'employees': 'uil-users-alt',
            'assignments': 'uil-exchange',
            'repairs': 'uil-wrench',
            'repair_requests': 'uil-wrench',
            'expenses': 'uil-receipt',
            'reports': 'uil-chart-bar',
            'users': 'uil-user-circle',
            'settings': 'uil-setting',
            'administration': 'uil-cog',
            'admin_branches': 'uil-building',
            'admin_departments': 'uil-sitemap',
            'admin_roles': 'uil-shield',
            'admin_permissions': 'uil-lock-alt',
            'admin_asset_types': 'uil-tag-alt',
            'admin_asset_statuses': 'uil-info-circle',
            'admin_expense_types': 'uil-dollar-sign',
            'admin_repair_types': 'uil-wrench',
            'admin_repair_statuses': 'uil-clipboard-alt',
            'admin_repair_priorities': 'uil-exclamation-triangle'
        };
        return icons[code] || 'uil-apps';
    }

    // Helper: Escape HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

})();
