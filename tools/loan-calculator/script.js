const loanTypes = {
    kcc: { defaultRate: 7, subsidyRate: 4, maxAmount: 300000, name: 'KCC' },
    crop: { defaultRate: 9, subsidyRate: 7, maxAmount: 500000, name: 'Crop Loan' },
    equipment: { defaultRate: 10, subsidyRate: 8, maxAmount: 1000000, name: 'Equipment Loan' }
};

let currentType = 'kcc';

function init() {
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => selectLoanType(btn.dataset.type));
    });
    document.getElementById('calculateBtn').addEventListener('click', calculateEMI);
    updateRateHint();
}

function selectLoanType(type) {
    currentType = type;
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
    const loan = loanTypes[type];
    document.getElementById('interestRate').value = loan.defaultRate;
    updateRateHint();
}

function updateRateHint() {
    const loan = loanTypes[currentType];
    document.querySelector('.hint').textContent = `Subsidy rate: ${loan.subsidyRate}% / सब्सिडी दर: ${loan.subsidyRate}%`;
}

function calculateEMI() {
    const principal = parseFloat(document.getElementById('loanAmount').value);
    const tenure = parseInt(document.getElementById('tenure').value);
    const rate = parseFloat(document.getElementById('interestRate').value);

    if (!principal || !tenure || !rate) {
        alert('Please fill all fields / कृपया सभी फ़ील्ड भरें');
        return;
    }

    const monthlyRate = rate / 12 / 100;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
    const totalPayable = emi * tenure;
    const totalInterest = totalPayable - principal;

    document.getElementById('emiValue').textContent = Math.round(emi).toLocaleString();
    document.getElementById('principal').textContent = '₹' + principal.toLocaleString();
    document.getElementById('totalInterest').textContent = '₹' + Math.round(totalInterest).toLocaleString();
    document.getElementById('totalPayable').textContent = '₹' + Math.round(totalPayable).toLocaleString();

    // Subsidy calculation
    const loan = loanTypes[currentType];
    const subsidyRate = loan.subsidyRate;
    const subsidyMonthlyRate = subsidyRate / 12 / 100;
    const subsidyEMI = principal * subsidyMonthlyRate * Math.pow(1 + subsidyMonthlyRate, tenure) / (Math.pow(1 + subsidyMonthlyRate, tenure) - 1);
    const subsidyTotal = subsidyEMI * tenure;
    const savings = totalPayable - subsidyTotal;

    document.getElementById('subsidyInfo').innerHTML = `
        <h4>💰 With Subsidy / सब्सिडी के साथ</h4>
        <p>EMI at ${subsidyRate}%: ₹${Math.round(subsidyEMI).toLocaleString()}/month</p>
        <p>You save: ₹${Math.round(savings).toLocaleString()} / आप बचाते हैं: ₹${Math.round(savings).toLocaleString()}</p>
    `;

    document.getElementById('resultsSection').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', init);
