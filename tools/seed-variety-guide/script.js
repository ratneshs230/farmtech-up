const seedData = {
    wheat: [
        { name: 'HD-2967', hindi: 'एचडी-2967', yield: '50-55', duration: '140-145', tags: ['yield', 'popular'], features: ['High yield / अधिक उपज', 'Rust resistant / रतुआ प्रतिरोधी', 'Good chapati quality / अच्छी रोटी गुणवत्ता'], seedRate: '100', suitableFor: 'Irrigated / सिंचित' },
        { name: 'PBW-343', hindi: 'पीबीडब्ल्यू-343', yield: '45-50', duration: '130-135', tags: ['early', 'popular'], features: ['Early maturing / जल्दी पकना', 'Yellow rust tolerant / पीला रतुआ सहनशील'], seedRate: '100', suitableFor: 'Timely sown / समय पर बुवाई' },
        { name: 'HD-3086', hindi: 'एचडी-3086', yield: '55-60', duration: '145-150', tags: ['yield', 'disease'], features: ['Very high yield / बहुत अधिक उपज', 'Multiple disease resistant / बहु रोग प्रतिरोधी'], seedRate: '100', suitableFor: 'Late sown / देर से बुवाई' },
        { name: 'DBW-187', hindi: 'डीबीडब्ल्यू-187', yield: '50-55', duration: '135-140', tags: ['disease'], features: ['Karnal bunt resistant / करनाल बंट प्रतिरोधी', 'Good grain quality / अच्छी दाना गुणवत्ता'], seedRate: '100', suitableFor: 'All conditions / सभी स्थिति' }
    ],
    rice: [
        { name: 'Pusa Basmati-1121', hindi: 'पूसा बासमती-1121', yield: '45-50', duration: '140-145', tags: ['yield', 'popular'], features: ['Extra long grain / बहुत लंबा दाना', 'Premium price / प्रीमियम मूल्य'], seedRate: '20', suitableFor: 'Transplanted / रोपाई' },
        { name: 'Swarna', hindi: 'स्वर्णा', yield: '55-60', duration: '150-155', tags: ['yield'], features: ['High yield / अधिक उपज', 'Good for lowland / निचली भूमि के लिए'], seedRate: '25', suitableFor: 'Lowland / निचली भूमि' },
        { name: 'Sahbhagi Dhan', hindi: 'सहभागी धान', yield: '40-45', duration: '105-110', tags: ['early', 'disease'], features: ['Drought tolerant / सूखा सहनशील', 'Short duration / कम अवधि'], seedRate: '30', suitableFor: 'Rainfed / बारानी' },
        { name: 'Pusa-44', hindi: 'पूसा-44', yield: '60-65', duration: '145-150', tags: ['yield'], features: ['Very high yield / बहुत अधिक उपज', 'Semi-dwarf / अर्ध बौना'], seedRate: '25', suitableFor: 'Irrigated / सिंचित' }
    ],
    mustard: [
        { name: 'Pusa Bold', hindi: 'पूसा बोल्ड', yield: '18-20', duration: '125-130', tags: ['yield', 'popular'], features: ['Bold seed / मोटा दाना', 'High oil content / उच्च तेल'], seedRate: '5', suitableFor: 'Irrigated / सिंचित' },
        { name: 'RH-749', hindi: 'आरएच-749', yield: '20-22', duration: '130-135', tags: ['yield', 'disease'], features: ['White rust resistant / सफेद रतुआ प्रतिरोधी', 'High yield / अधिक उपज'], seedRate: '5', suitableFor: 'All conditions / सभी स्थिति' },
        { name: 'NRCHB-101', hindi: 'एनआरसीएचबी-101', yield: '22-25', duration: '120-125', tags: ['early', 'yield'], features: ['Early maturing / जल्दी पकना', 'High oil / उच्च तेल'], seedRate: '4', suitableFor: 'Timely sown / समय पर बुवाई' }
    ],
    potato: [
        { name: 'Kufri Pukhraj', hindi: 'कुफरी पुखराज', yield: '300-350', duration: '90-100', tags: ['yield', 'popular'], features: ['High yield / अधिक उपज', 'Yellow flesh / पीला गूदा', 'Good storage / अच्छा भंडारण'], seedRate: '25-30', suitableFor: 'Plains / मैदानी' },
        { name: 'Kufri Jyoti', hindi: 'कुफरी ज्योति', yield: '250-300', duration: '90-110', tags: ['disease'], features: ['Late blight tolerant / पछेती झुलसा सहनशील', 'White flesh / सफेद गूदा'], seedRate: '25-30', suitableFor: 'All conditions / सभी स्थिति' },
        { name: 'Kufri Bahar', hindi: 'कुफरी बहार', yield: '280-320', duration: '95-105', tags: ['yield'], features: ['Good for chips / चिप्स के लिए', 'Oval tubers / अंडाकार कंद'], seedRate: '25-30', suitableFor: 'Processing / प्रसंस्करण' }
    ]
};

let selectedForCompare = [];

function init() {
    document.getElementById('cropSelect').addEventListener('change', renderVarieties);
    document.getElementById('prioritySelect').addEventListener('change', renderVarieties);
    document.getElementById('clearCompare').addEventListener('click', clearComparison);
    renderVarieties();
}

function renderVarieties() {
    const crop = document.getElementById('cropSelect').value;
    const priority = document.getElementById('prioritySelect').value;
    let varieties = seedData[crop] || [];

    if (priority !== 'all') {
        varieties = varieties.filter(v => v.tags.includes(priority));
    }

    const container = document.getElementById('varietiesSection');
    container.innerHTML = varieties.map(v => `
        <div class="variety-card">
            <div class="variety-header">
                <div>
                    <div class="variety-name">${v.name}</div>
                    <div class="variety-hindi">${v.hindi}</div>
                </div>
            </div>
            <div class="variety-badges">
                ${v.tags.map(t => `<span class="badge badge-${t}">${getTagLabel(t)}</span>`).join('')}
            </div>
            <div class="variety-stats">
                <div class="stat-item"><div class="stat-value">${v.yield}</div><div class="stat-label">Yield q/ha</div></div>
                <div class="stat-item"><div class="stat-value">${v.duration}</div><div class="stat-label">Days</div></div>
                <div class="stat-item"><div class="stat-value">${v.seedRate}</div><div class="stat-label">kg/ha seed</div></div>
            </div>
            <div class="variety-features">
                ${v.features.map(f => `<div class="feature-item">✓ ${f}</div>`).join('')}
            </div>
            <button class="btn-compare ${selectedForCompare.includes(v.name) ? 'selected' : ''}" onclick="toggleCompare('${v.name}')">
                ${selectedForCompare.includes(v.name) ? '✓ Selected' : '+ Compare'}
            </button>
        </div>
    `).join('');
}

function getTagLabel(tag) {
    const labels = { yield: 'High Yield', disease: 'Disease Resistant', early: 'Early', popular: 'Popular' };
    return labels[tag] || tag;
}

function toggleCompare(name) {
    if (selectedForCompare.includes(name)) {
        selectedForCompare = selectedForCompare.filter(n => n !== name);
    } else if (selectedForCompare.length < 3) {
        selectedForCompare.push(name);
    }
    renderVarieties();
    updateComparison();
}

function updateComparison() {
    const section = document.getElementById('comparisonSection');
    if (selectedForCompare.length < 2) {
        section.style.display = 'none';
        return;
    }

    const crop = document.getElementById('cropSelect').value;
    const varieties = seedData[crop].filter(v => selectedForCompare.includes(v.name));

    document.getElementById('comparisonTable').innerHTML = `
        <table class="compare-table">
            <tr><th>Feature</th>${varieties.map(v => `<th>${v.name}</th>`).join('')}</tr>
            <tr><td>Yield (q/ha)</td>${varieties.map(v => `<td>${v.yield}</td>`).join('')}</tr>
            <tr><td>Duration (days)</td>${varieties.map(v => `<td>${v.duration}</td>`).join('')}</tr>
            <tr><td>Seed Rate</td>${varieties.map(v => `<td>${v.seedRate} kg/ha</td>`).join('')}</tr>
            <tr><td>Suitable For</td>${varieties.map(v => `<td>${v.suitableFor}</td>`).join('')}</tr>
        </table>
    `;
    section.style.display = 'block';
}

function clearComparison() {
    selectedForCompare = [];
    renderVarieties();
    document.getElementById('comparisonSection').style.display = 'none';
}

window.toggleCompare = toggleCompare;
document.addEventListener('DOMContentLoaded', init);
