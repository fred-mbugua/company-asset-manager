// assets/js/api.js

// -----------------------------
// CONFIG
// -----------------------------
const API_BASE = "http://localhost:5000/api"; // change this to match your Node.js backend

// -----------------------------
// TOKEN HELPERS
// -----------------------------
function getAccessToken() {
  return localStorage.getItem("accessToken") || null;
}

function setAccessToken(token) {
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
}

// -----------------------------
// FETCH WRAPPER
// -----------------------------
async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  headers["Content-Type"] = headers["Content-Type"] || "application/json";
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    setAccessToken(null);
    window.location.href = "login.html"; // redirect on expired/invalid token
  }

  return res;
}

// -----------------------------
// AUTH HELPERS
// -----------------------------
async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw await res.json().catch(() => ({ error: "Login failed" }));
  }

  const data = await res.json();
  setAccessToken(data.accessToken);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data.user;
}

function logout() {
  setAccessToken(null);
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

function isLoggedIn() {
  return !!getAccessToken();
}

function getUser() {
  return JSON.parse(localStorage.getItem("user") || "null");
}
