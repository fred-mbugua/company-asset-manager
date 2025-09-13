// Load available assets (In Stock only)
async function loadAssets() {
    try {
      const res = await apiFetch("/api/assets");
      if (!res.ok) throw new Error("Failed to load assets");
      const assets = await res.json();

      const select = document.getElementById("asset-select");
      select.innerHTML = '<option value="">Select Asset</option>';
      assets
        .filter(a => a.status === "In Stock")
        .forEach(asset => {
          const opt = document.createElement("option");
          opt.value = asset.id;
          opt.textContent = `${asset.asset_tag} - ${asset.asset_type}`;
          select.appendChild(opt);
        });
    } catch (err) {
      console.error(err);
      alert("Error loading assets");
    }
  }

  // Load employees (👉 adjust endpoint if different in your API)
  async function loadEmployees() {
    try {
      const res = await apiFetch("/api/employees");
      if (!res.ok) throw new Error("Failed to load employees");
      const employees = await res.json();

      const select = document.getElementById("employee-select");
      select.innerHTML = '<option value="">Select Employee</option>';
      employees.forEach(emp => {
        const opt = document.createElement("option");
        opt.value = emp.id;
        opt.textContent = `${emp.name} (${emp.department || ""})`;
        select.appendChild(opt);
      });
    } catch (err) {
      console.error(err);
      alert("Error loading employees");
    }
  }

  // Load current assignments
  async function loadAssignments() {
    try {
      const res = await apiFetch("/api/assignments");
      if (!res.ok) throw new Error("Failed to load assignments");
      const assignments = await res.json();
      renderAssignments(assignments);
    } catch (err) {
      console.error(err);
      document.getElementById("assignment-table-body").innerHTML =
        `<tr><td colspan="6" style="text-align:center;color:red;">Error loading assignments</td></tr>`;
    }
  }

  // Render assignments table
  function renderAssignments(assignments) {
    const body = document.getElementById("assignment-table-body");
    body.innerHTML = "";

    if (!assignments || assignments.length === 0) {
      body.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888;">No assignments found</td></tr>`;
      return;
    }

    assignments.forEach(asg => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${asg.id}</td>
        <td>${asg.asset ? asg.asset.asset_tag : ""}</td>
        <td>${asg.employee ? asg.employee.name : ""}</td>
        <td>${asg.assigned_date || ""}</td>
        <td>${asg.return_date || ""}</td>
        <td>
          ${!asg.return_date ? `<button class="btn btn-return" data-id="${asg.id}">Return</button>` : ""}
          <button class="btn btn-view" data-id="${asg.id}">View</button>
          <button class="btn btn-delete" data-id="${asg.id}">Delete</button>
        </td>
      `;
      body.appendChild(tr);
    });

    // Return button
    document.querySelectorAll(".btn-return").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!confirm("Mark asset as returned?")) return;
        try {
          const res = await apiFetch(`/api/assignments/${id}/return`, { method: "PUT" });
          if (res.ok) {
            alert("Asset returned");
            loadAssignments();
            loadAssets(); // refresh available assets
          } else {
            alert("Failed to return asset");
          }
        } catch (err) {
          alert("Error returning asset");
        }
      });
    });

    // Delete button
    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!confirm("Delete this assignment?")) return;
        try {
          const res = await apiFetch(`/api/assignments/${id}`, { method: "DELETE" });
          if (res.ok) {
            alert("Assignment deleted");
            loadAssignments();
            loadAssets();
          } else {
            alert("Failed to delete assignment");
          }
        } catch (err) {
          alert("Error deleting assignment");
        }
      });
    });

    // View button
    document.querySelectorAll(".btn-view").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        alert("View assignment ID " + id);
        // 👉 could load a modal or another view later
      });
    });
  }

  // Handle form submit
  document.getElementById("assign-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const assetId = document.getElementById("asset-select").value;
    const employeeId = document.getElementById("employee-select").value;

    if (!assetId || !employeeId) {
      alert("Please select both asset and employee");
      return;
    }

    try {
      const res = await apiFetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_id: assetId, employee_id: employeeId })
      });
      if (res.ok) {
        alert("Asset assigned successfully");
        document.getElementById("assign-form").reset();
        loadAssignments();
        loadAssets();
      } else {
        alert("Failed to assign asset");
      }
    } catch (err) {
      console.error(err);
      alert("Error assigning asset");
    }
  });

  // Init
  loadAssets();
  loadEmployees();
  loadAssignments();