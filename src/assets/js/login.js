const form = document.getElementById("login-form");
const errorBox = document.getElementById("error");

form.onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const user = await login(email, password);
    errorBox.style.display = "none";
    window.location.href = "dashboard.html"; // redirect after login
  } catch (err) {
    errorBox.textContent = err.error || "Login failed";
    errorBox.style.display = "block";
  }
};
