// public/assets/js/reports.js

function showForm(type) {
    ['employee-form', 'branch-form', 'expenses-form'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    document.getElementById(`${type}-form`).style.display = 'block';
    document.getElementById('report-output').innerHTML = '';
}

async function generateReport(endpoint, params) {
    const outputDiv = document.getElementById('report-output');
    outputDiv.innerHTML = '<p style="text-align:center;">Generating report...</p>';
    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await API.get(`/reports/${endpoint}?${queryString}`);
        
        if (response.data && response.data.reportHtml) {
            outputDiv.innerHTML = response.data.reportHtml; // Server returns pre-rendered HTML
        } else if (response.data) {
            outputDiv.innerHTML = '<h4>Report Data:</h4>' + JSON.stringify(response.data, null, 2);
        } else {
            outputDiv.innerHTML = '<p>No data found for this report.</p>';
        }
        showMessage('success', 'Report generated successfully.');
    } catch (error) {
        outputDiv.innerHTML = '<p style="color:red;">Error generating report.</p>';
        showMessage('error', error.message || 'Failed to generate report.');
    }
}

window.showForm = showForm;
window.fetchEmployeeReport = () => {
    const employeeId = document.getElementById('employeeId').value;
    if (!employeeId) return showMessage('error', 'Please enter an Employee ID.');
    generateReport('employee-assets', { employeeId });
};

window.fetchBranchReport = () => {
    const branchId = document.getElementById('branchId').value;
    if (!branchId) return showMessage('error', 'Please enter a Branch ID.');
    generateReport('branch-assets', { branchId });
};

window.fetchExpensesReport = () => {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    if (!startDate || !endDate) return showMessage('error', 'Please select both start and end dates.');
    generateReport('expenses-period', { startDate, endDate });
};