const form = document.getElementById("user-form");
    const messageEl = document.getElementById("form-message");
    const userTable = document.getElementById("user-table-body");

    // Load users
    async function loadUsers() {
      try {
        const res = await apiFetch("/api/users");
        if (!res.ok) throw new Error("Failed to load users");
        const users = await res.json();
        renderUsers(users);
      } catch (err) {
        console.error(err);
        userTable.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Error loading users</td></tr>`;
      }
    }

    function renderUsers(users) {
      userTable.innerHTML = "";
      if (!users || users.length === 0) {
        userTable.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">No users found</td></tr>`;
        return;
      }
      users.forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${u.id}</td>
          <td>${u.first_name}</td>
          <td>${u.middle_name}</td>
          <td>${u.last_name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>
            <button class="btn btn-edit" 
              onclick="editUser(${u.id}, '${u.first_name}', '${u.middle_name}', '${u.last_name}', '${u.email}', '${u.role}')">
              Edit
            </button>
            <button class="btn btn-delete" onclick="deleteUser(${u.id})">Delete</button>
          </td>
        `;
        userTable.appendChild(tr);
      });
    }

    // Handle form submit
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const userId = document.getElementById("user_id").value;
      const userData = {
        first_name: form.first_name.value.trim(),
        middle_name: form.middle_name.value.trim(),
        last_name: form.last_name.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value.trim(),
        role: form.role.value
      };

      try {
        let res;
        if (userId) {
          res = await apiFetch(`/api/users/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
          });
        } else {
          res = await apiFetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
          });
        }

        if (!res.ok) throw new Error("Save failed");

        messageEl.textContent = userId ? "User updated successfully!" : "User created successfully!";
        messageEl.className = "message success";
        form.reset();
        document.getElementById("user_id").value = "";
        loadUsers();
      } catch (err) {
        console.error(err);
        messageEl.textContent = "Error saving user.";
        messageEl.className = "message error";
      }
    });

    function resetForm() {
      form.reset();
      document.getElementById("user_id").value = "";
      messageEl.textContent = "";
    }

    // ✅ Fixed editUser to accept and set first/middle/last separately
    function editUser(id, first_name, middle_name, last_name, email, role) {
      document.getElementById("user_id").value = id;
      document.getElementById("first_name").value = first_name;
      document.getElementById("middle_name").value = middle_name;
      document.getElementById("last_name").value = last_name;
      document.getElementById("email").value = email;
      document.getElementById("role").value = role;
      messageEl.textContent = "Editing user...";
      messageEl.className = "message";
    }

    async function deleteUser(id) {
      if (!confirm("Delete this user?")) return;
      try {
        const res = await apiFetch(`/api/users/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
        alert("User deleted");
        loadUsers();
      } catch (err) {
        console.error(err);
        alert("Error deleting user");
      }
    }

    // Init
    loadUsers();