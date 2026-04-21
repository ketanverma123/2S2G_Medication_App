// ── ALERT STATE ──
let alerts = [
  {
    id: 'appearance-metformin',
    type: 'warning',
    icon: '⚠️',
    title: 'Metformin appearance changed',
    text: 'Your pharmacy switched brands. The pill looks different — it is still the same medicine. See photo inside.'
  }
];

let currentAlertIndex = 0;
const missedDoseAlertsShown = {};

// ── RENDER BANNER ──
function renderCurrentAlert() {
  const banner  = document.getElementById('main-alert-banner');
  const icon    = document.getElementById('main-alert-icon');
  const count   = document.getElementById('main-alert-count');
  const title   = document.getElementById('main-alert-title');
  const text    = document.getElementById('main-alert-text');
  const nextBtn = document.getElementById('next-alert-btn');

  if (!alerts.length) {
    banner.style.display = 'none';
    return;
  }

  if (currentAlertIndex >= alerts.length) currentAlertIndex = 0;

  const alert = alerts[currentAlertIndex];

  banner.style.display = 'flex';
  banner.classList.remove('warning', 'info', 'success');
  banner.classList.add(alert.type);

  icon.textContent  = alert.icon;
  count.textContent = alerts.length === 1 ? '1 Alert' : `${alerts.length} Alerts`;
  title.textContent = alert.title;
  text.textContent  = alert.text;

  nextBtn.style.display = alerts.length > 1 ? 'block' : 'none';
}

function showNextAlert() {
  if (alerts.length <= 1) return;
  currentAlertIndex = (currentAlertIndex + 1) % alerts.length;
  renderCurrentAlert();
}

function dismissCurrentAlert() {
  if (!alerts.length) return;

  const removed = alerts[currentAlertIndex];
  alerts.splice(currentAlertIndex, 1);

  if (removed.id && removed.id.startsWith('missed-')) {
    const reminderId = removed.id.replace('missed-', '');
    missedDoseAlertsShown[reminderId] = true;
  }

  if (currentAlertIndex >= alerts.length) currentAlertIndex = 0;
  renderCurrentAlert();
}

function addAlert(newAlert) {
  if (alerts.some(a => a.id === newAlert.id)) return;
  alerts.push(newAlert);
  renderCurrentAlert();
}

function removeMissedAlertForReminder(reminderId) {
  alerts = alerts.filter(a => a.id !== 'missed-' + reminderId);
}

// ── MISSED DOSE DETECTION ──
function isReminderMissed(reminderId) {
  const btn = document.getElementById('check-' + reminderId);
  if (!btn || btn.classList.contains('taken')) return false;

  const reminder = appState.reminders.find(r => r.id === reminderId);
  if (!reminder) return false;

  const dueTime = new Date();
  const parsed  = parseTimeString(reminder.time);
  dueTime.setHours(parsed.hours, parsed.minutes, 0, 0);

  return new Date() > dueTime;
}

function checkMissedDoses() {
  appState.reminders.forEach(reminder => {
    if (isReminderMissed(reminder.id) && !missedDoseAlertsShown[reminder.id]) {
      const med = appState.medicines.find(m => m.id === reminder.medId);
      if (!med) return;

      addAlert({
        id:    'missed-' + reminder.id,
        type:  'warning',
        icon:  '⏰',
        title: `${med.name} may have been missed`,
        text:  `The ${reminder.time} reminder looks overdue. Review the medication instructions or contact your care team if you are unsure what to do.`
      });
    }
  });
}
