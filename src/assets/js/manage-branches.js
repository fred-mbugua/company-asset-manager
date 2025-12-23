document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addBranchBtn = document.getElementById('add-branch-btn');
    const modal = document.getElementById('branch-form-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const modalTitle = document.getElementById('modal-title');
    const branchForm = document.getElementById('branch-form');
    const branchesTableBody = document.getElementById('branches-table-body');

    // Form Fields
    const branchIdField = document.getElementById('branch-id');
    const nameField = document.getElementById('name');
    const locationField = document.getElementById('location');

    const API_ENDPOINT = '/branches'; 

    /**
     * Resets the form and prepares the modal for adding a new branch.
     */
    const openAddModal = () => {
        branchForm.reset();
        branchIdField.value = '';
        modalTitle.textContent = 'Add New Branch';
        modal.style.display = 'block';
    };

    /**
     * Fetches branch data and populates the form for editing.
     */
    const openEditModal = async (id) => {
        try {
            const response = await API.get(`${API_ENDPOINT}/${id}`); 
            const branch = response.data; 

            branchIdField.value = branch.id;
            nameField.value = branch.name;
            locationField.value = branch.location;

            modalTitle.textContent = `Edit Branch: ${branch.name}`;
            modal.style.display = 'block';

        } catch (error) {
            console.error('Error fetching branch data:', error);
            alert('Failed to load branch data for editing.');
        }
    };

    /**
     * Handles the form submission for both creating and updating a branch.
     */
    branchForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = branchIdField.value;
        console.log('Submitting form for branch ID:', id);
        const isUpdate = !!id;
        const formData = {
            name: nameField.value,
            location: locationField.value
        };

        try {
            let response;
            if (isUpdate) {
                // Update existing branch
                response = await API.put(`${API_ENDPOINT}/${id}`, formData);
                alert(`Branch ${formData.name} updated successfully!`);
            } else {
                // Create new branch
                response = await API.post(API_ENDPOINT, formData);
                alert(`Branch ${formData.name} created successfully!`);
            }
            
            modal.style.display = 'none';
            window.location.reload(); // Reload the page to show updated table

        } catch (error) {
            console.error('Branch save failed:', error);
            alert('Branch save failed. Ensure the name is unique and all fields are correct.');
        }
    });
    
    /**
     * Handles the delete action.
     */
    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to DELETE the branch: ${name}? This action cannot be undone and may affect linked assets/employees.`)) {
            return;
        }

        try {
            await API.delete(`${API_ENDPOINT}/${id}`);
            alert(`Branch ${name} deleted successfully.`);
            window.location.reload(); 
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete branch. Check if it is linked to any active assets or employees.');
        }
    };


    // --- Event Listeners ---
    
    // Open Add Branch Modal
    addBranchBtn.addEventListener('click', openAddModal);

    // Close Modal
    closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (e) => { 
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Delegated Table Button Clicks (Edit, Delete)
    branchesTableBody.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;

        // console.log('Clicked element:', target, 'with ID:', id);
        
        if (!id) return;

        // Find the branch name from the closest row for the confirmation prompt
        const row = target.closest('tr');
        const name = row.querySelector('td[data-label="Name"]').textContent;

        if (target.classList.contains('btn-edit')) {
            openEditModal(id);
        } else if (target.classList.contains('btn-delete')) {
            handleDelete(id, name);
        }
    });

    // --- Pagination Logic ---
    const branchesTable = document.getElementById('branches-table');
    const pageSizeSelect = document.getElementById('page-size');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');
    const searchInput = document.getElementById('search-input');

    let currentPage = 1;
    let itemsPerPage = 10;
    let allBranches = [];
    let filteredBranches = [];

    // Store all branch rows when page loads
    if (branchesTableBody) {
        const rows = Array.from(branchesTableBody.querySelectorAll('tr'));
        allBranches = rows.map(row => ({
            element: row.cloneNode(true),
            name: row.querySelector('td[data-label="Name"]')?.textContent.toLowerCase() || '',
            location: row.querySelector('td[data-label="Location (City, State)"]')?.textContent.toLowerCase() || ''
        }));
        filteredBranches = [...allBranches];

        // Initialize pagination
        updatePagination();

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                
                if (!searchTerm) {
                    filteredBranches = [...allBranches];
                } else {
                    filteredBranches = allBranches.filter(branch => 
                        branch.name.includes(searchTerm) ||
                        branch.location.includes(searchTerm)
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
                const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    updatePagination();
                }
            });
        }

        // Next button handler
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    updatePagination();
                }
            });
        }
    }

    function updatePagination() {
        const validBranches = filteredBranches.filter(branch => branch.name || branch.location);
        
        const totalItems = validBranches.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        branchesTableBody.innerHTML = '';
        
        if (totalItems === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = '<td colspan="4" style="text-align:center;">No branches found.</td>';
            branchesTableBody.appendChild(noDataRow);
        } else {
            const pageBranches = validBranches.slice(startIndex, endIndex);
            pageBranches.forEach(branch => {
                branchesTableBody.appendChild(branch.element.cloneNode(true));
            });
        }
        
        pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalItems} total)`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage >= totalPages;
    }
});