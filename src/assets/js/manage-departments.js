document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addDeptBtn = document.getElementById('add-dept-btn');
    const modal = document.getElementById('dept-form-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const modalTitle = document.getElementById('modal-title');
    const deptForm = document.getElementById('dept-form');
    const departmentsTableBody = document.getElementById('departments-table-body');

    // Form Fields
    const deptIdField = document.getElementById('dept-id');
    const nameField = document.getElementById('name');

    const API_ENDPOINT = '/departments'; 

    /**
     * Resets the form and prepares the modal for adding a new department.
     */
    const openAddModal = () => {
        deptForm.reset();
        deptIdField.value = '';
        modalTitle.textContent = 'Add New Department';
        modal.style.display = 'block';
    };

    /**
     * Fetches department data and populates the form for editing.
     */
    const openEditModal = async (id) => {
        try {
            const response = await API.get(`${API_ENDPOINT}/${id}`); 
            const department = response.data; 

            deptIdField.value = department.id;
            nameField.value = department.name;

            modalTitle.textContent = `Edit Department: ${department.name}`;
            modal.style.display = 'block';

        } catch (error) {
            console.error('Error fetching department data:', error);
            alert('Failed to load department data for editing.');
        }
    };

    /**
     * Handles the form submission for both creating and updating a department.
     */
    deptForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = deptIdField.value;
        const isUpdate = !!id;
        const formData = {
            name: nameField.value
        };

        try {
            let response;
            if (isUpdate) {
                // Update existing department
                response = await API.put(`${API_ENDPOINT}/${id}`, formData);
                alert(`Department ${formData.name} updated successfully!`);
            } else {
                // Create new department
                response = await API.post(API_ENDPOINT, formData);
                alert(`Department ${formData.name} created successfully!`);
            }
            
            modal.style.display = 'none';
            window.location.reload(); 

        } catch (error) {
            console.error('Department save failed:', error);
            alert('Department save failed. Ensure the name is unique.');
        }
    });
    
    /**
     * Handles the delete action.
     */
    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to DELETE the department: ${name}? This action cannot be undone and may affect linked employees/users.`)) {
            return;
        }

        try {
            await API.delete(`${API_ENDPOINT}/${id}`);
            alert(`Department ${name} deleted successfully.`);
            window.location.reload(); 
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete department. Please ensure no employees or users are currently linked to it.');
        }
    };


    // --- Event Listeners ---
    
    // Open Add Department Modal
    addDeptBtn.addEventListener('click', openAddModal);

    // Close Modal
    closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (e) => { 
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Delegated Table Button Clicks (Edit, Delete)
    departmentsTableBody.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        
        if (!id) return;

        // Find the department name from the closest row
        const row = target.closest('tr');
        const name = row.querySelector('td[data-label="Name"]').textContent;

        if (target.classList.contains('btn-edit')) {
            openEditModal(id);
        } else if (target.classList.contains('btn-delete')) {
            handleDelete(id, name);
        }
    });

    // --- Pagination Logic ---
    const departmentsTable = document.getElementById('departments-table');
    const pageSizeSelect = document.getElementById('page-size');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');
    const searchInput = document.getElementById('search-input');

    let currentPage = 1;
    let itemsPerPage = 10;
    let allDepartments = [];
    let filteredDepartments = [];

    // Store all department rows when page loads
    if (departmentsTableBody) {
        const rows = Array.from(departmentsTableBody.querySelectorAll('tr'));
        allDepartments = rows.map(row => ({
            element: row.cloneNode(true),
            name: row.querySelector('td[data-label="Name"]')?.textContent.toLowerCase() || ''
        }));
        filteredDepartments = [...allDepartments];

        // Initialize pagination
        updatePagination();

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                
                if (!searchTerm) {
                    filteredDepartments = [...allDepartments];
                } else {
                    filteredDepartments = allDepartments.filter(dept => 
                        dept.name.includes(searchTerm)
                    );
                }
                
                currentPage = 1;
                updatePagination();
            });
        }

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
                const totalPages = Math.ceil(allDepartments.length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    updatePagination();
                }
            });
        }
    }

    function updatePagination() {
        // Filter out "No departments found" row
        const validDepartments = filteredDepartments.filter(dept => dept.name);
        
        const totalItems = validDepartments.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        
        // Calculate start and end indices
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // Clear table body
        departmentsTableBody.innerHTML = '';
        
        if (totalItems === 0) {
            // Show no data message
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = '<td colspan="3" style="text-align:center;">No departments found.</td>';
            departmentsTableBody.appendChild(noDataRow);
        } else {
            // Show only the rows for the current page
            const pageDepartments = validDepartments.slice(startIndex, endIndex);
            pageDepartments.forEach(dept => {
                departmentsTableBody.appendChild(dept.element.cloneNode(true));
            });
        }
        
        // Update page info
        pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalItems} total)`;
        
        // Update button states
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage >= totalPages;
    }
});