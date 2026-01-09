const waterRates = { tubewell: 500, canal: 200, pond: 100 }; // Liters per hour
const costRates = { tubewell: 50, canal: 20, pond: 10 }; // Rs per hour
let logs = JSON.parse(localStorage.getItem('water_logs') || '[]');

function init() {
    document.getElementById('logBtn').addEventListener('click', logIrrigation);
    updateSummary();
    renderHistory();
}

function logIrrigation() {
    const field = document.getElementById('fieldSelect').value;
    const duration = parseFloat(document.getElementById('duration').value);
    const source = document.getElementById('sourceSelect').value;

    if (!duration || duration <= 0) {
        alert('Please enter valid duration / कृपया सही समय दर्ज करें');
        return;
    }

    const water = Math.round(duration * waterRates[source]);
    const cost = Math.round(duration * costRates[source]);

    logs.unshift({
        field, duration, source, water, cost,
        date: new Date().toISOString(),
        id: Date.now()
    });

    if (logs.length > 50) logs.pop();
    localStorage.setItem('water_logs', JSON.stringify(logs));

    document.getElementById('duration').value = '';
    updateSummary();
    renderHistory();
}

function updateSummary() {
    const totalWater = logs.reduce((sum, l) => sum + l.water, 0);
    const totalCost = logs.reduce((sum, l) => sum + l.cost, 0);
    const days = new Set(logs.map(l => l.date.split('T')[0])).size || 1;
    const avgDaily = Math.round(totalWater / days);

    document.getElementById('totalWater').textContent = totalWater.toLocaleString();
    document.getElementById('avgDaily').textContent = avgDaily.toLocaleString();
    document.getElementById('totalCost').textContent = '₹' + totalCost.toLocaleString();
}

function renderHistory() {
    const container = document.getElementById('historyList');
    if (logs.length === 0) {
        container.innerHTML = '<p class="no-history">No irrigation logs / कोई सिंचाई लॉग नहीं</p>';
        return;
    }

    const fieldNames = { field1: 'Field 1', field2: 'Field 2', field3: 'Field 3' };
    const sourceNames = { tubewell: 'Tubewell', canal: 'Canal', pond: 'Pond' };

    container.innerHTML = logs.slice(0, 10).map(l => `
        <div class="history-item">
            <div class="history-info">
                <div class="history-field">${fieldNames[l.field]}</div>
                <div class="history-details">${sourceNames[l.source]} • ${l.duration}h • ${new Date(l.date).toLocaleDateString('en-IN')}</div>
            </div>
            <div class="history-water">${l.water}L<br><small>₹${l.cost}</small></div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', init);
