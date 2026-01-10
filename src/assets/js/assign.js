document.addEventListener('DOMContentLoaded', () => {
    // Wait for jQuery and Select2 to be available
    const initSelect2 = () => {
        if (typeof $ !== 'undefined' && typeof $.fn.select2 !== 'undefined') {
            $('.select2-dropdown').select2({
                placeholder: 'Select an option',
                allowClear: true,
                width: 'style',
                minimumResultsForSearch: 0
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
                // Skip check if employee has no branch assigned (allow assignment without transfer)
                if (employee.branch_id && asset.branch_id !== employee.branch_id) {
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

    // --- Pagination Logic ---
    const assignmentTable = document.getElementById('assignment-table');
    const assignmentTableBody = document.getElementById('assignment-table-body');
    const pageSizeSelect = document.getElementById('page-size');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');
    const searchInput = document.getElementById('search-input');

    let currentPage = 1;
    let itemsPerPage = 10;
    let allAssignments = [];
    let filteredAssignments = [];

    // Store all assignment rows when page loads
    if (assignmentTableBody) {
        const rows = Array.from(assignmentTableBody.querySelectorAll('tr'));
        allAssignments = rows.map(row => {
            const cells = Array.from(row.cells);
            return {
                element: row.cloneNode(true),
                assetTag: String(cells[1]?.textContent || '').toLowerCase(),
                manufacturer: String(cells[2]?.textContent || '').toLowerCase(),
                model: String(cells[3]?.textContent || '').toLowerCase(),
                employee: String(cells[4]?.textContent || '').toLowerCase(),
                notes: String(cells[7]?.textContent || '').toLowerCase(),
                isValid: !row.querySelector('.no-data')
            };
        });
        filteredAssignments = [...allAssignments];

        // Initialize pagination
        updatePagination();

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = String(e.target.value || '').toLowerCase().trim();
                
                if (!searchTerm) {
                    filteredAssignments = [...allAssignments];
                } else {
                    filteredAssignments = allAssignments.filter(assignment => {
                        if (!assignment.isValid) return false;
                        return assignment.assetTag.includes(searchTerm) ||
                               assignment.manufacturer.includes(searchTerm) ||
                               assignment.model.includes(searchTerm) ||
                               assignment.employee.includes(searchTerm) ||
                               assignment.notes.includes(searchTerm);
                    });
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
                const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    updatePagination();
                }
            });
        }
    }

    function updatePagination() {
        // Filter out "No current assignments" row
        const validAssignments = filteredAssignments.filter(assignment => assignment.isValid);
        
        const totalItems = validAssignments.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        
        // Calculate start and end indices
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // Clear table body
        assignmentTableBody.innerHTML = '';
        
        if (totalItems === 0) {
            // Show no data message
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = '<td colspan="10" class="no-data">No current assignments</td>';
            assignmentTableBody.appendChild(noDataRow);
        } else {
            // Show only the rows for the current page
            const pageAssignments = validAssignments.slice(startIndex, endIndex);
            pageAssignments.forEach(assignment => {
                assignmentTableBody.appendChild(assignment.element.cloneNode(true));
            });
        }
        
        // Update page info
        pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalItems} total)`;
        
        // Update button states
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage >= totalPages;
    }
});

// Show assignment attachments modal
async function showAssignmentAttachments(assignmentId) {
    const modal = document.getElementById('assignmentAttachmentsModal');
    const attachmentsContent = document.getElementById('assignment-attachments-content');
    
    modal.style.display = 'block';
    attachmentsContent.innerHTML = '<p style="text-align: center; color: #888;">Loading...</p>';
    
    try {
        // Fetch assignment details
        const response = await API.get(`/assignments/${assignmentId}`);
        const assignment = response.data;
        
        // Display assignment info and attachments
        attachmentsContent.innerHTML = `
            <div class="assignment-detail-info" style="background: #f8f9fa; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
                <div class="detail-row" style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                    <strong style="display: inline-block; min-width: 150px;">Assignment ID:</strong> ${assignment.id}
                </div>
                <div class="detail-row" style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                    <strong style="display: inline-block; min-width: 150px;">Asset:</strong> ${assignment.asset_tag || 'N/A'}
                </div>
                <div class="detail-row" style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                    <strong style="display: inline-block; min-width: 150px;">Employee:</strong> ${assignment.employee_name || 'N/A'}
                </div>
                <div class="detail-row" style="padding: 8px 0;">
                    <strong style="display: inline-block; min-width: 150px;">Assigned Date:</strong> ${new Date(assignment.assignment_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}
                </div>
            </div>
            
            <div class="attachments-section" data-entity-type="assignment" data-entity-id="${assignmentId}">
                <h4 style="margin-bottom: 15px; color: #2c3e50; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="uil uil-paperclip"></i> Attachments & Notes
                </h4>
                
                <div class="attachment-upload-form" style="background: white; padding: 1.5rem; border-radius: 6px; margin-bottom: 1.5rem;">
                    <div class="upload-area" style="margin-bottom: 1rem;">
                        <input type="file" id="assignment-attachment-file-${assignmentId}" class="attachment-file-input" accept="*/*" style="display: none;">
                        <label for="assignment-attachment-file-${assignmentId}" class="upload-label" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2rem; border: 2px dashed #ddd; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; background: #fafafa;">
                            <i class="uil uil-upload" style="font-size: 2.5rem; color: #F37635;"></i>
                            <span>Choose File or Drag & Drop</span>
                            <small style="color: #7f8c8d; font-size: 0.875rem;">Maximum file size: 10MB</small>
                        </label>
                        <div class="selected-file" style="display: none; align-items: center; gap: 0.5rem; padding: 1rem; border: 2px solid #F37635; border-radius: 6px; background: #fff5f0;">
                            <i class="uil uil-file" style="font-size: 1.5rem; color: #F37635;"></i>
                            <span class="file-name" style="flex: 1; color: #2c3e50; font-weight: 500;"></span>
                            <button type="button" class="clear-file-btn" style="background: #e74c3c; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 18px; line-height: 1; padding: 0;">&times;</button>
                        </div>
                    </div>
                    <div class="upload-notes" style="margin-bottom: 1rem;">
                        <label for="assignment-attachment-notes-${assignmentId}" style="display: block; margin-bottom: 0.5rem; color: #495057; font-weight: 500;">Notes (Optional)</label>
                        <textarea id="assignment-attachment-notes-${assignmentId}" class="attachment-notes-input" rows="2" placeholder="Add any notes about this attachment..." style="width: 100%; padding: 0.75rem; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px; font-family: inherit; resize: vertical;"></textarea>
                    </div>
                    <button type="button" class="btn btn-upload-attachment" data-entity-type="assignment" data-entity-id="${assignmentId}" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: #F37635; color: white; border: none; border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer;">
                        <i class="uil uil-upload-alt"></i> Upload Attachment
                    </button>
                </div>

                <div class="attachments-list" id="assignment-attachments-list-${assignmentId}" style="background: white; border-radius: 6px; padding: 1rem; min-height: 100px;">
                    <p class="loading-text" style="text-align: center; color: #7f8c8d; font-style: italic; padding: 2rem;">Loading attachments...</p>
                </div>
            </div>
        `;
        
        // Initialize attachment manager for assignments
        AttachmentManager.init('assignment', assignmentId);
        
    } catch (error) {
        console.error('Error loading assignment details:', error);
        attachmentsContent.innerHTML = `
            <p style="text-align: center; color: #e74c3c;">
                Failed to load assignment details. Please try again.
            </p>
        `;
    }
}

// Close assignment attachments modal
function closeAssignmentAttachments() {
    const modal = document.getElementById('assignmentAttachmentsModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('assignmentAttachmentsModal');
    if (event.target === modal) {
        closeAssignmentAttachments();
    }
});

// Make functions globally available
window.showAssignmentAttachments = showAssignmentAttachments;
window.closeAssignmentAttachments = closeAssignmentAttachments;
