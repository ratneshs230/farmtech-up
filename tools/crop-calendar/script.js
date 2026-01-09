const cropCalendars = {
    wheat: {
        name: 'Wheat / गेहूं',
        months: {
            'Oct': [{ type: 'sowing', text: 'Field prep / खेत तैयारी' }],
            'Nov': [{ type: 'sowing', text: 'Sowing / बुवाई' }, { type: 'irrigation', text: 'First irrigation / पहली सिंचाई' }],
            'Dec': [{ type: 'irrigation', text: 'Second irrigation' }, { type: 'fertilizer', text: 'Urea top dress' }],
            'Jan': [{ type: 'irrigation', text: 'Third irrigation' }, { type: 'pest', text: 'Aphid watch' }],
            'Feb': [{ type: 'irrigation', text: 'Fourth irrigation' }, { type: 'fertilizer', text: 'Final urea' }],
            'Mar': [{ type: 'irrigation', text: 'Fifth irrigation' }, { type: 'pest', text: 'Rust watch' }],
            'Apr': [{ type: 'harvest', text: 'Harvest / कटाई' }]
        }
    },
    rice: {
        name: 'Rice / धान',
        months: {
            'May': [{ type: 'sowing', text: 'Nursery / नर्सरी' }],
            'Jun': [{ type: 'sowing', text: 'Transplanting / रोपाई' }],
            'Jul': [{ type: 'fertilizer', text: 'First dose' }, { type: 'irrigation', text: 'Maintain water' }],
            'Aug': [{ type: 'fertilizer', text: 'Second dose' }, { type: 'pest', text: 'BPH watch' }],
            'Sep': [{ type: 'pest', text: 'Blast watch' }],
            'Oct': [{ type: 'harvest', text: 'Harvest / कटाई' }]
        }
    },
    sugarcane: {
        name: 'Sugarcane / गन्ना',
        months: {
            'Feb': [{ type: 'sowing', text: 'Spring planting / वसंत बुवाई' }],
            'Mar': [{ type: 'irrigation', text: 'Regular irrigation' }],
            'Apr': [{ type: 'fertilizer', text: 'First earthing' }],
            'May': [{ type: 'irrigation', text: 'Increase frequency' }],
            'Jun': [{ type: 'fertilizer', text: 'Second earthing' }],
            'Oct': [{ type: 'sowing', text: 'Autumn planting / पतझड़ बुवाई' }],
            'Dec': [{ type: 'harvest', text: 'Harvest begins / कटाई शुरू' }]
        }
    },
    potato: {
        name: 'Potato / आलू',
        months: {
            'Oct': [{ type: 'sowing', text: 'Planting / बुवाई' }],
            'Nov': [{ type: 'irrigation', text: 'First irrigation' }, { type: 'fertilizer', text: 'Top dress' }],
            'Dec': [{ type: 'irrigation', text: 'Regular irrigation' }, { type: 'pest', text: 'Blight watch' }],
            'Jan': [{ type: 'fertilizer', text: 'Earthing up' }],
            'Feb': [{ type: 'harvest', text: 'Harvest / खुदाई' }]
        }
    },
    mustard: {
        name: 'Mustard / सरसों',
        months: {
            'Oct': [{ type: 'sowing', text: 'Sowing / बुवाई' }],
            'Nov': [{ type: 'irrigation', text: 'First irrigation' }, { type: 'fertilizer', text: 'Top dress' }],
            'Dec': [{ type: 'pest', text: 'Aphid spray' }],
            'Jan': [{ type: 'irrigation', text: 'Pre-flowering irrigation' }],
            'Feb': [{ type: 'harvest', text: 'Harvest / कटाई' }]
        }
    },
    maize: {
        name: 'Maize / मक्का',
        months: {
            'Jun': [{ type: 'sowing', text: 'Kharif sowing / खरीफ बुवाई' }],
            'Jul': [{ type: 'fertilizer', text: 'First top dress' }, { type: 'irrigation', text: 'Regular' }],
            'Aug': [{ type: 'fertilizer', text: 'Second top dress' }],
            'Sep': [{ type: 'harvest', text: 'Harvest / कटाई' }],
            'Feb': [{ type: 'sowing', text: 'Rabi sowing / रबी बुवाई' }]
        }
    }
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let reminders = JSON.parse(localStorage.getItem('crop_reminders') || '[]');

function init() {
    document.getElementById('cropSelect').addEventListener('change', renderCalendar);
    document.getElementById('addReminder').addEventListener('click', addReminder);
    renderCalendar();
    renderReminders();
}

function renderCalendar() {
    const crop = document.getElementById('cropSelect').value;
    const calendar = cropCalendars[crop];
    const currentMonth = months[new Date().getMonth()];

    const calendarHTML = months.map(month => {
        const tasks = calendar.months[month] || [];
        const isCurrentMonth = month === currentMonth;
        return `
            <div class="month-row ${isCurrentMonth ? 'current-month' : ''}">
                <span class="month-name">${month}</span>
                <div class="month-tasks">
                    ${tasks.map(t => `<span class="task-badge task-${t.type}">${t.text}</span>`).join('')}
                    ${tasks.length === 0 ? '<span style="color:#999;font-size:0.8rem">-</span>' : ''}
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('calendarSection').innerHTML = calendarHTML;
    renderCurrentTasks(calendar, currentMonth);
}

function renderCurrentTasks(calendar, currentMonth) {
    const tasks = calendar.months[currentMonth] || [];
    const container = document.getElementById('currentTasks');

    if (tasks.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#999;">No tasks this month / इस महीने कोई कार्य नहीं</p>';
        return;
    }

    container.innerHTML = tasks.map(t => `
        <div class="task-item">
            <div class="task-title">${t.text}</div>
            <div class="task-desc">Complete this task in ${currentMonth} for best results / ${currentMonth} में यह कार्य पूरा करें</div>
        </div>
    `).join('');
}

function addReminder() {
    const text = document.getElementById('reminderText').value;
    const date = document.getElementById('reminderDate').value;
    if (!text || !date) return alert('Please fill all fields / सभी फ़ील्ड भरें');

    reminders.push({ text, date, id: Date.now() });
    localStorage.setItem('crop_reminders', JSON.stringify(reminders));
    document.getElementById('reminderText').value = '';
    document.getElementById('reminderDate').value = '';
    renderReminders();
}

function removeReminder(id) {
    reminders = reminders.filter(r => r.id !== id);
    localStorage.setItem('crop_reminders', JSON.stringify(reminders));
    renderReminders();
}

function renderReminders() {
    const container = document.getElementById('remindersList');
    if (reminders.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#999;font-style:italic;">No reminders set</p>';
        return;
    }
    container.innerHTML = reminders.map(r => `
        <div class="reminder-item">
            <span>${r.text} - ${new Date(r.date).toLocaleDateString('en-IN')}</span>
            <button onclick="removeReminder(${r.id})" style="background:none;border:none;cursor:pointer;">🗑️</button>
        </div>
    `).join('');
}

window.removeReminder = removeReminder;
document.addEventListener('DOMContentLoaded', init);
