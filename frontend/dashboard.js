let phChart, turbidityChart, pieChart;

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

    if (safePH && safeTurbidity)
        return { safe: true, message: "✅ Water is SAFE to drink" };
    else
        return { safe: false, message: "⚠️ Water is NOT safe to drink" };
}

function initCharts() {

    const ctxPh = document.getElementById('phChart').getContext('2d');
    phChart = new Chart(ctxPh, {
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

    const ctxTurbidity = document.getElementById('turbidityChart').getContext('2d');
    turbidityChart = new Chart(ctxTurbidity, {
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

    const ctxPie = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ['pH Level', 'Turbidity (NTU)'],
            datasets: [{
                data: [],
                backgroundColor: ['#005f99', '#4caf50']
            }]
        }
    });
}

async function updateDashboard() {

    const data = await fetchData();
    if (!data || data.length === 0) return;

    const recentData = data.slice(-10);
    const latest = recentData[recentData.length - 1];

    document.getElementById('current-pH').textContent = latest.pH.toFixed(2);
    document.getElementById('current-turbidity').textContent =
        latest.turbidity.toFixed(2) + " NTU";

    const statusDiv = document.getElementById('statusMessage');
    const safety = evaluateWaterSafety(latest);
    statusDiv.textContent = safety.message;
    statusDiv.className = safety.safe ? "status safe" : "status unsafe";

    const labels = recentData.map(d =>
        d.timestamp ? new Date(d.timestamp).toLocaleTimeString() : ""
    );

    const phData = recentData.map(d => d.pH);
    const turbidityData = recentData.map(d => d.turbidity);

    phChart.data.labels = labels;
    phChart.data.datasets[0].data = phData;
    phChart.update();

    turbidityChart.data.labels = labels;
    turbidityChart.data.datasets[0].data = turbidityData;
    turbidityChart.update();

    pieChart.data.datasets[0].data = [latest.pH, latest.turbidity];
    pieChart.update();
}

initCharts();
updateDashboard();
setInterval(updateDashboard, 2000);
