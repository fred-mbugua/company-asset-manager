document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('assignments-table-body');
    const searchBtn = document.getElementById('search-btn');
    const exportBtn = document.getElementById('export-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageSizeSelect = document.getElementById('page-size');
    const pageInfoSpan = document.getElementById('page-info');

    // State is initialized based on server-rendered EJS data (Page 1)
    let currentPage = parseInt(pageInfoSpan.textContent.match(/Page (\d+)/)?.[1] || '1', 10);
    let totalPages = parseInt(pageInfoSpan.textContent.match(/of (\d+)/)?.[1] || '1', 10);
    let currentFilters = {};
    const reportEndpoint = '/reports/assignments'; 
    const COLSPAN = 10; 

    const getFilters = () => {
        return {
            asset_tag: document.getElementById('filter-tag')?.value,
            department: document.getElementById('filter-department')?.value,
            employee_name: document.getElementById('filter-employee')?.value,
            location: document.getElementById('filter-location')?.value,
            from_date: document.getElementById('filter-from-date')?.value,
            to_date: document.getElementById('filter-to-date')?.value,
        };
    };

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
            
            const data = response.data.assignments;
            const totalCount = response.data.totalCount;

            totalPages = Math.ceil(totalCount / limit);

            renderTable(data);
            updatePaginationControls(totalCount);

        } catch (error) {
            console.error('Error fetching assignment report:', error);
            tableBody.innerHTML = `<tr><td colspan="${COLSPAN}" style="text-align:center;color:red;">Error loading data.</td></tr>`;
            updatePaginationControls(0);
        }
    };

    const renderTable = (data) => {
        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${COLSPAN}" style="text-align:center;color:#888;">No assignments found matching the criteria.</td></tr>`;
            return;
        }
        
        tableBody.innerHTML = data.map(assignment => `
            <tr>
                <td>${assignment.id}</td>
                <td>${assignment.asset_tag}</td>
                <td>${assignment.manufacturer}</td>
                <td>${assignment.model}</td>
                <td>${assignment.employee_name}</td>
                <td>${assignment.department}</td>
                <td>${DateUtils.formatDate(assignment.assignment_date)}</td> 
                <td title="${assignment.notes || ''}">${assignment.notes ? assignment.notes.substring(0, 50) + '...' : 'N/A'}</td>
                <td>${assignment.return_date ? DateUtils.formatDate(assignment.return_date) : 'N/A'}</td> 
            </tr>
        `).join('');
    };

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
    
    // Export button handler
    exportBtn.addEventListener('click', () => {
        const filters = getFilters();
        const exportQuery = new URLSearchParams(filters).toString();
        // Uses the separate /export endpoint defined in the controller
        window.open(`/api/reports/assignments/export?${exportQuery}`, '_blank'); 
    });

    // Since EJS loads the first page, set initial filters.
    currentFilters = getFilters();
});