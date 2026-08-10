# PPE Guard — Compliance Dashboard Simulation

A front-end simulation of a construction-site PPE (personal protective equipment)
compliance monitoring web app, built from a reference dashboard design. It's a
static HTML/CSS/JS single-page app with a mock live-data engine — no backend
required.

## Features

- **Dashboard** — KPI cards (total scans, compliance rate, failed detections,
  active alerts), daily trend / compliance / alert-frequency charts, a live
  camera monitoring panel with a simulated PPE detection bounding box, a
  performance & feedback summary, recent alerts table, site/device health
  donuts, AI model accuracy trend, and top PPE issues.
- **Live simulation** — every few seconds the app "ticks": scan counts climb,
  compliance/model-accuracy trends update, charts animate, and new PPE
  violation alerts occasionally appear across the dashboard, alerts table,
  and camera feed in sync.
- **Live Monitoring, Alerts, Workers, Sites, Devices, Reports, Settings** —
  additional routed pages (hash-based client-side router) with mock data.

## Running it

No build step or dependencies — everything (including Chart.js) is vendored
locally in `js/vendor/`. Just serve the folder statically, e.g.:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

## Structure

```
index.html          Shell: sidebar, topbar, content mount point
css/style.css        All styling
js/data.js           Mock data store + simulation tick logic
js/charts.js         Chart.js create/update/destroy helpers
js/views.js          HTML templates + mount/update logic per route
js/app.js            Hash router + simulation interval
js/vendor/           Vendored Chart.js (UMD build)
```
