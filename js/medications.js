// ── EDIT MODE TRACKING ──
let editingMedId = null;

// ── RENDER TODAY'S MEDICATIONS (home screen) ──
function renderTodayMedications() {
  const container = document.getElementById('today-medications-list');
  if (!container) return;
  container.innerHTML = '';

  const sorted = [...appState.reminders].sort((a, b) =>
    reminderTimeToMinutes(a.time) - reminderTimeToMinutes(b.time)
  );

  sorted.forEach((reminder, index) => {
    const med = appState.medicines.find(m => m.id === reminder.medId);
    if (!med) return;

    const isTaken  = !!appState.takenMeds[reminder.id];
    const bgColor  = MED_BACKGROUND_COLORS[index % MED_BACKGROUND_COLORS.length];
    const badge    = med.changed
      ? `<div class="pill-badge" style="background:#C0392B;color:white">!</div>`
      : '';

    container.innerHTML += `
      <div class="med-item" onclick="openMedDetail('${med.id}','${reminder.id}')">
        <div class="pill-icon" style="background:${bgColor}">
          ${MED_ICON}${badge}
        </div>
        <div class="med-info">
          <div class="med-name">${med.name}</div>
          <div class="med-detail">${reminder.dosage || ''} · ${reminder.smallNote || ''}</div>
        </div>
        <div style="text-align:right">
          <div class="med-time">${reminder.time}</div>
          <button
            class="check-btn ${isTaken ? 'taken' : ''}"
            id="check-${reminder.id}"
            onclick="event.stopPropagation();takeReminder('${reminder.id}')"
          >${isTaken ? '✓' : '○'}</button>
        </div>
      </div>
    `;
  });
}

// ── RENDER MANAGE MEDICATIONS LIST ──
function renderManageMedicationsList() {
  const container = document.getElementById('manage-medications-list');
  if (!container) return;
  container.innerHTML = '';

  appState.medicines.forEach((med, index) => {
    const bgColor = MED_BACKGROUND_COLORS[index % MED_BACKGROUND_COLORS.length];
    const changeBadge = med.changed ? `
      <div style="
        position:absolute;top:-4px;right:-4px;width:18px;height:18px;
        border-radius:50%;background:#C0392B;color:white;font-size:11px;
        font-weight:900;display:flex;align-items:center;justify-content:center;
        border:2px solid var(--white);">!</div>` : '';

    container.innerHTML += `
      <div style="
        background:var(--white);border:1px solid var(--gray-soft);
        border-radius:16px;padding:14px;display:flex;
        align-items:flex-start;gap:12px;">
        <div style="
          width:48px;height:48px;border-radius:14px;background:${bgColor};
          display:flex;align-items:center;justify-content:center;
          font-size:24px;flex-shrink:0;position:relative;">
          ${MED_ICON}${changeBadge}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-family:'Nunito',sans-serif;font-size:16px;font-weight:800;color:var(--text-dark);">
            ${med.name}
          </div>
          <div style="font-size:13px;color:var(--text-medium);margin-top:4px;line-height:1.4;">
            ${med.shape || ''}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
            <button class="medium-btn" style="background:var(--gold-pale);color:var(--maroon);"
              onclick="openEditMedicationModal('${med.id}')">Edit</button>
            <button class="medium-btn" style="background:var(--red-light);color:var(--red);"
              onclick="deleteMedication('${med.id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  });
}

// ── MANAGE MODAL ──
function openManageMedicationsModal() {
  renderManageMedicationsList();
  document.getElementById('manage-medications-modal').classList.add('open');
}
function closeManageMedicationsModal(event) {
  if (event.target === document.getElementById('manage-medications-modal'))
    document.getElementById('manage-medications-modal').classList.remove('open');
}
function closeManageMedicationsModalDirect() {
  document.getElementById('manage-medications-modal').classList.remove('open');
}

// ── ADD MEDICATION MODAL ──
function openAddMedicationModal() {
  editingMedId = null;
  clearAddMedicationForm();
  document.getElementById('add-medication-modal-title').textContent    = 'Add New Medication';
  document.getElementById('add-medication-modal-subtitle').textContent = 'Add a medication profile with a name, description, and reference image.';
  document.getElementById('submit-medication-btn').textContent          = 'Save Medication';
  document.getElementById('medication-image-preview').innerHTML         = '';
  closeManageMedicationsModalDirect();
  document.getElementById('add-medication-modal').classList.add('open');
}
function closeAddMedicationModal(event) {
  if (event.target === document.getElementById('add-medication-modal'))
    document.getElementById('add-medication-modal').classList.remove('open');
}
function closeAddMedicationModalDirect() {
  document.getElementById('add-medication-modal').classList.remove('open');
}

function clearAddMedicationForm() {
  ['medication-name', 'medication-shape', 'medication-image'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

// ── EDIT MEDICATION MODAL ──
function openEditMedicationModal(medId) {
  const med = appState.medicines.find(m => m.id === medId);
  if (!med) return;

  editingMedId = medId;
  clearAddMedicationForm();

  document.getElementById('medication-name').value  = med.name;
  document.getElementById('medication-shape').value = med.shape;

  document.getElementById('add-medication-modal-title').textContent    = 'Edit Medication';
  document.getElementById('add-medication-modal-subtitle').textContent = 'Update the medication details below.';
  document.getElementById('submit-medication-btn').textContent          = 'Update Medication';

  const preview = document.getElementById('medication-image-preview');
  preview.innerHTML = med.image ? `
    <img src="${med.image}" alt="Current image for ${med.name}"
      style="max-width:100%;height:80px;object-fit:contain;border-radius:8px;margin-bottom:6px;">
    <div style="font-size:12px;color:var(--text-medium);">
      Current image — upload a new one to replace it (optional).
    </div>` : '';

  closeManageMedicationsModalDirect();
  document.getElementById('add-medication-modal').classList.add('open');
}

// ── SUBMIT MEDICATION FORM (add or edit) ──
function submitMedicationForm() {
  const name  = document.getElementById('medication-name').value.trim();
  const shape = document.getElementById('medication-shape').value.trim();
  const imageInput = document.getElementById('medication-image');
  const file  = imageInput && imageInput.files.length ? imageInput.files[0] : null;

  if (!name)  { showToast('Please enter a medication name.');   return; }
  if (!shape) { showToast('Please enter a shape description.'); return; }

  if (editingMedId) {
    // ── UPDATE EXISTING ──
    const med = appState.medicines.find(m => m.id === editingMedId);
    if (!med) return;

    med.name  = name;
    med.shape = shape;
    if (file) med.image = URL.createObjectURL(file);

    saveState();
    medData = buildMedData();
    renderTodayMedications();
    renderScheduleReminders();
    updateProgress();
    closeAddMedicationModalDirect();
    openManageMedicationsModal();
    showToast(`✅ ${name} updated!`);

  } else {
    // ── ADD NEW ──
    if (!file) { showToast('Please upload an image.'); return; }

    const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    appState.medicines.push({ id, name, shape, image: URL.createObjectURL(file), changed: false });

    saveState();
    medData = buildMedData();
    renderTodayMedications();
    closeAddMedicationModalDirect();
    openManageMedicationsModal();
    showToast(`✅ ${name} added!`);
  }
}

// ── DELETE MEDICATION ──
function deleteMedication(medId) {
  const med = appState.medicines.find(m => m.id === medId);
  if (!med) return;

  if (!confirm(`Delete ${med.name} and all its reminders?`)) return;

  // Remove associated reminder taken-states
  const removedIds = appState.reminders.filter(r => r.medId === medId).map(r => r.id);
  removedIds.forEach(id => delete appState.takenMeds[id]);

  appState.reminders = appState.reminders.filter(r => r.medId !== medId);
  appState.medicines = appState.medicines.filter(m => m.id !== medId);

  // Clear any alerts related to this med/reminders
  alerts = alerts.filter(a => !removedIds.some(id => a.id.includes(id)));

  saveState();
  medData = buildMedData();
  renderTodayMedications();
  renderScheduleReminders();
  updateProgress();
  renderManageMedicationsList();
  showToast(`🗑️ ${med.name} removed.`);
}

// ── TAKE REMINDER ──
function takeReminder(reminderId) {
  const btn = document.getElementById('check-' + reminderId);
  if (!btn || btn.classList.contains('taken')) return;

  const reminder = appState.reminders.find(r => r.id === reminderId);
  if (!reminder) return;
  const med = appState.medicines.find(m => m.id === reminder.medId);

  appState.takenMeds[reminderId] = true;
  saveState();

  btn.classList.add('taken');
  btn.textContent = '✓';

  updateProgress();
  removeMissedAlertForReminder(reminderId);
  renderCurrentAlert();

  showToast(`✅ ${med ? med.name : 'Medication'} marked as taken!`);
}

// ── PROGRESS BAR ──
function updateProgress() {
  const total  = appState.reminders.length;
  const taken  = appState.reminders.filter(r => appState.takenMeds[r.id]).length;
  const pct    = total ? Math.round((taken / total) * 100) : 0;

  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-pct').textContent = pct + '%';
  document.querySelector('.progress-label span').textContent = `${taken} of ${total} taken`;

  if (pct === 100) setTimeout(showMedTakenSuccess, 500);

  updateWeekOverviewForToday();
  renderWeekOverview();
}
