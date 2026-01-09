const cropData = {
    wheat: { baseYield: 5.5, unit: 'quintals', price: 2200, inputCost: 8000, tips: ['Use certified seeds / प्रमाणित बीज', 'Timely irrigation / समय पर सिंचाई', 'Balanced fertilizer / संतुलित खाद'] },
    rice: { baseYield: 6.0, unit: 'quintals', price: 2100, inputCost: 10000, tips: ['SRI method / एसआरआई पद्धति', 'Proper spacing / उचित दूरी', 'Weed control / खरपतवार नियंत्रण'] },
    sugarcane: { baseYield: 90, unit: 'quintals', price: 350, inputCost: 15000, tips: ['Trench planting / नाली रोपण', 'Earthing up / मिट्टी चढ़ाना', 'Ratoon management / पेड़ी प्रबंधन'] },
    potato: { baseYield: 35, unit: 'quintals', price: 1200, inputCost: 25000, tips: ['Disease-free seed / रोगमुक्त बीज', 'Proper earthing / सही मिट्टी चढ़ाना', 'Timely harvest / समय पर खुदाई'] },
    mustard: { baseYield: 2.5, unit: 'quintals', price: 5000, inputCost: 5000, tips: ['Line sowing / कतार बुवाई', 'Aphid control / माहू नियंत्रण', 'Irrigation at flowering / फूल पर सिंचाई'] }
};

const soilFactors = { poor: 0.7, average: 1.0, good: 1.2 };
const irrigationFactors = { rainfed: 0.6, partial: 0.85, full: 1.0 };

function init() {
    document.getElementById('estimateBtn').addEventListener('click', estimateYield);
}

function estimateYield() {
    const crop = document.getElementById('cropSelect').value;
    const area = parseFloat(document.getElementById('area').value);
    const soil = document.getElementById('soilQuality').value;
    const irrigation = document.getElementById('irrigation').value;

    if (!area || area <= 0) {
        alert('Please enter valid area / कृपया सही क्षेत्र दर्ज करें');
        return;
    }

    const data = cropData[crop];
    const adjustedYield = data.baseYield * soilFactors[soil] * irrigationFactors[irrigation];
    const totalYield = Math.round(adjustedYield * area * 10) / 10;
    const perBigha = Math.round(adjustedYield * 10) / 10;
    const marketValue = Math.round(totalYield * data.price);
    const totalInputCost = Math.round(data.inputCost * area);
    const netProfit = marketValue - totalInputCost;

    document.getElementById('yieldValue').textContent = totalYield;
    document.getElementById('yieldUnit').textContent = data.unit;
    document.getElementById('areaDisplay').textContent = area;
    document.getElementById('perBigha').textContent = perBigha + ' ' + data.unit.charAt(0);
    document.getElementById('marketValue').textContent = '₹' + marketValue.toLocaleString();
    document.getElementById('inputCost').textContent = '₹' + totalInputCost.toLocaleString();
    document.getElementById('netProfit').textContent = '₹' + netProfit.toLocaleString();

    document.getElementById('tipsList').innerHTML = data.tips.map(t => `<div class="tip-item">✓ ${t}</div>`).join('');
    document.getElementById('resultsSection').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', init);
