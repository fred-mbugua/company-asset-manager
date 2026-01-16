document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addBtn = document.getElementById('add-status-btn');
    const modal = document.getElementById('status-form-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('status-form');
    const tableBody = document.getElementById('statuses-table-body');
    const searchInput = document.getElementById('search-input');
    const showInactive = document.getElementById('show-inactive');

    // Form Fields
    const idField = document.getElementById('status-id');
    const nameField = document.getElementById('name');
    const descriptionField = document.getElementById('description');
    const colorPickerField = document.getElementById('color_picker');
    const colorCodeField = document.getElementById('color_code');
    const displayOrderField = document.getElementById('display_order');
    const isActiveField = document.getElementById('is_active');
    const previewBadge = document.getElementById('status-preview');

    const API_ENDPOINT = '/repair-requests/statuses';

    // State
    let allData = [];
    let filteredData = [];

    /**
     * Fetch all repair request statuses from the server
     */
    const fetchData = async () => {
        try {
            const includeInactive = showInactive.checked;
            const response = await API.get(`${API_ENDPOINT}?includeInactive=${includeInactive}`);
            allData = response.data || [];
            filterData();
        } catch (error) {
            console.error('Error fetching repair request statuses:', error);
            alert('Failed to load repair request statuses.');
        }
    };

    /**
     * Filter data based on search
     */
    const filterData = () => {
        const searchTerm = searchInput.value.toLowerCase();
        filteredData = allData.filter(status => {
            const matchesSearch = status.name.toLowerCase().includes(searchTerm) ||
                (status.description && status.description.toLowerCase().includes(searchTerm));
            const matchesActive = showInactive.checked || status.is_active;
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
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No repair request statuses found.</td></tr>';
            return;
        }

        filteredData.forEach(status => {
            const row = document.createElement('tr');
            row.dataset.statusId = status.id;
            row.className = status.is_active ? '' : 'row-inactive';
            row.innerHTML = `
                <td data-label="ID">${status.id}</td>
                <td data-label="Name">${escapeHtml(status.name)}</td>
                <td data-label="Description">${escapeHtml(status.description) || 'N/A'}</td>
                <td data-label="Preview">
                    <span class="status-badge" style="background-color: ${status.color_code || '#6c757d'}">
                        ${escapeHtml(status.name)}
                    </span>
                </td>
                <td data-label="Order">${status.display_order || 0}</td>
                <td data-label="Status">
                    <span class="status-badge ${status.is_active ? 'status-active' : 'status-inactive'}">
                        ${status.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td data-label="Actions">
                    <button class="btn btn-sm btn-edit" data-id="${status.id}" title="Edit">
                        <i class="uil uil-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-toggle" data-id="${status.id}" data-active="${status.is_active}" title="${status.is_active ? 'Deactivate' : 'Activate'}">
                        <i class="uil ${status.is_active ? 'uil-toggle-on' : 'uil-toggle-off'}"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" data-id="${status.id}" title="Delete">
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
        colorPickerField.value = '#3498db';
        colorCodeField.value = '#3498db';
        displayOrderField.value = '0';
        isActiveField.value = 'true';
        previewBadge.style.backgroundColor = '#3498db';
        previewBadge.textContent = 'Preview';
        modalTitle.textContent = 'Add New Status';
        modal.style.display = 'block';
    };

    /**
     * Open modal for editing
     */
    const openEditModal = async (id) => {
        try {
            const response = await API.get(`${API_ENDPOINT}/${id}`);
            const status = response.data;

            idField.value = status.id;
            nameField.value = status.name;
            descriptionField.value = status.description || '';
            colorPickerField.value = status.color_code || '#3498db';
            colorCodeField.value = status.color_code || '#3498db';
            displayOrderField.value = status.display_order || 0;
            isActiveField.value = status.is_active ? 'true' : 'false';
            updatePreview();

            modalTitle.textContent = `Edit Status: ${status.name}`;
            modal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching status data:', error);
            alert('Failed to load status data for editing.');
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
                alert('Status updated successfully!');
            } else {
                await API.post(API_ENDPOINT, formData);
                alert('Status created successfully!');
            }
            
            modal.style.display = 'none';
            fetchData();
        } catch (error) {
            console.error('Save failed:', error);
            alert(error.response?.data?.message || 'Failed to save status.');
        }
    });

    /**
     * Handle toggle active/inactive
     */
    const handleToggle = async (id, currentActive) => {
        const action = currentActive === 'true' ? 'deactivate' : 'activate';
        if (!confirm(`Are you sure you want to ${action} this status?`)) {
            return;
        }

        try {
            await API.patch(`${API_ENDPOINT}/${id}/toggle`);
            alert(`Status ${action}d successfully!`);
            fetchData();
        } catch (error) {
            console.error('Toggle failed:', error);
            alert(error.response?.data?.message || `Failed to ${action} status.`);
        }
    };

    /**
     * Handle delete
     */
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this status? This cannot be undone.')) {
            return;
        }

        try {
            await API.delete(`${API_ENDPOINT}/${id}`);
            alert('Status deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Delete failed:', error);
            alert(error.response?.data?.message || 'Failed to delete status.');
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
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Initial load
    fetchData();
});
