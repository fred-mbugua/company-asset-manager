// Load branches when page loads
document.addEventListener("DOMContentLoaded", loadBranches);

// Save or update branch
document.getElementById("branch-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("branch_id").value;
  const name = document.getElementById("name").value.trim();
  const location = document.getElementById("location").value.trim();

  const msg = document.getElementById("form-message");

  if (!name || !location) {
    msg.textContent = "Please fill all fields!";
    msg.className = "message error";
    return;
  }

  const payload = { name, location };

  try {
    if (id === "") {
      // CREATE Branch
      await apiFetch("/branches", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      msg.textContent = "Branch created successfully ✓";
    } else {
      // UPDATE Branch
      await apiFetch(`/branches/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      msg.textContent = "Branch updated successfully ✓";
    }

    msg.className = "message success";

    resetForm();
    loadBranches();

  } catch (error) {
    msg.textContent = "Error saving branch!";
    msg.className = "message error";
  }
});

// Load branches into table
async function loadBranches() {
  const body = document.getElementById("branch-table-body");
  body.innerHTML = `<tr><td colspan="6" style="text-align:center;">Loading...</td></tr>`;

  try {
    const res = await apiFetch("/branches");
    const branches = await res.json();

    if (branches.length === 0) {
      body.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#777;">No branches found</td></tr>`;
      return;
    }

    body.innerHTML = "";
    branches.forEach(branch => {
      body.innerHTML += `
        <tr>
          <td>${branch.id}</td>
          <td>${branch.name}</td>
          <td>${branch.location}</td>
          <td>${DateUtils.formatDateTime(branch.created_at)}</td>
          <td>${DateUtils.formatDateTime(branch.updated_at)}</td>
          <td>
            <button class="action-btn btn-edit" onclick="editBranch(${branch.id})">Edit</button>
            <button class="action-btn btn-delete" onclick="deleteBranch(${branch.id})">Delete</button>
          </td>
        </tr>
      `;
    });

  } catch (error) {
    body.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red;">Failed to load branches</td></tr>`;
  }
}

// Edit branch
async function editBranch(id) {
  const res = await apiFetch(`/branches/${id}`);
  const branch = await res.json();

  document.getElementById("branch_id").value = branch.id;
  document.getElementById("name").value = branch.name;
  document.getElementById("location").value = branch.location;

  document.getElementById("form-message").style.display = "none";
}

// Delete branch
async function deleteBranch(id) {
  if (!confirm("Are you sure you want to delete this branch?")) return;

  await apiFetch(`/branches/${id}`, { method: "DELETE" });

  loadBranches();
}

// Reset form
function resetForm() {
  document.getElementById("branch_id").value = "";
  document.getElementById("name").value = "";
  document.getElementById("location").value = "";
  document.getElementById("form-message").style.display = "none";
}
