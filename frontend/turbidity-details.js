let turbidityChart;

async function fetchData() {
    const res = await fetch("/api/readings");
    return await res.json();
}

function initChart() {
    const ctx = document.getElementById('turbidityDetailChart').getContext('2d');

    turbidityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Turbidity (NTU)',
                data: [],
                backgroundColor: '#4caf50'
            }]
        }
    });
}

function evaluateWaterSafety(reading) {
    return reading.turbidity < 5;
}

async function updateChart() {
    const data = await fetchData();
    if (!data || data.length === 0) return;

    const recent = data.slice(-10);
    const latest = recent[recent.length - 1];

    const labels = recent.map(d => new Date(d.timestamp).toLocaleTimeString());
    const turbidityData = recent.map(d => d.turbidity);

    turbidityChart.data.labels = labels;
    turbidityChart.data.datasets[0].data = turbidityData;
    turbidityChart.update();

    // Safety display
    const statusDiv = document.getElementById('statusMessage');
    if (evaluateWaterSafety(latest)) {
        statusDiv.textContent = "✅ Water is SAFE. Turbidity: " + latest.turbidity.toFixed(2) + " NTU";
        statusDiv.className = "status safe";
    } else {
        statusDiv.textContent = "⚠️ Water NOT safe. Turbidity: " + latest.turbidity.toFixed(2) + " NTU";
        statusDiv.className = "status unsafe";
    }
}

initChart();
updateChart();
setInterval(updateChart, 2000);
