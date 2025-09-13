const form = document.getElementById("assetForm");
    const notification = document.getElementById("notification");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        asset_tag: document.getElementById("asset_tag").value.trim(),
        asset_type: document.getElementById("asset_type").value,
        manufacturer: document.getElementById("manufacturer").value.trim(),
        model: document.getElementById("model").value.trim(),
        serial_number: document.getElementById("serial_number").value.trim(),
        status: document.getElementById("status").value,
        location: document.getElementById("location").value.trim(),
        purchase_date: document.getElementById("purchase_date").value,
        purchase_price: parseFloat(document.getElementById("purchase_price").value),
        notes: document.getElementById("notes").value.trim(),
      };

      try {
        const res = await apiFetch("/api/assets", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to save asset");

        await res.json();
        showNotification("Asset created successfully ✅", "success");
        form.reset();
      } catch (err) {
        console.error(err);
        showNotification("Error creating asset ❌", "error");
      }
    });

    function showNotification(msg, type) {
      notification.textContent = msg;
      notification.className = "notification " + type;
      notification.style.display = "block";
      setTimeout(() => {
        notification.style.display = "none";
      }, 3000);
    }