// Handle asset type change to show next tag preview
document.getElementById('asset_type').addEventListener('change', async function() {
    const assetTypeId = this.value;
    const tagPreview = document.getElementById('tag-preview');
    const nextTagValue = document.getElementById('next-tag-value');
    
    if (assetTypeId) {
        try {
            const response = await API.get(`/assets/next-tag/${assetTypeId}`);
            if (response.data) {
                nextTagValue.textContent = response.data.fullTag;
                tagPreview.style.display = 'block';
            }
        } catch (error) {
            console.error('Failed to get tag preview:', error);
            tagPreview.style.display = 'none';
        }
    } else {
        tagPreview.style.display = 'none';
    }
});

// Auto-generate asset tag button
document.getElementById('generateTagBtn').addEventListener('click', async function() {
    const assetTypeId = document.getElementById('asset_type').value;
    const assetTagInput = document.getElementById('asset_tag');
    
    if (!assetTypeId) {
        showMessage('error', 'Please select an asset type first.');
        return;
    }
    
    try {
        const response = await API.get(`/assets/next-tag/${assetTypeId}`);
        if (response.data && response.data.fullTag) {
            assetTagInput.value = response.data.fullTag;
            showMessage('info', `Tag will be: ${response.data.fullTag} (final tag assigned on save)`);
        }
    } catch (error) {
        showMessage('error', 'Failed to generate asset tag.');
    }
});

document.getElementById('assetForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validate purchase date is not in the future
    const purchaseDateInput = document.getElementById('purchase_date');
    const selectedDate = new Date(purchaseDateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
        return showMessage('error', 'Purchase date cannot be in the future.');
    }

    const assetTagValue = document.getElementById('asset_tag').value.trim();
    
    const formData = {
        asset_tag: assetTagValue || 'AUTO', // If empty, use AUTO to trigger auto-generation
        asset_type: document.getElementById('asset_type').selectedOptions[0].text,
        manufacturer: document.getElementById('manufacturer').value,
        model: document.getElementById('model').value,
        serial_number: document.getElementById('serial_number').value,
        status: document.getElementById('status').selectedOptions[0].text,
        branch_id: parseInt(document.getElementById('branch_id').value),
        purchase_date: document.getElementById('purchase_date').value,
        purchase_price: parseFloat(document.getElementById('purchase_price').value),
        notes: document.getElementById('notes').value,
        asset_type_id: parseInt(document.getElementById('asset_type').value),
        asset_status_id: parseInt(document.getElementById('status').value)
    };

    // console.log('Form Data:', formData);

    try {
        const response = await API.post('/assets', formData);
        showMessage('success', response.message || 'Asset created successfully!');
        
        // Clear the form after successful submission
        document.getElementById('assetForm').reset();
        document.getElementById('tag-preview').style.display = 'none';
    } catch (error) {
        showMessage('error', error.message || 'Failed to create asset.');
    }
});