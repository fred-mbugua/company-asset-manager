document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addBtn = document.getElementById('add-status-btn');
    const modal = document.getElementById('status-form-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('status-form');
    const tableBody = document.getElementById('statuses-table-body');
    const searchInput = document.getElementById('search-input');

    // Form Fields
    const idField = document.getElementById('status-id');
    const nameField = document.getElementById('name');
    const isAvailableField = document.getElementById('is_available');
    const descriptionField = document.getElementById('description');

    const API_ENDPOINT = '/api/assets';

    // Pagination Variables
    let currentPage = 1;
    let pageSize = 10;
    let allData = [];
    let filteredData = [];

    /**
     * Fetch all asset statuses from the server
     */
    const fetchData = async () => {
        try {
            const response = await API.get('/assets/asset-statuses/all');
            allData = response.data || [];
            filteredData = [...allData];
            updatePagination();
            renderTable();
        } catch (error) {
            console.error('Error fetching asset statuses:', error);
            alert('Failed to load asset statuses.');
        }
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
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No asset statuses found.</td></tr>';
            return;
        }

        pageData.forEach(status => {
            const row = document.createElement('tr');
            row.dataset.statusId = status.id;
            row.innerHTML = `
                <td data-label="ID">${status.id}</td>
                <td data-label="Name">${status.name}</td>
                <td data-label="Is Available">${status.is_available ? 'Yes' : 'No'}</td>
                <td data-label="Description">${status.description || 'N/A'}</td>
                <td data-label="Actions">
                    <button class="btn btn-sm btn-edit" data-id="${status.id}">Edit</button>
                    <button class="btn btn-sm btn-delete" data-id="${status.id}">Delete</button>
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
        const totalPages = Math.ceil(filteredData.length / pageSize);
        const pageInfo = document.getElementById('page-info');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${filteredData.length} total)`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    };

    /**
     * Search/Filter functionality
     */
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filteredData = allData.filter(status => 
            status.name.toLowerCase().includes(searchTerm) ||
            (status.description && status.description.toLowerCase().includes(searchTerm))
        );
        currentPage = 1;
        updatePagination();
        renderTable();
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
        modalTitle.textContent = 'Add New Asset Status';
        modal.style.display = 'block';
    };

    /**
     * Open modal for editing
     */
    const openEditModal = async (id) => {
        try {
            const response = await API.get(`/assets/asset-statuses/${id}`);
            const status = response.data;

            idField.value = status.id;
            nameField.value = status.name;
            isAvailableField.value = status.is_available ? 'true' : 'false';
            descriptionField.value = status.description || '';

            modalTitle.textContent = `Edit Asset Status: ${status.name}`;
            modal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching asset status data:', error);
            alert('Failed to load asset status data for editing.');
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
            is_available: isAvailableField.value === 'true',
            description: descriptionField.value.trim() || null,
        };

        try {
            if (isUpdate) {
                await API.put(`/assets/asset-statuses/${id}`, formData);
                alert('Asset status updated successfully!');
            } else {
                await API.post('/assets/asset-statuses/create', formData);
                alert('Asset status created successfully!');
            }
            
            modal.style.display = 'none';
            fetchData();
        } catch (error) {
            console.error('Save failed:', error);
            alert(error.response?.data?.message || 'Failed to save asset status.');
        }
    });

    /**
     * Handle delete
     */
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this asset status?')) {
            return;
        }

        try {
            await API.delete(`/assets/asset-statuses/${id}`);
            alert('Asset status deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Delete failed:', error);
            alert(error.response?.data?.message || 'Failed to delete asset status.');
        }
    };

    /**
     * Attach event listeners to table buttons
     */
    const attachEventListeners = () => {
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id));
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => handleDelete(btn.dataset.id));
        });
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
    attachEventListeners();
});
