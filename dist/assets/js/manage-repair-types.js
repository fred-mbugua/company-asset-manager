document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addBtn = document.getElementById('add-type-btn');
    const modal = document.getElementById('type-form-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('type-form');
    const tableBody = document.getElementById('types-table-body');
    const searchInput = document.getElementById('search-input');
    const showInactive = document.getElementById('show-inactive');

    // Form Fields
    const idField = document.getElementById('type-id');
    const nameField = document.getElementById('name');
    const descriptionField = document.getElementById('description');
    const displayOrderField = document.getElementById('display_order');
    const isActiveField = document.getElementById('is_active');

    const API_ENDPOINT = '/repair-requests/types';

    // State
    let allData = [];
    let filteredData = [];

    /**
     * Fetch all repair request types from the server
     */
    const fetchData = async () => {
        try {
            const includeInactive = showInactive.checked;
            const response = await API.get(`${API_ENDPOINT}?includeInactive=${includeInactive}`);
            allData = response.data || [];
            filterData();
        } catch (error) {
            console.error('Error fetching repair request types:', error);
            alert('Failed to load repair request types.');
        }
    };

    /**
     * Filter data based on search
     */
    const filterData = () => {
        const searchTerm = searchInput.value.toLowerCase();
        filteredData = allData.filter(type => {
            const matchesSearch = type.name.toLowerCase().includes(searchTerm) ||
                (type.description && type.description.toLowerCase().includes(searchTerm));
            const matchesActive = showInactive.checked || type.is_active;
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
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No repair request types found.</td></tr>';
            return;
        }

        filteredData.forEach(type => {
            const row = document.createElement('tr');
            row.dataset.typeId = type.id;
            row.className = type.is_active ? '' : 'row-inactive';
            row.innerHTML = `
                <td data-label="ID">${type.id}</td>
                <td data-label="Name">${escapeHtml(type.name)}</td>
                <td data-label="Description">${escapeHtml(type.description) || 'N/A'}</td>
                <td data-label="Order">${type.display_order || 0}</td>
                <td data-label="Status">
                    <span class="status-badge ${type.is_active ? 'status-active' : 'status-inactive'}">
                        ${type.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td data-label="Actions">
                    <button class="btn btn-sm btn-edit" data-id="${type.id}" title="Edit">
                        <i class="uil uil-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-toggle" data-id="${type.id}" data-active="${type.is_active}" title="${type.is_active ? 'Deactivate' : 'Activate'}">
                        <i class="uil ${type.is_active ? 'uil-toggle-on' : 'uil-toggle-off'}"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" data-id="${type.id}" title="Delete">
                        <i class="uil uil-trash-alt"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        attachEventListeners();
    };

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
        displayOrderField.value = '0';
        isActiveField.value = 'true';
        modalTitle.textContent = 'Add New Repair Request Type';
        modal.style.display = 'block';
    };

    /**
     * Open modal for editing
     */
    const openEditModal = async (id) => {
        try {
            const response = await API.get(`${API_ENDPOINT}/${id}`);
            const type = response.data;

            idField.value = type.id;
            nameField.value = type.name;
            descriptionField.value = type.description || '';
            displayOrderField.value = type.display_order || 0;
            isActiveField.value = type.is_active ? 'true' : 'false';

            modalTitle.textContent = `Edit Type: ${type.name}`;
            modal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching type data:', error);
            alert('Failed to load type data for editing.');
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
            display_order: parseInt(displayOrderField.value) || 0,
            is_active: isActiveField.value === 'true'
        };

        try {
            if (isUpdate) {
                await API.put(`${API_ENDPOINT}/${id}`, formData);
                alert('Type updated successfully!');
            } else {
                await API.post(API_ENDPOINT, formData);
                alert('Type created successfully!');
            }
            
            modal.style.display = 'none';
            fetchData();
        } catch (error) {
            console.error('Save failed:', error);
            alert(error.response?.data?.message || 'Failed to save type.');
        }
    });

    /**
     * Handle toggle active/inactive
     */
    const handleToggle = async (id, currentActive) => {
        const action = currentActive === 'true' ? 'deactivate' : 'activate';
        if (!confirm(`Are you sure you want to ${action} this type?`)) {
            return;
        }

        try {
            await API.patch(`${API_ENDPOINT}/${id}/toggle`);
            alert(`Type ${action}d successfully!`);
            fetchData();
        } catch (error) {
            console.error('Toggle failed:', error);
            alert(error.response?.data?.message || `Failed to ${action} type.`);
        }
    };

    /**
     * Handle delete
     */
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this type? This cannot be undone.')) {
            return;
        }

        try {
            await API.delete(`${API_ENDPOINT}/${id}`);
            alert('Type deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Delete failed:', error);
            alert(error.response?.data?.message || 'Failed to delete type.');
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
