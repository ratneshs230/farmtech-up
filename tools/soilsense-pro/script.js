/**
 * SoilSense Pro - Complete Soil Analysis App
 * Simulates soil analysis with NPK, pH, and moisture measurements
 */

// App State
const state = {
    readings: JSON.parse(localStorage.getItem('soilsense_readings') || '[]'),
    currentLocation: null,
    isScanning: false
};

// DOM Elements
const elements = {
    scanBtn: document.getElementById('scanBtn'),
    loadingSection: document.getElementById('loadingSection'),
    resultsSection: document.getElementById('resultsSection'),
    recommendationsSection: document.getElementById('recommendationsSection'),
    recommendationsList: document.getElementById('recommendationsList'),
    cropSelect: document.getElementById('cropSelect'),
    historyList: document.getElementById('historyList'),
    clearHistory: document.getElementById('clearHistory'),
    saveLocation: document.getElementById('saveLocation'),
    locationDisplay: document.getElementById('locationDisplay'),
    offlineMsg: document.getElementById('offlineMsg'),

    // Result values
    moistureValue: document.getElementById('moistureValue'),
    moistureBar: document.getElementById('moistureBar'),
    moistureStatus: document.getElementById('moistureStatus'),
    phValue: document.getElementById('phValue'),
    phMarker: document.getElementById('phMarker'),
    phStatus: document.getElementById('phStatus'),
    nitrogenValue: document.getElementById('nitrogenValue'),
    phosphorusValue: document.getElementById('phosphorusValue'),
    potassiumValue: document.getElementById('potassiumValue'),
    depth1: document.getElementById('depth1'),
    depth2: document.getElementById('depth2'),
    depth3: document.getElementById('depth3'),
    depth1Value: document.getElementById('depth1Value'),
    depth2Value: document.getElementById('depth2Value'),
    depth3Value: document.getElementById('depth3Value')
};

// Crop-specific optimal ranges
const cropOptimalRanges = {
    wheat: { pH: [6.0, 7.5], N: [120, 150], P: [60, 80], K: [40, 60], moisture: [50, 70] },
    rice: { pH: [5.5, 7.0], N: [100, 140], P: [50, 70], K: [60, 80], moisture: [70, 90] },
    sugarcane: { pH: [6.0, 7.5], N: [150, 200], P: [80, 100], K: [80, 120], moisture: [60, 80] },
    potato: { pH: [5.5, 6.5], N: [100, 130], P: [100, 120], K: [120, 150], moisture: [60, 80] },
    mustard: { pH: [6.0, 7.0], N: [80, 100], P: [40, 60], K: [40, 50], moisture: [40, 60] },
    vegetables: { pH: [6.0, 7.0], N: [100, 150], P: [60, 100], K: [80, 120], moisture: [60, 75] }
};

// Initialize app
function init() {
    // Event listeners
    elements.scanBtn.addEventListener('click', startScan);
    elements.clearHistory.addEventListener('click', clearHistory);
    elements.saveLocation.addEventListener('click', saveLocation);
    elements.cropSelect.addEventListener('change', updateRecommendations);

    // Check online status
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Render history
    renderHistory();
}

// Check online/offline status
function updateOnlineStatus() {
    elements.offlineMsg.style.display = navigator.onLine ? 'none' : 'block';
}

// Generate simulated soil data
function generateSoilData() {
    return {
        moisture: Math.floor(Math.random() * 60) + 20, // 20-80%
        pH: (Math.random() * 4 + 4.5).toFixed(1), // 4.5-8.5
        nitrogen: Math.floor(Math.random() * 150) + 50, // 50-200 kg/ha
        phosphorus: Math.floor(Math.random() * 100) + 20, // 20-120 kg/ha
        potassium: Math.floor(Math.random() * 120) + 30, // 30-150 kg/ha
        depth1Moisture: Math.floor(Math.random() * 40) + 40, // 40-80%
        depth2Moisture: Math.floor(Math.random() * 35) + 35, // 35-70%
        depth3Moisture: Math.floor(Math.random() * 30) + 25, // 25-55%
        timestamp: new Date().toISOString(),
        location: state.currentLocation
    };
}

// Start soil scan
async function startScan() {
    if (state.isScanning) return;

    state.isScanning = true;
    elements.scanBtn.disabled = true;
    elements.resultsSection.style.display = 'none';
    elements.recommendationsSection.style.display = 'none';
    elements.loadingSection.style.display = 'block';

    // Simulate scanning delay
    await delay(2500);

    // Generate and display results
    const data = generateSoilData();
    displayResults(data);

    // Save to history
    state.readings.unshift(data);
    if (state.readings.length > 20) state.readings.pop(); // Keep last 20
    localStorage.setItem('soilsense_readings', JSON.stringify(state.readings));
    renderHistory();

    // Generate recommendations
    generateRecommendations(data);

    elements.loadingSection.style.display = 'none';
    elements.resultsSection.style.display = 'block';
    elements.recommendationsSection.style.display = 'block';
    elements.scanBtn.disabled = false;
    state.isScanning = false;
}

// Display scan results
function displayResults(data) {
    // Moisture
    elements.moistureValue.textContent = data.moisture;
    elements.moistureBar.style.width = data.moisture + '%';
    updateMoistureStatus(data.moisture);

    // pH
    elements.phValue.textContent = data.pH;
    const phPercent = ((parseFloat(data.pH) - 4) / 6) * 100; // 4-10 scale to percentage
    elements.phMarker.style.left = `calc(${Math.min(100, Math.max(0, phPercent))}% - 4px)`;
    updatePhStatus(parseFloat(data.pH));

    // NPK
    elements.nitrogenValue.textContent = data.nitrogen;
    elements.phosphorusValue.textContent = data.phosphorus;
    elements.potassiumValue.textContent = data.potassium;

    // Depth analysis
    elements.depth1.style.width = data.depth1Moisture + '%';
    elements.depth1Value.textContent = data.depth1Moisture + '%';
    elements.depth2.style.width = data.depth2Moisture + '%';
    elements.depth2Value.textContent = data.depth2Moisture + '%';
    elements.depth3.style.width = data.depth3Moisture + '%';
    elements.depth3Value.textContent = data.depth3Moisture + '%';
}

// Update moisture status message
function updateMoistureStatus(moisture) {
    let status, className;

    if (moisture < 30) {
        status = 'Very Dry - Immediate irrigation needed / बहुत सूखी - तुरंत सिंचाई करें';
        className = 'status-danger';
    } else if (moisture < 45) {
        status = 'Dry - Irrigation recommended / सूखी - सिंचाई की सलाह';
        className = 'status-warning';
    } else if (moisture < 70) {
        status = 'Good moisture level / अच्छा नमी स्तर';
        className = 'status-good';
    } else {
        status = 'Too wet - Avoid watering / बहुत गीली - पानी न दें';
        className = 'status-warning';
    }

    elements.moistureStatus.textContent = status;
    elements.moistureStatus.className = 'result-status ' + className;
}

// Update pH status message
function updatePhStatus(pH) {
    let status, className;

    if (pH < 5.5) {
        status = 'Too acidic - Add lime / बहुत अम्लीय - चूना डालें';
        className = 'status-danger';
    } else if (pH < 6.0) {
        status = 'Slightly acidic / थोड़ी अम्लीय';
        className = 'status-warning';
    } else if (pH <= 7.5) {
        status = 'Optimal pH range / आदर्श पीएच स्तर';
        className = 'status-good';
    } else if (pH <= 8.0) {
        status = 'Slightly alkaline / थोड़ी क्षारीय';
        className = 'status-warning';
    } else {
        status = 'Too alkaline - Add sulfur / बहुत क्षारीय - गंधक डालें';
        className = 'status-danger';
    }

    elements.phStatus.textContent = status;
    elements.phStatus.className = 'result-status ' + className;
}

// Generate recommendations based on soil data and crop
function generateRecommendations(data) {
    const crop = elements.cropSelect.value;
    const optimal = cropOptimalRanges[crop];
    const recommendations = [];

    // pH recommendations
    if (parseFloat(data.pH) < optimal.pH[0]) {
        recommendations.push({
            title: 'pH Correction / पीएच सुधार',
            text: `Add agricultural lime (2-3 kg per bigha) to raise pH. / पीएच बढ़ाने के लिए कृषि चूना (2-3 किलो प्रति बीघा) डालें।`
        });
    } else if (parseFloat(data.pH) > optimal.pH[1]) {
        recommendations.push({
            title: 'pH Correction / पीएच सुधार',
            text: `Add sulfur or gypsum to lower pH. / पीएच कम करने के लिए गंधक या जिप्सम डालें।`
        });
    }

    // Nitrogen recommendations
    if (data.nitrogen < optimal.N[0]) {
        recommendations.push({
            title: 'Nitrogen Deficiency / नाइट्रोजन की कमी',
            text: `Apply urea (${Math.ceil((optimal.N[0] - data.nitrogen) / 2)} kg/bigha) or DAP fertilizer. / यूरिया (${Math.ceil((optimal.N[0] - data.nitrogen) / 2)} किलो/बीघा) या डीएपी खाद डालें।`
        });
    }

    // Phosphorus recommendations
    if (data.phosphorus < optimal.P[0]) {
        recommendations.push({
            title: 'Phosphorus Deficiency / फास्फोरस की कमी',
            text: `Apply SSP or DAP fertilizer for phosphorus. / फास्फोरस के लिए एसएसपी या डीएपी खाद डालें।`
        });
    }

    // Potassium recommendations
    if (data.potassium < optimal.K[0]) {
        recommendations.push({
            title: 'Potassium Deficiency / पोटेशियम की कमी',
            text: `Apply MOP (Muriate of Potash) fertilizer. / एमओपी (म्यूरेट ऑफ पोटाश) खाद डालें।`
        });
    }

    // Moisture recommendations
    if (data.moisture < optimal.moisture[0]) {
        recommendations.push({
            title: 'Irrigation Needed / सिंचाई जरूरी',
            text: `Irrigate within 24-48 hours for optimal ${crop} growth. / ${crop} की बेहतर वृद्धि के लिए 24-48 घंटे में सिंचाई करें।`
        });
    } else if (data.moisture > optimal.moisture[1]) {
        recommendations.push({
            title: 'Excess Moisture / अधिक नमी',
            text: `Ensure proper drainage. Avoid watering for 2-3 days. / उचित जल निकासी सुनिश्चित करें। 2-3 दिन पानी न दें।`
        });
    }

    // If all good
    if (recommendations.length === 0) {
        recommendations.push({
            title: 'Soil Health Good / मिट्टी स्वस्थ है',
            text: `Your soil conditions are optimal for ${crop}. Continue current practices. / आपकी मिट्टी ${crop} के लिए उत्तम है। वर्तमान प्रथाओं को जारी रखें।`
        });
    }

    renderRecommendations(recommendations);
}

// Render recommendations
function renderRecommendations(recommendations) {
    elements.recommendationsList.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <h4>${rec.title}</h4>
            <p>${rec.text}</p>
        </div>
    `).join('');
}

// Update recommendations when crop changes
function updateRecommendations() {
    if (state.readings.length > 0) {
        generateRecommendations(state.readings[0]);
    }
}

// Render history
function renderHistory() {
    if (state.readings.length === 0) {
        elements.historyList.innerHTML = '<p class="no-history">No readings yet / अभी तक कोई रीडिंग नहीं</p>';
        return;
    }

    elements.historyList.innerHTML = state.readings.slice(0, 10).map(reading => {
        const date = new Date(reading.timestamp);
        const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        const locationStr = reading.location ? `📍 ${reading.location.lat.toFixed(4)}, ${reading.location.lng.toFixed(4)}` : '';

        return `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-date">${dateStr}</div>
                    <div class="history-summary">pH: ${reading.pH} | NPK: ${reading.nitrogen}/${reading.phosphorus}/${reading.potassium} | 💧${reading.moisture}%</div>
                    ${locationStr ? `<div class="history-location">${locationStr}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Clear history
function clearHistory() {
    if (confirm('Clear all readings? / सभी रीडिंग मिटाएं?')) {
        state.readings = [];
        localStorage.removeItem('soilsense_readings');
        renderHistory();
        elements.resultsSection.style.display = 'none';
        elements.recommendationsSection.style.display = 'none';
    }
}

// Save GPS location
function saveLocation() {
    if (!navigator.geolocation) {
        elements.locationDisplay.textContent = 'GPS not supported / जीपीएस समर्थित नहीं';
        return;
    }

    elements.locationDisplay.textContent = 'Getting location... / स्थान प्राप्त हो रहा है...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            state.currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            elements.locationDisplay.textContent = `📍 ${state.currentLocation.lat.toFixed(6)}, ${state.currentLocation.lng.toFixed(6)}`;
            elements.locationDisplay.classList.add('location-saved');
        },
        (error) => {
            elements.locationDisplay.textContent = 'Location error / स्थान त्रुटि: ' + error.message;
        },
        { enableHighAccuracy: true }
    );
}

// Utility function for delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
