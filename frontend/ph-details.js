import { sensorReadings, evaluateWaterSafety } from "./sensorData.js";

let currentIndex = 0, phChart;

function initChart() 
{
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
        },
        options: {
        responsive: true,
        plugins: {
            tooltip: {
            callbacks: {
                label: (ctx) => `pH: ${ctx.parsed.y.toFixed(2)}`
            }
            }
        },
        scales: {
            y: {
            beginAtZero: false,
            title: { display: true, text: 'pH Value' }
            }
        }
        }
    });
}

function checkSafety(latestReading) 
{
    const statusDiv = document.getElementById('statusMessage');
    const suggestionList = document.getElementById('suggestionList');
    suggestionList.innerHTML = "";

    const safety = evaluateWaterSafety(latestReading);

    statusDiv.textContent = safety.message + `. pH: ${latestReading.pH.toFixed(2)}`;
    statusDiv.className = safety.safe ? "status safe" : "status unsafe";

    if (safety.safe) 
    {
        suggestionList.innerHTML += "<li>Safe for drinking</li>";
        suggestionList.innerHTML += "<li>Safe for cooking and utensils</li>";
        suggestionList.innerHTML += "<li>Safe for irrigation</li>";
    } 
    
    else 
    {
        suggestionList.innerHTML += "<li>Use for irrigation (plants can tolerate wider pH)</li>";
        suggestionList.innerHTML += "<li>Use for cleaning or washing utensils</li>";
        suggestionList.innerHTML += "<li>Industrial or non-potable applications</li>";
    }
}

function loadNextReading() 
{
    if (currentIndex < sensorReadings.length) 
    {
        phChart.data.labels.push(new Date(sensorReadings[currentIndex].timestamp).toLocaleTimeString());
        phChart.data.datasets[0].data.push(sensorReadings[currentIndex].pH);

        if (phChart.data.labels.length > 10) 
        {
            phChart.data.labels.shift();
            phChart.data.datasets[0].data.shift();
        }

        phChart.update();
        checkSafety(sensorReadings[currentIndex]);

        currentIndex++;
    }
}

initChart();
loadNextReading();
setInterval(loadNextReading, 10000);