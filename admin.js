const ADMIN_SESSION_KEY = "surakshamap-admin-session";
const STORAGE_KEY = "surakshamap-reports-v2";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "suraksha2026";

const STATUS_LABELS = {
  pending: "Pending approval",
  open: "Open",
  under_review: "Under review",
  resolved: "Resolved",
  closed: "Closed",
  rejected: "Rejected",
};

const ADMIN_STATUSES = [
  "open",
  "under_review",
  "resolved",
  "closed",
  "rejected",
];

const loginCard = document.getElementById("login-card");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("admin-login-form");
const loginError = document.getElementById("login-error");
const reportTable = document.getElementById("admin-report-table");

function isLoggedIn() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

function showAdmin() {
  loginCard.hidden = true;
  adminPanel.hidden = false;
  renderAdmin();
}

function showLogin() {
  loginCard.hidden = false;
  adminPanel.hidden = true;
}

function getReports() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const reports = saved ? JSON.parse(saved) : [];
    return reports.map((report) => ({
      ...report,
      approved:
        typeof report.approved === "boolean"
          ? report.approved
          : report.status !== "pending",
      status: report.status || "pending",
    }));
  } catch (error) {
    console.error("Could not load reports", error);
    return [];
  }
}

function saveReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function renderAdmin() {
  const reports = getReports();

  const pending = reports.filter((r) => !r.approved).length;
  const approved = reports.filter((r) => r.approved).length;
  const open = reports.filter((r) => r.approved && r.status === "open").length;
  const review = reports.filter(
    (r) => r.approved && r.status === "under_review",
  ).length;
  const resolved = reports.filter(
    (r) => r.approved && r.status === "resolved",
  ).length;

  document.getElementById("admin-pending").textContent = pending;
  document.getElementById("admin-approved").textContent = approved;
  document.getElementById("admin-open").textContent = open;
  document.getElementById("admin-review").textContent = review;
  document.getElementById("admin-resolved").textContent = resolved;

  const sorted = [...reports].sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
  );

  reportTable.innerHTML = sorted.length
    ? sorted
        .map((report) => {
          const submitted = new Date(report.submittedAt).toLocaleString(
            "en-IN",
            { dateStyle: "medium", timeStyle: "short" },
          );
          const statusOptions = ADMIN_STATUSES.map(
            (status) =>
              `<option value="${status}" ${report.status === status ? "selected" : ""}>${STATUS_LABELS[status]}</option>`,
          ).join("");

          return `
          <tr>
            <td><code>${escapeHtml(report.token)}</code></td>
            <td>
              <strong>${escapeHtml(report.category)}</strong><br />
              <span class="muted">${escapeHtml(report.description || "")}</span>
            </td>
            <td>${escapeHtml(report.severity)}</td>
            <td>${submitted}</td>
            <td><span class="status-pill ${report.status}">${STATUS_LABELS[report.status] || report.status}</span></td>
            <td>
              ${
                report.approved
                  ? `<span class="badge Low">Approved</span>`
                  : `<button class="primary-button admin-approve" type="button" data-id="${report.id}">Approve</button>`
              }
            </td>
            <td>
              <div class="admin-actions-cell">
                <select class="admin-status-select" data-id="${report.id}">
                  ${report.approved ? statusOptions : `<option value="pending" selected>Pending approval</option>`}
                </select>
                <button class="secondary-button admin-apply" type="button" data-id="${report.id}" ${report.approved ? "" : "disabled"}>Apply</button>
              </div>
            </td>
          </tr>
        `;
        })
        .join("")
    : `<tr><td colspan="7" class="muted">No reports have been submitted yet.</td></tr>`;

  reportTable.querySelectorAll(".admin-approve").forEach((button) => {
    button.addEventListener("click", () => approveReport(button.dataset.id));
  });

  reportTable.querySelectorAll(".admin-apply").forEach((button) => {
    button.addEventListener("click", () => {
      const select = reportTable.querySelector(
        `.admin-status-select[data-id="${button.dataset.id}"]`,
      );
      if (select) setAdminStatus(button.dataset.id, select.value);
    });
  });
}

function approveReport(id) {
  const reports = getReports();
  const report = reports.find((item) => item.id === id);
  if (!report) return;

  report.approved = true;
  report.status = "open";
  report.approvedAt = new Date().toISOString();
  report.approvedBy = "admin";

  saveReports(reports);
  renderAdmin();
}

function setAdminStatus(id, status) {
  if (!ADMIN_STATUSES.includes(status)) return;

  const reports = getReports();
  const report = reports.find((item) => item.id === id);
  if (!report || !report.approved) return;

  report.status = status;
  report.lastUpdatedAt = new Date().toISOString();
  report.lastUpdatedBy = "admin";

  saveReports(reports);
  renderAdmin();
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.getElementById("admin-username").value.trim();
  const password = document.getElementById("admin-password").value;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    loginError.textContent = "";
    showAdmin();
  } else {
    loginError.textContent = "Invalid admin credentials.";
  }
});

document.getElementById("admin-logout").addEventListener("click", () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  showLogin();
});

window.addEventListener("storage", () => {
  if (isLoggedIn()) renderAdmin();
});

if (isLoggedIn()) showAdmin();
else showLogin();