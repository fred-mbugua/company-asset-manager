document.addEventListener('DOMContentLoaded', () => {
    // Wait for jQuery and Select2 to be available
    const initSelect2 = () => {
        if (typeof $ !== 'undefined' && typeof $.fn.select2 !== 'undefined') {
            $('.select2-dropdown').select2({
                placeholder: 'Select an option',
                allowClear: true,
                width: '100%'
            });
        } else {
            // Retry after a short delay if not loaded yet
            setTimeout(initSelect2, 100);
        }
    };
    
    initSelect2();
    
    const assignmentForm = document.getElementById('assignment-form');
    const assetSelect = document.getElementById('asset_id'); 
    const userSelect = document.getElementById('employee_id'); 
    const assignmentDate = document.getElementById('assignment_date');
    const notesField = document.getElementById('notes');

    // Set today's date as default for convenience
    assignmentDate.value = new Date().toISOString().substring(0, 10);
    
    // --- Form Submission Logic ---
    if (assignmentForm) {
        assignmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                asset_id: parseInt(assetSelect.value),
                employee_id: parseInt(userSelect.value),
                assignment_date: assignmentDate.value,
                notes: notesField.value
            };

            // Basic validation
            if (!formData.asset_id || !formData.employee_id || !formData.assignment_date) {
                return showMessage('error', 'Please fill in all required fields.');
            }
            
            // Prevent future date assignment
            const selectedDate = new Date(formData.assignment_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate > today + 1) {
                return showMessage('error', 'Assignment date cannot be in the future.');
            }

            try {
                
                const response = await API.post('/assignments', formData);
                
                showMessage('success', response.message || 'Asset assigned successfully! Reloading data...');
                
                // Clear the form fields after successful submission
                assignmentForm.reset();
                assignmentDate.value = new Date().toISOString().substring(0, 10); // Reset date to today
                
                // Reload data or reload the page to update the current assignments table
                window.location.reload(); 

            } catch (error) {
                showMessage('error', error.message || 'Failed to assign asset.');
            }
        });
    }
    
    
    // --- Return Asset Logic ---
    const modal = document.getElementById('returnModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-return');
    const returnForm = document.getElementById('return-form');
    const returnDateInput = document.getElementById('return_date');
    const returnNotesInput = document.getElementById('return_notes');
    const returnAssignmentIdInput = document.getElementById('return_assignment_id');

    // Open modal when return button is clicked
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-return')) {
            const assignmentId = e.target.getAttribute('data-id');
            returnAssignmentIdInput.value = assignmentId;
            returnDateInput.value = new Date().toISOString().substring(0, 10);
            returnNotesInput.value = '';
            modal.style.display = 'block';
        }
    });

    // Close modal
    const closeModal = () => {
        modal.style.display = 'none';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Handle return form submission
    if (returnForm) {
        returnForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const assignmentId = returnAssignmentIdInput.value;
            const returnData = {
                return_date: returnDateInput.value,
                return_notes: returnNotesInput.value
            };

            // Validate return date is not in the future
            const selectedDate = new Date(returnData.return_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate > today + 1) {
                return showMessage('error', 'Return date cannot be in the future.');
            }

            try {
                const response = await API.put(`/assignments/${assignmentId}/return`, returnData);
                
                showMessage('success', response.message || 'Asset returned successfully!');
                closeModal();
                
                // Reload to update the table
                setTimeout(() => {
                    window.location.reload();
                }, 1000);

            } catch (error) {
                showMessage('error', error.message || 'Failed to return asset.');
            }
        });
    }
});
