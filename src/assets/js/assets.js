// public/assets/js/assets.js

document.getElementById('assetForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        asset_tag: document.getElementById('asset_tag').value,
        asset_type: document.getElementById('asset_type').value,
        manufacturer: document.getElementById('manufacturer').value,
        model: document.getElementById('model').value,
        serial_number: document.getElementById('serial_number').value,
        status: document.getElementById('status').value,
        location: document.getElementById('location').value,
        purchase_date: document.getElementById('purchase_date').value,
        purchase_price: parseFloat(document.getElementById('purchase_price').value),
        notes: document.getElementById('notes').value
    };

    try {
        const response = await API.post('/assets', formData);
        showMessage('success', response.message || 'Asset created successfully!');
        
        // Clear the form after successful submission
        document.getElementById('assetForm').reset();
    } catch (error) {
        showMessage('error', error.message || 'Failed to create asset.');
    }
});