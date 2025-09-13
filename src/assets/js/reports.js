function showForm(type) {
    document.querySelectorAll(".report-form").forEach(f => f.style.display = "none");
    document.getElementById(type + "-form").style.display = "block";
    document.getElementById("report-output").innerHTML = "";
  }

  async function fetchEmployeeReport() {
    const id = document.getElementById("employeeId").value.trim();
    if (!id) return alert("Enter Employee ID");
    try {
      const res = await apiFetch(`/api/reports/assets/employee/${id}`);
      if (!res.ok) throw new Error("Failed to fetch employee report");
      const data = await res.json();

      let html = `<h3>Employee: ${data.employee.full_name}</h3>`;
      if (!data.assets || data.assets.length === 0) {
        html += `<p style="color:#888;">No assets assigned.</p>`;
      } else {
        html += `<table><thead><tr>
          <th>ID</th><th>Asset Tag</th><th>Type</th><th>Assignment Date</th>
        </tr></thead><tbody>`;
        data.assets.forEach(a => {
          html += `<tr><td>${a.id}</td><td>${a.asset_tag}</td><td>${a.asset_type || ""}</td><td>${a.assignment_date}</td></tr>`;
        });
        html += `</tbody></table>`;
      }
      document.getElementById("report-output").innerHTML = html;
    } catch (err) {
      document.getElementById("report-output").innerHTML = `<p style="color:red;">Error loading report</p>`;
    }
  }

  async function fetchBranchReport() {
    const loc = document.getElementById("branchLocation").value.trim();
    if (!loc) return alert("Enter Branch Location");
    try {
      const res = await apiFetch(`/api/reports/assets/branch/${encodeURIComponent(loc)}`);
      if (!res.ok) throw new Error("Failed to fetch branch report");
      const data = await res.json();

      let html = `<h3>Assets in Branch: ${loc}</h3>`;
      if (!data || data.length === 0) {
        html += `<p style="color:#888;">No assets found.</p>`;
      } else {
        html += `<table><thead><tr>
          <th>ID</th><th>Asset Tag</th><th>Type</th><th>Location</th>
        </tr></thead><tbody>`;
        data.forEach(a => {
          html += `<tr><td>${a.id}</td><td>${a.asset_tag}</td><td>${a.asset_type || ""}</td><td>${a.location || ""}</td></tr>`;
        });
        html += `</tbody></table>`;
      }
      document.getElementById("report-output").innerHTML = html;
    } catch (err) {
      document.getElementById("report-output").innerHTML = `<p style="color:red;">Error loading report</p>`;
    }
  }

  async function fetchExpensesReport() {
    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;
    if (!start || !end) return alert("Select start and end dates");
    try {
      const res = await apiFetch(`/api/reports/expenses/time-period?startDate=${start}&endDate=${end}`);
      if (!res.ok) throw new Error("Failed to fetch expenses report");
      const data = await res.json();

      let html = `<h3>Expenses from ${start} to ${end}</h3>`;
      if (!data || data.length === 0) {
        html += `<p style="color:#888;">No expenses found.</p>`;
      } else {
        html += `<table><thead><tr>
          <th>ID</th><th>Asset ID</th><th>Type</th><th>Amount</th><th>Date</th>
        </tr></thead><tbody>`;
        data.forEach(e => {
          html += `<tr><td>${e.id}</td><td>${e.asset_id}</td><td>${e.expense_type || ""}</td><td>${e.amount}</td><td>${e.date}</td></tr>`;
        });
        html += `</tbody></table>`;
      }
      document.getElementById("report-output").innerHTML = html;
    } catch (err) {
      document.getElementById("report-output").innerHTML = `<p style="color:red;">Error loading report</p>`;
    }
  }