const listSection = document.getElementById('assets-list-section');
const detailSection = document.getElementById('asset-detail-section');
const detailForm = document.getElementById('asset-detail-form');
const tableBody = document.getElementById('asset-table-body');
const searchBtn = document.getElementById('search-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageSizeSelect = document.getElementById('page-size');
const pageInfoSpan = document.getElementById('page-info');

let currentAssetId = null;
let currentPage = 1;
let totalPages = 1;
let currentFilters = {};

// Initialize Select2 for searchable dropdowns
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Select2 on all dropdowns with class select2-dropdown
    $('.select2-dropdown').select2({
        placeholder: 'Select an option',
        allowClear: true,
        width: '100%'
    });
    
    // Load initial data
    fetchAndRenderData();
});

/**
 * Gathers all filter values from the UI.
 * @returns {object} An object containing all filter parameters.
 */
const getFilters = () => {
    return {
        asset_tag: document.getElementById('filter-tag')?.value,
        serial_number: document.getElementById('filter-serial')?.value,
        type: document.getElementById('filter-type')?.value,
        status: document.getElementById('filter-status')?.value,
        location: document.getElementById('filter-location')?.value,
        from_date: document.getElementById('filter-from-date')?.value,
        to_date: document.getElementById('filter-to-date')?.value,
    };
};

/**
 * Fetches and renders the asset data based on current state.
 */
const fetchAndRenderData = async () => {
    const limit = parseInt(pageSizeSelect.value);
    const offset = (currentPage - 1) * limit;

    // Show loading state
    tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:#888;">Loading assets...</td></tr>`;

    try {
        const params = {
            ...currentFilters,
            limit: limit,
            offset: offset
        };

        const response = await API.get('/assets/search', params);
        const data = response.data;
        
        const totalCount = data.totalCount || data.length || 0;
        totalPages = Math.ceil(totalCount / limit);

        renderTable(data.assets || data);
        updatePaginationControls(totalCount);

    } catch (error) {
        console.error('Error fetching assets:', error);
        showMessage('error', 'Failed to load assets data.');
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:red;">Error loading data.</td></tr>`;
        updatePaginationControls(0);
    }
};

/**
 * Renders the data rows into the table body.
 * @param {Array<object>} data - The array of asset records.
 */
const renderTable = (data) => {
    if (!data || data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:#888;">No assets found matching the criteria.</td></tr>`;
        return;
    }

    const deleteButton = window.isUserAdmin 
        ? (id, tag) => `<button class="btn btn-delete" onclick="confirmDelete(${id}, '${tag}')">Delete</button>`
        : () => '';

    tableBody.innerHTML = data.map(asset => `
        <tr data-id="${asset.id}">
            <td>${asset.id}</td>
            <td>${asset.asset_tag}</td>
            <td>${asset.asset_type || asset.type_name || 'N/A'}</td>
            <td>${asset.manufacturer}</td>
            <td>${asset.model}</td>
            <td>${asset.serial_number}</td>
            <td>${asset.status || asset.status_name || 'N/A'}</td>
            <td>${asset.location || 'N/A'}</td>
            <td>${new Date(asset.purchase_date).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-edit" onclick="showAssetDetails(${asset.id})">View/Edit</button>
                <button class="btn btn-view" onclick="showAssignmentHistory(${asset.id}, '${asset.asset_tag}')">History</button>
                ${deleteButton(asset.id, asset.asset_tag)}
            </td>
        </tr>
    `).join('');
};

/**
 * Updates the text and disabled state of pagination buttons.
 * @param {number} totalCount - The total number of records.
 */
const updatePaginationControls = (totalCount) => {
    pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages} (${totalCount} total)`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;
};

// --- Event Listeners ---

// Search/Filter button handler
searchBtn.addEventListener('click', () => {
    currentFilters = getFilters();
    currentPage = 1; // Reset to first page on new search
    fetchAndRenderData();
});

// Pagination size change handler
pageSizeSelect.addEventListener('change', () => {
    currentPage = 1; // Reset to first page when limit changes
    fetchAndRenderData();
});

// Previous button handler
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchAndRenderData();
    }
});

// Next button handler
nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchAndRenderData();
    }
});

// The main view (loading assets) is handled by EJS. This JS focuses on details/edit.

async function showAssetDetails(id) {
    try {
        const [assetResponse, statusesResponse, branchesResponse] = await Promise.all([
            API.get(`/assets/${id}`),
            API.get('/assets/statuses/list'),
            API.get('/branches')
        ]);
        
        const asset = assetResponse.data;
        const statuses = statusesResponse.data;
        const branches = branchesResponse.data;

        // console.log('Asset Details:', statuses);
        currentAssetId = id;

        // Generate status options from database
        const statusOptions = statuses.map(status => 
            `<option value="${status.id}" data-name="${status.name}">${status.name}</option>`
        ).join('');

        // Generate branch/location options
        const branchOptions = branches.map(branch =>
            `<option value="${branch.id}">${branch.name} - ${branch.location}</option>`
        ).join('');

        // Form generation for viewing/editing
        detailForm.innerHTML = `
            <div class="form-field"><label>Asset Tag:</label><input type="text" id="edit_tag" value="${asset.asset_tag}" required></div>
            <div class="form-field"><label>Serial Number:</label><input type="text" id="edit_serial" value="${asset.serial_number}" required></div>
            <div class="form-field"><label>Status:</label>
            <select id="edit_status" required>
                ${statusOptions}
            </select></div>
            <div class="form-field"><label>Location (Branch):</label>
            <select id="edit_location" class="location-select" required>
                ${branchOptions}
            </select></div>
            <div class="form-field"><label>Purchase Price:</label><input type="number" step="0.01" id="edit_price" value="${asset.purchase_price}" required></div>
            <div class="form-field full-width"><label>Notes:</label><textarea id="edit_desc" rows="3">${asset.notes}</textarea></div>
        `;
        document.getElementById('edit_status').value = asset.asset_status_id;
        document.getElementById('edit_location').value = asset.branch_id;
        
        // Initialize Select2 for the location dropdown
        if (typeof $ !== 'undefined' && typeof $.fn.select2 !== 'undefined') {
            $('.location-select').select2({
                placeholder: 'Select a branch',
                allowClear: false,
                width: '100%'
            });
        }
        
        listSection.style.display = 'none';
        detailSection.style.display = 'block';

    } catch (error) {
        showMessage('error', error.message || 'Failed to load asset details.');
    }
}

document.getElementById('save-asset-btn').addEventListener('click', async () => {
    if (!currentAssetId) return;

    const updatedData = {
        asset_tag: document.getElementById('edit_tag').value,
        serial_number: document.getElementById('edit_serial').value,
        status: document.getElementById('edit_status').selectedOptions[0].dataset.name,
        asset_status_id: parseInt(document.getElementById('edit_status').value),
        purchase_price: parseFloat(document.getElementById('edit_price').value),
        notes: document.getElementById('edit_desc').value,
        branch_id: parseInt(document.getElementById('edit_location').value)
    };

    try {
        const response = await API.put(`/assets/${currentAssetId}`, updatedData);
        showMessage('success', response.message || 'Asset updated successfully!');
        
        // Hide details and show list, reloading list data
        listSection.style.display = 'block';
        detailSection.style.display = 'none';
        fetchAndRenderData(); // Reload data instead of full page reload
    } catch (error) {
        showMessage('error', error.message || 'Failed to save changes.');
    }
});

// Delete functionality
let deleteAssetId = null;

function confirmDelete(assetId, assetTag) {
    if (!window.isUserAdmin) {
        showMessage('error', 'You do not have permission to delete assets.');
        return;
    }
    
    deleteAssetId = assetId;
    const modal = document.getElementById('deleteModal');
    const message = document.getElementById('delete-message');
    message.textContent = `Are you sure you want to delete asset "${assetTag}" (ID: ${assetId})? This action cannot be undone.`;
    modal.style.display = 'flex';
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'none';
    deleteAssetId = null;
}

// Delete modal event listeners
document.getElementById('cancel-delete-btn')?.addEventListener('click', closeDeleteModal);

document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
    if (!deleteAssetId) return;
    
    try {
        const response = await API.delete(`/assets/${deleteAssetId}`);
        showMessage('success', response.message || 'Asset deleted successfully!');
        closeDeleteModal();
        fetchAndRenderData(); // Reload the table
    } catch (error) {
        showMessage('error', error.message || 'Failed to delete asset.');
        closeDeleteModal();
    }
});

// Close modal when clicking outside
document.getElementById('deleteModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'deleteModal') {
        closeDeleteModal();
    }
});

// Assignment History Modal Functions
async function showAssignmentHistory(assetId, assetTag) {
    const modal = document.getElementById('historyModal');
    const assetInfo = document.getElementById('history-asset-info');
    const historyContent = document.getElementById('history-content');
    
    assetInfo.textContent = `Asset: ${assetTag}`;
    historyContent.innerHTML = '<p style="text-align: center; color: #888;">Loading history...</p>';
    modal.style.display = 'flex';
    
    try {
        const response = await API.get(`/assignments/asset/${assetId}/history`);
        console.log('History response:', response);
        const history = response.data;
        
        if (!history || history.length === 0) {
            historyContent.innerHTML = '<p style="text-align: center; color: #888;">No assignment history found for this asset.</p>';
            return;
        }
        
        const historyHTML = `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Assigned To</th>
                        <th>Branch</th>
                        <th>Assigned Date</th>
                        <th>Returned Date</th>
                        <th>Assigned By</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.map(record => {
                        const employeeName = `${record.first_name} ${record.middle_name || ''} ${record.last_name}`.trim();
                        const branchInfo = record.branch_name 
                            ? `${record.branch_name}${record.branch_location ? ' - ' + record.branch_location : ''}`
                            : 'N/A';
                        const assignedBy = record.assigned_by_first_name 
                            ? `${record.assigned_by_first_name} ${record.assigned_by_last_name}`
                            : 'N/A';
                        const assignedDate = new Date(record.assignment_date).toLocaleDateString();
                        const returnedDate = record.return_date 
                            ? new Date(record.return_date).toLocaleDateString()
                            : '<span style="color: #4A9D5F; font-weight: 600;">Currently Assigned</span>';
                        const status = record.return_date ? 'returned' : 'active';
                        
                        return `
                            <tr class="${status}">
                                <td>${employeeName}</td>
                                <td>${branchInfo}</td>
                                <td>${assignedDate}</td>
                                <td>${returnedDate}</td>
                                <td>${assignedBy}</td>
                                <td>${record.notes || '-'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        historyContent.innerHTML = historyHTML;
        
    } catch (error) {
        console.error('Error loading assignment history:', error);
        console.error('Error details:', error.message, error.stack);
        const errorMessage = error.message || 'Failed to load assignment history.';
        historyContent.innerHTML = `<p style="text-align: center; color: red;">${errorMessage}</p>`;
    }
}

function closeHistoryModal() {
    const modal = document.getElementById('historyModal');
    modal.style.display = 'none';
}

// Close history modal when clicking outside
document.getElementById('historyModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'historyModal') {
        closeHistoryModal();
    }
});

// Attach to window for EJS onclick
window.showAssetDetails = showAssetDetails;
window.confirmDelete = confirmDelete;
window.showAssignmentHistory = showAssignmentHistory;
window.closeHistoryModal = closeHistoryModal;