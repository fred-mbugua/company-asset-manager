document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const newRequestBtn = document.getElementById('new-request-btn');
    const requestModal = document.getElementById('request-modal');
    const detailsModal = document.getElementById('details-modal');
    const statusModal = document.getElementById('status-modal');
    const attachmentsModal = document.getElementById('attachments-modal');
    const requestForm = document.getElementById('request-form');
    const statusForm = document.getElementById('status-form');
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

    const API_BASE = '/repair-requests';

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
            const stats = response.data;

            document.getElementById('stat-total').textContent = stats.total || 0;
            document.getElementById('stat-pending').textContent = stats.pending || 0;
            document.getElementById('stat-progress').textContent = stats.in_progress || 0;
            document.getElementById('stat-completed').textContent = stats.completed || 0;
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
                <td>${escapeHtml(req.type_name || 'N/A')}</td>
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
     * Get action buttons based on status and user role
     */
    const getActionButtons = (req) => {
        const role = window.currentUser?.role || 'Standard User';
        const userId = window.currentUser?.id;
        let buttons = '';

        // ICT actions
        if (role === 'Admin' || role === 'ICT') {
            if (req.status_name === 'Pending') {
                buttons += `
                    <button class="btn btn-sm btn-success btn-icon" onclick="performAction(${req.id}, 'ict-approve')" title="ICT Approve">
                        <i class="uil uil-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-icon" onclick="performAction(${req.id}, 'ict-reject')" title="ICT Reject">
                        <i class="uil uil-times"></i>
                    </button>
                `;
            }
            if (req.status_name === 'ICT Approved') {
                buttons += `
                    <button class="btn btn-sm btn-warning btn-icon" onclick="performAction(${req.id}, 'in-repair')" title="Mark In Repair">
                        <i class="uil uil-wrench"></i>
                    </button>
                `;
            }
            if (req.status_name === 'In Repair') {
                buttons += `
                    <button class="btn btn-sm btn-primary btn-icon" onclick="performAction(${req.id}, 'submit-invoice')" title="Submit Invoice">
                        <i class="uil uil-invoice"></i>
                    </button>
                `;
            }
        }

        // Finance actions
        if (role === 'Admin' || role === 'Finance') {
            if (req.status_name === 'Invoice Submitted') {
                buttons += `
                    <button class="btn btn-sm btn-success btn-icon" onclick="performAction(${req.id}, 'finance-approve')" title="Finance Approve">
                        <i class="uil uil-check-circle"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-icon" onclick="performAction(${req.id}, 'finance-reject')" title="Finance Reject">
                        <i class="uil uil-times-circle"></i>
                    </button>
                `;
            }
            if (req.status_name === 'Finance Approved') {
                buttons += `
                    <button class="btn btn-sm btn-success btn-icon" onclick="performAction(${req.id}, 'complete')" title="Mark Complete">
                        <i class="uil uil-check-square"></i>
                    </button>
                `;
            }
        }

        // Attachments button
        buttons += `
            <button class="btn btn-sm btn-secondary btn-icon" onclick="openAttachments(${req.id})" title="Attachments">
                <i class="uil uil-paperclip"></i>
            </button>
        `;

        // Cancel button (for requester or admin)
        if ((req.requester_id === userId || role === 'Admin') && 
            !['Completed', 'Cancelled'].includes(req.status_name)) {
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
                        <span>${escapeHtml(req.type_name || 'N/A')}</span>
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
                    </div>
                ` : ''}

                <div class="history-section">
                    <h4><i class="uil uil-history"></i> Request History</h4>
                    <div class="history-timeline">
                        ${history.map(h => `
                            <div class="history-item">
                                <div class="history-status">${escapeHtml(h.status_name)}</div>
                                <div class="history-meta">
                                    ${escapeHtml(h.changed_by_name)} - ${formatDateTime(h.changed_at)}
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
            alert('Failed to load request details.');
        }
    };

    /**
     * Get workflow actions for details modal
     */
    const getWorkflowActions = (req) => {
        const role = window.currentUser?.role || 'Standard User';
        const userId = window.currentUser?.id;
        let actions = '';

        if (role === 'Admin' || role === 'ICT') {
            if (req.status_name === 'Pending') {
                actions += `
                    <button class="btn btn-success" onclick="performAction(${req.id}, 'ict-approve')">
                        <i class="uil uil-check"></i> ICT Approve
                    </button>
                    <button class="btn btn-danger" onclick="performAction(${req.id}, 'ict-reject')">
                        <i class="uil uil-times"></i> ICT Reject
                    </button>
                `;
            }
            if (req.status_name === 'ICT Approved') {
                actions += `
                    <button class="btn btn-warning" onclick="performAction(${req.id}, 'in-repair')">
                        <i class="uil uil-wrench"></i> Mark In Repair
                    </button>
                `;
            }
            if (req.status_name === 'In Repair') {
                actions += `
                    <button class="btn btn-primary" onclick="performAction(${req.id}, 'submit-invoice')">
                        <i class="uil uil-invoice"></i> Submit Invoice
                    </button>
                `;
            }
        }

        if (role === 'Admin' || role === 'Finance') {
            if (req.status_name === 'Invoice Submitted') {
                actions += `
                    <button class="btn btn-success" onclick="performAction(${req.id}, 'finance-approve')">
                        <i class="uil uil-check-circle"></i> Finance Approve
                    </button>
                    <button class="btn btn-danger" onclick="performAction(${req.id}, 'finance-reject')">
                        <i class="uil uil-times-circle"></i> Finance Reject
                    </button>
                `;
            }
            if (req.status_name === 'Finance Approved') {
                actions += `
                    <button class="btn btn-success" onclick="performAction(${req.id}, 'complete')">
                        <i class="uil uil-check-square"></i> Mark Complete
                    </button>
                `;
            }
        }

        if ((req.requester_id === userId || role === 'Admin') && 
            !['Completed', 'Cancelled'].includes(req.status_name)) {
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
            await API.post(`${API_BASE}/${id}/${action}`, formData);
            alert('Status updated successfully!');
            statusModal.style.display = 'none';
            detailsModal.style.display = 'none';
            fetchRequests();
            fetchStatistics();
        } catch (error) {
            console.error('Error updating status:', error);
            alert(error.response?.data?.message || 'Failed to update status.');
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

            container.innerHTML = attachments.map(att => `
                <div class="attachment-item">
                    <div class="attachment-info">
                        <i class="uil ${getFileIcon(att.file_name)}"></i>
                        <div>
                            <div class="attachment-name">${escapeHtml(att.original_name || att.file_name)}</div>
                            <div class="attachment-meta">${att.attachment_type} - ${formatFileSize(att.file_size)}</div>
                        </div>
                    </div>
                    <div class="attachment-actions">
                        <a href="/uploads/repair-requests/${att.file_name}" target="_blank" class="btn btn-sm btn-info" title="Download">
                            <i class="uil uil-download-alt"></i>
                        </a>
                        <button class="btn btn-sm btn-danger" onclick="deleteAttachment(${id}, ${att.id})" title="Delete">
                            <i class="uil uil-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
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
            alert('Please select files to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('attachment_type', type);
        for (let file of files) {
            formData.append('files', file);
        }

        try {
            await API.post(`${API_BASE}/${id}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Attachments uploaded successfully!');
            document.getElementById('attachment-files').value = '';
            loadAttachments(id);
        } catch (error) {
            console.error('Error uploading attachments:', error);
            alert(error.response?.data?.message || 'Failed to upload attachments.');
        }
    });

    /**
     * Delete attachment
     */
    window.deleteAttachment = async (requestId, attachmentId) => {
        if (!confirm('Are you sure you want to delete this attachment?')) return;

        try {
            await API.delete(`${API_BASE}/${requestId}/attachments/${attachmentId}`);
            alert('Attachment deleted successfully!');
            loadAttachments(requestId);
        } catch (error) {
            console.error('Error deleting attachment:', error);
            alert(error.response?.data?.message || 'Failed to delete attachment.');
        }
    };

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
            alert('Repair request submitted successfully!');
            requestModal.style.display = 'none';
            fetchRequests();
            fetchStatistics();
        } catch (error) {
            console.error('Error creating request:', error);
            alert(error.response?.data?.message || 'Failed to submit request.');
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

    // Initial load
    fetchRequests();
    fetchStatistics();
});
