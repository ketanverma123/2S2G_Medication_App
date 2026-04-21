// ── EDIT MODE TRACKING ──
let editingReminderId = null;

// ── RENDER SCHEDULE SCREEN ──
function renderScheduleReminders() {
  const container = document.getElementById('schedule-reminders-list');
  if (!container) return;
  container.innerHTML = '';

  const sorted = [...appState.reminders].sort((a, b) =>
    reminderTimeToMinutes(a.time) - reminderTimeToMinutes(b.time)
  );

  sorted.forEach((reminder, index) => {
    const med = appState.medicines.find(m => m.id === reminder.medId);
    if (!med) return;

    const connector = index < sorted.length - 1
      ? `<div class="time-connector"></div>` : '';
    const speakerChip = reminder.speaker === 'Smart speaker'
      ? `<div class="reminder-chip">📢 Smart speaker</div>`
      : `<div class="reminder-chip inactive">📢 No speaker alarm</div>`;
    const dotColor = REMINDER_DOT_COLORS[index % REMINDER_DOT_COLORS.length];

    container.innerHTML += `
      <div class="time-block">
        <div class="time-label">${reminder.time}</div>
        <div class="time-line">
          <div class="time-dot" style="background:${dotColor}"></div>
          ${connector}
        </div>
        <div class="time-content" style="padding:10px 0 20px">
          <div style="font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;color:var(--text-dark)">
            ${reminder.label}
          </div>
          <div style="font-size:13px;color:var(--text-medium);margin-top:4px">
            Take <strong>${med.name} ${reminder.dosage || ''}</strong>
          </div>
          <div style="font-size:13px;color:var(--text-medium);margin-top:4px">
            ${reminder.smallNote || ''}
          </div>
          <div class="reminder-row" style="margin-top:8px">
            <div class="reminder-chip">
              ${getReminderIcon(reminder.reminderType)} ${reminder.reminderType}
            </div>
            ${speakerChip}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
            <button class="medium-btn" style="background:var(--gold-pale);color:var(--maroon);"
              onclick="openEditReminderModal('${reminder.id}')">Edit</button>
            <button class="medium-btn" style="background:var(--red-light);color:var(--red);"
              onclick="deleteReminder('${reminder.id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  });
}

// ── ADD REMINDER MODAL ──
function openAddReminderModal() {
  editingReminderId = null;
  populateMedicationDropdown();
  clearAddReminderForm();
  document.getElementById('add-reminder-modal-title').textContent    = 'Add Reminder';
  document.getElementById('add-reminder-modal-subtitle').textContent = 'Create a simple medicine reminder.';
  document.getElementById('save-reminder-btn').textContent            = '➕ Save Reminder';
  document.getElementById('add-reminder-modal').classList.add('open');
}
function closeAddReminderModal(event) {
  if (event.target === document.getElementById('add-reminder-modal'))
    document.getElementById('add-reminder-modal').classList.remove('open');
}
function closeAddReminderModalDirect() {
  document.getElementById('add-reminder-modal').classList.remove('open');
}

// ── EDIT REMINDER MODAL ──
function openEditReminderModal(reminderId) {
  const reminder = appState.reminders.find(r => r.id === reminderId);
  if (!reminder) return;

  editingReminderId = reminderId;
  populateMedicationDropdown();
  clearAddReminderForm();

  // Pre-fill fields
  document.getElementById('reminder-medication').value = reminder.medId;

  const [timeStr, ampm] = reminder.time.split(' ');
  document.getElementById('reminder-label').value = reminder.label;
  document.getElementById('reminder-time').value  = timeStr;
  document.getElementById('reminder-ampm').value  = ampm || 'AM';

  // Parse dosage: supports "500 mg", "500mg", "2 pill(s)"
  const dosageMatch = (reminder.dosage || '').match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
  if (dosageMatch) {
    document.getElementById('reminder-dosage-amount').value = dosageMatch[1];
    const unit = dosageMatch[2].trim();
    const unitSel = document.getElementById('reminder-dosage-unit');
    const match = Array.from(unitSel.options).find(o => o.value === unit);
    unitSel.value = match ? unit : 'mg';
  }

  document.getElementById('reminder-type').value       = reminder.reminderType || 'Alarm Set';
  document.getElementById('reminder-small-note').value = reminder.smallNote || '';

  // Speaker toggle
  const speakerOn = reminder.speaker === 'Smart speaker';
  document.getElementById('reminder-speaker').value = speakerOn ? 'On' : 'Off';
  document.querySelectorAll('#reminder-speaker-toggle .toggle-btn').forEach((btn, i) => {
    btn.classList.toggle('active', speakerOn ? i === 0 : i === 1);
  });

  // Pre-fill steps
  const stepsContainer = document.getElementById('reminder-steps-list');
  stepsContainer.innerHTML = '';
  (reminder.steps || []).forEach(step => addReminderStepRow(step));

  document.getElementById('add-reminder-modal-title').textContent    = 'Edit Reminder';
  document.getElementById('add-reminder-modal-subtitle').textContent = 'Update this reminder\'s details.';
  document.getElementById('save-reminder-btn').textContent            = '✏️ Update Reminder';

  document.getElementById('add-reminder-modal').classList.add('open');
}

// ── POPULATE MEDICATION DROPDOWN ──
function populateMedicationDropdown() {
  const select = document.getElementById('reminder-medication');
  if (!select) return;
  select.innerHTML = '';
  appState.medicines.forEach(med => {
    const opt = document.createElement('option');
    opt.value       = med.id;
    opt.textContent = med.name;
    select.appendChild(opt);
  });
}

// ── CLEAR REMINDER FORM ──
function clearAddReminderForm() {
  document.getElementById('reminder-label').value        = '';
  document.getElementById('reminder-time').value         = '';
  document.getElementById('reminder-ampm').value         = 'AM';
  document.getElementById('reminder-dosage-amount').value = '';
  document.getElementById('reminder-dosage-unit').value  = 'mg';
  document.getElementById('reminder-type').value         = 'Alarm Set';
  document.getElementById('reminder-speaker').value      = 'On';
  document.getElementById('reminder-small-note').value   = '';

  document.querySelectorAll('#reminder-speaker-toggle .toggle-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === 0);
  });

  const stepsContainer = document.getElementById('reminder-steps-list');
  if (stepsContainer) {
    stepsContainer.innerHTML = '';
    addReminderStepRow();
  }
}

// ── STEP ROWS ──
function addReminderStepRow(value = '') {
  const container = document.getElementById('reminder-steps-list');
  if (!container) return;

  const stepNumber = container.children.length + 1;
  const row = document.createElement('div');
  row.className = 'reminder-step-row';
  row.style.cssText = 'display:flex;align-items:center;gap:10px;';

  row.innerHTML = `
    <div style="
      min-width:32px;height:32px;border-radius:50%;background:var(--maroon);color:white;
      display:flex;align-items:center;justify-content:center;
      font-family:'Nunito',sans-serif;font-weight:800;font-size:14px;flex-shrink:0;">
      ${stepNumber}
    </div>
    <input type="text" class="reminder-step-input"
      placeholder="Enter step ${stepNumber}"
      value="${value.replace(/"/g, '&quot;')}"
      style="flex:1;padding:14px;border-radius:12px;border:1px solid #D8D1CA;font-size:15px;">
    <button type="button" onclick="removeReminderStepRow(this)"
      aria-label="Remove step ${stepNumber}"
      style="border:none;background:#FDECEA;color:#C0392B;border-radius:10px;
             padding:10px 12px;cursor:pointer;font-weight:800;">✕</button>
  `;

  container.appendChild(row);
  renumberReminderStepRows();
}

function removeReminderStepRow(buttonEl) {
  const row = buttonEl.closest('.reminder-step-row');
  if (row) { row.remove(); renumberReminderStepRows(); }
}

function renumberReminderStepRows() {
  document.querySelectorAll('#reminder-steps-list .reminder-step-row').forEach((row, index) => {
    const n = index + 1;
    row.children[0].textContent = n;
    row.querySelector('.reminder-step-input').placeholder = `Enter step ${n}`;
    row.querySelector('button').setAttribute('aria-label', `Remove step ${n}`);
  });
}

// ── SAVE REMINDER FORM (add or edit) ──
function saveReminderForm() {
  const medId         = document.getElementById('reminder-medication').value;
  const label         = document.getElementById('reminder-label').value.trim();
  const time          = document.getElementById('reminder-time').value.trim();
  const ampm          = document.getElementById('reminder-ampm').value;
  const dosageAmount  = document.getElementById('reminder-dosage-amount').value.trim();
  const dosageUnit    = document.getElementById('reminder-dosage-unit').value;
  const reminderType  = document.getElementById('reminder-type').value;
  const speakerToggle = document.getElementById('reminder-speaker').value;
  const smallNote     = document.getElementById('reminder-small-note').value.trim();
  const steps = Array.from(document.querySelectorAll('.reminder-step-input'))
    .map(i => i.value.trim()).filter(Boolean);

  if (!medId)                        { showToast('Please choose a medication.'); return; }
  if (!label)                        { showToast('Please enter a reminder title.'); return; }
  if (!/^(1[0-2]|[1-9]):[0-5][0-9]$/.test(time)) { showToast('Please enter time like 8:00.'); return; }
  if (!dosageAmount || !dosageUnit)  { showToast('Please enter a dosage.'); return; }
  if (!steps.length)                 { showToast('Please add at least one step.'); return; }

  const fullTime = `${time} ${ampm}`;
  const dosage   = `${dosageAmount} ${dosageUnit}`;
  const speaker  = speakerToggle === 'On' ? 'Smart speaker' : 'No speaker alarm';

  if (editingReminderId) {
    // ── UPDATE EXISTING ──
    const reminder = appState.reminders.find(r => r.id === editingReminderId);
    if (!reminder) return;

    reminder.medId        = medId;
    reminder.label        = label;
    reminder.time         = fullTime;
    reminder.dosage       = dosage;
    reminder.reminderType = reminderType;
    reminder.speaker      = speaker;
    reminder.smallNote    = smallNote;
    reminder.steps        = steps;

    saveState();
    renderTodayMedications();
    renderScheduleReminders();
    updateProgress();
    checkMissedDoses();
    closeAddReminderModalDirect();
    showToast('✅ Reminder updated!');

  } else {
    // ── ADD NEW ──
    const newReminder = {
      id: `${medId}-reminder-${Date.now()}`,
      medId, label, time: fullTime, dosage,
      reminderType, speaker,
      smallNote: smallNote || '',
      steps
    };

    appState.reminders.push(newReminder);
    saveState();
    renderTodayMedications();
    renderScheduleReminders();
    updateProgress();
    checkMissedDoses();
    closeAddReminderModalDirect();
    showToast('✅ New reminder added!');
  }
}

// ── DELETE REMINDER ──
function deleteReminder(reminderId) {
  const reminder = appState.reminders.find(r => r.id === reminderId);
  if (!reminder) return;

  const med = appState.medicines.find(m => m.id === reminder.medId);
  const name = med ? `${med.name} (${reminder.label})` : reminder.label;

  if (!confirm(`Delete the reminder "${name}"?`)) return;

  delete appState.takenMeds[reminderId];
  appState.reminders = appState.reminders.filter(r => r.id !== reminderId);
  alerts = alerts.filter(a => a.id !== 'missed-' + reminderId);

  saveState();
  renderTodayMedications();
  renderScheduleReminders();
  updateProgress();
  renderCurrentAlert();
  showToast(`🗑️ Reminder removed.`);
}

// ── WEEKLY OVERVIEW ──
function getTodayWeekKey() {
  return ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'][new Date().getDay()];
}

function getWeekOverviewDisplayValue(dayKey, value) {
  if (value === true)  return { symbol: '✓', background: 'var(--green)' };
  if (value === false) return { symbol: '✗', background: '#F5C6C6' };
  if (dayKey === getTodayWeekKey()) return { symbol: '↑', background: 'var(--gold)' };
  return { symbol: '', background: 'var(--gray-soft)' };
}

function renderWeekOverview() {
  const container = document.getElementById('weekly-overview-grid');
  if (!container) return;
  container.innerHTML = '';

  ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'].forEach(dayKey => {
    const status  = appState.weekOverview?.[dayKey] ?? null;
    const display = getWeekOverviewDisplayValue(dayKey, status);
    container.innerHTML += `
      <div>
        <div style="font-family:'Nunito',sans-serif;font-size:10px;font-weight:700;color:var(--maroon-dark)">${dayKey}</div>
        <div style="
          width:32px;height:32px;border-radius:50%;background:${display.background};
          color:${display.symbol === '✓' ? 'white' : 'var(--text-dark)'};
          display:flex;align-items:center;justify-content:center;font-size:14px;margin:4px auto;">
          ${display.symbol}
        </div>
      </div>`;
  });
}

function updateWeekOverviewForToday() {
  if (!appState.weekOverview) return;
  const todayKey = getTodayWeekKey();
  const total = appState.reminders.length;
  const taken = appState.reminders.filter(r => appState.takenMeds[r.id]).length;
  appState.weekOverview[todayKey] = total > 0 && taken === total ? true : null;
  saveState();
}
