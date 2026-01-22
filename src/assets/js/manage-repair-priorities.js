document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addBtn = document.getElementById('add-priority-btn');
    const modal = document.getElementById('priority-form-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('priority-form');
    const tableBody = document.getElementById('priorities-table-body');
    const searchInput = document.getElementById('search-input');
    const showInactive = document.getElementById('show-inactive');

    // Form Fields
    const idField = document.getElementById('priority-id');
    const nameField = document.getElementById('name');
    const descriptionField = document.getElementById('description');
    const colorPickerField = document.getElementById('color_picker');
    const colorCodeField = document.getElementById('color_code');
    const displayOrderField = document.getElementById('display_order');
    const isActiveField = document.getElementById('is_active');
    const previewBadge = document.getElementById('priority-preview');

    const API_ENDPOINT = '/repair-requests/priorities';

    // State
    let allData = [];
    let filteredData = [];

    /**
     * Fetch all repair request priorities from the server
     */
    const fetchData = async () => {
        try {
            const includeInactive = showInactive.checked;
            const response = await API.get(`${API_ENDPOINT}?includeInactive=${includeInactive}`);
            allData = response.data || [];
            filterData();
        } catch (error) {
            console.error('Error fetching repair request priorities:', error);
            AppNotify.error('Failed to load repair request priorities.');
        }
    };

    /**
     * Filter data based on search
     */
    const filterData = () => {
        const searchTerm = searchInput.value.toLowerCase();
        filteredData = allData.filter(priority => {
            const matchesSearch = priority.name.toLowerCase().includes(searchTerm) ||
                (priority.description && priority.description.toLowerCase().includes(searchTerm));
            const matchesActive = showInactive.checked || priority.is_active;
            return matchesSearch && matchesActive;
        });
        renderTable();
    };

    /**
     * Render table with data
     */
    const renderTable = () => {
        tableBody.innerHTML = '';
        
        if (filteredData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No repair request priorities found.</td></tr>';
            return;
        }

        filteredData.forEach(priority => {
            const row = document.createElement('tr');
            row.dataset.priorityId = priority.id;
            row.className = priority.is_active ? '' : 'row-inactive';
            row.innerHTML = `
                <td data-label="ID">${priority.id}</td>
                <td data-label="Name">${escapeHtml(priority.name)}</td>
                <td data-label="Description">${escapeHtml(priority.description) || 'N/A'}</td>
                <td data-label="Preview">
                    <span class="priority-badge" style="background-color: ${priority.color_code || '#6c757d'}">
                        ${escapeHtml(priority.name)}
                    </span>
                </td>
                <td data-label="Order">${priority.display_order || 0}</td>
                <td data-label="Status">
                    <span class="status-badge ${priority.is_active ? 'status-active' : 'status-inactive'}">
                        ${priority.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td data-label="Actions">
                    <button class="btn btn-sm btn-edit" data-id="${priority.id}" title="Edit">
                        <i class="uil uil-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-toggle" data-id="${priority.id}" data-active="${priority.is_active}" title="${priority.is_active ? 'Deactivate' : 'Activate'}">
                        <i class="uil ${priority.is_active ? 'uil-toggle-on' : 'uil-toggle-off'}"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" data-id="${priority.id}" title="Delete">
                        <i class="uil uil-trash-alt"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        attachEventListeners();
    };

    /**
     * Update preview badge color
     */
    const updatePreview = () => {
        previewBadge.style.backgroundColor = colorCodeField.value;
        previewBadge.textContent = nameField.value || 'Preview';
    };

    // Color picker sync
    colorPickerField.addEventListener('input', () => {
        colorCodeField.value = colorPickerField.value;
        updatePreview();
    });

    colorCodeField.addEventListener('input', () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(colorCodeField.value)) {
            colorPickerField.value = colorCodeField.value;
        }
        updatePreview();
    });

    nameField.addEventListener('input', updatePreview);

    /**
     * Search/Filter functionality
     */
    searchInput.addEventListener('input', filterData);
    showInactive.addEventListener('change', fetchData);

    /**
     * Open modal for adding
     */
    const openAddModal = () => {
        form.reset();
        idField.value = '';
        colorPickerField.value = '#f39c12';
        colorCodeField.value = '#f39c12';
        displayOrderField.value = '0';
        isActiveField.value = 'true';
        previewBadge.style.backgroundColor = '#f39c12';
        previewBadge.textContent = 'Preview';
        modalTitle.textContent = 'Add New Priority';
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    /**
     * Open modal for editing
     */
    const openEditModal = async (id) => {
        try {
            const response = await API.get(`${API_ENDPOINT}/${id}`);
            const priority = response.data;

            idField.value = priority.id;
            nameField.value = priority.name;
            descriptionField.value = priority.description || '';
            colorPickerField.value = priority.color_code || '#f39c12';
            colorCodeField.value = priority.color_code || '#f39c12';
            displayOrderField.value = priority.display_order || 0;
            isActiveField.value = priority.is_active ? 'true' : 'false';
            updatePreview();

            modalTitle.textContent = `Edit Priority: ${priority.name}`;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error('Error fetching priority data:', error);
            AppNotify.error('Failed to load priority data for editing.');
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
            color_code: colorCodeField.value,
            display_order: parseInt(displayOrderField.value) || 0,
            is_active: isActiveField.value === 'true'
        };

        try {
            if (isUpdate) {
                await API.put(`${API_ENDPOINT}/${id}`, formData);
                AppNotify.success('Priority updated successfully!');
            } else {
                await API.post(API_ENDPOINT, formData);
                AppNotify.success('Priority created successfully!');
            }
            
            modal.style.display = 'none';
            document.body.style.overflow = '';
            fetchData();
        } catch (error) {
            console.error('Save failed:', error);
            AppNotify.error(error.response?.data?.message || 'Failed to save priority.');
        }
    });

    /**
     * Handle toggle active/inactive
     */
    const handleToggle = async (id, currentActive) => {
        const action = currentActive === 'true' ? 'deactivate' : 'activate';
        const confirmed = await AppConfirm.warn(`Are you sure you want to ${action} this priority?`);
        if (!confirmed) {
            return;
        }

        try {
            await API.patch(`${API_ENDPOINT}/${id}/toggle`);
            AppNotify.success(`Priority ${action}d successfully!`);
            fetchData();
        } catch (error) {
            console.error('Toggle failed:', error);
            AppNotify.error(error.response?.data?.message || `Failed to ${action} priority.`);
        }
    };

    /**
     * Handle delete
     */
    const handleDelete = async (id) => {
        const confirmed = await AppConfirm.delete('Are you sure you want to delete this priority? This cannot be undone.');
        if (!confirmed) {
            return;
        }

        try {
            await API.delete(`${API_ENDPOINT}/${id}`);
            AppNotify.success('Priority deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Delete failed:', error);
            AppNotify.error(error.response?.data?.message || 'Failed to delete priority.');
        }
    };

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
            btn.addEventListener('click', () => handleDelete(btn.dataset.id));
        });
    };

    /**
     * Escape HTML for XSS prevention
     */
    const escapeHtml = (str) => {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // Modal controls
    addBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    });

    // Prevent modal closing when clicking inside modal content
    modal.querySelector('.modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Initial load
    fetchData();
});
