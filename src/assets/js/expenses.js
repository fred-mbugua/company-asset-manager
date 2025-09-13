async function loadAssets() {
    try {
      const res = await apiFetch("/api/assets");
      if (!res.ok) throw new Error("Failed to load assets");
      const assets = await res.json();

      const select = document.getElementById("asset_id");
      assets.forEach(a => {
        const option = document.createElement("option");
        option.value = a.id;
        option.textContent = `${a.asset_tag} (${a.asset_type})`;
        select.appendChild(option);
      });
    } catch (err) {
      console.error(err);
      showAlert("Error loading assets", "error");
    }
  }

  document.getElementById("expense-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      asset_id: parseInt(document.getElementById("asset_id").value),
      expense_type: document.getElementById("expense_type").value,
      date: document.getElementById("date").value,
      amount: parseFloat(document.getElementById("amount").value),
      vendor: document.getElementById("vendor").value,
      invoice_number: document.getElementById("invoice_number").value,
      notes: document.getElementById("notes").value,
    };

    try {
      const res = await apiFetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showAlert("Expense created successfully!", "success");
        document.getElementById("expense-form").reset();
      } else {
        const errMsg = await res.text();
        showAlert("Failed to create expense: " + errMsg, "error");
      }
    } catch (err) {
      showAlert("Error creating expense: " + err.message, "error");
    }
  });

  document.getElementById("cancel-btn").addEventListener("click", () => {
    if (typeof loadContent === "function") {
      loadContent("dashboard");
    } else {
      window.history.back();
    }
  });

  function showAlert(msg, type) {
    const alertDiv = document.getElementById("form-alert");
    alertDiv.className = "alert " + (type === "success" ? "alert-success" : "alert-error");
    alertDiv.textContent = msg;
  }

  loadAssets();