// public/assets/js/expenses.js

// Set max date to today to prevent future dates
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('max', today);
});

document.getElementById('expense-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const dateValue = document.getElementById('date').value;
    const today = new Date().toISOString().split('T')[0];
    
    // Validate date is not in the future
    if (dateValue > today) {
        showMessage('error', 'Cannot create expense with a future date.');
        return;
    }

    const formData = {
        asset_id: parseInt(document.getElementById('asset_id').value),
        expense_type_id: parseInt(document.getElementById('expense_type_id').value),
        date: dateValue,
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
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No expenses recorded</td></tr>';
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