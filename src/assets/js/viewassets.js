// public/assets/js/viewassets.js

const listSection = document.getElementById('assets-list-section');
const detailSection = document.getElementById('asset-detail-section');
const detailForm = document.getElementById('asset-detail-form');
let currentAssetId = null;

// The main view (loading assets) is handled by EJS. This JS focuses on details/edit.

async function showAssetDetails(id) {
    try {
        const response = await API.get(`/assets/${id}`);
        const asset = response.data;
        currentAssetId = id;

        // Simple form generation for viewing/editing
        detailForm.innerHTML = `
            <div class="form-field"><label>Asset Tag:</label><input type="text" id="edit_tag" value="${asset.asset_tag}" required></div>
            <div class="form-field"><label>Serial Number:</label><input type="text" id="edit_serial" value="${asset.serial_number}" required></div>
            <div class="form-field"><label>Status:</label><select id="edit_status" required>
                <option value="In Stock">In Stock</option>
                <option value="In Use">In Use</option>
                <option value="Under Repair">Under Repair</option>
                <option value="Disposed">Disposed</option>
            </select></div>
            <div class="form-field"><label>Purchase Price:</label><input type="number" step="0.01" id="edit_price" value="${asset.purchase_price}" required></div>
            <div class="form-field full-width"><label>Description:</label><textarea id="edit_desc" rows="3">${asset.description}</textarea></div>
        `;
        document.getElementById('edit_status').value = asset.status;
        
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
        status: document.getElementById('edit_status').value,
        purchase_price: parseFloat(document.getElementById('edit_price').value),
        description: document.getElementById('edit_desc').value,
        // Include other fields as needed
    };

    try {
        const response = await API.put(`/assets/${currentAssetId}`, updatedData);
        showMessage('success', response.message || 'Asset updated successfully!');
        
        // Hide details and show list, reloading list data (simple non-SPA approach)
        listSection.style.display = 'block';
        detailSection.style.display = 'none';
        window.location.reload(); 
    } catch (error) {
        showMessage('error', error.message || 'Failed to save changes.');
    }
});

// Attach to window for EJS onclick
window.showAssetDetails = showAssetDetails;