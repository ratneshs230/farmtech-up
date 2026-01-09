/**
 * Weather Alert - Farming weather forecasts and alerts
 */

const weatherConditions = [
    { condition: 'Sunny', hindi: 'धूप', icon: '☀️', irrigation: 'high' },
    { condition: 'Partly Cloudy', hindi: 'आंशिक बादल', icon: '⛅', irrigation: 'medium' },
    { condition: 'Cloudy', hindi: 'बादल', icon: '☁️', irrigation: 'low' },
    { condition: 'Light Rain', hindi: 'हल्की बारिश', icon: '🌦️', irrigation: 'none' },
    { condition: 'Rain', hindi: 'बारिश', icon: '🌧️', irrigation: 'none' },
    { condition: 'Thunderstorm', hindi: 'आंधी-तूफान', icon: '⛈️', irrigation: 'none' },
    { condition: 'Fog', hindi: 'कोहरा', icon: '🌫️', irrigation: 'low' },
    { condition: 'Haze', hindi: 'धुंध', icon: '🌁', irrigation: 'medium' }
];

const alerts = [
    { type: 'severe', icon: '🌡️', title: 'Heat Wave Alert', titleHindi: 'लू की चेतावनी', desc: 'Expected 44°C+ tomorrow. Protect crops and animals.' },
    { type: 'moderate', icon: '🌧️', title: 'Heavy Rain Expected', titleHindi: 'भारी बारिश की संभावना', desc: 'Rainfall 50mm+ in next 48 hours. Ensure drainage.' },
    { type: 'mild', icon: '💨', title: 'Strong Winds', titleHindi: 'तेज हवाएं', desc: 'Wind speed 30-40 km/h. Secure loose materials.' },
    { type: 'moderate', icon: '❄️', title: 'Frost Warning', titleHindi: 'पाला चेतावनी', desc: 'Temperature may drop below 4°C tonight.' }
];

const farmingTips = {
    hot: [
        '🌡️ Apply mulch to retain soil moisture / मल्च लगाएं नमी बनाए रखने के लिए',
        '💧 Irrigate early morning or evening / सुबह जल्दी या शाम को सिंचाई करें',
        '🏠 Provide shade for young plants / छोटे पौधों को छाया दें'
    ],
    rainy: [
        '🚰 Ensure proper field drainage / खेत में जल निकासी सुनिश्चित करें',
        '🛡️ Apply fungicide preventively / रोकथाम के लिए कवकनाशी डालें',
        '📦 Harvest ready crops before rain / बारिश से पहले तैयार फसल काट लें'
    ],
    cold: [
        '🔥 Use smoke to protect from frost / पाले से बचाव के लिए धुआं करें',
        '💧 Light irrigation before frost night / पाले वाली रात से पहले हल्की सिंचाई',
        '🌾 Cover sensitive crops / संवेदनशील फसलों को ढकें'
    ],
    normal: [
        '✅ Good conditions for spraying / छिड़काव के लिए अच्छी स्थिति',
        '🌱 Ideal for transplanting / रोपाई के लिए आदर्श',
        '📋 Check crops for pest/disease / कीट/रोग के लिए फसल जांचें'
    ]
};

const districts = ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Gorakhpur'];

function init() {
    loadWeatherData();
    setInterval(loadWeatherData, 300000); // Refresh every 5 minutes
}

function loadWeatherData() {
    // Simulate current weather
    const weather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    const temp = Math.floor(Math.random() * 20) + 20; // 20-40°C
    const humidity = Math.floor(Math.random() * 40) + 40; // 40-80%
    const wind = Math.floor(Math.random() * 30) + 5; // 5-35 km/h
    const rainfall = weather.condition.includes('Rain') ? Math.floor(Math.random() * 30) : 0;
    const district = districts[Math.floor(Math.random() * districts.length)];

    // Update current weather
    document.getElementById('weatherIcon').textContent = weather.icon;
    document.getElementById('tempValue').textContent = temp;
    document.getElementById('condition').textContent = `${weather.condition} / ${weather.hindi}`;
    document.getElementById('location').textContent = `📍 ${district}, UP`;
    document.getElementById('humidity').textContent = `${humidity}%`;
    document.getElementById('wind').textContent = `${wind} km/h`;
    document.getElementById('rainfall').textContent = `${rainfall} mm`;

    // Load alerts (randomly show 0-2 alerts)
    loadAlerts();

    // Load forecast
    loadForecast();

    // Load farming tips based on conditions
    loadFarmingTips(temp, weather);

    // Load irrigation advice
    loadIrrigationAdvice(temp, humidity, rainfall, weather);
}

function loadAlerts() {
    const alertsContainer = document.getElementById('alertsList');
    const activeAlerts = Math.random() > 0.5 ? alerts.slice(0, Math.floor(Math.random() * 2) + 1) : [];

    if (activeAlerts.length === 0) {
        alertsContainer.innerHTML = '<div class="no-alerts">✅ No active alerts / कोई सक्रिय अलर्ट नहीं</div>';
        return;
    }

    alertsContainer.innerHTML = activeAlerts.map(alert => `
        <div class="alert-item ${alert.type}">
            <span class="alert-icon">${alert.icon}</span>
            <div class="alert-text">
                <div class="alert-title">${alert.title} / ${alert.titleHindi}</div>
                <div class="alert-desc">${alert.desc}</div>
            </div>
        </div>
    `).join('');
}

function loadForecast() {
    const days = ['Today', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hindiDays = ['आज', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'];

    const forecastContainer = document.getElementById('forecastList');
    forecastContainer.innerHTML = days.map((day, i) => {
        const weather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const highTemp = Math.floor(Math.random() * 15) + 25;
        const lowTemp = highTemp - Math.floor(Math.random() * 10) - 5;
        const rainChance = weather.condition.includes('Rain') ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 30);

        return `
            <div class="forecast-day ${i === 0 ? 'today' : ''}">
                <div class="forecast-name">${day}<br>${hindiDays[i]}</div>
                <div class="forecast-icon">${weather.icon}</div>
                <div class="forecast-temp">${highTemp}° / ${lowTemp}°</div>
                <div class="forecast-rain">🌧️ ${rainChance}%</div>
            </div>
        `;
    }).join('');
}

function loadFarmingTips(temp, weather) {
    let tipCategory = 'normal';
    if (temp >= 38) tipCategory = 'hot';
    else if (weather.condition.includes('Rain')) tipCategory = 'rainy';
    else if (temp <= 10) tipCategory = 'cold';

    const tips = farmingTips[tipCategory];
    const tipsContainer = document.getElementById('farmingTips');

    tipsContainer.innerHTML = tips.map(tip => `<div class="tip-item">${tip}</div>`).join('');
}

function loadIrrigationAdvice(temp, humidity, rainfall, weather) {
    const adviceContainer = document.getElementById('irrigationAdvice');
    let advice = [];

    if (rainfall > 10 || weather.irrigation === 'none') {
        advice.push('🚫 <strong>Skip irrigation today</strong> - Rain expected / आज सिंचाई न करें - बारिश की संभावना');
        advice.push('📅 Next irrigation: After 2-3 days / अगली सिंचाई: 2-3 दिन बाद');
    } else if (temp >= 35 && humidity < 50) {
        advice.push('⚠️ <strong>Urgent irrigation needed</strong> / तत्काल सिंचाई जरूरी');
        advice.push('⏰ Best time: 5-7 AM or 5-7 PM / सबसे अच्छा समय: सुबह 5-7 या शाम 5-7');
        advice.push('💧 Apply 5-6 cm water / 5-6 सेमी पानी दें');
    } else if (weather.irrigation === 'high') {
        advice.push('💧 <strong>Light irrigation recommended</strong> / हल्की सिंचाई की सलाह');
        advice.push('⏰ Irrigate in evening / शाम को सिंचाई करें');
    } else {
        advice.push('✅ <strong>Normal irrigation schedule</strong> / सामान्य सिंचाई कार्यक्रम');
        advice.push('📋 Check soil moisture before irrigating / सिंचाई से पहले मिट्टी की नमी जांचें');
    }

    adviceContainer.innerHTML = advice.map(a => `<p>${a}</p>`).join('');
}

document.addEventListener('DOMContentLoaded', init);
