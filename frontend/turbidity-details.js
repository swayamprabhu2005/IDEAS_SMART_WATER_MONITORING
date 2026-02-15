import { sensorReadings, evaluateWaterSafety } from "./sensorData.js";

let currentIndex = 0, turbidityChart;

function initChart() 
{
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
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `Turbidity: ${ctx.parsed.y.toFixed(2)} NTU`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'NTU' }
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

    const safety = evaluateWaterSafety(latestReading)

    statusDiv.textContent = safety.message + `. Turbidity: ${latestReading.turbidity.toFixed(2)}`;
    statusDiv.className = safety.safe ? "status safe" : "status unsafe";

    if(safety.safe)
    {
        suggestionList.innerHTML += "<li>Safe for drinking</li>";
        suggestionList.innerHTML += "<li>Safe for cooking and utensils</li>";
        suggestionList.innerHTML += "<li>Safe for irrigation</li>";
    }

    else
    {
        suggestionList.innerHTML += "<li>Use for irrigation (plants tolerate higher turbidity)</li>";
        suggestionList.innerHTML += "<li>Use for cleaning or washing utensils</li>";
        suggestionList.innerHTML += "<li>Industrial or construction applications</li>";
    }
}

function loadNextReading() 
{
  if (currentIndex < sensorReadings.length) 
    {
        const reading = sensorReadings[currentIndex];

        // Add new label and value
        turbidityChart.data.labels.push(new Date(reading.timestamp).toLocaleTimeString());
        turbidityChart.data.datasets[0].data.push(reading.turbidity);

        // Keep only the last 10 values (sliding window)
        if (turbidityChart.data.labels.length > 10) {
        turbidityChart.data.labels.shift();
        turbidityChart.data.datasets[0].data.shift();
        }

        turbidityChart.update();

        checkSafety(sensorReadings[currentIndex]);

        currentIndex++;
    } 
}

initChart();
// checkSafety();
loadNextReading();
setInterval(loadNextReading, 10000);