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

    // Branch transfer dialog elements
    const branchTransferOverlay = document.getElementById('branchTransferOverlay');
    const cancelTransferBtn = document.getElementById('cancelTransferBtn');
    const proceedWithoutTransferBtn = document.getElementById('proceedWithoutTransferBtn');
    const confirmTransferBtn = document.getElementById('confirmTransferBtn');

    let pendingAssignment = null;
    let assetBranchMismatch = null;

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
                // Check for branch mismatch before submitting
                const [assetResponse, employeeResponse] = await Promise.all([
                    API.get(`/assets/${formData.asset_id}`),
                    API.get(`/employees/${formData.employee_id}`)
                ]);

                const asset = assetResponse.data;
                const employee = employeeResponse.data;

                // Check if asset and employee are in different branches
                if (asset.branch_id !== employee.branch_id) {
                    // Store pending assignment data
                    pendingAssignment = formData;
                    
                    // Format branch information
                    const assetBranchDisplay = asset.branch_name 
                        ? `${asset.branch_name}${asset.location ? ' - ' + asset.location : ''}`
                        : 'Unknown';
                    const employeeBranchDisplay = employee.branch_location 
                        ? employee.branch_location 
                        : 'Unknown';
                    
                    assetBranchMismatch = {
                        asset: asset,
                        employee: employee,
                        assetBranch: assetBranchDisplay,
                        employeeBranch: employeeBranchDisplay
                    };

                    // Show branch transfer dialog
                    showBranchTransferDialog();
                    return;
                }

                // If branches match, proceed with assignment
                await submitAssignment(formData, false);

            } catch (error) {
                showMessage('error', error.message || 'Failed to assign asset.');
            }
        });
    }

    // Function to show branch transfer dialog
    function showBranchTransferDialog() {
        if (!assetBranchMismatch) return;

        document.getElementById('transfer-asset-name').textContent = 
            `${assetBranchMismatch.asset.asset_tag} - ${assetBranchMismatch.asset.manufacturer} ${assetBranchMismatch.asset.model}`;
        document.getElementById('transfer-asset-branch').textContent = assetBranchMismatch.assetBranch;
        document.getElementById('transfer-employee-name').textContent = 
            `${assetBranchMismatch.employee.first_name} ${assetBranchMismatch.employee.last_name}`;
        document.getElementById('transfer-employee-branch').textContent = assetBranchMismatch.employeeBranch;

        branchTransferOverlay.classList.add('active');
    }

    // Function to hide branch transfer dialog
    function hideBranchTransferDialog() {
        branchTransferOverlay.classList.remove('active');
        pendingAssignment = null;
        assetBranchMismatch = null;
    }

    // Function to submit assignment
    async function submitAssignment(formData, transferAsset = false) {
        try {
            console.log('Submitting assignment:', formData, 'Transfer:', transferAsset);
            const payload = { ...formData, transfer_asset: transferAsset };
            console.log('Payload:', payload);
            const response = await API.post('/assignments', payload);
            console.log('Response:', response);
            
            showMessage('success', response.message || 'Asset assigned successfully!');
            
            // Clear the form fields after successful submission
            assignmentForm.reset();
            assignmentDate.value = new Date().toISOString().substring(0, 10);
            
            // Reload to update the assignments table
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('Assignment error:', error);
            showMessage('error', error.message || 'Failed to assign asset.');
        }
    }

    // Dialog button handlers
    if (cancelTransferBtn) {
        cancelTransferBtn.addEventListener('click', () => {
            hideBranchTransferDialog();
            showMessage('info', 'Assignment cancelled.');
        });
    }

    if (proceedWithoutTransferBtn) {
        proceedWithoutTransferBtn.addEventListener('click', async () => {
            console.log('Proceed without transfer clicked', pendingAssignment);
            if (pendingAssignment) {
                const assignmentData = { ...pendingAssignment };
                hideBranchTransferDialog();
                await submitAssignment(assignmentData, false);
            }
        });
    }

    if (confirmTransferBtn) {
        confirmTransferBtn.addEventListener('click', async () => {
            console.log('Confirm transfer clicked', pendingAssignment);
            if (pendingAssignment) {
                const assignmentData = { ...pendingAssignment };
                hideBranchTransferDialog();
                await submitAssignment(assignmentData, true);
            }
        });
    }

    // Close dialog when clicking outside
    branchTransferOverlay?.addEventListener('click', (e) => {
        if (e.target === branchTransferOverlay) {
            hideBranchTransferDialog();
        }
    });
    
    
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
