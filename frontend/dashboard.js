import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = "https://oqbzbvkbqzpcuivsahkx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnpidmticXpwY3VpdnNhaGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDk2MTMsImV4cCI6MjA3NDE4NTYxM30._bAXsOuz-xPbALqK9X0R5QKNZcwSzKCats3vMTfDGWs"; // replace with your anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

import { showWaterAlert, requestNotificationPermission } from "./notification.js";
let phChart, turbidityChart, gaugeChart;
let alertsCount = 0;

document.addEventListener("DOMContentLoaded", async () => {

  // Ask notification permission
  await requestNotificationPermission();

  initCharts();
  updateDashboard();

  // Dashboard updates every 5 seconds
  setInterval(updateDashboard, 5000);

  // Notification check every 5 minutes
  setInterval(checkAndNotify, 2 * 60 * 1000);
});

// Fetch water data
async function fetchData() {
  try {
    const res = await fetch("/api/readings");
    return await res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

function evaluateWaterSafety(latest) {
  const safePH = latest.pH >= 6.5 && latest.pH <= 8.5;
  const safeTurbidity = latest.turbidity < 5;
  return safePH && safeTurbidity;
}

function initCharts() {
  const ctxPh = document.getElementById("phChart").getContext("2d");
  phChart = new Chart(ctxPh, {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'pH Level', data: [], borderColor: '#0599f5', backgroundColor: 'blue', fill: true }] },
    options: { responsive: true }
  });

  const ctxTurbidity = document.getElementById("turbidityChart").getContext("2d");
  turbidityChart = new Chart(ctxTurbidity, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Turbidity (NTU)', data: [], borderColor: '#4caf50', fill: false }] },
    options: { responsive: true }
  });

  const ctxGauge = document.getElementById("gaugeChart").getContext("2d");
  gaugeChart = new Chart(ctxGauge, {
    type: "doughnut",
    data: { labels: ["Safe", "Unsafe"], datasets: [{ data: [1, 0], backgroundColor: ["#4caf50", "#f44336"], borderWidth: 0 }] },
    options: { circumference: 180, rotation: -90, cutout: "70%", plugins: { legend: { display: false }, tooltip: { enabled: false } } }
  });
}

async function updateDashboard() {
  const data = await fetchData();
  if (!data || data.length === 0) return;

  // SORT like pH page
  const ordered = data.sort((a, b) =>
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  const recentData = ordered.slice(-10);
  const latest = recentData[recentData.length - 1];

  document.getElementById("current-pH").textContent = latest.pH.toFixed(2);
  document.getElementById("current-turbidity").textContent =
    latest.turbidity.toFixed(2) + " NTU";

  const safe = evaluateWaterSafety(latest);
  const statusDiv = document.getElementById("statusMessage");
  statusDiv.textContent = safe ? "✅ Safe" : "⚠️ Unsafe";
  statusDiv.style.color = safe ? "#4caf50" : "#f44336";

  const labels = recentData.map(d =>
    new Date(d.timestamp).toLocaleTimeString()
  );

  const phData = recentData.map(d => d.pH);
  const turbidityData = recentData.map(d => d.turbidity);

  phChart.data.labels = labels;
  phChart.data.datasets[0].data = phData;
  phChart.update();

  turbidityChart.data.labels = labels;
  turbidityChart.data.datasets[0].data = turbidityData;
  turbidityChart.update();

  gaugeChart.data.datasets[0].data = safe ? [1, 0] : [0, 1];
  gaugeChart.update();
}
async function checkAndNotify() {
  const data = await fetchData();
  if (!data || data.length === 0) return;

  // Get latest reading
  const latest = data.sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  )[0];

  const safe = evaluateWaterSafety(latest);

  // Only notify if unsafe
  if (!safe) {
    showWaterAlert(latest.pH, latest.turbidity);
  }
}