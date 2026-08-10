/* Router + live-simulation loop tying data.js <-> views.js <-> charts.js together */

const routes = {
  dashboard: { title: "PPE Compliance Dashboard", render: renderDashboard, mount: mountDashboardCharts },
  live: { title: "Live Monitoring", render: renderLive },
  alerts: { title: "Alerts", render: renderAlerts },
  reports: { title: "Reports", render: renderReports, mount: mountReportsCharts },
  workers: { title: "Workers", render: renderWorkers },
  sites: { title: "Sites", render: renderSites },
  devices: { title: "Devices", render: renderDevices },
  settings: { title: "Settings", render: renderSettings, mount: mountSettings },
};

let currentRoute = "dashboard";

function navigate() {
  const hash = (location.hash || "#dashboard").replace("#", "");
  const route = routes[hash] ? hash : "dashboard";
  currentRoute = route;

  destroyAllCharts();

  document.getElementById("page-title").textContent = routes[route].title;
  document.getElementById("content").innerHTML = routes[route].render();

  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.route === route);
  });

  if (routes[route].mount) routes[route].mount();
}

function updateChromeBadges() {
  document.getElementById("nav-alert-badge").textContent = state.activeAlerts;
  document.getElementById("bell-badge").textContent = state.activeAlerts;
}

function simulationTick() {
  tickScans();

  if (Math.random() < 0.22) {
    generateLiveAlert();
  }

  updateChromeBadges();

  if (currentRoute === "dashboard") updateDashboardLive();
  if (currentRoute === "alerts") updateAlertsPage();
}

window.addEventListener("hashchange", navigate);
window.addEventListener("DOMContentLoaded", () => {
  navigate();
  updateChromeBadges();
  setInterval(simulationTick, 2500);
});
