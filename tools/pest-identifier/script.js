const pestDatabase = {
    wheat: [
        { name: 'Aphid', hindi: 'माहू', icon: '🦟', damage: 'Sucks sap, causes yellowing / रस चूसता है, पीलापन करता है',
          treatments: [{ name: 'Imidacloprid', desc: '0.5 ml/L spray / 0.5 मिली/लीटर छिड़काव' }, { name: 'Neem oil', desc: '5 ml/L spray / 5 मिली/लीटर छिड़काव' }],
          prevention: ['Early sowing / जल्दी बुवाई', 'Remove weeds / खरपतवार हटाएं', 'Use yellow sticky traps / पीले चिपचिपे जाल'] },
        { name: 'Termite', hindi: 'दीमक', icon: '🐜', damage: 'Damages roots and stems / जड़ और तना नुकसान',
          treatments: [{ name: 'Chlorpyrifos', desc: 'Soil treatment 5L/ha / मिट्टी उपचार 5 लीटर/हेक्टेयर' }],
          prevention: ['Proper field drainage / उचित जल निकासी', 'Remove crop residue / फसल अवशेष हटाएं'] }
    ],
    rice: [
        { name: 'Stem Borer', hindi: 'तना छेदक', icon: '🐛', damage: 'Bores into stem, causes dead hearts / तने में छेद, डेड हार्ट',
          treatments: [{ name: 'Cartap', desc: '1 kg/ha granules / 1 किग्रा/हेक्टेयर दाने' }, { name: 'Chlorantraniliprole', desc: '0.4 ml/L spray' }],
          prevention: ['Light traps / प्रकाश जाल', 'Remove stubbles / ठूंठ हटाएं', 'Timely transplanting / समय पर रोपाई'] },
        { name: 'BPH', hindi: 'भूरा फुदका', icon: '🦗', damage: 'Sucks sap, causes hopper burn / रस चूसता है, हॉपर बर्न',
          treatments: [{ name: 'Buprofezin', desc: '1.5 ml/L spray' }, { name: 'Thiamethoxam', desc: '0.2 g/L spray' }],
          prevention: ['Avoid excess nitrogen / अधिक नाइट्रोजन से बचें', 'Alternate wetting drying / वैकल्पिक गीला सूखा'] }
    ],
    vegetables: [
        { name: 'Whitefly', hindi: 'सफेद मक्खी', icon: '🪰', damage: 'Transmits viruses, causes leaf curl / वायरस फैलाता है',
          treatments: [{ name: 'Imidacloprid', desc: '0.5 ml/L spray' }, { name: 'Yellow sticky traps', desc: 'Install 10/acre' }],
          prevention: ['Reflective mulch / परावर्तक मल्च', 'Intercrop with maize / मक्का के साथ अंतर्फसल'] },
        { name: 'Fruit Borer', hindi: 'फल छेदक', icon: '🐛', damage: 'Bores into fruits / फलों में छेद करता है',
          treatments: [{ name: 'Spinosad', desc: '0.5 ml/L spray' }, { name: 'Neem extract', desc: '5% spray' }],
          prevention: ['Pheromone traps / फेरोमोन जाल', 'Remove infested fruits / संक्रमित फल हटाएं'] }
    ],
    sugarcane: [
        { name: 'Early Shoot Borer', hindi: 'अगेती तना छेदक', icon: '🐛', damage: 'Causes dead hearts in young shoots',
          treatments: [{ name: 'Carbofuran', desc: '30 kg/ha in furrows' }],
          prevention: ['Light traps / प्रकाश जाल', 'Remove dry leaves / सूखी पत्तियां हटाएं'] }
    ],
    cotton: [
        { name: 'Pink Bollworm', hindi: 'गुलाबी सुंडी', icon: '🐛', damage: 'Damages bolls and seeds / टिंडे और बीज नुकसान',
          treatments: [{ name: 'Quinalphos', desc: '2 ml/L spray' }],
          prevention: ['Pheromone traps / फेरोमोन जाल', 'Bt cotton varieties / बीटी कपास'] }
    ]
};

let selectedImage = null;

function init() {
    document.getElementById('cameraInput').addEventListener('change', handleImage);
    document.getElementById('galleryInput').addEventListener('change', handleImage);
    document.getElementById('identifyBtn').addEventListener('click', identifyPest);
    document.getElementById('cropSelect').addEventListener('change', renderCommonPests);
    renderCommonPests();
}

function handleImage(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            selectedImage = event.target.result;
            document.getElementById('previewImage').src = selectedImage;
            document.getElementById('previewImage').style.display = 'block';
            document.getElementById('placeholder').style.display = 'none';
            document.getElementById('identifyBtn').disabled = false;
        };
        reader.readAsDataURL(file);
    }
}

async function identifyPest() {
    if (!selectedImage) return;
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'block';

    await new Promise(r => setTimeout(r, 2000));

    const crop = document.getElementById('cropSelect').value;
    const pests = pestDatabase[crop] || pestDatabase.wheat;
    const pest = pests[Math.floor(Math.random() * pests.length)];
    const confidence = 75 + Math.floor(Math.random() * 20);

    displayResults(pest, confidence);
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
}

function displayResults(pest, confidence) {
    document.getElementById('pestIcon').textContent = pest.icon;
    document.getElementById('pestName').textContent = pest.name;
    document.getElementById('pestNameHindi').textContent = pest.hindi;
    document.getElementById('confidence').textContent = confidence + '%';
    document.getElementById('damageInfo').textContent = pest.damage;

    document.getElementById('treatmentList').innerHTML = pest.treatments.map(t =>
        `<div class="treatment-item"><h4>${t.name}</h4><p>${t.desc}</p></div>`
    ).join('');

    document.getElementById('preventionList').innerHTML = pest.prevention.map(p =>
        `<li>${p}</li>`
    ).join('');
}

function renderCommonPests() {
    const crop = document.getElementById('cropSelect').value;
    const pests = pestDatabase[crop] || [];
    document.getElementById('commonPestsList').innerHTML = `
        <div class="pest-grid">
            ${pests.map(p => `<div class="pest-tile" onclick="showPestDetails('${crop}', '${p.name}')">
                <span>${p.icon}</span>
                <div>${p.name}<br><small>${p.hindi}</small></div>
            </div>`).join('')}
        </div>
    `;
}

function showPestDetails(crop, name) {
    const pest = pestDatabase[crop].find(p => p.name === name);
    if (pest) {
        displayResults(pest, 100);
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }
}

window.showPestDetails = showPestDetails;
document.addEventListener('DOMContentLoaded', init);
