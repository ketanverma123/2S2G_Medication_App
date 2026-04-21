// ── TAB SWITCHING ──
function switchBnav(id, el) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  el.classList.add('active');
}

// ── TOAST ──
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-text').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── TOGGLE BUTTON GROUP ──
function setToggleValue(inputId, value, clickedBtn) {
  const hiddenInput = document.getElementById(inputId);
  if (hiddenInput) hiddenInput.value = value;

  const group = clickedBtn.parentElement;
  if (!group) return;
  group.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
  clickedBtn.classList.add('active');
}

// ── REMINDER TYPE ICON ──
function getReminderIcon(type) {
  switch (type) {
    case 'Alarm Set':             return '⏰';
    case 'Push Notification Set': return '📱';
    case 'Notifications On':      return '🔔';
    case 'Send Email':            return '✉️';
    case 'Caregiver Alert':       return '👥';
    default:                      return '🔔';
  }
}
