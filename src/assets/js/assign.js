document.addEventListener('DOMContentLoaded', () => {
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
    // a listener would be added here to handle the "Return" button clicks)
});