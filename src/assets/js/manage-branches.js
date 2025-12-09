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
});