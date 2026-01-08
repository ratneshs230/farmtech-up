// Smart Soil Moisture Probe - JavaScript

// DOM Elements
const currentMoistureEl = document.getElementById('currentMoisture');
const moistureStatusEl = document.getElementById('moistureStatus');
const moistureInput = document.getElementById('moistureInput');
const addReadingBtn = document.getElementById('addReading');
const avgMoistureEl = document.getElementById('avgMoisture');
const maxMoistureEl = document.getElementById('maxMoisture');
const minMoistureEl = document.getElementById('minMoisture');
const readingsListEl = document.getElementById('readingsList');
const clearAllBtn = document.getElementById('clearAll');
const chartCanvas = document.getElementById('moistureChart');

// Data storage
let readings = [];

// Load readings from localStorage
function loadReadings() {
    const stored = localStorage.getItem('soilMoistureReadings');
    if (stored) {
        readings = JSON.parse(stored);
    }
}

// Save readings to localStorage
function saveReadings() {
    localStorage.setItem('soilMoistureReadings', JSON.stringify(readings));
}

// Get moisture status text and class
function getMoistureStatus(value) {
    if (value < 20) {
        return {
            text: '🏜️ Very Dry - Water Needed! / बहुत सूखा - पानी दें!',
            class: 'status-dry'
        };
    } else if (value < 40) {
        return {
            text: '🌵 Low Moisture / कम नमी',
            class: 'status-low'
        };
    } else if (value <= 70) {
        return {
            text: '✅ Good Moisture / अच्छी नमी',
            class: 'status-good'
        };
    } else {
        return {
            text: '💧 Very Wet / बहुत गीला',
            class: 'status-wet'
        };
    }
}

// Update the display
function updateDisplay() {
    // Update current moisture
    if (readings.length > 0) {
        const latest = readings[readings.length - 1];
        currentMoistureEl.textContent = latest.value;

        const status = getMoistureStatus(latest.value);
        moistureStatusEl.textContent = status.text;
        moistureStatusEl.className = 'moisture-status ' + status.class;
    } else {
        currentMoistureEl.textContent = '--';
        moistureStatusEl.textContent = 'No readings yet / अभी तक कोई रीडिंग नहीं';
        moistureStatusEl.className = 'moisture-status';
    }

    // Update statistics
    if (readings.length > 0) {
        const values = readings.map(r => r.value);
        const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
        const max = Math.max(...values);
        const min = Math.min(...values);

        avgMoistureEl.textContent = avg + '%';
        maxMoistureEl.textContent = max + '%';
        minMoistureEl.textContent = min + '%';
    } else {
        avgMoistureEl.textContent = '--';
        maxMoistureEl.textContent = '--';
        minMoistureEl.textContent = '--';
    }

    // Update readings list
    updateReadingsList();

    // Update chart
    drawChart();
}

// Update readings list
function updateReadingsList() {
    if (readings.length === 0) {
        readingsListEl.innerHTML = '<li class="no-readings">No readings yet / अभी तक कोई रीडिंग नहीं</li>';
        return;
    }

    // Show last 10 readings, newest first
    const recentReadings = [...readings].reverse().slice(0, 10);

    readingsListEl.innerHTML = recentReadings.map((reading, index) => {
        const actualIndex = readings.length - 1 - index;
        const time = new Date(reading.timestamp).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <li>
                <div>
                    <span class="reading-value">💧 ${reading.value}%</span>
                    <span class="reading-time">${time}</span>
                </div>
                <button class="btn-delete" onclick="deleteReading(${actualIndex})">❌</button>
            </li>
        `;
    }).join('');
}

// Draw simple bar chart
function drawChart() {
    const ctx = chartCanvas.getContext('2d');
    const width = chartCanvas.width = chartCanvas.offsetWidth;
    const height = chartCanvas.height = chartCanvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#f9fbe7';
    ctx.fillRect(0, 0, width, height);

    if (readings.length === 0) {
        ctx.fillStyle = '#8d6e63';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No data yet / अभी तक कोई डेटा नहीं', width / 2, height / 2);
        return;
    }

    // Get last 10 readings for chart
    const chartData = readings.slice(-10);
    const barWidth = (width - 40) / Math.max(chartData.length, 1);
    const maxHeight = height - 40;

    // Draw bars
    chartData.forEach((reading, index) => {
        const barHeight = (reading.value / 100) * maxHeight;
        const x = 20 + (index * barWidth) + (barWidth * 0.1);
        const y = height - 20 - barHeight;
        const actualBarWidth = barWidth * 0.8;

        // Color based on moisture level
        if (reading.value < 20) {
            ctx.fillStyle = '#c62828';
        } else if (reading.value < 40) {
            ctx.fillStyle = '#f57c00';
        } else if (reading.value <= 70) {
            ctx.fillStyle = '#4caf50';
        } else {
            ctx.fillStyle = '#1565c0';
        }

        // Draw bar with rounded top
        ctx.beginPath();
        ctx.roundRect(x, y, actualBarWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        // Draw value on top
        ctx.fillStyle = '#5d4037';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(reading.value + '%', x + actualBarWidth / 2, y - 5);
    });

    // Draw baseline
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(15, height - 20);
    ctx.lineTo(width - 15, height - 20);
    ctx.stroke();
}

// Add a new reading
function addReading() {
    const value = parseInt(moistureInput.value);

    if (isNaN(value) || value < 0 || value > 100) {
        alert('Please enter a valid moisture value (0-100)\nकृपया वैध नमी मान दर्ज करें (0-100)');
        return;
    }

    readings.push({
        value: value,
        timestamp: new Date().toISOString()
    });

    saveReadings();
    updateDisplay();
    moistureInput.value = '';
    moistureInput.focus();
}

// Delete a specific reading
function deleteReading(index) {
    if (confirm('Delete this reading? / यह रीडिंग हटाएं?')) {
        readings.splice(index, 1);
        saveReadings();
        updateDisplay();
    }
}

// Clear all readings
function clearAllReadings() {
    if (confirm('Delete all readings? / सभी रीडिंग हटाएं?')) {
        readings = [];
        saveReadings();
        updateDisplay();
    }
}

// Event listeners
addReadingBtn.addEventListener('click', addReading);

moistureInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addReading();
    }
});

clearAllBtn.addEventListener('click', clearAllReadings);

// Handle window resize for chart
window.addEventListener('resize', () => {
    drawChart();
});

// Initialize app
loadReadings();
updateDisplay();
