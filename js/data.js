/* PPE Guard — mock data store & live simulation engine */

const DAYS = ["May 10", "May 11", "May 12", "May 13", "May 14", "May 15", "May 16"];

const SITES = ["Main Gate", "North Gate", "East Gate", "South Gate", "Warehouse B"];
const ISSUES = ["No Safety Glasses", "Harness Missing", "No Helmet", "High Vis Missing"];
const ISSUE_COLORS = {
  "No Safety Glasses": "#ef4444",
  "Harness Missing": "#f59e0b",
  "No Helmet": "#f59e0b",
  "High Vis Missing": "#f59e0b",
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randWorkerId() {
  return "WKR-" + randInt(1000, 1099);
}

function makeTrend(base, spread, len) {
  const arr = [];
  let v = base;
  for (let i = 0; i < len; i++) {
    v = Math.max(0, v + randInt(-spread, spread));
    arr.push(v);
  }
  return arr;
}

const state = {
  totalScans: 1248,
  complianceRate: 96.4,
  failedDetections: 43,
  activeAlerts: 12,
  modelAccuracy: 98.2,

  dailyTrend: [320, 260, 480, 260, 500, 420, 560],
  complianceByDay: [95.2, 94.8, 96.1, 95.5, 96.8, 96.0, 96.4],
  alertFrequency: [45, 55, 30, 38, 28, 22, 15],
  modelAccuracyTrend: [95.5, 96.2, 95.8, 97.1, 96.5, 97.8, 98.2],

  feedback: {
    ppeAlerts: 12,
    policyViolations: 8,
    systemNotifications: 5,
    generalFeedback: 3,
  },

  liveDetection: {
    status: "PASS",
    label: "Harness Detected",
    detail: "All required PPE detected.",
    time: "Today, 09:41 AM",
  },

  recentAlerts: [
    { time: "Today, 09:41 AM", site: "Main Gate", worker: "WKR-1042", issue: "No Safety Glasses" },
    { time: "Today, 09:39 AM", site: "Main Gate", worker: "WKR-1038", issue: "Harness Missing" },
    { time: "Today, 09:36 AM", site: "North Gate", worker: "WKR-1045", issue: "No Helmet" },
    { time: "Today, 09:34 AM", site: "Main Gate", worker: "WKR-1041", issue: "High Vis Missing" },
    { time: "Today, 09:29 AM", site: "East Gate", worker: "WKR-1033", issue: "No Safety Glasses" },
  ],

  sites: [
    { name: "Main Gate", status: "Active", workers: 34, compliance: 97.2 },
    { name: "North Gate", status: "Active", workers: 21, compliance: 95.8 },
    { name: "East Gate", status: "Active", workers: 18, compliance: 96.5 },
    { name: "South Gate", status: "Warning", workers: 12, compliance: 89.1 },
    { name: "Warehouse B", status: "Offline", workers: 0, compliance: 0 },
  ],

  devices: [
    { name: "Camera 01 - Main Gate", status: "Online", uptime: "99.9%" },
    { name: "Camera 02 - North Gate", status: "Online", uptime: "99.7%" },
    { name: "Camera 03 - East Gate", status: "Online", uptime: "98.4%" },
    { name: "Camera 04 - South Gate", status: "Warning", uptime: "84.2%" },
    { name: "Camera 05 - Warehouse B", status: "Offline", uptime: "0%" },
    { name: "Edge Node A1", status: "Online", uptime: "100%" },
  ],

  workers: [
    { id: "WKR-1042", name: "S. Thongchai", site: "Main Gate", compliance: 94, lastSeen: "09:41 AM" },
    { id: "WKR-1038", name: "N. Aroon", site: "Main Gate", compliance: 88, lastSeen: "09:39 AM" },
    { id: "WKR-1045", name: "P. Somchai", site: "North Gate", compliance: 91, lastSeen: "09:36 AM" },
    { id: "WKR-1041", name: "K. Suda", site: "Main Gate", compliance: 97, lastSeen: "09:34 AM" },
    { id: "WKR-1033", name: "T. Manee", site: "East Gate", compliance: 85, lastSeen: "09:29 AM" },
    { id: "WKR-1050", name: "A. Chai", site: "South Gate", compliance: 99, lastSeen: "09:20 AM" },
  ],

  topIssues: [
    { label: "Harness Missing", count: 24, max: 24 },
    { label: "No Safety Glasses", count: 18, max: 24 },
    { label: "No Helmet", count: 12, max: 24 },
    { label: "High Vis Missing", count: 9, max: 24 },
  ],

  siteStatusCounts: { active: 3, warning: 1, offline: 1 },
  deviceHealthCounts: { online: 4, warning: 1, offline: 1 },
};

/** Push a new alert + related side-effects; keeps arrays bounded */
function generateLiveAlert() {
  const site = SITES[randInt(0, SITES.length - 1)];
  const issue = ISSUES[randInt(0, ISSUES.length - 1)];
  const now = new Date();
  const time =
    "Today, " +
    now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const alert = { time, site, worker: randWorkerId(), issue };
  state.recentAlerts.unshift(alert);
  state.recentAlerts = state.recentAlerts.slice(0, 8);

  state.activeAlerts += 1;
  state.failedDetections += 1;

  const issueEntry = state.topIssues.find((i) => i.label === issue) || state.topIssues.find(i => i.label.includes(issue.split(" ")[0]));
  if (issueEntry) {
    issueEntry.count += 1;
    issueEntry.max = Math.max(issueEntry.max, issueEntry.count);
  }

  state.liveDetection = {
    status: "FAIL",
    label: issue.includes("Harness") ? "Harness Missing" : issue,
    detail:
      issue === "Harness Missing"
        ? "Full body harness not detected."
        : issue === "No Helmet"
        ? "Hard hat not detected on worker."
        : issue === "No Safety Glasses"
        ? "Protective eyewear not detected."
        : "High-visibility vest not detected.",
    time,
  };

  return alert;
}

function tickScans() {
  const inc = randInt(1, 4);
  state.totalScans += inc;

  // shift trend window occasionally
  state.dailyTrend[state.dailyTrend.length - 1] += inc;

  const passed = Math.random() > 0.08;
  if (passed) {
    state.liveDetection = {
      status: "PASS",
      label: "Harness Detected",
      detail: "All required PPE detected.",
      time:
        "Today, " +
        new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
  }

  // recompute compliance rate from scans/failed ratio, keep it in a believable band
  const ratio = 1 - state.failedDetections / state.totalScans;
  state.complianceRate = Math.max(90, Math.min(99.9, ratio * 100));
  state.complianceByDay[state.complianceByDay.length - 1] = Number(state.complianceRate.toFixed(1));

  state.modelAccuracy = Math.max(95, Math.min(99.9, state.modelAccuracy + (Math.random() - 0.48) * 0.15));
  state.modelAccuracyTrend[state.modelAccuracyTrend.length - 1] = Number(state.modelAccuracy.toFixed(1));

  return passed;
}
