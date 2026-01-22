document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const newRequestBtn = document.getElementById('new-request-btn');
    const requestModal = document.getElementById('request-modal');
    const detailsModal = document.getElementById('details-modal');
    const statusModal = document.getElementById('status-modal');
    const attachmentsModal = document.getElementById('attachments-modal');
    const editInvoiceModal = document.getElementById('edit-invoice-modal');
    const editAttachmentModal = document.getElementById('edit-attachment-modal');
    const requestForm = document.getElementById('request-form');
    const statusForm = document.getElementById('status-form');
    const editInvoiceForm = document.getElementById('edit-invoice-form');
    const editAttachmentForm = document.getElementById('edit-attachment-form');
    const tableBody = document.getElementById('requests-table-body');

    // Filter Elements
    const filterStatus = document.getElementById('filter-status');
    const filterPriority = document.getElementById('filter-priority');
    const filterType = document.getElementById('filter-type');
    const filterBranch = document.getElementById('filter-branch');
    const filterSearch = document.getElementById('filter-search');
    const myRequestsOnly = document.getElementById('my-requests-only');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const clearFiltersBtn = document.getElementById('clear-filters');

    // Pagination
    const pageSizeSelect = document.getElementById('page-size');
    const pageInfoSpan = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    // State
    let currentPage = 1;
    let pageSize = 20;
    let totalPages = 1;
    let totalRecords = 0;
    let userWorkflowPermissions = {}; // Dynamic workflow permissions cache

    const API_BASE = '/repair-requests';

    /**
     * Load user's workflow permissions from backend
     */
    const loadUserWorkflowPermissions = async () => {
        try {
            const response = await API.get(`${API_BASE}/workflow/my-permissions`);
            if (response.data) {
                userWorkflowPermissions = response.data;
                // Create a lookup by stage_key for easier access
                userWorkflowPermissions.stageKeys = {};
                if (Array.isArray(response.data)) {
                    response.data.forEach(perm => {
                        userWorkflowPermissions.stageKeys[perm.stage_key] = true;
                    });
                }
            }
        } catch (error) {
            console.warn('Could not load workflow permissions, using defaults:', error);
            userWorkflowPermissions = { stageKeys: {} };
        }
    };

    /**
     * Check if user can perform a specific action
     */
    const canPerformAction = (stageKey) => {
        // If permissions loaded, use them
        if (userWorkflowPermissions.stageKeys) {
            return userWorkflowPermissions.stageKeys[stageKey] === true;
        }
        // Fallback to role-based checks
        const role = window.currentUser?.role || 'Standard User';
        const actionRoleMap = {
            'ict-approve': ['Admin', 'ICT'],
            'ict-reject': ['Admin', 'ICT'],
            'in-repair': ['Admin', 'ICT'],
            'submit-invoice': ['Admin', 'ICT'],
            'finance-approve': ['Admin', 'Finance'],
            'finance-reject': ['Admin', 'Finance'],
            'complete': ['Admin', 'Finance'],
            'cancel': ['Admin', 'Standard User', 'ICT', 'Finance']
        };
        return actionRoleMap[stageKey]?.includes(role) || false;
    };

    /**
     * Fetch repair requests with filters and pagination
     */
    const fetchRequests = async () => {
        try {
            showLoading();
            
            const params = new URLSearchParams({
                page: currentPage,
                limit: pageSize
            });

            if (filterStatus?.value) params.append('status_id', filterStatus.value);
            if (filterPriority?.value) params.append('priority_id', filterPriority.value);
            if (filterType?.value) params.append('request_type_id', filterType.value);
            if (filterBranch?.value) params.append('branch_id', filterBranch.value);
            if (filterSearch?.value) params.append('search', filterSearch.value);
            if (myRequestsOnly?.checked && window.currentUser?.id) {
                params.append('my_requests', 'true');
            }

            const response = await API.get(`${API_BASE}?${params.toString()}`);
            const result = response.data || {};

            totalPages = result.totalPages || 1;
            totalRecords = result.total || 0;

            renderTable(result.requests || []);
            updatePagination();
        } catch (error) {
            console.error('Error fetching requests:', error);
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center text-error">Failed to load requests</td></tr>';
        }
    };

    /**
     * Fetch statistics
     */
    const fetchStatistics = async () => {
        try {
            const response = await API.get(`${API_BASE}/statistics`);
            const stats = response.data || {};

            document.getElementById('stat-total').textContent = stats.total_requests || 0;
            document.getElementById('stat-pending').textContent = stats.pending_count || 0;
            document.getElementById('stat-progress').textContent = stats.in_progress_count || 0;
            document.getElementById('stat-completed').textContent = stats.completed_count || 0;
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    /**
     * Show loading state in table
     */
    const showLoading = () => {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="loading-row">
                    <i class="uil uil-spinner-alt spin"></i> Loading requests...
                </td>
            </tr>
        `;
    };

    /**
     * Render requests table
     */
    const renderTable = (requests) => {
        if (!requests || requests.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No repair requests found.</td></tr>';
            return;
        }

        tableBody.innerHTML = requests.map(req => `
            <tr data-id="${req.id}">
                <td><span class="request-number">${req.request_number}</span></td>
                <td>${escapeHtml(req.title)}</td>
                <td>${req.asset_tag || '<span class="text-muted">N/A</span>'}</td>
                <td>${escapeHtml(req.request_type_name || 'N/A')}</td>
                <td>
                    <span class="priority-badge" style="background-color: ${req.priority_color || '#6c757d'}">
                        ${escapeHtml(req.priority_name || 'N/A')}
                    </span>
                </td>
                <td>
                    <span class="status-badge" style="background-color: ${req.status_color || '#6c757d'}">
                        ${escapeHtml(req.status_name || 'N/A')}
                    </span>
                </td>
                <td>${escapeHtml(req.requester_name || 'N/A')}</td>
                <td>${formatDate(req.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info btn-icon" onclick="viewRequest(${req.id})" title="View Details">
                            <i class="uil uil-eye"></i>
                        </button>
                        ${getActionButtons(req)}
                    </div>
                </td>
            </tr>
        `).join('');
    };

    /**
     * Get action buttons based on status and user workflow permissions
     */
    const getActionButtons = (req) => {
        const userId = window.currentUser?.id;
        const role = window.currentUser?.role || 'Standard User';
        let buttons = '';

        // ICT actions - based on workflow permissions
        if (canPerformAction('ict-approve') || canPerformAction('ict-reject')) {
            if (req.status_name === 'Pending') {
                if (canPerformAction('ict-approve')) {
                    buttons += `
                        <button class="btn btn-sm btn-success btn-icon" onclick="performAction(${req.id}, 'ict-approve')" title="ICT Approve">
                            <i class="uil uil-check"></i>
                        </button>
                    `;
                }
                if (canPerformAction('ict-reject')) {
                    buttons += `
                        <button class="btn btn-sm btn-danger btn-icon" onclick="performAction(${req.id}, 'ict-reject')" title="ICT Reject">
                            <i class="uil uil-times"></i>
                        </button>
                    `;
                }
            }
        }
        
        if (canPerformAction('in-repair') && req.status_name === 'ICT Approved') {
            buttons += `
                <button class="btn btn-sm btn-warning btn-icon" onclick="performAction(${req.id}, 'in-repair')" title="Mark In Repair">
                    <i class="uil uil-wrench"></i>
                </button>
            `;
        }
        
        if (canPerformAction('submit-invoice') && req.status_name === 'In Repair') {
            buttons += `
                <button class="btn btn-sm btn-primary btn-icon" onclick="performAction(${req.id}, 'submit-invoice')" title="Submit Invoice">
                    <i class="uil uil-invoice"></i>
                </button>
            `;
        }

        // Finance actions - based on workflow permissions
        if (canPerformAction('finance-approve') || canPerformAction('finance-reject')) {
            if (req.status_name === 'Invoice Submitted') {
                if (canPerformAction('finance-approve')) {
                    buttons += `
                        <button class="btn btn-sm btn-success btn-icon" onclick="performAction(${req.id}, 'finance-approve')" title="Finance Approve">
                            <i class="uil uil-check-circle"></i>
                        </button>
                    `;
                }
                if (canPerformAction('finance-reject')) {
                    buttons += `
                        <button class="btn btn-sm btn-danger btn-icon" onclick="performAction(${req.id}, 'finance-reject')" title="Finance Reject">
                            <i class="uil uil-times-circle"></i>
                        </button>
                    `;
                }
            }
        }
        
        if (canPerformAction('complete') && req.status_name === 'Finance Approved') {
            buttons += `
                <button class="btn btn-sm btn-success btn-icon" onclick="performAction(${req.id}, 'complete')" title="Mark Complete">
                    <i class="uil uil-check-square"></i>
                </button>
            `;
        }

        // Attachments button (always visible)
        buttons += `
            <button class="btn btn-sm btn-secondary btn-icon" onclick="openAttachments(${req.id})" title="Attachments">
                <i class="uil uil-paperclip"></i>
            </button>
        `;

        // Cancel button (for requester or users with cancel permission)
        const canCancel = canPerformAction('cancel') || req.requester_id === userId || role === 'Admin';
        if (canCancel && !['Completed', 'Cancelled'].includes(req.status_name)) {
            buttons += `
                <button class="btn btn-sm btn-danger btn-icon" onclick="performAction(${req.id}, 'cancel')" title="Cancel">
                    <i class="uil uil-ban"></i>
                </button>
            `;
        }

        return buttons;
    };

    /**
     * Update pagination controls
     */
    const updatePagination = () => {
        pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages} (${totalRecords} total)`;
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
    };

    /**
     * View request details
     */
    window.viewRequest = async (id) => {
        try {
            const [requestRes, historyRes] = await Promise.all([
                API.get(`${API_BASE}/${id}`),
                API.get(`${API_BASE}/${id}/history`)
            ]);
            
            const req = requestRes.data;
            const history = historyRes.data || [];

            document.getElementById('details-title').innerHTML = `
                <i class="uil uil-file-info-alt"></i> ${req.request_number} - ${escapeHtml(req.title)}
            `;

            document.getElementById('details-body').innerHTML = `
                <div class="details-grid">
                    <div class="detail-item">
                        <label>Request Number</label>
                        <span>${req.request_number}</span>
                    </div>
                    <div class="detail-item">
                        <label>Status</label>
                        <span class="status-badge" style="background-color: ${req.status_color || '#6c757d'}">${escapeHtml(req.status_name)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Type</label>
                        <span>${escapeHtml(req.request_type_name || 'N/A')}</span>
                    </div>
                    <div class="detail-item">
                        <label>Priority</label>
                        <span class="priority-badge" style="background-color: ${req.priority_color || '#6c757d'}">${escapeHtml(req.priority_name)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Asset</label>
                        <span>${req.asset_tag ? `${req.asset_tag} - ${escapeHtml(req.asset_manufacturer || '')} ${escapeHtml(req.asset_model || '')}` : 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Branch</label>
                        <span>${escapeHtml(req.branch_name || 'N/A')}</span>
                    </div>
                    <div class="detail-item">
                        <label>Requested By</label>
                        <span>${escapeHtml(req.requester_name)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Date Submitted</label>
                        <span>${formatDateTime(req.created_at)}</span>
                    </div>
                    <div class="detail-item full-width">
                        <label>Description</label>
                        <span>${escapeHtml(req.description)}</span>
                    </div>
                </div>

                ${req.vendor_name ? `
                    <div class="invoice-section">
                        <h4><i class="uil uil-invoice"></i> Invoice Details</h4>
                        <div class="details-grid">
                            <div class="detail-item">
                                <label>Vendor</label>
                                <span>${escapeHtml(req.vendor_name)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Invoice Number</label>
                                <span>${escapeHtml(req.invoice_number || 'N/A')}</span>
                            </div>
                            <div class="detail-item">
                                <label>Amount</label>
                                <span>Ksh ${formatCurrency(req.invoice_amount)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Invoice Date</label>
                                <span>${formatDate(req.invoice_date)}</span>
                            </div>
                            ${req.payment_reference ? `
                                <div class="detail-item">
                                    <label>Payment Reference</label>
                                    <span>${escapeHtml(req.payment_reference)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Payment Date</label>
                                    <span>${formatDate(req.payment_date)}</span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="invoice-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                            <button class="btn btn-info btn-sm" onclick="openInvoiceAttachments(${req.id})">
                                <i class="uil uil-file-search-alt"></i> View Invoice Docs
                            </button>
                            ${canEditInvoice(req) ? `
                                <button class="btn btn-warning btn-sm" onclick="openEditInvoice(${req.id}, '${escapeHtml(req.vendor_name)}', '${escapeHtml(req.invoice_number || '')}', ${req.invoice_amount || 0}, '${req.invoice_date ? req.invoice_date.split('T')[0] : ''}')">
                                    <i class="uil uil-edit"></i> Edit Invoice
                                </button>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                <div class="history-section">
                    <h4><i class="uil uil-history"></i> Request History</h4>
                    <div class="history-timeline">
                        ${history.map(h => `
                            <div class="history-item">
                                <div class="history-status">${escapeHtml(h.to_status_name || h.action_type || 'N/A')}</div>
                                <div class="history-meta">
                                    ${escapeHtml(h.performer_name || 'System')} - ${formatDateTime(h.created_at)}
                                </div>
                                ${h.notes ? `<div class="history-notes">${escapeHtml(h.notes)}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="workflow-actions">
                    ${getWorkflowActions(req)}
                </div>
            `;

            detailsModal.style.display = 'block';
        } catch (error) {
            console.error('Error loading request details:', error);
            AppNotify.error('Failed to load request details.');
        }
    };

    /**
     * Get workflow actions for details modal (using dynamic permissions)
     */
    const getWorkflowActions = (req) => {
        const userId = window.currentUser?.id;
        const role = window.currentUser?.role || 'Standard User';
        let actions = '';

        // ICT actions
        if (req.status_name === 'Pending') {
            if (canPerformAction('ict-approve')) {
                actions += `
                    <button class="btn btn-success" onclick="performAction(${req.id}, 'ict-approve')">
                        <i class="uil uil-check"></i> ICT Approve
                    </button>
                `;
            }
            if (canPerformAction('ict-reject')) {
                actions += `
                    <button class="btn btn-danger" onclick="performAction(${req.id}, 'ict-reject')">
                        <i class="uil uil-times"></i> ICT Reject
                    </button>
                `;
            }
        }
        
        if (canPerformAction('in-repair') && req.status_name === 'ICT Approved') {
            actions += `
                <button class="btn btn-warning" onclick="performAction(${req.id}, 'in-repair')">
                    <i class="uil uil-wrench"></i> Mark In Repair
                </button>
            `;
        }
        
        if (canPerformAction('submit-invoice') && req.status_name === 'In Repair') {
            actions += `
                <button class="btn btn-primary" onclick="performAction(${req.id}, 'submit-invoice')">
                    <i class="uil uil-invoice"></i> Submit Invoice
                </button>
            `;
        }

        // Finance actions
        if (req.status_name === 'Invoice Submitted') {
            if (canPerformAction('finance-approve')) {
                actions += `
                    <button class="btn btn-success" onclick="performAction(${req.id}, 'finance-approve')">
                        <i class="uil uil-check-circle"></i> Finance Approve
                    </button>
                `;
            }
            if (canPerformAction('finance-reject')) {
                actions += `
                    <button class="btn btn-danger" onclick="performAction(${req.id}, 'finance-reject')">
                        <i class="uil uil-times-circle"></i> Finance Reject
                    </button>
                `;
            }
        }
        
        if (canPerformAction('complete') && req.status_name === 'Finance Approved') {
            actions += `
                <button class="btn btn-success" onclick="performAction(${req.id}, 'complete')">
                    <i class="uil uil-check-square"></i> Mark Complete
                </button>
            `;
        }

        // Cancel button
        const canCancel = canPerformAction('cancel') || req.requester_id === userId || role === 'Admin';
        if (canCancel && !['Completed', 'Cancelled'].includes(req.status_name)) {
            actions += `
                <button class="btn btn-danger" onclick="performAction(${req.id}, 'cancel')">
                    <i class="uil uil-ban"></i> Cancel Request
                </button>
            `;
        }

        return actions || '<p class="text-muted">No actions available</p>';
    };

    /**
     * Perform workflow action
     */
    window.performAction = (id, action) => {
        document.getElementById('status-request-id').value = id;
        document.getElementById('status-action').value = action;
        document.getElementById('status-notes').value = '';

        const titles = {
            'ict-approve': 'ICT Approval',
            'ict-reject': 'ICT Rejection',
            'in-repair': 'Mark In Repair',
            'submit-invoice': 'Submit Invoice',
            'finance-approve': 'Finance Approval',
            'finance-reject': 'Finance Rejection',
            'complete': 'Complete Request',
            'cancel': 'Cancel Request'
        };

        const buttonClasses = {
            'ict-approve': 'btn-success',
            'ict-reject': 'btn-danger',
            'in-repair': 'btn-warning',
            'submit-invoice': 'btn-primary',
            'finance-approve': 'btn-success',
            'finance-reject': 'btn-danger',
            'complete': 'btn-success',
            'cancel': 'btn-danger'
        };

        document.getElementById('status-modal-title').innerHTML = `
            <i class="uil uil-exchange"></i> ${titles[action] || 'Update Status'}
        `;

        // Show/hide special fields
        const invoiceFields = document.getElementById('invoice-fields');
        const paymentFields = document.getElementById('payment-fields');
        const notesRequired = document.getElementById('notes-required');

        invoiceFields.style.display = action === 'submit-invoice' ? 'block' : 'none';
        paymentFields.style.display = action === 'finance-approve' ? 'block' : 'none';
        notesRequired.style.display = ['ict-reject', 'finance-reject', 'cancel'].includes(action) ? 'inline' : 'none';

        // Update confirm button
        const confirmBtn = document.getElementById('confirm-status-btn');
        confirmBtn.className = `btn ${buttonClasses[action] || 'btn-primary'}`;

        statusModal.style.display = 'block';
    };

    /**
     * Submit status change
     */
    statusForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('status-request-id').value;
        const action = document.getElementById('status-action').value;
        const notes = document.getElementById('status-notes').value;

        const formData = { notes };

        // Add invoice/payment fields if applicable
        if (action === 'submit-invoice') {
            formData.vendor_name = document.getElementById('vendor-name').value;
            formData.invoice_number = document.getElementById('invoice-number').value;
            formData.invoice_amount = parseFloat(document.getElementById('invoice-amount').value);
            formData.invoice_date = document.getElementById('invoice-date').value;
        }

        if (action === 'finance-approve') {
            formData.payment_reference = document.getElementById('payment-reference').value;
            formData.payment_date = document.getElementById('payment-date').value;
        }

        try {
            await API.patch(`${API_BASE}/${id}/${action}`, formData);
            
            // If submitting invoice and a file was attached, upload it
            if (action === 'submit-invoice') {
                const invoiceFile = document.getElementById('invoice-attachment').files[0];
                if (invoiceFile) {
                    try {
                        const uploadFormData = new FormData();
                        uploadFormData.append('attachment_type', 'invoice');
                        uploadFormData.append('files', invoiceFile);
                        await API.upload(`${API_BASE}/${id}/attachments`, uploadFormData);
                    } catch (uploadError) {
                        console.error('Error uploading invoice attachment:', uploadError);
                        AppNotify.warning('Invoice submitted but attachment upload failed. You can add it later via Attachments.');
                    }
                }
                // Clear the file input
                document.getElementById('invoice-attachment').value = '';
            }
            
            AppNotify.success('Status updated successfully!');
            statusModal.style.display = 'none';
            detailsModal.style.display = 'none';
            fetchRequests();
            fetchStatistics();
        } catch (error) {
            console.error('Error updating status:', error);
            AppNotify.error(error.response?.data?.message || 'Failed to update status.');
        }
    });

    /**
     * Open attachments modal
     */
    window.openAttachments = async (id) => {
        document.getElementById('attachments-request-id').value = id;
        await loadAttachments(id);
        attachmentsModal.style.display = 'block';
    };

    /**
     * Load attachments list
     */
    const loadAttachments = async (id) => {
        try {
            const response = await API.get(`${API_BASE}/${id}/attachments`);
            const attachments = response.data || [];
            const container = document.getElementById('attachments-list');

            if (attachments.length === 0) {
                container.innerHTML = '<p class="no-attachments">No attachments yet.</p>';
                return;
            }

            const userId = window.currentUser?.id;
            const userRole = window.currentUser?.role;

            container.innerHTML = attachments.map(att => {
                // Only show edit/delete buttons if user is Admin or the uploader
                const canEdit = userRole === 'Admin' || att.uploaded_by === userId;
                
                return `
                <div class="attachment-item">
                    <div class="attachment-info">
                        <i class="uil ${getFileIcon(att.file_name)}"></i>
                        <div>
                            <div class="attachment-name">${escapeHtml(att.original_name || att.file_name)}</div>
                            <div class="attachment-meta">${att.attachment_type} - ${formatFileSize(att.file_size)}${att.uploader_name ? ` - Uploaded by ${escapeHtml(att.uploader_name)}` : ''}</div>
                        </div>
                    </div>
                    <div class="attachment-actions">
                        <a href="/api/repair-requests/${id}/attachments/${att.id}/download" target="_blank" class="btn btn-sm btn-info" title="Download">
                            <i class="uil uil-download-alt"></i>
                        </a>
                        ${canEdit ? `
                        <button class="btn btn-sm btn-warning" onclick="openEditAttachment(${id}, ${att.id}, '${escapeHtml(att.original_name || att.file_name)}', '${att.attachment_type}', '${escapeHtml(att.notes || '')}')" title="Edit">
                            <i class="uil uil-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAttachment(${id}, ${att.id})" title="Delete">
                            <i class="uil uil-trash"></i>
                        </button>
                        ` : ''}
                    </div>
                </div>
            `}).join('');
        } catch (error) {
            console.error('Error loading attachments:', error);
        }
    };

    /**
     * Upload attachments
     */
    document.getElementById('upload-attachments-btn').addEventListener('click', async () => {
        const id = document.getElementById('attachments-request-id').value;
        const type = document.getElementById('attachment-type').value;
        const files = document.getElementById('attachment-files').files;

        if (files.length === 0) {
            AppNotify.warning('Please select files to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('attachment_type', type);
        for (let file of files) {
            formData.append('files', file);
        }

        try {
            await API.upload(`${API_BASE}/${id}/attachments`, formData);
            AppNotify.success('Attachments uploaded successfully!');
            document.getElementById('attachment-files').value = '';
            loadAttachments(id);
        } catch (error) {
            console.error('Error uploading attachments:', error);
            AppNotify.error(error.message || 'Failed to upload attachments.');
        }
    });

    /**
     * Delete attachment
     */
    window.deleteAttachment = async (requestId, attachmentId) => {
        const confirmed = await AppConfirm.delete('Are you sure you want to delete this attachment?');
        if (!confirmed) return;

        try {
            await API.delete(`${API_BASE}/${requestId}/attachments/${attachmentId}`);
            AppNotify.success('Attachment deleted successfully!');
            loadAttachments(requestId);
        } catch (error) {
            console.error('Error deleting attachment:', error);
            AppNotify.error(error.response?.data?.message || 'Failed to delete attachment.');
        }
    };

    /**
     * Open edit attachment modal
     */
    window.openEditAttachment = (requestId, attachmentId, fileName, attachmentType, notes) => {
        document.getElementById('edit-attachment-request-id').value = requestId;
        document.getElementById('edit-attachment-id').value = attachmentId;
        document.getElementById('edit-attachment-type').value = attachmentType || 'general';
        document.getElementById('edit-attachment-notes').value = notes || '';
        document.getElementById('edit-attachment-file').value = '';
        document.getElementById('edit-attachment-current-file').innerHTML = `
            <i class="uil ${getFileIcon(fileName)}"></i>
            <span>${fileName}</span>
        `;
        editAttachmentModal.style.display = 'block';
    };

    /**
     * Close edit attachment modal
     */
    window.closeEditAttachmentModal = () => {
        editAttachmentModal.style.display = 'none';
    };

    /**
     * Handle edit attachment form submission
     */
    editAttachmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const requestId = document.getElementById('edit-attachment-request-id').value;
        const attachmentId = document.getElementById('edit-attachment-id').value;
        const attachmentType = document.getElementById('edit-attachment-type').value;
        const notes = document.getElementById('edit-attachment-notes').value;
        const newFile = document.getElementById('edit-attachment-file').files[0];

        try {
            if (newFile) {
                // If there's a new file, use FormData
                const formData = new FormData();
                formData.append('attachment_type', attachmentType);
                formData.append('notes', notes);
                formData.append('file', newFile);
                await API.upload(`${API_BASE}/${requestId}/attachments/${attachmentId}`, formData, 'PATCH');
            } else {
                // Just update type and notes
                await API.patch(`${API_BASE}/${requestId}/attachments/${attachmentId}`, {
                    attachment_type: attachmentType,
                    notes: notes
                });
            }

            AppNotify.success('Attachment updated successfully!');
            editAttachmentModal.style.display = 'none';
            loadAttachments(requestId);
        } catch (error) {
            console.error('Error updating attachment:', error);
            AppNotify.error(error.message || 'Failed to update attachment.');
        }
    });

    /**
     * Check if current user can edit invoice
     */
    const canEditInvoice = (req) => {
        const userId = window.currentUser?.id;
        const userRole = window.currentUser?.role;
        // Only the invoice uploader or Admin can edit
        return req.invoice_uploaded_by === userId || userRole === 'Admin';
    };

    /**
     * Open invoice attachments (filtered to show only invoice type)
     */
    window.openInvoiceAttachments = async (id) => {
        document.getElementById('attachments-request-id').value = id;
        await loadInvoiceAttachments(id);
        attachmentsModal.style.display = 'block';
    };

    /**
     * Load invoice attachments only
     */
    const loadInvoiceAttachments = async (id) => {
        try {
            const response = await API.get(`${API_BASE}/${id}/attachments`);
            const attachments = (response.data || []).filter(att => 
                att.attachment_type === 'invoice' || att.attachment_type === 'Invoice'
            );
            const container = document.getElementById('attachments-list');

            if (attachments.length === 0) {
                container.innerHTML = '<p class="no-attachments">No invoice documents attached yet.</p>';
                return;
            }

            const userId = window.currentUser?.id;
            const userRole = window.currentUser?.role;

            container.innerHTML = attachments.map(att => {
                // Only show delete button if user is Admin or the uploader
                const canDelete = userRole === 'Admin' || att.uploaded_by === userId;
                
                return `
                <div class="attachment-item">
                    <div class="attachment-info">
                        <i class="uil ${getFileIcon(att.file_name)}"></i>
                        <div>
                            <div class="attachment-name">${escapeHtml(att.original_name || att.file_name)}</div>
                            <div class="attachment-meta">${att.attachment_type} - ${formatFileSize(att.file_size)}${att.uploader_name ? ` - Uploaded by ${escapeHtml(att.uploader_name)}` : ''}</div>
                        </div>
                    </div>
                    <div class="attachment-actions">
                        <a href="/api/repair-requests/${id}/attachments/${att.id}/download" target="_blank" class="btn btn-sm btn-info" title="Download">
                            <i class="uil uil-download-alt"></i>
                        </a>
                        ${canDelete ? `
                        <button class="btn btn-sm btn-danger" onclick="deleteAttachment(${id}, ${att.id})" title="Delete">
                            <i class="uil uil-trash"></i>
                        </button>
                        ` : ''}
                    </div>
                </div>
            `}).join('');
        } catch (error) {
            console.error('Error loading invoice attachments:', error);
        }
    };

    /**
     * Open edit invoice modal
     */
    window.openEditInvoice = async (id, vendorName, invoiceNumber, invoiceAmount, invoiceDate) => {
        document.getElementById('edit-invoice-request-id').value = id;
        document.getElementById('edit-vendor-name').value = vendorName;
        document.getElementById('edit-invoice-number').value = invoiceNumber;
        document.getElementById('edit-invoice-amount').value = invoiceAmount;
        document.getElementById('edit-invoice-date').value = invoiceDate;
        document.getElementById('edit-invoice-attachment').value = '';
        
        // Load current invoice attachments
        await loadCurrentInvoiceAttachment(id);
        
        editInvoiceModal.style.display = 'block';
    };

    /**
     * Load current invoice attachment for edit modal
     */
    const loadCurrentInvoiceAttachment = async (requestId) => {
        const container = document.getElementById('current-invoice-attachment');
        try {
            const response = await API.get(`${API_BASE}/${requestId}/attachments`);
            const attachments = response.data || [];
            const invoiceAttachments = attachments.filter(att => att.attachment_type === 'invoice');
            
            if (invoiceAttachments.length === 0) {
                container.innerHTML = '<span class="no-attachment">No invoice document attached</span>';
                return;
            }

            const userId = window.currentUser?.id;
            const userRole = window.currentUser?.role;
            
            container.innerHTML = invoiceAttachments.map(att => {
                // Only show delete button if user is Admin or the uploader
                const canDelete = userRole === 'Admin' || att.uploaded_by === userId;
                
                return `
                <div class="attachment-item-inline" data-attachment-id="${att.id}">
                    <div class="attachment-info-inline">
                        <i class="uil ${getFileIcon(att.file_name)}"></i>
                        <span class="attachment-name">${escapeHtml(att.original_name || att.file_name)}</span>
                        <span class="attachment-size">(${formatFileSize(att.file_size)})</span>
                    </div>
                    <div class="attachment-actions-inline">
                        <a href="/api/repair-requests/${requestId}/attachments/${att.id}/download" target="_blank" class="btn btn-sm btn-info" title="View/Download">
                            <i class="uil uil-eye"></i>
                        </a>
                        ${canDelete ? `
                        <button type="button" class="btn btn-sm btn-danger" onclick="deleteInvoiceAttachment(${requestId}, ${att.id})" title="Delete">
                            <i class="uil uil-trash"></i>
                        </button>
                        ` : ''}
                    </div>
                </div>
            `}).join('');
        } catch (error) {
            console.error('Error loading invoice attachments:', error);
            container.innerHTML = '<span class="no-attachment">Error loading attachments</span>';
        }
    };

    /**
     * Delete invoice attachment from edit modal
     */
    window.deleteInvoiceAttachment = async (requestId, attachmentId) => {
        const confirmed = await AppConfirm.delete('Are you sure you want to delete this invoice document?');
        if (!confirmed) return;

        try {
            await API.delete(`${API_BASE}/${requestId}/attachments/${attachmentId}`);
            // Reload the current attachment display
            await loadCurrentInvoiceAttachment(requestId);
            AppNotify.success('Invoice document deleted successfully!');
        } catch (error) {
            console.error('Error deleting invoice attachment:', error);
            AppNotify.error(error.message || 'Failed to delete invoice document.');
        }
    };

    /**
     * Handle edit invoice form submission
     */
    editInvoiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('edit-invoice-request-id').value;
        const formData = {
            vendor_name: document.getElementById('edit-vendor-name').value,
            invoice_number: document.getElementById('edit-invoice-number').value,
            invoice_amount: parseFloat(document.getElementById('edit-invoice-amount').value),
            invoice_date: document.getElementById('edit-invoice-date').value
        };

        try {
            await API.patch(`${API_BASE}/${id}/update-invoice`, formData);
            
            // Check if a new file was selected for upload
            const newInvoiceFile = document.getElementById('edit-invoice-attachment').files[0];
            if (newInvoiceFile) {
                // First, delete existing invoice attachments
                try {
                    const response = await API.get(`${API_BASE}/${id}/attachments`);
                    const attachments = response.data || [];
                    const invoiceAttachments = attachments.filter(att => att.attachment_type === 'invoice');
                    
                    // Delete all existing invoice attachments
                    for (const att of invoiceAttachments) {
                        await API.delete(`${API_BASE}/${id}/attachments/${att.id}`);
                    }
                } catch (deleteError) {
                    console.warn('Could not delete old attachments:', deleteError);
                }
                
                // Upload the new file
                try {
                    const uploadFormData = new FormData();
                    uploadFormData.append('attachment_type', 'invoice');
                    uploadFormData.append('files', newInvoiceFile);
                    await API.upload(`${API_BASE}/${id}/attachments`, uploadFormData);
                } catch (uploadError) {
                    console.error('Error uploading new invoice attachment:', uploadError);
                    AppNotify.warning('Invoice details updated but new attachment upload failed.');
                }
            }
            
            AppNotify.success('Invoice updated successfully!');
            editInvoiceModal.style.display = 'none';
            detailsModal.style.display = 'none';
            fetchRequests();
        } catch (error) {
            console.error('Error updating invoice:', error);
            AppNotify.error(error.message || 'Failed to update invoice.');
        }
    });

    // Close edit invoice modal
    document.getElementById('cancel-edit-invoice').addEventListener('click', () => {
        editInvoiceModal.style.display = 'none';
    });

    editInvoiceModal.querySelector('.close-btn').addEventListener('click', () => {
        editInvoiceModal.style.display = 'none';
    });

    /**
     * Create new request
     */
    newRequestBtn.addEventListener('click', () => {
        requestForm.reset();
        document.getElementById('request-id').value = '';
        document.getElementById('modal-title').innerHTML = '<i class="uil uil-plus"></i> New Repair Request';
        requestModal.style.display = 'block';
    });

    /**
     * Submit new request
     */
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            title: document.getElementById('request-title').value.trim(),
            description: document.getElementById('request-description').value.trim(),
            request_type_id: parseInt(document.getElementById('request-type').value),
            priority_id: parseInt(document.getElementById('request-priority').value),
            asset_id: document.getElementById('request-asset').value || null,
            branch_id: document.getElementById('request-branch').value || null
        };

        try {
            await API.post(API_BASE, formData);
            AppNotify.success('Repair request submitted successfully!');
            requestModal.style.display = 'none';
            fetchRequests();
            fetchStatistics();
        } catch (error) {
            console.error('Error creating request:', error);
            AppNotify.error(error.response?.data?.message || 'Failed to submit request.');
        }
    });

    // Filter controls
    applyFiltersBtn?.addEventListener('click', () => {
        currentPage = 1;
        fetchRequests();
    });

    clearFiltersBtn?.addEventListener('click', () => {
        // Clear all filter values
        if (filterStatus) {
            filterStatus.value = '';
            if (typeof $ !== 'undefined' && $(filterStatus).hasClass('select2-hidden-accessible')) {
                $(filterStatus).val('').trigger('change');
            }
        }
        if (filterPriority) {
            filterPriority.value = '';
            if (typeof $ !== 'undefined' && $(filterPriority).hasClass('select2-hidden-accessible')) {
                $(filterPriority).val('').trigger('change');
            }
        }
        if (filterType) {
            filterType.value = '';
            if (typeof $ !== 'undefined' && $(filterType).hasClass('select2-hidden-accessible')) {
                $(filterType).val('').trigger('change');
            }
        }
        if (filterBranch) {
            filterBranch.value = '';
            if (typeof $ !== 'undefined' && $(filterBranch).hasClass('select2-hidden-accessible')) {
                $(filterBranch).val('').trigger('change');
            }
        }
        if (filterSearch) filterSearch.value = '';
        if (myRequestsOnly) myRequestsOnly.checked = false;
        
        currentPage = 1;
        fetchRequests();
    });

    filterSearch?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentPage = 1;
            fetchRequests();
        }
    });

    // Pagination controls
    pageSizeSelect?.addEventListener('change', (e) => {
        pageSize = parseInt(e.target.value);
        currentPage = 1;
        fetchRequests();
    });

    prevBtn?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchRequests();
        }
    });

    nextBtn?.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchRequests();
        }
    });

    // Modal close handlers
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });

    document.getElementById('cancel-request').addEventListener('click', () => {
        requestModal.style.display = 'none';
    });

    document.getElementById('cancel-status').addEventListener('click', () => {
        statusModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Utility functions
    const escapeHtml = (str) => {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'N/A';
        return parseFloat(amount).toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (filename) => {
        if (!filename) return 'uil-file';
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'pdf': 'uil-file-alt',
            'doc': 'uil-file-alt',
            'docx': 'uil-file-alt',
            'xls': 'uil-file-graph',
            'xlsx': 'uil-file-graph',
            'jpg': 'uil-image',
            'jpeg': 'uil-image',
            'png': 'uil-image',
            'gif': 'uil-image'
        };
        return icons[ext] || 'uil-file';
    };

    // Initial load - first load workflow permissions, then requests
    const initialize = async () => {
        await loadUserWorkflowPermissions();
        fetchRequests();
        fetchStatistics();
    };
    
    initialize();
});
