const STORAGE_KEY = "surakshamap-reports-v2";
const CENTER = [19.1234, 72.9876];
const riskApi = window.SurakshaMapRisk;
const GROUPING_RADIUS = 200;

const RISK_COLORS = {
  Low: "#3F9D5E",
  Medium: "#D9A32B",
  High: "#E07B34",
  Critical: "#C6423F",
};
const STATUS_LABELS = {
  open: "Open",
  under_review: "Under review",
  resolved: "Resolved",
};

let reports = [];
let map;
let mapMarkers = [];
let selectedPhotoDataUrl = null;

const demoReports = [
  {
    id: "demo-1",
    token: "SM-DEMO-0001",
    category: "Broken streetlight",
    description: "Streetlight near the college gate is not working.",
    latitude: 19.1234,
    longitude: 72.9876,
    severity: "high",
    submittedAt: daysAgoIso(1, 21),
    status: "open",
    photo: null,
  },
  {
    id: "demo-2",
    token: "SM-DEMO-0002",
    category: "Broken streetlight",
    description: "The same lane is dark after sunset.",
    latitude: 19.124,
    longitude: 72.9878,
    severity: "medium",
    submittedAt: daysAgoIso(2, 20),
    status: "under_review",
    photo: null,
  },
  {
    id: "demo-3",
    token: "SM-DEMO-0003",
    category: "Open manhole",
    description: "Open manhole near the footpath, unmarked at night.",
    latitude: 19.1238,
    longitude: 72.9877,
    severity: "critical",
    submittedAt: daysAgoIso(3, 10),
    status: "open",
    photo: null,
  },
  {
    id: "demo-4",
    token: "SM-DEMO-0004",
    category: "Waterlogging",
    description: "Water remains near the bus stop after rain.",
    latitude: 19.14,
    longitude: 72.99,
    severity: "medium",
    submittedAt: daysAgoIso(20, 12),
    status: "resolved",
    photo: null,
  },
];

function daysAgoIso(days, hour) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function generateToken() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (len) =>
    Array.from(
      { length: len },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return `SM-${part(4)}-${part(4)}`;
}

function loadReports() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoReports));
    return demoReports;
  } catch (error) {
    console.warn("Local storage unavailable, using in-memory copy.", error);
    document.getElementById("storage-notice").hidden = false;
    return [...demoReports];
  }
}

function saveReports() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (error) {
    console.warn("Could not save reports", error);
    document.getElementById("storage-notice").hidden = false;
  }
}

/* ---------------- Navigation ---------------- */

function showView(viewName) {
  document
    .querySelectorAll(".view")
    .forEach((view) => view.classList.remove("active-view"));
  document.getElementById(`${viewName}-view`).classList.add("active-view");
  document
    .querySelectorAll(".nav-button")
    .forEach((button) =>
      button.classList.toggle("active", button.dataset.view === viewName),
    );
  document.getElementById("main-nav").classList.remove("nav-open");
  document.getElementById("nav-toggle").setAttribute("aria-expanded", "false");

  if (viewName === "map") {
    setTimeout(() => {
      drawMap();
      map?.invalidateSize();
    }, 50);
  }
  if (viewName === "dashboard") renderDashboard();
  if (viewName === "home") renderHome();
}

document
  .querySelectorAll("[data-view]")
  .forEach((button) =>
    button.addEventListener("click", () => showView(button.dataset.view)),
  );

const navToggle = document.getElementById("nav-toggle");
navToggle.addEventListener("click", () => {
  const nav = document.getElementById("main-nav");
  const open = nav.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(open));
});

/* ---------------- Photo capture ---------------- */

const photoInput = document.getElementById("photo-input");
const photoPreview = document.getElementById("photo-preview");
const photoFileName = document.getElementById("photo-file-name");
const removePhotoButton = document.getElementById("remove-photo");

photoInput.addEventListener("change", () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    photoFileName.textContent = "Please choose an image file.";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const maxWidth = 900;
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      selectedPhotoDataUrl = canvas.toDataURL("image/jpeg", 0.72);

      photoPreview.src = selectedPhotoDataUrl;
      photoPreview.hidden = false;
      photoFileName.textContent = file.name;
      removePhotoButton.hidden = false;
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

removePhotoButton.addEventListener("click", () => {
  selectedPhotoDataUrl = null;
  photoInput.value = "";
  photoPreview.hidden = true;
  photoPreview.src = "";
  photoFileName.textContent = "No photo selected";
  removePhotoButton.hidden = true;
});

/* ---------------- Location ---------------- */

document.getElementById("use-location").addEventListener("click", () => {
  const status = document.getElementById("location-status");
  if (!navigator.geolocation) {
    status.textContent =
      "Geolocation is not supported on this device. Enter coordinates manually.";
    return;
  }
  status.textContent = "Locating…";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      document.getElementById("latitude").value =
        position.coords.latitude.toFixed(5);
      document.getElementById("longitude").value =
        position.coords.longitude.toFixed(5);
      status.textContent = "Location captured from your device.";
    },
    () => {
      status.textContent =
        "Could not get your location. Enter coordinates manually.";
    },
  );
});

/* ---------------- Report submission ---------------- */

document.getElementById("report-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const latitude = Number(document.getElementById("latitude").value);
  const longitude = Number(document.getElementById("longitude").value);
  const message = document.getElementById("form-message");

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    message.textContent =
      "Enter a valid latitude (-90 to 90) and longitude (-180 to 180).";
    message.className = "form-message full-width error";
    return;
  }

  const report = {
    id: `report-${Date.now()}`,
    token: generateToken(),
    category: document.getElementById("category").value,
    severity: document.getElementById("severity").value,
    description: document.getElementById("description").value.trim(),
    latitude: Math.round(latitude * 10000) / 10000,
    longitude: Math.round(longitude * 10000) / 10000,
    submittedAt: new Date().toISOString(),
    status: "open",
    photo: selectedPhotoDataUrl,
  };

  reports.push(report);
  saveReports();

  message.innerHTML = `Report submitted. Your tracking token is <span class="tracking-token">${report.token}</span> — save it to check status later.`;
  message.className = "form-message full-width success";

  event.target.reset();
  document.getElementById("severity").value = "medium";
  document.getElementById("latitude").value = "19.1234";
  document.getElementById("longitude").value = "72.9876";
  document.getElementById("location-status").textContent =
    "Enter coordinates or use your device location.";
  removePhotoButton.click();

  renderHome();
});

/* ---------------- Tracking ---------------- */

document.getElementById("track-button").addEventListener("click", trackReport);
document.getElementById("tracking-token").addEventListener("keydown", (e) => {
  if (e.key === "Enter") trackReport();
});

function trackReport() {
  const input = document.getElementById("tracking-token");
  const result = document.getElementById("tracking-result");
  const token = input.value.trim().toUpperCase();

  if (!token) {
    result.innerHTML = `<p class="form-message error">Enter a tracking token.</p>`;
    return;
  }

  const report = reports.find((r) => r.token === token);
  if (!report) {
    result.innerHTML = `<p class="form-message error">No report found for that token in this browser.</p>`;
    return;
  }

  const nearby = reports.filter(
    (r) =>
      r.id !== report.id &&
      riskApi.distanceInMeters(
        report.latitude,
        report.longitude,
        r.latitude,
        r.longitude,
      ) <= GROUPING_RADIUS,
  );
  const risk = riskApi.calculateRiskScore(report, nearby);
  const submitted = new Date(report.submittedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  result.innerHTML = `
    <div class="tracking-card">
      <div class="tracking-card-head">
        <span class="tracking-token">${report.token}</span>
        <span class="status-pill ${report.status}">${STATUS_LABELS[report.status]}</span>
      </div>
      <p><strong>${escapeHtml(report.category)}</strong> &middot; ${report.severity} severity</p>
      <p class="muted">${escapeHtml(report.description)}</p>
      <p class="muted">Submitted ${submitted}</p>
      ${report.photo ? `<img class="tracking-photo" src="${report.photo}" alt="Photo submitted with report" />` : ""}
      <div class="risk-line"><span class="badge ${risk.riskLevel}">${risk.riskLevel} risk</span><span class="muted">score ${risk.score}</span></div>
      <p class="recommendation">${escapeHtml(risk.recommendation)}</p>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

/* ---------------- Home ---------------- */

function renderHome() {
  const open = reports.filter((r) => r.status !== "resolved").length;
  document.getElementById("home-open-count").textContent = open;
  const hotspots = riskApi.groupReportsIntoHotspots(
    reports.filter((r) => r.status !== "resolved"),
    { groupingRadiusMeters: GROUPING_RADIUS },
  );
  document.getElementById("home-hotspot-count").textContent = hotspots.length;
}

/* ---------------- Map ---------------- */

function drawMap() {
  if (!map) {
    map = L.map("map").setView(CENTER, 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
  }

  mapMarkers.forEach((marker) => map.removeLayer(marker));
  mapMarkers = [];

  const categoryFilter = document.getElementById("map-filter").value;
  const statusFilter = document.getElementById("status-filter").value;

  const visible = reports.filter(
    (r) =>
      (categoryFilter === "all" || r.category === categoryFilter) &&
      (statusFilter === "all" || r.status === statusFilter),
  );

  visible.forEach((report) => {
    const nearby = visible.filter(
      (r) =>
        r.id !== report.id &&
        riskApi.distanceInMeters(
          report.latitude,
          report.longitude,
          r.latitude,
          r.longitude,
        ) <= GROUPING_RADIUS,
    );
    const risk = riskApi.calculateRiskScore(report, nearby);
    const color = RISK_COLORS[risk.riskLevel];

    const icon = L.divIcon({
      className: "map-pin",
      html: `<span class="map-pin-dot" style="background:${color}"></span>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const marker = L.marker([report.latitude, report.longitude], {
      icon,
    }).addTo(map);
    marker.bindPopup(`
      <div class="map-popup">
        ${report.photo ? `<img src="${report.photo}" alt="Report photo" />` : ""}
        <strong>${escapeHtml(report.category)}</strong>
        <p>${escapeHtml(report.description)}</p>
        <p class="muted">Severity: ${report.severity} &middot; Status: ${STATUS_LABELS[report.status]}</p>
        <p><span class="badge ${risk.riskLevel}">${risk.riskLevel}</span> score ${risk.score}</p>
        <p class="recommendation">${escapeHtml(risk.recommendation)}</p>
      </div>
    `);
    mapMarkers.push(marker);
  });
}

document.getElementById("map-filter").addEventListener("change", drawMap);
document.getElementById("status-filter").addEventListener("change", drawMap);

/* ---------------- Dashboard ---------------- */

function renderDashboard() {
  const total = reports.length;
  const open = reports.filter((r) => r.status === "open").length;
  const underReview = reports.filter((r) => r.status === "under_review").length;
  const resolved = reports.filter((r) => r.status === "resolved").length;

  const activeHotspots = riskApi.groupReportsIntoHotspots(
    reports.filter((r) => r.status !== "resolved"),
    { groupingRadiusMeters: GROUPING_RADIUS },
  );
  const highRisk = activeHotspots.filter(
    (h) => h.riskLevel === "High" || h.riskLevel === "Critical",
  ).length;

  document.getElementById("total-reports").textContent = total;
  document.getElementById("open-reports").textContent = open;
  document.getElementById("under-review-reports").textContent = underReview;
  document.getElementById("high-hotspots").textContent = highRisk;
  document.getElementById("resolved-reports").textContent = resolved;

  const hotspotList = document.getElementById("hotspot-list");
  hotspotList.innerHTML = activeHotspots.length
    ? activeHotspots
        .slice(0, 6)
        .map(
          (h) => `
        <div class="hotspot-card">
          <div class="hotspot-card-head">
            <span class="badge ${h.riskLevel}">${h.riskLevel}</span>
            <strong>${escapeHtml(h.dominantCategory)}</strong>
            <span class="muted">score ${h.score}</span>
          </div>
          <p>${escapeHtml(h.explanation)}</p>
          <p class="recommendation">${escapeHtml(h.recommendation)}</p>
        </div>`,
        )
        .join("")
    : `<p class="muted">No active hotspots right now.</p>`;

  const categoryCounts = {};
  reports.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });
  const maxCount = Math.max(1, ...Object.values(categoryCounts));
  const categoryList = document.getElementById("category-list");
  categoryList.innerHTML = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([category, count]) => `
      <div class="bar-row">
        <div class="bar-label"><span>${escapeHtml(category)}</span><span>${count}</span></div>
        <div class="bar"><span style="width:${(count / maxCount) * 100}%"></span></div>
      </div>`,
    )
    .join("");

  renderReportTable();
}

function renderReportTable() {
  const table = document.getElementById("report-table");
  const sorted = [...reports].sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
  );

  table.innerHTML = sorted
    .map((report) => {
      const nearby = reports.filter(
        (r) =>
          r.id !== report.id &&
          riskApi.distanceInMeters(
            report.latitude,
            report.longitude,
            r.latitude,
            r.longitude,
          ) <= GROUPING_RADIUS,
      );
      const risk = riskApi.calculateRiskScore(report, nearby);
      return `
        <tr>
          <td><code>${report.token}</code></td>
          <td>${report.photo ? `<img class="table-thumb" src="${report.photo}" alt="Report photo" />` : "&mdash;"}</td>
          <td>${escapeHtml(report.category)}<br /><span class="muted">${report.severity}</span></td>
          <td><span class="badge ${risk.riskLevel}">${risk.riskLevel}</span></td>
          <td><span class="status-pill ${report.status}">${STATUS_LABELS[report.status]}</span></td>
          <td>
            <select class="status-select" data-id="${report.id}">
              <option value="open" ${report.status === "open" ? "selected" : ""}>Open</option>
              <option value="under_review" ${report.status === "under_review" ? "selected" : ""}>Under review</option>
              <option value="resolved" ${report.status === "resolved" ? "selected" : ""}>Resolved</option>
            </select>
          </td>
        </tr>`;
    })
    .join("");

  table.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", () => {
      const report = reports.find((r) => r.id === select.dataset.id);
      if (report) {
        report.status = select.value;
        saveReports();
        renderDashboard();
        renderHome();
      }
    });
  });
}

/* ---------------- Init ---------------- */

reports = loadReports();
renderHome();
