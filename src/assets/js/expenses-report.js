// document.addEventListener('DOMContentLoaded', () => {
//     const tableBody = document.getElementById('expenses-table-body');
//     const searchBtn = document.getElementById('search-btn');
//     const exportBtn = document.getElementById('export-btn');
//     const prevBtn = document.getElementById('prev-btn');
//     const nextBtn = document.getElementById('next-btn');
//     const pageSizeSelect = document.getElementById('page-size');
//     const pageInfoSpan = document.getElementById('page-info');

//     // State for pagination and filters
//     let currentPage = 1;
//     let totalPages = 1;
//     let currentFilters = {};
//     const reportEndpoint = '/reports/expenses'; // API endpoint for expenses
    
//     // Currency formatter (e.g., USD)
//     const formatter = new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'KE',
//     });

//     /**
//      * Gathers all filter values from the UI.
//      */
//     const getFilters = () => {
//         return {
//             asset_tag: document.getElementById('filter-tag')?.value,
//             expense_type: document.getElementById('filter-type')?.value,
//             department: document.getElementById('filter-department')?.value,
//             location: document.getElementById('filter-location')?.value,
//             from_date: document.getElementById('filter-from-date')?.value,
//             to_date: document.getElementById('filter-to-date')?.value,
//         };
//     };

//     /**
//      * Fetches and renders the expense data based on current state.
//      */
//     const fetchAndRenderData = async () => {
//         const limit = parseInt(pageSizeSelect.value);
//         const offset = (currentPage - 1) * limit;
        
//         tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:#888;">Loading report data...</td></tr>`;

//         try {
//             const params = { ...currentFilters, limit: limit, offset: offset };
//             const response = await API.get(reportEndpoint, params); 
            
//             const data = response.data.expenses;
//             const totalCount = response.data.totalCount;

//             totalPages = Math.ceil(totalCount / limit);

//             renderTable(data);
//             updatePaginationControls(totalCount);

//         } catch (error) {
//             console.error('Error fetching expense report:', error);
//             showMessage('error', 'Failed to load expense report data.');
//             tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:red;">Error loading data.</td></tr>`;
//             updatePaginationControls(0);
//         }
//     };

//     /**
//      * Renders the data rows into the table body.
//      */
//     const renderTable = (data) => {
//         if (!data || data.length === 0) {
//             tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:#888;">No expenses found matching the criteria.</td></tr>`;
//             return;
//         }

//         tableBody.innerHTML = data.map(expense => `
//             <tr>
//                 <td>${expense.id}</td>
//                 <td>${expense.asset_tag}</td>
//                 <td>${expense.expense_type}</td>
//                 <td>${new Date(expense.date).toLocaleDateString()}</td>
//                 <td>${formatter.format(expense.amount)}</td>
//                 <td>${expense.vendor || 'N/A'}</td>
//                 <td>${expense.invoice_no || 'N/A'}</td>
//                 <td>${expense.department || 'N/A'}</td>
//                 <td>${expense.location || 'N/A'}</td>
//                 <td title="${expense.notes || ''}">${expense.notes ? expense.notes.substring(0, 50) + '...' : 'N/A'}</td>
//             </tr>
//         `).join('');
//     };

//     /**
//      * Updates pagination controls (same as asset-report.js)
//      */
//     const updatePaginationControls = (totalCount) => {
//         const limit = parseInt(pageSizeSelect.value);
//         totalPages = Math.ceil(totalCount / limit);
//         pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages} (${totalCount} total)`;
//         prevBtn.disabled = currentPage === 1;
//         nextBtn.disabled = currentPage >= totalPages;
//     };

//     // --- Event Listeners ---
//     searchBtn.addEventListener('click', () => { currentFilters = getFilters(); currentPage = 1; fetchAndRenderData(); });
//     pageSizeSelect.addEventListener('change', () => { currentPage = 1; fetchAndRenderData(); });
//     prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; fetchAndRenderData(); } });
//     nextBtn.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; fetchAndRenderData(); } });
//     exportBtn.addEventListener('click', () => {
//         const exportQuery = new URLSearchParams(getFilters()).toString();
//         window.open(`${reportEndpoint}/export?${exportQuery}`, '_blank');
//     });

//     // Initial load
//     fetchAndRenderData();
// });


document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('expenses-table-body');
    const searchBtn = document.getElementById('search-btn');
    const exportBtn = document.getElementById('export-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageSizeSelect = document.getElementById('page-size');
    const pageInfoSpan = document.getElementById('page-info');

    // State for pagination and filters
    let currentPage = 1;
    let totalPages = 1;
    let currentFilters = {};
    const reportEndpoint = '/reports/expenses'; 
    const COLSPAN = 10; // Number of columns in the table

    /**
     * Gathers all filter values from the UI.
     */
    const getFilters = () => {
        return {
            asset_tag: document.getElementById('filter-tag')?.value,
            expense_type: document.getElementById('filter-type')?.value,
            department: document.getElementById('filter-department')?.value,
            location: document.getElementById('filter-location')?.value,
            from_date: document.getElementById('filter-from-date')?.value,
            to_date: document.getElementById('filter-to-date')?.value,
        };
    };

    /**
     * Fetches and renders the expense data based on current state.
     */
    const fetchAndRenderData = async () => {
        const limit = parseInt(pageSizeSelect.value);
        const offset = (currentPage - 1) * limit;
        
        tableBody.innerHTML = `<tr><td colspan="${COLSPAN}" style="text-align:center;color:#888;">Loading report data...</td></tr>`;

        try {
            const params = { 
                ...currentFilters, 
                limit: limit, 
                offset: offset 
            };
            
            // Use the updated API.get(url, params)
            const response = await API.get(reportEndpoint, params); 
            
            const data = response.data.expenses;
            const totalCount = response.data.totalCount;

            totalPages = Math.ceil(totalCount / limit);

            renderTable(data);
            updatePaginationControls(totalCount);

        } catch (error) {
            console.error('Error fetching expense report:', error);
            tableBody.innerHTML = `<tr><td colspan="${COLSPAN}" style="text-align:center;color:red;">Error loading data.</td></tr>`;
            updatePaginationControls(0);
        }
    };

    /**
     * Renders the data rows into the table body.
     */
    const renderTable = (data) => {
        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${COLSPAN}" style="text-align:center;color:#888;">No expenses found matching the criteria.</td></tr>`;
            return;
        }
        
        // Data coming from the controller should already have formatted dates and amounts.
        tableBody.innerHTML = data.map(expense => `
            <tr>
                <td>${expense.id}</td>
                <td>${expense.asset_tag}</td>
                <td>${expense.expense_type_name}</td>
                <td>${new Date(expense.date).toLocaleDateString()}</td> 
                <td>${expense.amount}</td> 
                <td>${expense.vendor || 'N/A'}</td>
                <td>${expense.invoice_number || 'N/A'}</td>
                <td>${expense.department || 'N/A'}</td>
                <td>${expense.location || 'N/A'}</td>
                <td title="${expense.notes || ''}">${expense.notes ? expense.notes.substring(0, 50) + '...' : 'N/A'}</td>
            </tr>
        `).join('');
    };

    /**
     * Updates pagination controls.
     */
    const updatePaginationControls = (totalCount) => {
        const limit = parseInt(pageSizeSelect.value);
        totalPages = Math.ceil(totalCount / limit);
        pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages} (${totalCount} total)`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage >= totalPages;
    };

    // --- Event Listeners ---
    searchBtn.addEventListener('click', () => { currentFilters = getFilters(); currentPage = 1; fetchAndRenderData(); });
    pageSizeSelect.addEventListener('change', () => { currentPage = 1; fetchAndRenderData(); });
    prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; fetchAndRenderData(); } });
    nextBtn.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; fetchAndRenderData(); } });
    
    // Export button handler - uses direct navigation for cookie-based auth
    exportBtn.addEventListener('click', () => {
        const filters = getFilters();
        delete filters.limit;
        delete filters.offset;
        const exportQuery = new URLSearchParams(filters).toString();
        window.open(`/api/reports/expenses/export?${exportQuery}`, '_blank'); 
    });

    // Initial load
    currentFilters = getFilters();
    // fetchAndRenderData();
});