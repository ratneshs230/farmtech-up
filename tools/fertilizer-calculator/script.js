/**
 * Fertilizer Calculator - Smart fertilizer recommendations
 */

// NPK requirements per hectare (kg) for different crops
const cropNPK = {
    wheat: { N: 120, P: 60, K: 40, schedule: ['basal', 'tillering', 'heading'] },
    rice: { N: 100, P: 50, K: 50, schedule: ['basal', 'tillering', 'panicle'] },
    sugarcane: { N: 150, P: 80, K: 60, schedule: ['planting', 'earthing1', 'earthing2'] },
    potato: { N: 180, P: 100, K: 150, schedule: ['planting', 'earthing'] },
    mustard: { N: 80, P: 40, K: 40, schedule: ['basal', 'first_irrigation'] },
    maize: { N: 120, P: 60, K: 40, schedule: ['basal', 'knee_high', 'tasseling'] },
    vegetables: { N: 100, P: 50, K: 50, schedule: ['basal', 'growth', 'fruiting'] }
};

// Soil adjustment factors
const soilFactors = {
    alluvial: { N: 1.0, P: 1.0, K: 1.0 },
    clay: { N: 0.9, P: 1.1, K: 0.9 },
    sandy: { N: 1.2, P: 0.9, K: 1.2 },
    loamy: { N: 0.95, P: 1.0, K: 0.95 }
};

// Yield target multipliers
const yieldFactors = { low: 0.7, medium: 1.0, high: 1.3 };

// Area conversion to hectare
const areaToHectare = { bigha: 0.25, acre: 0.4047, hectare: 1 };

// Fertilizer prices (₹/kg)
const fertilizerPrices = {
    urea: 6, dap: 27, mop: 18, ssp: 8
};

// Schedule labels
const scheduleLabels = {
    basal: { en: 'At Sowing', hi: 'बुवाई के समय' },
    tillering: { en: 'At Tillering', hi: 'कल्ले फूटते समय' },
    heading: { en: 'At Heading', hi: 'बाली निकलते समय' },
    panicle: { en: 'At Panicle', hi: 'बाली निकलते समय' },
    planting: { en: 'At Planting', hi: 'रोपाई/बुवाई के समय' },
    earthing1: { en: 'First Earthing', hi: 'पहली मिट्टी चढ़ाते समय' },
    earthing2: { en: 'Second Earthing', hi: 'दूसरी मिट्टी चढ़ाते समय' },
    earthing: { en: 'At Earthing', hi: 'मिट्टी चढ़ाते समय' },
    first_irrigation: { en: 'First Irrigation', hi: 'पहली सिंचाई पर' },
    knee_high: { en: 'Knee High Stage', hi: 'घुटने तक ऊंचाई पर' },
    tasseling: { en: 'At Tasseling', hi: 'नर फूल आने पर' },
    growth: { en: 'Active Growth', hi: 'सक्रिय वृद्धि पर' },
    fruiting: { en: 'At Fruiting', hi: 'फल आने पर' }
};

const elements = {
    cropSelect: document.getElementById('cropSelect'),
    areaValue: document.getElementById('areaValue'),
    areaUnit: document.getElementById('areaUnit'),
    soilSelect: document.getElementById('soilSelect'),
    yieldTarget: document.getElementById('yieldTarget'),
    calculateBtn: document.getElementById('calculateBtn'),
    resultsSection: document.getElementById('resultsSection'),
    nitrogenNeed: document.getElementById('nitrogenNeed'),
    phosphorusNeed: document.getElementById('phosphorusNeed'),
    potassiumNeed: document.getElementById('potassiumNeed'),
    fertilizerList: document.getElementById('fertilizerList'),
    scheduleList: document.getElementById('scheduleList'),
    costDisplay: document.getElementById('costDisplay'),
    tipsList: document.getElementById('tipsList'),
    historyList: document.getElementById('historyList')
};

let history = JSON.parse(localStorage.getItem('fertilizer_history') || '[]');

function init() {
    elements.calculateBtn.addEventListener('click', calculate);
    renderHistory();
}

function calculate() {
    const crop = elements.cropSelect.value;
    const area = parseFloat(elements.areaValue.value);
    const unit = elements.areaUnit.value;
    const soil = elements.soilSelect.value;
    const yieldLevel = elements.yieldTarget.value;

    if (!area || area <= 0) {
        alert('Please enter valid field area / कृपया सही खेत क्षेत्र दर्ज करें');
        return;
    }

    // Convert to hectare
    const hectares = area * areaToHectare[unit];

    // Get base NPK
    const baseNPK = cropNPK[crop];
    const soilFactor = soilFactors[soil];
    const yieldFactor = yieldFactors[yieldLevel];

    // Calculate adjusted NPK
    const N = Math.round(baseNPK.N * soilFactor.N * yieldFactor * hectares);
    const P = Math.round(baseNPK.P * soilFactor.P * yieldFactor * hectares);
    const K = Math.round(baseNPK.K * soilFactor.K * yieldFactor * hectares);

    // Display NPK needs
    elements.nitrogenNeed.textContent = N;
    elements.phosphorusNeed.textContent = P;
    elements.potassiumNeed.textContent = K;

    // Calculate fertilizers
    const fertilizers = calculateFertilizers(N, P, K);
    renderFertilizers(fertilizers);

    // Render schedule
    renderSchedule(crop, fertilizers);

    // Calculate cost
    const cost = calculateCost(fertilizers);
    elements.costDisplay.textContent = `₹${cost.toLocaleString()}`;

    // Render tips
    renderTips(crop, soil);

    // Show results
    elements.resultsSection.style.display = 'block';

    // Save to history
    saveToHistory(crop, area, unit, N, P, K, cost);
}

function calculateFertilizers(N, P, K) {
    // Calculate fertilizer quantities
    // DAP: 18% N, 46% P2O5
    // Urea: 46% N
    // MOP: 60% K2O
    // SSP: 16% P2O5

    const dap = Math.round(P / 0.46); // DAP for phosphorus
    const dapN = dap * 0.18; // N from DAP
    const urea = Math.round((N - dapN) / 0.46); // Remaining N from urea
    const mop = Math.round(K / 0.60); // MOP for potassium

    return {
        urea: Math.max(0, urea),
        dap: Math.max(0, dap),
        mop: Math.max(0, mop)
    };
}

function renderFertilizers(fertilizers) {
    const fertData = [
        { name: 'Urea', hindi: 'यूरिया', qty: fertilizers.urea },
        { name: 'DAP', hindi: 'डीएपी', qty: fertilizers.dap },
        { name: 'MOP', hindi: 'एमओपी', qty: fertilizers.mop }
    ];

    elements.fertilizerList.innerHTML = fertData.map(f => `
        <div class="fertilizer-item">
            <div>
                <div class="fertilizer-name">${f.name}</div>
                <div class="fertilizer-hindi">${f.hindi}</div>
            </div>
            <div class="fertilizer-qty">
                <span class="amount">${f.qty}</span>
                <span class="unit">kg</span>
            </div>
        </div>
    `).join('');
}

function renderSchedule(crop, fertilizers) {
    const schedule = cropNPK[crop].schedule;
    const splitRatio = schedule.length === 3 ? [0.5, 0.25, 0.25] : [0.6, 0.4];

    elements.scheduleList.innerHTML = schedule.map((stage, i) => {
        const label = scheduleLabels[stage] || { en: stage, hi: stage };
        const urea = Math.round(fertilizers.urea * splitRatio[i]);
        const dap = i === 0 ? fertilizers.dap : 0;
        const mop = i === 0 ? fertilizers.mop : 0;

        let desc = [];
        if (dap > 0) desc.push(`DAP: ${dap} kg`);
        if (mop > 0) desc.push(`MOP: ${mop} kg`);
        if (urea > 0) desc.push(`Urea: ${urea} kg`);

        return `
            <div class="schedule-item">
                <div class="schedule-time">${label.en}<br>${label.hi}</div>
                <div class="schedule-desc">${desc.join(', ')}</div>
            </div>
        `;
    }).join('');
}

function calculateCost(fertilizers) {
    return Math.round(
        fertilizers.urea * fertilizerPrices.urea +
        fertilizers.dap * fertilizerPrices.dap +
        fertilizers.mop * fertilizerPrices.mop
    );
}

function renderTips(crop, soil) {
    const tips = [
        '💧 Apply fertilizer when soil has moisture / जब मिट्टी में नमी हो तब खाद डालें',
        '🌅 Best time: Early morning or evening / सबसे अच्छा समय: सुबह या शाम',
        '⚖️ Mix DAP and MOP before application / DAP और MOP मिलाकर डालें'
    ];

    if (soil === 'sandy') {
        tips.push('⚠️ Apply N in more splits for sandy soil / बलुई मिट्टी में N अधिक बार में दें');
    }

    if (crop === 'rice') {
        tips.push('🌾 Apply urea in standing water for rice / धान में खड़े पानी में यूरिया दें');
    }

    elements.tipsList.innerHTML = tips.map(t => `<div class="tip-item">${t}</div>`).join('');
}

function saveToHistory(crop, area, unit, N, P, K, cost) {
    history.unshift({
        crop, area, unit, N, P, K, cost,
        date: new Date().toISOString()
    });
    if (history.length > 10) history.pop();
    localStorage.setItem('fertilizer_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        elements.historyList.innerHTML = '<p class="no-history">No saved calculations / कोई सहेजी गई गणना नहीं</p>';
        return;
    }

    elements.historyList.innerHTML = history.slice(0, 5).map(h => {
        const date = new Date(h.date).toLocaleDateString('en-IN');
        return `
            <div class="history-item">
                <strong>${h.crop}</strong> - ${h.area} ${h.unit}<br>
                <small>NPK: ${h.N}/${h.P}/${h.K} kg | ₹${h.cost} | ${date}</small>
            </div>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', init);
