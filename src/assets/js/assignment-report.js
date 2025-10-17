// public/assets/js/assignments-report.js

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('assignments-table-body');
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
    const reportEndpoint = '/reports/assignments'; // API endpoint for assignments

    /**
     * Gathers all filter values from the UI.
     */
    const getFilters = () => {
        return {
            asset_tag: document.getElementById('filter-tag')?.value,
            department: document.getElementById('filter-department')?.value,
            employee_id: document.getElementById('filter-employee')?.value,
            location: document.getElementById('filter-location')?.value,
            from_date: document.getElementById('filter-from-date')?.value,
            to_date: document.getElementById('filter-to-date')?.value,
        };
    };

    /**
     * Fetches and renders the assignment data based on current state.
     */
    const fetchAndRenderData = async () => {
        const limit = parseInt(pageSizeSelect.value);
        const offset = (currentPage - 1) * limit;
        
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#888;">Loading report data...</td></tr>`;

        try {
            const params = { ...currentFilters, limit: limit, offset: offset };
            const response = await API.get(reportEndpoint, params); 
            
            const data = response.data.assignments;
            const totalCount = response.data.totalCount;

            totalPages = Math.ceil(totalCount / limit);

            renderTable(data);
            updatePaginationControls(totalCount);

        } catch (error) {
            console.error('Error fetching assignment report:', error);
            showMessage('error', 'Failed to load assignment report data.');
            tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:red;">Error loading data.</td></tr>`;
            updatePaginationControls(0);
        }
    };

    /**
     * Renders the data rows into the table body.
     */
    const renderTable = (data) => {
        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#888;">No assignments found matching the criteria.</td></tr>`;
            return;
        }

        tableBody.innerHTML = data.map(assign => `
            <tr>
                <td>${assign.id}</td>
                <td>${assign.asset_tag}</td>
                <td>${assign.manufacturer}</td>
                <td>${assign.model}</td>
                <td>${assign.employee_name}</td>
                <td>${assign.department || 'N/A'}</td>
                <td>${new Date(assign.assigned_date).toLocaleDateString()}</td>
                <td title="${assign.notes || ''}">${assign.notes ? assign.notes.substring(0, 50) + '...' : 'N/A'}</td>
                <td>${assign.returned_date ? new Date(assign.returned_date).toLocaleDateString() : '—'}</td>
            </tr>
        `).join('');
    };

    /**
     * Updates pagination controls (same as asset-report.js)
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
    exportBtn.addEventListener('click', () => {
        const exportQuery = new URLSearchParams(getFilters()).toString();
        window.open(`${reportEndpoint}/export?${exportQuery}`, '_blank');
    });

    // Initial load
    fetchAndRenderData();
});