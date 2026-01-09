/**
 * Crop Disease Detector - AI-powered disease identification
 * Simulates disease detection from crop images
 */

// Disease database for different crops
const diseaseDatabase = {
    wheat: [
        {
            name: "Wheat Rust",
            nameHindi: "गेहूं का रतुआ",
            icon: "🟤",
            symptoms: [
                "Orange-brown pustules on leaves / पत्तियों पर नारंगी-भूरे दाने",
                "Yellowing of leaf tissue / पत्तियों का पीला पड़ना",
                "Reduced grain filling / दाने का कम भरना"
            ],
            treatments: [
                { name: "Propiconazole", desc: "Spray 0.1% solution / 0.1% घोल का छिड़काव" },
                { name: "Mancozeb", desc: "Apply 2.5 kg/ha / 2.5 किग्रा/हेक्टेयर" }
            ],
            prevention: [
                "Use resistant varieties / प्रतिरोधी किस्में लगाएं",
                "Early sowing / जल्दी बुवाई करें",
                "Remove infected debris / संक्रमित अवशेष हटाएं"
            ]
        },
        {
            name: "Powdery Mildew",
            nameHindi: "चूर्णी फफूंदी",
            icon: "⚪",
            symptoms: [
                "White powdery patches / सफेद पाउडर जैसे धब्बे",
                "Leaf curling / पत्तियों का मुड़ना",
                "Stunted growth / विकास रुकना"
            ],
            treatments: [
                { name: "Sulfur dust", desc: "Apply 25 kg/ha / 25 किग्रा/हेक्टेयर" },
                { name: "Karathane", desc: "Spray 0.05% / 0.05% छिड़काव" }
            ],
            prevention: [
                "Avoid dense planting / घनी बुवाई से बचें",
                "Good air circulation / अच्छा हवा संचार",
                "Balanced nitrogen / संतुलित नाइट्रोजन"
            ]
        }
    ],
    rice: [
        {
            name: "Rice Blast",
            nameHindi: "धान का झुलसा",
            icon: "🔥",
            symptoms: [
                "Diamond-shaped lesions / हीरे के आकार के धब्बे",
                "Gray center with brown border / भूरी किनारी वाला धूसर केंद्र",
                "Neck rot / गर्दन सड़न"
            ],
            treatments: [
                { name: "Tricyclazole", desc: "Spray 0.06% / 0.06% छिड़काव" },
                { name: "Carbendazim", desc: "Apply 1 g/L water / 1 ग्राम/लीटर पानी" }
            ],
            prevention: [
                "Balanced fertilization / संतुलित खाद",
                "Avoid excess nitrogen / अधिक नाइट्रोजन से बचें",
                "Resistant varieties / प्रतिरोधी किस्में"
            ]
        },
        {
            name: "Bacterial Leaf Blight",
            nameHindi: "जीवाणु पत्ती झुलसा",
            icon: "🦠",
            symptoms: [
                "Water-soaked lesions / पानी जैसे धब्बे",
                "Yellow to white stripes / पीली से सफेद धारियां",
                "Leaf wilting / पत्ती मुरझाना"
            ],
            treatments: [
                { name: "Streptocycline", desc: "15 g/ha spray / 15 ग्राम/हेक्टेयर" },
                { name: "Copper oxychloride", desc: "0.25% solution / 0.25% घोल" }
            ],
            prevention: [
                "Clip seedling tips / पौध की नोक काटें",
                "Avoid field flooding / खेत में पानी भराव से बचें",
                "Seed treatment / बीज उपचार"
            ]
        }
    ],
    potato: [
        {
            name: "Late Blight",
            nameHindi: "पछेती झुलसा",
            icon: "🖤",
            symptoms: [
                "Dark brown spots / गहरे भूरे धब्बे",
                "White fungal growth / सफेद फफूंद",
                "Rapid leaf death / तेज पत्ती मृत्यु"
            ],
            treatments: [
                { name: "Mancozeb", desc: "Spray 2.5 kg/ha / 2.5 किग्रा/हेक्टेयर" },
                { name: "Metalaxyl", desc: "Apply 2.5 g/L / 2.5 ग्राम/लीटर" }
            ],
            prevention: [
                "Certified seed / प्रमाणित बीज",
                "Destroy infected tubers / संक्रमित कंद नष्ट करें",
                "Good drainage / अच्छा जल निकास"
            ]
        },
        {
            name: "Early Blight",
            nameHindi: "अगेती झुलसा",
            icon: "🟫",
            symptoms: [
                "Concentric ring spots / संकेंद्रित वलय धब्बे",
                "Target board appearance / निशाना बोर्ड जैसा",
                "Lower leaves first / पहले निचली पत्तियां"
            ],
            treatments: [
                { name: "Chlorothalonil", desc: "2 g/L spray / 2 ग्राम/लीटर छिड़काव" },
                { name: "Copper fungicide", desc: "0.3% solution / 0.3% घोल" }
            ],
            prevention: [
                "Crop rotation / फसल चक्र",
                "Remove crop debris / फसल अवशेष हटाएं",
                "Adequate spacing / पर्याप्त दूरी"
            ]
        }
    ],
    tomato: [
        {
            name: "Tomato Leaf Curl",
            nameHindi: "टमाटर पत्ती मोड़",
            icon: "🌀",
            symptoms: [
                "Upward leaf curling / पत्ती ऊपर मुड़ना",
                "Stunted growth / बौना विकास",
                "Yellow leaf margins / पीली पत्ती किनारी"
            ],
            treatments: [
                { name: "Imidacloprid", desc: "Control whitefly vector / सफेद मक्खी नियंत्रण" },
                { name: "Neem oil", desc: "5 ml/L spray / 5 मिली/लीटर छिड़काव" }
            ],
            prevention: [
                "Yellow sticky traps / पीले चिपचिपे जाल",
                "Remove infected plants / संक्रमित पौधे हटाएं",
                "Resistant varieties / प्रतिरोधी किस्में"
            ]
        },
        {
            name: "Fusarium Wilt",
            nameHindi: "फ्यूजेरियम उकठा",
            icon: "💀",
            symptoms: [
                "One-sided wilting / एक तरफा मुरझाना",
                "Yellow lower leaves / पीली निचली पत्तियां",
                "Brown vascular tissue / भूरा संवहनी ऊतक"
            ],
            treatments: [
                { name: "Carbendazim", desc: "Soil drench 1 g/L / मिट्टी में 1 ग्राम/लीटर" },
                { name: "Trichoderma", desc: "Bio-control / जैव नियंत्रण" }
            ],
            prevention: [
                "Crop rotation 3-4 years / 3-4 साल फसल चक्र",
                "Grafted seedlings / कलमी पौध",
                "Soil solarization / मिट्टी सौर्यीकरण"
            ]
        }
    ],
    sugarcane: [
        {
            name: "Red Rot",
            nameHindi: "लाल सड़न",
            icon: "🔴",
            symptoms: [
                "Red internal tissue / लाल आंतरिक ऊतक",
                "White patches in red / लाल में सफेद धब्बे",
                "Sour smell / खट्टी गंध"
            ],
            treatments: [
                { name: "Carbendazim", desc: "Sett treatment 0.1% / सेट उपचार 0.1%" },
                { name: "Hot water treatment", desc: "52°C for 30 min / 52°C पर 30 मिनट" }
            ],
            prevention: [
                "Disease-free setts / रोग मुक्त सेट",
                "Resistant varieties / प्रतिरोधी किस्में",
                "Field sanitation / खेत स्वच्छता"
            ]
        }
    ],
    mustard: [
        {
            name: "White Rust",
            nameHindi: "सफेद रतुआ",
            icon: "⬜",
            symptoms: [
                "White pustules underside / नीचे सफेद दाने",
                "Distorted flowers / विकृत फूल",
                "Staghead formation / स्टैगहेड बनना"
            ],
            treatments: [
                { name: "Metalaxyl", desc: "Seed treatment 6 g/kg / बीज उपचार 6 ग्राम/किग्रा" },
                { name: "Mancozeb", desc: "Spray 0.25% / 0.25% छिड़काव" }
            ],
            prevention: [
                "Early sowing / जल्दी बुवाई",
                "Crop rotation / फसल चक्र",
                "Destroy infected plants / संक्रमित पौधे नष्ट करें"
            ]
        }
    ],
    maize: [
        {
            name: "Maize Leaf Blight",
            nameHindi: "मक्का पत्ती झुलसा",
            icon: "🍂",
            symptoms: [
                "Cigar-shaped lesions / सिगार आकार के धब्बे",
                "Gray-green color / धूसर-हरा रंग",
                "Leaf drying / पत्ती सूखना"
            ],
            treatments: [
                { name: "Mancozeb", desc: "Spray 2.5 g/L / 2.5 ग्राम/लीटर छिड़काव" },
                { name: "Propiconazole", desc: "1 ml/L spray / 1 मिली/लीटर छिड़काव" }
            ],
            prevention: [
                "Resistant hybrids / प्रतिरोधी संकर",
                "Remove crop residue / फसल अवशेष हटाएं",
                "Balanced fertilizer / संतुलित खाद"
            ]
        }
    ],
    cotton: [
        {
            name: "Cotton Leaf Curl",
            nameHindi: "कपास पत्ती मोड़",
            icon: "🌿",
            symptoms: [
                "Upward leaf curling / पत्ती ऊपर मुड़ना",
                "Vein thickening / शिरा मोटी होना",
                "Stunted plants / बौने पौधे"
            ],
            treatments: [
                { name: "Whitefly control", desc: "Spray Imidacloprid / इमिडाक्लोप्रिड छिड़काव" },
                { name: "Neem extract", desc: "5% spray / 5% छिड़काव" }
            ],
            prevention: [
                "Bt cotton varieties / बीटी कपास किस्में",
                "Border crop of maize / मक्का की बॉर्डर फसल",
                "Remove alternate hosts / वैकल्पिक मेजबान हटाएं"
            ]
        }
    ]
};

// State
const state = {
    selectedImage: null,
    history: JSON.parse(localStorage.getItem('disease_history') || '[]'),
    currentResult: null
};

// DOM Elements
const elements = {
    cameraInput: document.getElementById('cameraInput'),
    galleryInput: document.getElementById('galleryInput'),
    previewImage: document.getElementById('previewImage'),
    placeholder: document.getElementById('placeholder'),
    cropSelect: document.getElementById('cropSelect'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    loadingSection: document.getElementById('loadingSection'),
    resultsSection: document.getElementById('resultsSection'),
    historyList: document.getElementById('historyList'),
    clearHistory: document.getElementById('clearHistory'),
    saveResult: document.getElementById('saveResult'),
    shareResult: document.getElementById('shareResult'),
    offlineMsg: document.getElementById('offlineMsg'),
    // Result elements
    diseaseIcon: document.getElementById('diseaseIcon'),
    diseaseName: document.getElementById('diseaseName'),
    diseaseNameHindi: document.getElementById('diseaseNameHindi'),
    confidenceFill: document.getElementById('confidenceFill'),
    confidenceValue: document.getElementById('confidenceValue'),
    severityBadge: document.getElementById('severityBadge'),
    severityText: document.getElementById('severityText'),
    symptomsList: document.getElementById('symptomsList'),
    treatmentList: document.getElementById('treatmentList'),
    preventionList: document.getElementById('preventionList')
};

// Initialize
function init() {
    elements.cameraInput.addEventListener('change', handleImageSelect);
    elements.galleryInput.addEventListener('change', handleImageSelect);
    elements.analyzeBtn.addEventListener('click', analyzeImage);
    elements.clearHistory.addEventListener('click', clearHistory);
    elements.saveResult.addEventListener('click', saveResult);
    elements.shareResult.addEventListener('click', shareResult);

    // Online/offline status
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    renderHistory();
}

function updateOnlineStatus() {
    elements.offlineMsg.style.display = navigator.onLine ? 'none' : 'block';
}

function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            state.selectedImage = event.target.result;
            elements.previewImage.src = state.selectedImage;
            elements.previewImage.style.display = 'block';
            elements.placeholder.style.display = 'none';
            elements.analyzeBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
}

async function analyzeImage() {
    if (!state.selectedImage) return;

    elements.resultsSection.style.display = 'none';
    elements.loadingSection.style.display = 'block';
    elements.analyzeBtn.disabled = true;

    // Simulate AI analysis
    await delay(2000 + Math.random() * 1000);

    const crop = elements.cropSelect.value;
    const diseases = diseaseDatabase[crop] || diseaseDatabase.wheat;
    const disease = diseases[Math.floor(Math.random() * diseases.length)];
    const confidence = 75 + Math.floor(Math.random() * 20);
    const severity = confidence > 90 ? 'high' : confidence > 80 ? 'medium' : 'low';

    state.currentResult = {
        disease,
        confidence,
        severity,
        crop,
        image: state.selectedImage,
        timestamp: new Date().toISOString()
    };

    displayResults(state.currentResult);

    elements.loadingSection.style.display = 'none';
    elements.resultsSection.style.display = 'block';
    elements.analyzeBtn.disabled = false;
}

function displayResults(result) {
    const { disease, confidence, severity } = result;

    elements.diseaseIcon.textContent = disease.icon;
    elements.diseaseName.textContent = disease.name;
    elements.diseaseNameHindi.textContent = disease.nameHindi;

    elements.confidenceFill.style.width = confidence + '%';
    elements.confidenceValue.textContent = confidence + '%';

    elements.severityBadge.className = 'severity-badge severity-' + severity;
    const severityLabels = {
        low: 'Low Risk / कम जोखिम',
        medium: 'Medium Risk / मध्यम जोखिम',
        high: 'High Risk / उच्च जोखिम'
    };
    elements.severityText.textContent = severityLabels[severity];

    // Symptoms
    elements.symptomsList.innerHTML = disease.symptoms
        .map(s => `<li>${s}</li>`).join('');

    // Treatments
    elements.treatmentList.innerHTML = disease.treatments
        .map(t => `<div class="treatment-item"><h4>${t.name}</h4><p>${t.desc}</p></div>`).join('');

    // Prevention
    elements.preventionList.innerHTML = disease.prevention
        .map(p => `<li>${p}</li>`).join('');
}

function saveResult() {
    if (!state.currentResult) return;

    state.history.unshift(state.currentResult);
    if (state.history.length > 10) state.history.pop();
    localStorage.setItem('disease_history', JSON.stringify(state.history));
    renderHistory();

    alert('Result saved! / परिणाम सहेजा गया!');
}

function shareResult() {
    if (!state.currentResult) return;

    const text = `Crop Disease Detection Result:\n` +
        `Disease: ${state.currentResult.disease.name}\n` +
        `Hindi: ${state.currentResult.disease.nameHindi}\n` +
        `Confidence: ${state.currentResult.confidence}%\n` +
        `Crop: ${state.currentResult.crop}\n\n` +
        `Via FarmTech UP`;

    if (navigator.share) {
        navigator.share({ title: 'Disease Detection', text });
    } else {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard! / क्लिपबोर्ड पर कॉपी हो गया!');
    }
}

function renderHistory() {
    if (state.history.length === 0) {
        elements.historyList.innerHTML = '<p class="no-history">No scans yet / अभी तक कोई जांच नहीं</p>';
        return;
    }

    elements.historyList.innerHTML = state.history.slice(0, 5).map(item => {
        const date = new Date(item.timestamp);
        const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        return `
            <div class="history-item">
                <img src="${item.image}" alt="Scan" class="history-thumb">
                <div class="history-info">
                    <div class="history-disease">${item.disease.name}</div>
                    <div class="history-date">${dateStr} - ${item.crop}</div>
                </div>
            </div>
        `;
    }).join('');
}

function clearHistory() {
    if (confirm('Clear all history? / सारा इतिहास मिटाएं?')) {
        state.history = [];
        localStorage.removeItem('disease_history');
        renderHistory();
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', init);
