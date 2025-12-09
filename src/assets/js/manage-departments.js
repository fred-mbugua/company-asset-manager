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
});