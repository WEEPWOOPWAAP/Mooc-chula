/* HTML templates for every route + mount/update logic per view */

function fmtNum(n) {
  return Math.round(n).toLocaleString("en-US");
}
function fmtPct(n) {
  return n.toFixed(1) + "%";
}

function issueDotColor(issue) {
  return issue === "No Safety Glasses" ? "red" : "amber-dot";
}

/* ---------------- Camera scene (SVG illustration, no stock photos) ---------------- */
function cameraSceneSVG() {
  return `
  <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>
    </defs>
    <rect width="400" height="260" fill="url(#sky)"/>
    <rect y="200" width="400" height="60" fill="#1a2333"/>
    ${Array.from({ length: 10 })
      .map((_, i) => `<rect x="${i * 42}" y="60" width="6" height="150" fill="#475569" opacity="0.6"/>`)
      .join("")}
    <rect x="300" y="50" width="86" height="110" rx="6" fill="#f8fafc"/>
    <rect x="300" y="50" width="86" height="18" rx="6" fill="#ef4444"/>
    <text x="343" y="63" font-size="8" fill="#fff" text-anchor="middle" font-family="sans-serif" font-weight="700">SAFETY</text>
    ${[78, 92, 106, 120, 134, 148].map((y) => `<rect x="308" y="${y}" width="70" height="4" rx="2" fill="#cbd5e1"/>`).join("")}
    <polygon points="360,220 372,220 378,200 354,200" fill="#f97316"/>
    <rect x="363" y="182" width="6" height="20" fill="#f97316"/>
    <g id="worker-figure">
      <rect x="140" y="150" width="10" height="45" fill="#1e293b"/>
      <rect x="158" y="150" width="10" height="45" fill="#1e293b"/>
      <rect x="132" y="95" width="46" height="58" rx="6" fill="#f97316"/>
      <rect x="132" y="105" width="46" height="7" fill="#fff" opacity="0.85"/>
      <rect x="132" y="128" width="46" height="7" fill="#fff" opacity="0.85"/>
      <rect x="118" y="100" width="16" height="40" rx="6" fill="#f97316"/>
      <rect x="176" y="100" width="16" height="40" rx="6" fill="#fbbf24"/>
      <circle cx="155" cy="80" r="14" fill="#e7b892"/>
      <path d="M139 76 a16 14 0 0 1 32 0 z" fill="#facc15"/>
    </g>
  </svg>`;
}

function renderCameraCard() {
  const d = state.liveDetection;
  const failClass = d.status === "FAIL" ? "fail" : "";
  return `
  <div class="card live-card" style="grid-row: span 1;">
    <div class="live-head">
      <div class="panel-head" style="margin:0;">Live Monitoring – Main Gate</div>
      <div class="live-badge"><span class="live-dot"></span>LIVE</div>
    </div>
    <div class="cam-frame" id="cam-frame">
      ${cameraSceneSVG()}
      <div class="bbox ${failClass}" id="cam-bbox" style="left:29%; top:29%; width:19%; height:42%;">
        <span class="bbox-label" id="cam-bbox-label">${d.label}</span>
      </div>
      <div class="cam-tag">Camera 01 - Main Gate</div>
      <div class="cam-expand">⤢</div>
    </div>
  </div>`;
}

/* ---------------- Dashboard ---------------- */
function renderDashboard() {
  return `
  <div class="grid stat-row">
    <div class="card stat-card">
      <div class="stat-icon blue">▣</div>
      <div>
        <div class="stat-label">Total Scans</div>
        <div class="stat-value" id="stat-total-scans">${fmtNum(state.totalScans)}</div>
        <div class="stat-delta up" id="stat-total-scans-delta">↑ 12.5% vs yesterday</div>
      </div>
    </div>
    <div class="card stat-card">
      <div class="stat-icon green">✔</div>
      <div>
        <div class="stat-label">Compliance Rate</div>
        <div class="stat-value" id="stat-compliance">${fmtPct(state.complianceRate)}</div>
        <div class="stat-delta up">↑ 2.8% vs yesterday</div>
      </div>
    </div>
    <div class="card stat-card">
      <div class="stat-icon red">⚠</div>
      <div>
        <div class="stat-label">Failed Detections</div>
        <div class="stat-value" id="stat-failed">${fmtNum(state.failedDetections)}</div>
        <div class="stat-delta down">↓ 18.2% vs yesterday</div>
      </div>
    </div>
    <div class="card stat-card">
      <div class="stat-icon amber">🔔</div>
      <div>
        <div class="stat-label">Active Alerts</div>
        <div class="stat-value" id="stat-active-alerts">${fmtNum(state.activeAlerts)}</div>
        <a class="stat-link" href="#alerts">View all alerts →</a>
      </div>
    </div>
  </div>

  <div class="grid panel-row-1">
    <div class="card">
      <div class="panel-head">Daily Trend (Scans) <span class="period-pill">7 Days ⌄</span></div>
      <div class="chart-wrap"><canvas id="chart-daily-trend"></canvas></div>
      <div class="chart-legend"><span class="dot blue"></span> Scans</div>
    </div>
    <div class="card">
      <div class="panel-head">Compliance by Day (%) <span class="period-pill">7 Days ⌄</span></div>
      <div class="chart-wrap"><canvas id="chart-compliance-day"></canvas></div>
      <div class="chart-legend"><span class="dot green"></span> Compliance Rate</div>
    </div>
    <div class="card">
      <div class="panel-head">Alert Frequency <span class="period-pill">7 Days ⌄</span></div>
      <div class="chart-wrap"><canvas id="chart-alert-freq"></canvas></div>
      <div class="chart-legend"><span class="dot red"></span> Alerts</div>
    </div>
    ${renderCameraCard()}
  </div>

  <div class="grid panel-row-2">
    <div class="card dark-panel">
      <div class="panel-head" style="color:#fff;">Performance &amp; Feedback <span class="period-pill" style="background:transparent;color:#8b98bd;border-color:#2a3654;">7 Days ⌄</span></div>
      <div class="mini-stats">
        <div class="mini-stat"><div class="label">Total Scans</div><div class="value" id="mini-total-scans">${fmtNum(state.totalScans)}</div></div>
        <div class="mini-stat"><div class="label">Compliance Rate</div><div class="value green" id="mini-compliance">${fmtPct(state.complianceRate)}</div></div>
        <div class="mini-stat"><div class="label">Failed Detections</div><div class="value red" id="mini-failed">${fmtNum(state.failedDetections)}</div></div>
      </div>
      <div class="dark-grid-2">
        <div class="dark-box">
          <div class="panel-head">Daily Trend</div>
          <div class="chart-wrap" style="height:110px;"><canvas id="chart-mini-trend"></canvas></div>
        </div>
        <div class="dark-box">
          <div class="panel-head">Feedback / Alerts</div>
          <ul class="feedback-list">
            <li><span class="fname"><span class="fdot" style="background:#f59e0b"></span>PPE Compliance Alerts</span><span class="fcount">${state.feedback.ppeAlerts}</span></li>
            <li><span class="fname"><span class="fdot" style="background:#f59e0b"></span>Policy Violations</span><span class="fcount">${state.feedback.policyViolations}</span></li>
            <li><span class="fname"><span class="fdot" style="background:#22c55e"></span>System Notifications</span><span class="fcount">${state.feedback.systemNotifications}</span></li>
            <li><span class="fname"><span class="fdot" style="background:#3b82f6"></span>General Feedback</span><span class="fcount">${state.feedback.generalFeedback}</span></li>
          </ul>
        </div>
      </div>
    </div>

    <div id="status-cards-col" style="display:flex; flex-direction:column; gap:16px;">
      ${renderStatusCards()}
    </div>

    <div class="card">
      <div class="panel-head">Recent Alerts <a class="view-all" href="#alerts">View All →</a></div>
      <table class="table">
        <thead><tr><th>Time</th><th>Site Entry</th><th>Worker ID</th><th>Issue Detected</th></tr></thead>
        <tbody id="recent-alerts-body">
          ${renderAlertRows(state.recentAlerts.slice(0, 5))}
        </tbody>
      </table>
    </div>
  </div>

  <div class="grid donut-row">
    <div class="card">
      <div class="panel-head">Site Status <a class="view-all" href="#sites">View All →</a></div>
      <div class="donut-wrap">
        <div class="donut-canvas-box">
          <canvas id="chart-site-status"></canvas>
          <div class="donut-center"><div class="num">${state.sites.length}</div><div class="lbl">Total Sites</div></div>
        </div>
        <div class="legend-list">
          <div class="row"><span class="dot green"></span>${state.siteStatusCounts.active} Active</div>
          <div class="row"><span class="dot" style="background:#f59e0b"></span>${state.siteStatusCounts.warning} Warning</div>
          <div class="row"><span class="dot" style="background:#98a2b3"></span>${state.siteStatusCounts.offline} Offline</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="panel-head">Device Health <a class="view-all" href="#devices">View All →</a></div>
      <div class="donut-wrap">
        <div class="donut-canvas-box">
          <canvas id="chart-device-health"></canvas>
          <div class="donut-center"><div class="num">${state.devices.length}</div><div class="lbl">Total Devices</div></div>
        </div>
        <div class="legend-list">
          <div class="row"><span class="dot green"></span>${state.deviceHealthCounts.online} Online</div>
          <div class="row"><span class="dot" style="background:#f59e0b"></span>${state.deviceHealthCounts.warning} Warning</div>
          <div class="row"><span class="dot red"></span>${state.deviceHealthCounts.offline} Offline</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="panel-head">AI Model Accuracy <span class="period-pill">7 Days ⌄</span></div>
      <div style="display:flex; align-items:center; gap:6px;">
        <div class="stat-icon blue" style="width:38px;height:38px;">🧠</div>
        <div>
          <div class="accuracy-value" id="model-accuracy">${fmtPct(state.modelAccuracy)}</div>
          <div class="stat-label" style="margin:0;">Model Accuracy</div>
        </div>
      </div>
      <div class="stat-delta up" style="margin:6px 0;">↑ 1.6% vs last 7 days</div>
      <div class="chart-wrap" style="height:70px;"><canvas id="chart-accuracy"></canvas></div>
    </div>
    <div class="card">
      <div class="panel-head">Top PPE Issues <span class="period-pill">7 Days ⌄</span></div>
      <div class="issue-bars" id="top-issues-list">
        ${renderTopIssues()}
      </div>
    </div>
  </div>
  `;
}

function renderStatusCards() {
  const d = state.liveDetection;
  const isPass = d.status === "PASS";
  return `
    <div class="card status-card ${isPass ? "pass" : "fail"}" id="status-card-live">
      <div class="status-icon-wrap">${isPass ? "✅" : "⚠️"}</div>
      <div>
        <div class="status-title ${isPass ? "pass" : "fail"}">${isPass ? "PASS" : "FAIL"}</div>
        <div class="status-sub">${d.label}</div>
        <div class="status-detail">${d.detail}</div>
        <div class="status-time">${d.time}</div>
      </div>
    </div>
    <div class="card status-card fail">
      <div class="status-icon-wrap">⚠️</div>
      <div>
        <div class="status-title fail">FAIL</div>
        <div class="status-sub">Harness Missing</div>
        <div class="status-detail">Full body harness not detected.</div>
        <div class="status-time">Today, 09:39 AM</div>
      </div>
    </div>
  `;
}

function renderAlertRows(alerts) {
  return alerts
    .map(
      (a) => `
    <tr>
      <td>${a.time}</td>
      <td>${a.site}</td>
      <td>${a.worker}</td>
      <td><span class="issue-cell"><span class="dot" style="background:${ISSUE_COLORS[a.issue] || "#f59e0b"}"></span>${a.issue}</span></td>
    </tr>`
    )
    .join("");
}

function renderTopIssues() {
  return state.topIssues
    .map(
      (i) => `
    <div class="issue-bar-row">
      <div class="top"><span>${i.label}</span><span>${i.count}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, (i.count / (i.max || 1)) * 100)}%"></div></div>
    </div>`
    )
    .join("");
}

function mountDashboardCharts() {
  makeLineChart("chart-daily-trend", DAYS, state.dailyTrend, "#3b82f6", "rgba(59,130,246,0.12)");
  makeLineChart("chart-compliance-day", DAYS, state.complianceByDay, "#22c55e", "rgba(34,197,94,0.12)");
  makeBarChart("chart-alert-freq", DAYS, state.alertFrequency, "#ef4444");
  makeLineChart("chart-mini-trend", DAYS, state.dailyTrend, "#60a5fa", "rgba(96,165,250,0.18)");
  makeLineChart("chart-accuracy", DAYS, state.modelAccuracyTrend, "#3b82f6", "rgba(59,130,246,0.12)");
  makeDonut(
    "chart-site-status",
    [state.siteStatusCounts.active, state.siteStatusCounts.warning, state.siteStatusCounts.offline],
    ["#22c55e", "#f59e0b", "#cbd2e0"]
  );
  makeDonut(
    "chart-device-health",
    [state.deviceHealthCounts.online, state.deviceHealthCounts.warning, state.deviceHealthCounts.offline],
    ["#22c55e", "#f59e0b", "#ef4444"]
  );
}

function updateDashboardLive() {
  const $ = (id) => document.getElementById(id);
  if (!$("stat-total-scans")) return; // not on this view

  $("stat-total-scans").textContent = fmtNum(state.totalScans);
  $("stat-compliance").textContent = fmtPct(state.complianceRate);
  $("stat-failed").textContent = fmtNum(state.failedDetections);
  $("stat-active-alerts").textContent = fmtNum(state.activeAlerts);
  $("mini-total-scans").textContent = fmtNum(state.totalScans);
  $("mini-compliance").textContent = fmtPct(state.complianceRate);
  $("mini-failed").textContent = fmtNum(state.failedDetections);
  $("model-accuracy").textContent = fmtPct(state.modelAccuracy);

  updateChartData("chart-daily-trend", DAYS, state.dailyTrend);
  updateChartData("chart-compliance-day", DAYS, state.complianceByDay);
  updateChartData("chart-mini-trend", DAYS, state.dailyTrend);
  updateChartData("chart-accuracy", DAYS, state.modelAccuracyTrend);
  updateChartData("chart-alert-freq", DAYS, state.alertFrequency);

  // Live camera + status card
  const bbox = $("cam-bbox");
  const label = $("cam-bbox-label");
  const statusCard = $("status-card-live");
  if (bbox && label && statusCard) {
    const isFail = state.liveDetection.status === "FAIL";
    bbox.classList.toggle("fail", isFail);
    label.textContent = state.liveDetection.label;
    statusCard.classList.toggle("pass", !isFail);
    statusCard.classList.toggle("fail", isFail);
    statusCard.querySelector(".status-icon-wrap").textContent = isFail ? "⚠️" : "✅";
    statusCard.querySelector(".status-title").textContent = isFail ? "FAIL" : "PASS";
    statusCard.querySelector(".status-title").className = "status-title " + (isFail ? "fail" : "pass");
    statusCard.querySelector(".status-sub").textContent = state.liveDetection.label;
    statusCard.querySelector(".status-detail").textContent = state.liveDetection.detail;
    statusCard.querySelector(".status-time").textContent = state.liveDetection.time;
  }

  const alertsBody = $("recent-alerts-body");
  if (alertsBody) alertsBody.innerHTML = renderAlertRows(state.recentAlerts.slice(0, 5));

  const issuesList = $("top-issues-list");
  if (issuesList) issuesList.innerHTML = renderTopIssues();
}

/* ---------------- Live Monitoring page ---------------- */
function renderLive() {
  const cams = [
    { name: "Camera 01 - Main Gate", status: state.liveDetection.status },
    { name: "Camera 02 - North Gate", status: "PASS" },
    { name: "Camera 03 - East Gate", status: "PASS" },
    { name: "Camera 04 - South Gate", status: "FAIL" },
  ];
  return `
  <div class="section-title">Live Camera Feeds</div>
  <div class="grid subpage-grid">
    ${cams
      .map(
        (c, idx) => `
      <div class="card live-card" style="min-height:260px;">
        <div class="live-head">
          <div class="panel-head" style="margin:0;">${c.name}</div>
          <div class="live-badge"><span class="live-dot"></span>LIVE</div>
        </div>
        <div class="cam-frame">
          ${cameraSceneSVG()}
          <div class="bbox ${c.status === "FAIL" ? "fail" : ""}" style="left:29%; top:29%; width:19%; height:42%;">
            <span class="bbox-label">${c.status === "FAIL" ? "PPE Missing" : "PPE OK"}</span>
          </div>
          <div class="cam-tag">${c.name}</div>
        </div>
      </div>`
      )
      .join("")}
  </div>`;
}

/* ---------------- Alerts page ---------------- */
function renderAlerts() {
  return `
  <div class="section-title">All Alerts</div>
  <div class="card">
    <table class="table">
      <thead><tr><th>Time</th><th>Site Entry</th><th>Worker ID</th><th>Issue Detected</th><th>Status</th></tr></thead>
      <tbody id="alerts-page-body">
        ${state.recentAlerts
          .map(
            (a) => `
          <tr>
            <td>${a.time}</td><td>${a.site}</td><td>${a.worker}</td>
            <td><span class="issue-cell"><span class="dot" style="background:${ISSUE_COLORS[a.issue] || "#f59e0b"}"></span>${a.issue}</span></td>
            <td><span class="badge warning">Open</span></td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  </div>`;
}
function updateAlertsPage() {
  const body = document.getElementById("alerts-page-body");
  if (!body) return;
  body.innerHTML = state.recentAlerts
    .map(
      (a) => `
    <tr class="flash">
      <td>${a.time}</td><td>${a.site}</td><td>${a.worker}</td>
      <td><span class="issue-cell"><span class="dot" style="background:${ISSUE_COLORS[a.issue] || "#f59e0b"}"></span>${a.issue}</span></td>
      <td><span class="badge warning">Open</span></td>
    </tr>`
    )
    .join("");
}

/* ---------------- Workers page ---------------- */
function renderWorkers() {
  return `
  <div class="section-title">Workers</div>
  <div class="grid subpage-grid">
    ${state.workers
      .map(
        (w) => `
      <div class="card entity-card">
        <div class="name">${w.name}</div>
        <div class="stat-label" style="margin:0;">${w.id} · ${w.site}</div>
        <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
          <div class="bar-track" style="flex:1;"><div class="bar-fill" style="width:${w.compliance}%; background:${w.compliance > 90 ? "#22c55e" : "#f59e0b"}"></div></div>
          <span style="font-size:12px; font-weight:700;">${w.compliance}%</span>
        </div>
        <div class="stat-label" style="margin:0;">Last seen ${w.lastSeen}</div>
      </div>`
      )
      .join("")}
  </div>`;
}

/* ---------------- Sites page ---------------- */
function renderSites() {
  return `
  <div class="section-title">Sites</div>
  <div class="grid subpage-grid">
    ${state.sites
      .map(
        (s) => `
      <div class="card entity-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div class="name">${s.name}</div>
          <span class="badge ${s.status.toLowerCase()}">${s.status}</span>
        </div>
        <div class="stat-label" style="margin:0;">${s.workers} workers on site</div>
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="bar-track" style="flex:1;"><div class="bar-fill" style="width:${s.compliance}%; background:${s.compliance > 90 ? "#22c55e" : "#f59e0b"}"></div></div>
          <span style="font-size:12px; font-weight:700;">${s.compliance}%</span>
        </div>
      </div>`
      )
      .join("")}
  </div>`;
}

/* ---------------- Devices page ---------------- */
function renderDevices() {
  return `
  <div class="section-title">Devices</div>
  <div class="grid subpage-grid">
    ${state.devices
      .map(
        (d) => `
      <div class="card entity-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div class="name">${d.name}</div>
          <span class="badge ${d.status.toLowerCase()}">${d.status}</span>
        </div>
        <div class="stat-label" style="margin:0;">Uptime: ${d.uptime}</div>
      </div>`
      )
      .join("")}
  </div>`;
}

/* ---------------- Reports page ---------------- */
function renderReports() {
  return `
  <div class="section-title">Reports</div>
  <div class="grid panel-row-1" style="grid-template-columns: 1fr 1fr;">
    <div class="card">
      <div class="panel-head">Compliance Trend <span class="period-pill">7 Days ⌄</span></div>
      <div class="chart-wrap"><canvas id="report-compliance"></canvas></div>
    </div>
    <div class="card">
      <div class="panel-head">Alerts by Site <span class="period-pill">7 Days ⌄</span></div>
      <div class="chart-wrap"><canvas id="report-alerts-site"></canvas></div>
    </div>
  </div>
  <div class="section-title">Export</div>
  <div class="card" style="display:flex; gap:12px; align-items:center;">
    <button class="btn-primary" id="export-csv-btn">Export CSV</button>
    <button class="btn-primary" style="background:#111c34;" id="export-pdf-btn">Export PDF</button>
    <span class="save-msg" id="export-msg">Report generated ✓</span>
  </div>`;
}
function mountReportsCharts() {
  makeLineChart("report-compliance", DAYS, state.complianceByDay, "#22c55e", "rgba(34,197,94,0.12)");
  makeBarChart(
    "report-alerts-site",
    state.sites.map((s) => s.name),
    state.sites.map(() => randInt(2, 20)),
    "#3b82f6"
  );
  document.getElementById("export-csv-btn").addEventListener("click", () => flashExportMsg());
  document.getElementById("export-pdf-btn").addEventListener("click", () => flashExportMsg());
}
function flashExportMsg() {
  const msg = document.getElementById("export-msg");
  msg.classList.add("show");
  setTimeout(() => msg.classList.remove("show"), 1800);
}

/* ---------------- Settings page ---------------- */
function renderSettings() {
  return `
  <div class="section-title">Account Settings</div>
  <div class="card settings-form">
    <div class="form-row">
      <label>Full Name</label>
      <input type="text" value="Admin User" />
    </div>
    <div class="form-row">
      <label>Email</label>
      <input type="email" value="pichaya.suks02@gmail.com" />
    </div>
    <div class="form-row">
      <label>Default Site</label>
      <select>
        ${state.sites.map((s) => `<option>${s.name}</option>`).join("")}
      </select>
    </div>
    <div class="toggle-row">
      <span>Email alerts for failed detections</span>
      <label class="switch"><input type="checkbox" checked /><span class="slider"></span></label>
    </div>
    <div class="toggle-row">
      <span>Push notifications</span>
      <label class="switch"><input type="checkbox" checked /><span class="slider"></span></label>
    </div>
    <div class="toggle-row" style="border-bottom:none;">
      <span>Weekly summary report</span>
      <label class="switch"><input type="checkbox" /><span class="slider"></span></label>
    </div>
    <button class="btn-primary" id="settings-save-btn">Save Changes</button>
    <span class="save-msg" id="settings-msg">Saved ✓</span>
  </div>`;
}
function mountSettings() {
  document.getElementById("settings-save-btn").addEventListener("click", () => {
    const msg = document.getElementById("settings-msg");
    msg.classList.add("show");
    setTimeout(() => msg.classList.remove("show"), 1800);
  });
}
