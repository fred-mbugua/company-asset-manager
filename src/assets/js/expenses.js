// Set max date to today to prevent future dates
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('max', today);
    
    // Initialize assigned employee field event listener
    initAssetEmployeeLookup();
});

// Fetch assigned employee when asset is selected
function initAssetEmployeeLookup() {
    const assetSelect = document.getElementById('asset_id');
    const employeeDisplay = document.getElementById('assigned_employee_display');
    const employeeIdField = document.getElementById('assigned_employee_id');
    
    if (assetSelect && employeeDisplay) {
        // Handle both Select2 and native change events
        $(assetSelect).on('change', async function() {
            const assetId = this.value;
            
            if (!assetId) {
                employeeDisplay.value = '';
                employeeIdField.value = '';
                return;
            }
            
            try {
                const response = await API.get(`/expenses/assigned-employee/${assetId}`);
                if (response.data && response.data.employee) {
                    employeeDisplay.value = `${response.data.employee.full_name} (${response.data.employee.company || 'N/A'})`;
                    employeeIdField.value = response.data.employee.id;
                } else {
                    employeeDisplay.value = 'Not assigned';
                    employeeIdField.value = '';
                }
            } catch (error) {
                console.error('Failed to fetch assigned employee:', error);
                employeeDisplay.value = 'Unable to fetch';
                employeeIdField.value = '';
            }
        });
    }
}

document.getElementById('expense-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const dateValue = document.getElementById('date').value;
    const today = new Date().toISOString().split('T')[0];
    
    // Validate date is not in the future
    if (dateValue > today) {
        showMessage('error', 'Cannot create expense with a future date.');
        return;
    }

    const assignedEmployeeId = document.getElementById('assigned_employee_id').value;
    
    const formData = {
        asset_id: parseInt(document.getElementById('asset_id').value),
        expense_type_id: parseInt(document.getElementById('expense_type_id').value),
        date: dateValue,
        amount: parseFloat(document.getElementById('amount').value),
        vendor: document.getElementById('vendor').value,
        invoice_number: document.getElementById('invoice_number').value,
        notes: document.getElementById('notes').value,
        assigned_employee_id: assignedEmployeeId ? parseInt(assignedEmployeeId) : null
    };

    try {
        // Assuming an API endpoint /expenses exists
        const response = await API.post('/expenses', formData);
        showMessage('success', response.message || 'Expense saved successfully!');
        
        document.getElementById('expense-form').reset();
        document.getElementById('assigned_employee_display').value = '';
        document.getElementById('assigned_employee_id').value = '';
        // Reload expense history
        window.location.reload();
    } catch (error) {
        showMessage('error', error.message || 'Failed to save expense.');
    }
});

// Pagination functionality
let currentPage = 1;
let itemsPerPage = 10;
let allExpenses = [];

// Store all expense rows on page load
document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('expense-table-body');
    const rows = Array.from(tbody.querySelectorAll('tr:not(#subtotal-row)'));
    
    allExpenses = rows.map(row => {
        return {
            element: row.cloneNode(true),
            data: Array.from(row.cells).map(cell => cell.textContent)
        };
    });
    
    // Initialize pagination
    if (allExpenses.length > 0) {
        updatePagination();
    }
});

function updatePagination() {
    const totalPages = Math.ceil(allExpenses.length / itemsPerPage);
    const tbody = document.getElementById('expense-table-body');
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Calculate start and end indices
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, allExpenses.length);
    
    // Clear tbody
    tbody.innerHTML = '';
    
    // Add paginated rows
    if (allExpenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="no-data">No expenses recorded</td></tr>';
    } else {
        for (let i = startIndex; i < endIndex; i++) {
            tbody.appendChild(allExpenses[i].element.cloneNode(true));
        }
        
        // Calculate subtotal for current page
        let pageSubtotal = 0;
        for (let i = startIndex; i < endIndex; i++) {
            const amountText = allExpenses[i].data[7]; // Amount column
            const amount = parseFloat(amountText.replace('Ksh. ', '').replace(/,/g, ''));
            if (!isNaN(amount)) {
                pageSubtotal += amount;
            }
        }
        
        // Add subtotal row
        const subtotalRow = document.createElement('tr');
        subtotalRow.id = 'subtotal-row';
        subtotalRow.innerHTML = `
            <td colspan="7" class="no-data" style="text-align: right;">Page Subtotal: </td>
            <td class="subtotal">Ksh. ${pageSubtotal.toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')}</td>
        `;
        tbody.appendChild(subtotalRow);
    }
    
    // Update page info
    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1} (${allExpenses.length} total)`;
    
    // Update button states
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages || allExpenses.length === 0;
}

// Event listeners for pagination
document.getElementById('page-size')?.addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 1;
    updatePagination();
});

document.getElementById('prev-btn')?.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
    }
});

document.getElementById('next-btn')?.addEventListener('click', () => {
    const totalPages = Math.ceil(allExpenses.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
    }
});

// Functionality to dynamically load assets if not done by EJS (fallback)
async function loadAssets() {
    try {
        const select = document.getElementById('asset_id');
        // Clear existing options, except the first placeholder
        while (select.options.length > 1) { select.remove(1); }

        const response = await API.get('/assets');
        response.data.forEach(asset => {
            const option = document.createElement('option');
            option.value = asset.id;
            option.textContent = `${asset.asset_tag} - ${asset.description}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Could not load assets:", error);
        showMessage('error', 'Failed to load asset list.');
    }
}

// Load assets if EJS didn't populate them
if (document.getElementById('asset_id').options.length <= 1) {
    loadAssets();
}

// Cancel button functionality
document.getElementById('cancel-btn')?.addEventListener('click', () => {
    document.getElementById('expense-form').reset();
});

// Search functionality
document.getElementById('expense-search')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
        // If search is empty, show all expenses
        currentPage = 1;
        updatePagination();
        return;
    }
    
    // Filter expenses based on search term
    const filteredExpenses = allExpenses.filter(expense => {
        const searchableText = expense.data.join(' ').toLowerCase();
        return searchableText.includes(searchTerm);
    });
    
    // Update the display with filtered results
    const tbody = document.getElementById('expense-table-body');
    tbody.innerHTML = '';
    
    if (filteredExpenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="no-data">No expenses found matching your search</td></tr>';
        document.getElementById('page-info').textContent = 'No results';
        document.getElementById('prev-btn').disabled = true;
        document.getElementById('next-btn').disabled = true;
        return;
    }
    
    // Calculate subtotal for filtered results
    let filteredSubtotal = 0;
    filteredExpenses.forEach(expense => {
        tbody.appendChild(expense.element.cloneNode(true));
        const amountText = expense.data[7]; // Amount column
        const amount = parseFloat(amountText.replace('Ksh. ', '').replace(/,/g, ''));
        if (!isNaN(amount)) {
            filteredSubtotal += amount;
        }
    });
    
    // Add subtotal row
    const subtotalRow = document.createElement('tr');
    subtotalRow.id = 'subtotal-row';
    subtotalRow.innerHTML = `
        <td colspan="8" class="no-data" style="text-align: right;">Filtered Subtotal: </td>
        <td class="subtotal">Ksh. ${filteredSubtotal.toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')}</td>
    `;
    tbody.appendChild(subtotalRow);
    
    // Update page info
    document.getElementById('page-info').textContent = `Showing ${filteredExpenses.length} of ${allExpenses.length} expenses`;
    document.getElementById('prev-btn').disabled = true;
    document.getElementById('next-btn').disabled = true;
});

// Show expense detail modal
async function showExpenseDetails(expenseId) {
    const modal = document.getElementById('expenseDetailModal');
    const detailContent = document.getElementById('expense-detail-content');
    
    modal.style.display = 'block';
    detailContent.innerHTML = '<p style="text-align: center; color: #888;">Loading...</p>';
    
    try {
        // Fetch expense details from API
        const response = await API.get(`/expenses/${expenseId}`);
        const expense = response.data;
        
        // Check if this expense came from a repair request
        const repairRequestInfo = expense.repair_request_id ? `
            <div class="detail-row" style="background: #e8f4fd; padding: 8px; border-radius: 4px; margin-bottom: 10px;">
                <strong><i class="uil uil-wrench"></i> From Repair Request:</strong> 
                #${expense.repair_request_number || expense.repair_request_id} - ${expense.repair_request_title || 'Repair'}
            </div>
        ` : '';
        
        // Format the expense details
        detailContent.innerHTML = `
            <div class="expense-detail-info">
                ${repairRequestInfo}
                <div class="detail-row">
                    <strong>Expense ID:</strong> ${expense.id}
                </div>
                <div class="detail-row">
                    <strong>Asset:</strong> ${expense.asset_tag || 'N/A'} - ${expense.manufacturer || ''} ${expense.model || ''}
                </div>
                <div class="detail-row">
                    <strong>Expense Type:</strong> ${expense.expense_type_name || expense.expense_type || 'N/A'}
                </div>
                <div class="detail-row">
                    <strong>Date:</strong> ${new Date(expense.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}
                </div>
                <div class="detail-row">
                    <strong>Vendor:</strong> ${expense.vendor || 'N/A'}
                </div>
                <div class="detail-row">
                    <strong>Invoice Number:</strong> ${expense.invoice_number || 'N/A'}
                </div>
                <div class="detail-row">
                    <strong>Amount:</strong> Ksh. ${parseFloat(expense.amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </div>
                <div class="detail-row">
                    <strong>Notes:</strong> ${expense.expense_notes || expense.notes || 'N/A'}
                </div>
            </div>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            
            ${expense.repair_request_id ? `
            <!-- Repair Request Attachments Section -->
            <div class="repair-attachments-section" style="margin-bottom: 20px;">
                <h4 style="color: #3498db;"><i class="uil uil-wrench"></i> Repair Request Documents</h4>
                <div id="repair-attachments-list-${expense.repair_request_id}" class="attachments-list">
                    <p class="loading-text">Loading repair documents...</p>
                </div>
            </div>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            ` : ''}
            
            <div class="attachments-section" data-entity-type="expense" data-entity-id="${expenseId}">
                <h4><i class="uil uil-paperclip"></i> Expense Attachments</h4>
                
                <!-- Upload Form -->
                <div class="attachment-upload-form">
                    <div class="upload-area">
                        <input type="file" id="expense-attachment-file-${expenseId}" class="attachment-file-input" accept="*/*" style="display: none;">
                        <label for="expense-attachment-file-${expenseId}" class="upload-label">
                            <i class="uil uil-upload"></i>
                            <span>Choose File or Drag & Drop</span>
                            <small>Maximum file size: 10MB</small>
                        </label>
                        <div class="selected-file" style="display: none;">
                            <i class="uil uil-file"></i>
                            <span class="file-name"></span>
                            <button type="button" class="clear-file-btn">&times;</button>
                        </div>
                    </div>
                    <div class="upload-notes">
                        <label for="expense-attachment-notes-${expenseId}">Notes (Optional)</label>
                        <textarea id="expense-attachment-notes-${expenseId}" class="attachment-notes-input" rows="2" placeholder="Add any notes about this attachment..."></textarea>
                    </div>
                    <button type="button" class="btn btn-upload-attachment" data-entity-type="expense" data-entity-id="${expenseId}">
                        <i class="uil uil-upload-alt"></i> Upload Attachment
                    </button>
                </div>

                <!-- Attachments List -->
                <div class="attachments-list" id="expense-attachments-list-${expenseId}">
                    <p class="loading-text">Loading attachments...</p>
                </div>
            </div>
        `;
        
        // Initialize attachment manager for expenses
        AttachmentManager.init('expense', expenseId);
        
        // Load repair request attachments if this expense came from a repair request
        if (expense.repair_request_id) {
            loadRepairRequestAttachments(expense.repair_request_id);
        }
        
    } catch (error) {
        console.error('Error loading expense details:', error);
        detailContent.innerHTML = `
            <p style="text-align: center; color: #e74c3c;">
                Failed to load expense details. Please try again.
            </p>
        `;
    }
}

// Load repair request attachments for expense detail view
async function loadRepairRequestAttachments(repairRequestId) {
    const container = document.getElementById(`repair-attachments-list-${repairRequestId}`);
    if (!container) return;
    
    try {
        const response = await API.get(`/repair-requests/${repairRequestId}/attachments`);
        const attachments = response.data || [];
        
        if (attachments.length === 0) {
            container.innerHTML = '<p style="color: #888; font-style: italic;">No repair request documents attached.</p>';
            return;
        }
        
        container.innerHTML = attachments.map(att => `
            <div class="attachment-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 6px; margin-bottom: 8px;">
                <div class="attachment-info" style="display: flex; align-items: center; gap: 10px;">
                    <i class="uil ${getFileIcon(att.file_name)}" style="font-size: 24px; color: #3498db;"></i>
                    <div>
                        <div style="font-weight: 500;">${escapeHtml(att.original_name || att.file_name)}</div>
                        <div style="font-size: 12px; color: #888;">
                            ${att.attachment_type || 'Document'} - ${formatFileSize(att.file_size)}
                            ${att.uploader_name ? ` - by ${escapeHtml(att.uploader_name)}` : ''}
                        </div>
                    </div>
                </div>
                <div class="attachment-actions">
                    <a href="/api/repair-requests/${repairRequestId}/attachments/${att.id}/download" target="_blank" class="btn btn-sm btn-info" title="View/Download">
                        <i class="uil uil-download-alt"></i>
                    </a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading repair request attachments:', error);
        container.innerHTML = '<p style="color: #e74c3c;">Failed to load repair documents.</p>';
    }
}

// Helper function to get file icon based on extension
function getFileIcon(fileName) {
    if (!fileName) return 'uil-file';
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
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
    return iconMap[ext] || 'uil-file';
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close expense detail modal
function closeExpenseDetail() {
    const modal = document.getElementById('expenseDetailModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('expenseDetailModal');
    if (event.target === modal) {
        closeExpenseDetail();
    }
}

// Make functions globally available
window.showExpenseDetails = showExpenseDetails;
window.closeExpenseDetail = closeExpenseDetail;