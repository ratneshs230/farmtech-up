/**
 * Mandi Price Tracker - Real-time market prices for farmers
 */

const priceData = {
    grains: [
        { name: "Wheat", hindi: "गेहूं", basePrice: 2200, unit: "quintal" },
        { name: "Rice (Paddy)", hindi: "धान", basePrice: 2100, unit: "quintal" },
        { name: "Maize", hindi: "मक्का", basePrice: 1850, unit: "quintal" },
        { name: "Barley", hindi: "जौ", basePrice: 1750, unit: "quintal" },
        { name: "Bajra", hindi: "बाजरा", basePrice: 2250, unit: "quintal" }
    ],
    vegetables: [
        { name: "Potato", hindi: "आलू", basePrice: 1200, unit: "quintal" },
        { name: "Onion", hindi: "प्याज", basePrice: 1800, unit: "quintal" },
        { name: "Tomato", hindi: "टमाटर", basePrice: 2500, unit: "quintal" },
        { name: "Cauliflower", hindi: "फूलगोभी", basePrice: 1500, unit: "quintal" },
        { name: "Cabbage", hindi: "पत्तागोभी", basePrice: 800, unit: "quintal" }
    ],
    pulses: [
        { name: "Chana", hindi: "चना", basePrice: 5200, unit: "quintal" },
        { name: "Moong", hindi: "मूंग", basePrice: 7500, unit: "quintal" },
        { name: "Urad", hindi: "उड़द", basePrice: 6800, unit: "quintal" },
        { name: "Masoor", hindi: "मसूर", basePrice: 5500, unit: "quintal" },
        { name: "Arhar", hindi: "अरहर", basePrice: 6500, unit: "quintal" }
    ],
    oilseeds: [
        { name: "Mustard", hindi: "सरसों", basePrice: 5000, unit: "quintal" },
        { name: "Groundnut", hindi: "मूंगफली", basePrice: 5500, unit: "quintal" },
        { name: "Soybean", hindi: "सोयाबीन", basePrice: 4200, unit: "quintal" },
        { name: "Sunflower", hindi: "सूरजमुखी", basePrice: 5800, unit: "quintal" }
    ]
};

const state = {
    currentCategory: 'grains',
    alerts: JSON.parse(localStorage.getItem('price_alerts') || '[]'),
    prices: {}
};

const elements = {
    districtSelect: document.getElementById('districtSelect'),
    mandiSelect: document.getElementById('mandiSelect'),
    refreshBtn: document.getElementById('refreshBtn'),
    lastUpdated: document.getElementById('lastUpdated'),
    priceList: document.getElementById('priceList'),
    alertCrop: document.getElementById('alertCrop'),
    alertPrice: document.getElementById('alertPrice'),
    addAlert: document.getElementById('addAlert'),
    alertsList: document.getElementById('alertsList'),
    chartBars: document.getElementById('chartBars'),
    chartLabels: document.getElementById('chartLabels'),
    offlineMsg: document.getElementById('offlineMsg')
};

function init() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchCategory(btn.dataset.category));
    });

    elements.refreshBtn.addEventListener('click', refreshPrices);
    elements.addAlert.addEventListener('click', addPriceAlert);
    elements.districtSelect.addEventListener('change', refreshPrices);
    elements.mandiSelect.addEventListener('change', refreshPrices);

    window.addEventListener('online', () => elements.offlineMsg.style.display = 'none');
    window.addEventListener('offline', () => elements.offlineMsg.style.display = 'block');

    refreshPrices();
    renderAlerts();
    renderTrendChart();
}

function switchCategory(category) {
    state.currentCategory = category;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    renderPrices();
}

function refreshPrices() {
    // Simulate price fetching with variation
    const district = elements.districtSelect.value;
    const variation = { lucknow: 1.02, kanpur: 0.98, agra: 1.01, varanasi: 0.97, allahabad: 1.0, meerut: 1.03, gorakhpur: 0.96, bareilly: 0.99 };
    const multiplier = variation[district] || 1;

    Object.keys(priceData).forEach(category => {
        state.prices[category] = priceData[category].map(item => ({
            ...item,
            price: Math.round(item.basePrice * multiplier * (0.95 + Math.random() * 0.1)),
            change: Math.round((Math.random() - 0.5) * 200)
        }));
    });

    const now = new Date();
    elements.lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString('en-IN')} / अंतिम अपडेट: ${now.toLocaleTimeString('hi-IN')}`;

    renderPrices();
    checkAlerts();
}

function renderPrices() {
    const prices = state.prices[state.currentCategory] || [];
    elements.priceList.innerHTML = prices.map(item => {
        const changeClass = item.change > 0 ? 'price-up' : item.change < 0 ? 'price-down' : 'price-stable';
        const changeIcon = item.change > 0 ? '↑' : item.change < 0 ? '↓' : '→';
        return `
            <div class="price-item">
                <div class="crop-info">
                    <div class="crop-name">${item.name}</div>
                    <div class="crop-hindi">${item.hindi}</div>
                </div>
                <div class="price-info">
                    <div class="current-price">₹${item.price.toLocaleString()}</div>
                    <div class="price-unit">per ${item.unit} / प्रति ${item.unit === 'quintal' ? 'क्विंटल' : item.unit}</div>
                    <div class="price-change ${changeClass}">${changeIcon} ₹${Math.abs(item.change)}</div>
                </div>
            </div>
        `;
    }).join('');
}

function addPriceAlert() {
    const crop = elements.alertCrop.value;
    const price = parseInt(elements.alertPrice.value);

    if (!crop || !price) {
        alert('Please select crop and enter price / कृपया फसल चुनें और भाव दर्ज करें');
        return;
    }

    state.alerts.push({ crop, price, id: Date.now() });
    localStorage.setItem('price_alerts', JSON.stringify(state.alerts));
    renderAlerts();

    elements.alertCrop.value = '';
    elements.alertPrice.value = '';
}

function removeAlert(id) {
    state.alerts = state.alerts.filter(a => a.id !== id);
    localStorage.setItem('price_alerts', JSON.stringify(state.alerts));
    renderAlerts();
}

function renderAlerts() {
    if (state.alerts.length === 0) {
        elements.alertsList.innerHTML = '<p style="text-align:center;color:#8d6e63;font-style:italic;">No alerts set / कोई अलर्ट नहीं</p>';
        return;
    }

    elements.alertsList.innerHTML = state.alerts.map(alert => `
        <div class="alert-item">
            <span>${alert.crop} when ₹${alert.price}+ / जब ₹${alert.price}+</span>
            <button class="btn-delete" onclick="removeAlert(${alert.id})">🗑️</button>
        </div>
    `).join('');
}

function checkAlerts() {
    state.alerts.forEach(alert => {
        const allPrices = Object.values(state.prices).flat();
        const crop = allPrices.find(p => p.name.toLowerCase().includes(alert.crop.toLowerCase()));
        if (crop && crop.price >= alert.price) {
            if (Notification.permission === 'granted') {
                new Notification(`Price Alert: ${crop.name}`, {
                    body: `Current price ₹${crop.price} is above your alert ₹${alert.price}`
                });
            }
        }
    });
}

function renderTrendChart() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const heights = [60, 75, 70, 85, 90, 80, 95];

    elements.chartBars.innerHTML = heights.map(h => `<div class="chart-bar" style="height: ${h}%"></div>`).join('');
    elements.chartLabels.innerHTML = days.map(d => `<span>${d}</span>`).join('');
}

// Make removeAlert globally accessible
window.removeAlert = removeAlert;

document.addEventListener('DOMContentLoaded', init);
