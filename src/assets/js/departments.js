// Elements
const deptForm = document.getElementById("department-form");
const deptName = document.getElementById("name");
const deptId = document.getElementById("department_id");
const messageBox = document.getElementById("form-message");
const tableBody = document.getElementById("department-table-body");

// =====================
// Load departments on page load
// =====================
document.addEventListener("DOMContentLoaded", loadDepartments);

async function loadDepartments() {
  tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">Loading...</td></tr>`;

  try {
    const res = await apiFetch("/departments", { method: "GET" });
    const data = await res.json();

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">No departments found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = "";
    data.forEach(dept => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${dept.id}</td>
        <td>${dept.name}</td>
        <td>${formatDate(dept.created_at)}</td>
        <td>${formatDate(dept.updated_at)}</td>
        <td>
          <button class="btn-edit" onclick="editDepartment(${dept.id}, '${dept.name}')">Edit</button>
          <button class="btn-delete" onclick="deleteDepartment(${dept.id})">Delete</button>
        </td>
      `;

      tableBody.appendChild(row);
    });

  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Error loading data</td></tr>`;
  }
}

// =====================
// Save / Update department
// =====================
deptForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (deptName.value.trim() === "") {
    showMessage("Name is required", "error");
    return;
  }

  const payload = { name: deptName.value.trim() };
  const isEditing = deptId.value !== "";

  try {
    let res;

    if (isEditing) {
      // Update
      res = await apiFetch(`/departments/${deptId.value}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      // Create
      res = await apiFetch("/departments", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) throw new Error("Request failed");

    showMessage(isEditing ? "Department updated successfully!" : "Department created successfully!", "success");

    resetForm();
    loadDepartments();

  } catch (err) {
    showMessage("Server error: " + err.message, "error");
  }
});

// =====================
// Edit (fill form)
// =====================
window.editDepartment = function (id, name) {
  deptId.value = id;
  deptName.value = name;

  showMessage("Editing department...", "success");
};

// =====================
// Delete
// =====================
window.deleteDepartment = async function (id) {
  if (!confirm("Are you sure you want to delete this department?")) return;

  try {
    const res = await apiFetch(`/departments/${id}`, { method: "DELETE" });

    if (!res.ok) throw new Error("Delete failed");

    showMessage("Department deleted successfully!", "success");
    loadDepartments();

  } catch (err) {
    showMessage("Server error: " + err.message, "error");
  }
};

// =====================
// Reset form
// =====================
function resetForm() {
  deptId.value = "";
  deptName.value = "";
  messageBox.textContent = "";
  messageBox.className = "message";
}

// =====================
// Helper: format date
// =====================
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString();
}

// =====================
// Helper: show messages
// =====================
function showMessage(msg, type) {
  messageBox.textContent = msg;
  messageBox.className = "message " + type;
}
