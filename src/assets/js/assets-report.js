document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('asset-table-body');
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
    const reportEndpoint = '/reports/assets'; // <-- Defining API endpoint

    /**
     * Gathers all filter values from the UI.
     * @returns {object} An object containing all filter parameters.
     */
    const getFilters = () => {
        return {
            type: document.getElementById('filter-type')?.value,
            location: document.getElementById('filter-location')?.value,
            status: document.getElementById('filter-status')?.value,
            from_date: document.getElementById('filter-from-date')?.value,
            to_date: document.getElementById('filter-to-date')?.value,
            // department: document.getElementById('filter-department')?.value,
            // Include other filters (e.g., status, date ranges) as needed
        };
    };

    console.log('Filters: ', getFilters());

    /**
     * Fetches and renders the asset data based on current state.
     */
    const fetchAndRenderData = async () => {
        const limit = parseInt(pageSizeSelect.value);
        const offset = (currentPage - 1) * limit;

        // Show loading state
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:#888;">Loading report data...</td></tr>`;

        try {
            const params = {
                ...currentFilters,
                limit: limit,
                offset: offset
            };

            const response = await API.get(reportEndpoint, params);
            const data = response.data;

            // console.log('Fetched data:', data);
            const totalCount = response.data.length || 0;

            // console.log('Total Count:', totalCount);

            totalPages = Math.ceil(totalCount / limit);

            renderTable(data);
            updatePaginationControls(totalCount);

        } catch (error) {
            console.error('Error fetching asset report:', error);
            showMessage('error', 'Failed to load asset report data.');
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

        tableBody.innerHTML = data.map(asset => `
            <tr>
                <td>${asset.id}</td>
                <td>${asset.asset_tag}</td>
                <td>${asset.type_name || 'N/A'}</td>
                <td>${asset.manufacturer}</td>
                <td>${asset.model}</td>
                <td>${asset.serial_number}</td>
                <td>${asset.status_name || 'N/A'}</td>
                <td>${asset.location || 'N/A'}</td>
                <td>${new Date(asset.purchase_date).toLocaleDateString()}</td>
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
        // console.log('Applying Filters: ', currentFilters);
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

    exportBtn.addEventListener('click', () => {
        //  Getting the current filters from the UI using the existing function
        const filters = getFilters();

        //  Removing pagination parameters (limit and offset) 
        // The backend must return ALL records when exporting.
        delete filters.limit;
        delete filters.offset;

        // Converting filters object into a URL query string
        const exportQuery = new URLSearchParams(filters).toString();

        //  Constructing the full export URL
        const exportURL = `/api${reportEndpoint}/export?${exportQuery}`;

        // Triggering the file download by navigating the browser to the URL.
        // The browser automatically attaches the authentication cookie to this request.
        window.open(exportURL, '_blank');
    });
});