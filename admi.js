const STORAGE_KEY = "surakshamap-reports-v1";
const SESSION_KEY = "surakshamap-admin-session";
const DEMO_USER = "admin";
const DEMO_PASSWORD = "suraksha2026";
const labels = {
  open: "Open",
  under_review: "Under review",
  resolved: "Resolved",
};

function getReports() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}
function escapeHtml(value) {
  const d = document.createElement("div");
  d.textContent = value ?? "";
  return d.innerHTML;
}
function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}
function render() {
  const reports = getReports();
  document.getElementById("admin-total").textContent = reports.length;
  document.getElementById("admin-open").textContent = reports.filter(
    (r) => r.status === "open",
  ).length;
  document.getElementById("admin-review").textContent = reports.filter(
    (r) => r.status === "under_review",
  ).length;
  document.getElementById("admin-resolved").textContent = reports.filter(
    (r) => r.status === "resolved",
  ).length;
  document.getElementById("admin-report-table").innerHTML =
    reports
      .slice()
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .map(
        (r) =>
          `<tr><td><code>${escapeHtml(r.token)}</code></td><td>${escapeHtml(r.category)}<br><span class="muted">${escapeHtml(r.description)}</span></td><td>${escapeHtml(r.severity)}</td><td>${new Date(r.submittedAt).toLocaleString("en-IN")}</td><td><select class="status-select" data-id="${escapeHtml(r.id)}"><option value="open" ${r.status === "open" ? "selected" : ""}>Open</option><option value="under_review" ${r.status === "under_review" ? "selected" : ""}>Under review</option><option value="resolved" ${r.status === "resolved" ? "selected" : ""}>Resolved</option></select></td></tr>`,
      )
      .join("") ||
    `<tr><td colspan="5" class="muted">No reports saved in this browser.</td></tr>`;
  document.querySelectorAll(".status-select").forEach((s) =>
    s.addEventListener("change", () => {
      const rs = getReports();
      const r = rs.find((x) => x.id === s.dataset.id);
      if (r) {
        r.status = s.value;
        saveReports(rs);
        render();
      }
    }),
  );
}
function setScreen() {
  document.getElementById("login-card").hidden = isLoggedIn();
  document.getElementById("admin-panel").hidden = !isLoggedIn();
  if (isLoggedIn()) render();
}
document.getElementById("admin-login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const u = document.getElementById("admin-username").value.trim();
  const p = document.getElementById("admin-password").value;
  const err = document.getElementById("login-error");
  if (u === DEMO_USER && p === DEMO_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, "1");
    err.textContent = "";
    setScreen();
  } else err.textContent = "Incorrect demo username or password.";
});
document.getElementById("admin-logout").addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  setScreen();
});
setScreen();
