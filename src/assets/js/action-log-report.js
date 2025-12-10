document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('logs-table-body');
    const searchBtn = document.getElementById('search-btn');
    const exportBtn = document.getElementById('export-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageSizeSelect = document.getElementById('page-size');
    const pageInfoSpan = document.getElementById('page-info');

    // Stating for pagination and filters
    let currentPage = 1;
    let totalPages = 1;
    let currentFilters = {};
    const reportEndpoint = '/reports/action-logs'; 
    const COLSPAN = 7; // Number of columns in the table

    /**
     * Gathering all filter values from the UI.
     */
    const getFilters = () => {
        return {
            user_id: document.getElementById('filter-user')?.value,
            action_type: document.getElementById('filter-action-type')?.value,
            entity_type: document.getElementById('filter-entity-type')?.value,
            from_date: document.getElementById('filter-from-date')?.value,
            to_date: document.getElementById('filter-to-date')?.value,
        };
    };

    /**
     * Fetching and renders the action log data based on current state.
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
            
            const response = await API.get(reportEndpoint, params); 
            
            const data = response.data.logs;
            const totalCount = response.data.totalCount;

            totalPages = Math.ceil(totalCount / limit);

            renderTable(data);
            updatePaginationControls(totalCount);

        } catch (error) {
            console.error('Error fetching action log report:', error);
            tableBody.innerHTML = `<tr><td colspan="${COLSPAN}" style="text-align:center;color:red;">Error loading data.</td></tr>`;
            updatePaginationControls(0);
        }
    };

    /**
     * Rendering the data rows into the table body.
     */
    const renderTable = (data) => {
        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${COLSPAN}" style="text-align:center;color:#888;">No action logs found matching the criteria.</td></tr>`;
            return;
        }
        
        // Data coming from the controller already have formatted dates and details.
        tableBody.innerHTML = data.map(log => `
            <tr>
                <td>${log.id}</td>
                <td>${log.user_name || 'N/A'}</td>
                <td>${log.action_type}</td>
                <td>${log.entity_type}</td>
                <td>${log.entity_id || 'N/A'}</td>
                <td title="${log.details}">${log.details.length > 50 ? log.details.substring(0, 50) + '...' : log.details}</td>
                <td>${log.created_at}</td>
            </tr>
        `).join('');
    };

    /**
     * Updating pagination controls.
     */
    const updatePaginationControls = (totalCount) => {
        const limit = parseInt(pageSizeSelect.value);
        totalPages = Math.ceil(totalCount / limit);
        pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages} (${totalCount} total)`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage >= totalPages;
    };

    // --- Event Listeners ---
    searchBtn.addEventListener('click', () => { 
        currentFilters = getFilters(); 
        currentPage = 1; 
        fetchAndRenderData(); 
    });
    
    pageSizeSelect.addEventListener('change', () => { 
        currentPage = 1; 
        fetchAndRenderData(); 
    });
    
    prevBtn.addEventListener('click', () => { 
        if (currentPage > 1) { 
            currentPage--; 
            fetchAndRenderData(); 
        } 
    });
    
    nextBtn.addEventListener('click', () => { 
        if (currentPage < totalPages) { 
            currentPage++; 
            fetchAndRenderData(); 
        } 
    });
    
    // Export button handler - uses direct navigation for cookie-based auth
    exportBtn.addEventListener('click', () => {
        const filters = getFilters();
        delete filters.limit;
        delete filters.offset;
        const exportQuery = new URLSearchParams(filters).toString();
        window.open(`/api/reports/action-logs/export?${exportQuery}`, '_blank'); 
    });

    // Initial load
    currentFilters = getFilters();
    // fetchAndRenderData(); // Uncomment to load data on page load, or rely on server-side initial data
});
