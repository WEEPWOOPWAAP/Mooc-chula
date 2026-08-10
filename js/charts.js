/* Chart.js setup/teardown helpers, kept separate so views can re-render safely */

const chartRegistry = {};

function destroyChart(id) {
  if (chartRegistry[id]) {
    chartRegistry[id].destroy();
    delete chartRegistry[id];
  }
}

function destroyAllCharts() {
  Object.keys(chartRegistry).forEach(destroyChart);
}

function baseLineOptions(color, fillColor) {
  return {
    type: "line",
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: { legend: { display: false }, tooltip: { intersect: false, mode: "index" } },
      elements: { point: { radius: 3, hoverRadius: 5 } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#98a2b3" } },
        y: { grid: { color: "#f1f3f8" }, ticks: { font: { size: 10 }, color: "#98a2b3" } },
      },
    },
  };
}

function makeLineChart(canvasId, labels, data, color, fillColor) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const cfg = baseLineOptions(color, fillColor);
  chartRegistry[canvasId] = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data,
          borderColor: color,
          backgroundColor: fillColor,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        },
      ],
    },
    options: cfg.options,
  });
  return chartRegistry[canvasId];
}

function makeBarChart(canvasId, labels, data, color) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  chartRegistry[canvasId] = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{ data, backgroundColor: color, borderRadius: 4, maxBarThickness: 22 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#98a2b3" } },
        y: { grid: { color: "#f1f3f8" }, ticks: { font: { size: 10 }, color: "#98a2b3" } },
      },
    },
  });
  return chartRegistry[canvasId];
}

function makeDonut(canvasId, values, colors) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  chartRegistry[canvasId] = new Chart(ctx, {
    type: "doughnut",
    data: { datasets: [{ data: values, backgroundColor: colors, borderWidth: 0 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "72%",
      animation: { duration: 400 },
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
    },
  });
  return chartRegistry[canvasId];
}

function updateChartData(canvasId, labels, data) {
  const c = chartRegistry[canvasId];
  if (!c) return;
  c.data.labels = labels;
  c.data.datasets[0].data = data;
  c.update("none");
}

function updateDonut(canvasId, values) {
  const c = chartRegistry[canvasId];
  if (!c) return;
  c.data.datasets[0].data = values;
  c.update("none");
}
