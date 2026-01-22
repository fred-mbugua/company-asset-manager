document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addBtn = document.getElementById('add-type-btn');
    const modal = document.getElementById('type-form-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('type-form');
    const tableBody = document.getElementById('types-table-body');
    const searchInput = document.getElementById('search-input');

    // Form Fields
    const idField = document.getElementById('type-id');
    const nameField = document.getElementById('name');
    const descriptionField = document.getElementById('description');

    const API_ENDPOINT = '/api/expenses';

    // Pagination Variables
    let currentPage = 1;
    let pageSize = 10;
    let allData = [];
    let filteredData = [];

    /**
     * Fetch all expense types from the server
     */
    const fetchData = async () => {
        try {
            const response = await API.get('/expenses/expense-types/all');
            allData = response.data || [];
            filteredData = [...allData];
            updatePagination();
            renderTable();
        } catch (error) {
            console.error('Error fetching expense types:', error);
            AppNotify.error('Failed to load expense types.');
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
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No expense types found.</td></tr>';
            return;
        }

        pageData.forEach(type => {
            const row = document.createElement('tr');
            row.dataset.typeId = type.id;
            row.innerHTML = `
                <td data-label="ID">${type.id}</td>
                <td data-label="Name">${type.name}</td>
                <td data-label="Description">${type.description || 'N/A'}</td>
                <td data-label="Actions">
                    <button class="btn btn-sm btn-edit" data-id="${type.id}">Edit</button>
                    <button class="btn btn-sm btn-delete" data-id="${type.id}">Delete</button>
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
        filteredData = allData.filter(type => 
            type.name.toLowerCase().includes(searchTerm) ||
            (type.description && type.description.toLowerCase().includes(searchTerm))
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
        modalTitle.textContent = 'Add New Expense Type';
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    /**
     * Open modal for editing
     */
    const openEditModal = async (id) => {
        try {
            const response = await API.get(`/expenses/expense-types/${id}`);
            const type = response.data;

            idField.value = type.id;
            nameField.value = type.name;
            descriptionField.value = type.description || '';

            modalTitle.textContent = `Edit Expense Type: ${type.name}`;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error('Error fetching expense type data:', error);
            AppNotify.error('Failed to load expense type data for editing.');
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
        };

        try {
            if (isUpdate) {
                await API.put(`/expenses/expense-types/${id}`, formData);
                AppNotify.success('Expense type updated successfully!');
            } else {
                await API.post('/expenses/expense-types/create', formData);
                AppNotify.success('Expense type created successfully!');
            }
            
            modal.style.display = 'none';
            document.body.style.overflow = '';
            fetchData();
        } catch (error) {
            console.error('Save failed:', error);
            AppNotify.error(error.response?.data?.message || 'Failed to save expense type.');
        }
    });

    /**
     * Handle delete
     */
    const handleDelete = async (id) => {
        const confirmed = await AppConfirm.delete('Are you sure you want to delete this expense type?');
        if (!confirmed) {
            return;
        }

        try {
            await API.delete(`/expenses/expense-types/${id}`);
            AppNotify.success('Expense type deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Delete failed:', error);
            AppNotify.error(error.response?.data?.message || 'Failed to delete expense type.');
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
    attachEventListeners();
});
