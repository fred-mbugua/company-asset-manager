// public/assets/js/expenses.js

document.getElementById('expense-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        asset_id: parseInt(document.getElementById('asset_id').value),
        expense_type_id: parseInt(document.getElementById('expense_type_id').value),
        date: document.getElementById('date').value,
        amount: parseFloat(document.getElementById('amount').value),
        vendor: document.getElementById('vendor').value,
        invoice_number: document.getElementById('invoice_number').value,
        notes: document.getElementById('notes').value
    };

    try {
        // Assuming an API endpoint /expenses exists
        const response = await API.post('/expenses', formData);
        showMessage('success', response.message || 'Expense saved successfully!');
        
        document.getElementById('expense-form').reset();
    } catch (error) {
        showMessage('error', error.message || 'Failed to save expense.');
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