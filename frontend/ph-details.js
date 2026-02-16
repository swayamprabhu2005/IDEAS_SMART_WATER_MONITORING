let phChart;

async function fetchData() {
    const res = await fetch("/api/readings");
    return await res.json();
}

function initChart() {
    const ctx = document.getElementById('phDetailChart').getContext('2d');

    phChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'pH Level',
                data: [],
                borderColor: '#005f99',
                backgroundColor: 'rgba(0,95,153,0.1)',
                fill: true
            }]
        }
    });
}

function evaluateWaterSafety(reading) {
    return reading.pH >= 6.5 && reading.pH <= 8.5;
}

async function updateChart() {
    const data = await fetchData();
    if (!data || data.length === 0) return;

    const recent = data.slice(-10);
    const latest = recent[recent.length - 1];

    const labels = recent.map(d => new Date(d.timestamp).toLocaleTimeString());
    const phData = recent.map(d => d.pH);

    phChart.data.labels = labels;
    phChart.data.datasets[0].data = phData;
    phChart.update();

    // Safety display
    const statusDiv = document.getElementById('statusMessage');
    if (evaluateWaterSafety(latest)) {
        statusDiv.textContent = "✅ Water is SAFE. pH: " + latest.pH.toFixed(2);
        statusDiv.className = "status safe";
    } else {
        statusDiv.textContent = "⚠️ Water NOT safe. pH: " + latest.pH.toFixed(2);
        statusDiv.className = "status unsafe";
    }
}

initChart();
updateChart();
setInterval(updateChart, 2000);
