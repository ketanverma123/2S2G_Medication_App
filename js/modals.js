// ── MED DETAIL MODAL ──
function openMedDetail(id, reminderId) {
  const m        = appState.medicines.find(m => m.id === id);
  const reminder = reminderId ? appState.reminders.find(r => r.id === reminderId) : null;
  if (!m) return;

  let html = `
    <div class="modal-pill-img" style="background:var(--gray-soft)">💊</div>
    <div class="modal-pill-name">${m.name}</div>
    <div class="modal-pill-dose">${reminder?.dosage || ''}</div>
  `;

  if (m.changed) {
    html += `
      <div class="alert-banner warning" style="margin:14px 0">
        <div class="alert-icon">⚠️</div>
        <div>
          <div class="alert-title">Appearance changed!</div>
          <div class="alert-text">
            Your pharmacy switched to a generic brand. It is the same medicine — just looks a little different.
          </div>
        </div>
      </div>
    `;
  }

  html += `
    <div class="pill-visual">
      <div class="pill-shape-info">
        <strong>How it looks</strong>
        ${m.shape}
      </div>
    </div>
    <button class="big-btn ghost" style="margin-top:10px;margin-bottom:6px;"
      onclick="showPillImage('${id}')">🖼️ View Pill Image</button>
    <div style="font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;
      color:var(--text-dark);margin:16px 0 8px">📋 How to take it</div>
  `;

  (reminder?.steps || []).forEach((s, i) => {
    html += `
      <div class="instruction-step">
        <div class="step-num">${i + 1}</div>
        <div class="step-text">${s}</div>
      </div>
    `;
  });

  html += `
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div class="card-title" style="margin-bottom:0;">Missed a Dose?</div>
        <button type="button" id="missed-dose-toggle-btn-modal"
          class="missed-toggle-btn"
          onclick="toggleMissedDoseBoxModal()"
          aria-expanded="false"
          style="background:none;border:none;cursor:pointer;font-size:20px;
                 font-weight:900;color:var(--text-dark);line-height:1;">▾</button>
      </div>
      <div id="missed-dose-content-modal" style="display:none;margin-top:10px;">
        <div class="missed-box">
          <div class="missed-box-title">🔴 What to do if you forget</div>
          <p style="margin:0;">
            Take it as soon as you remember. If it's almost time for your next dose, skip the missed one.
            <strong>Never take two doses at once.</strong>
          </p>
        </div>
        <button class="big-btn ghost" style="margin-top:10px"
          onclick="showToast('📱 Sending message to your care team...')">
          📞 Ask My Care Team
        </button>
      </div>
    </div>
  `;

  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('med-modal').classList.add('open');
}

function toggleMissedDoseBox() {
  const content = document.getElementById('missed-dose-content');
  const button  = document.getElementById('missed-dose-toggle-btn');
  if (!content || !button) return;
  const isOpen = content.style.display === 'block';
  content.style.display = isOpen ? 'none' : 'block';
  button.textContent    = isOpen ? '▾' : '▴';
  button.setAttribute('aria-expanded', String(!isOpen));
}

function toggleMissedDoseBoxModal() {
  const content = document.getElementById('missed-dose-content-modal');
  const button  = document.getElementById('missed-dose-toggle-btn-modal');
  if (!content || !button) return;
  const isOpen = content.style.display === 'block';
  content.style.display = isOpen ? 'none' : 'block';
  button.textContent    = isOpen ? '▾' : '▴';
  button.setAttribute('aria-expanded', String(!isOpen));
}

function closeMedModal(e) {
  if (e.target === document.getElementById('med-modal'))
    document.getElementById('med-modal').classList.remove('open');
}
function closeMedModalDirect() {
  document.getElementById('med-modal').classList.remove('open');
}

// ── PILL IMAGE MODAL ──
function showPillImage(id) {
  const m = medData[id];
  if (!m || !m.image) return;

  document.getElementById('pill-image-content').innerHTML = `
    <div style="font-family:'Nunito',sans-serif;font-size:24px;font-weight:900;
      color:var(--text-dark);margin-bottom:6px;">${m.name}</div>
    <img src="${m.image}" alt="Reference image for ${m.name}"
      style="max-width:100%;width:220px;height:auto;border-radius:16px;
             box-shadow:var(--shadow);margin-bottom:14px;">
    <div style="font-size:13px;color:var(--text-medium);line-height:1.5;">${m.shape}</div>
  `;
  document.getElementById('pill-image-modal').classList.add('open');
}
function closePillImageModal(event) {
  if (event.target === document.getElementById('pill-image-modal'))
    document.getElementById('pill-image-modal').classList.remove('open');
}

// ── SUCCESS OVERLAYS ──
function showRefillSuccess()   { document.getElementById('refill-success').classList.add('open'); }
function closeRefillSuccess()  { document.getElementById('refill-success').classList.remove('open'); }
function showMedTakenSuccess() { document.getElementById('med-taken-success').classList.add('open'); }
function closeMedTakenSuccess(){ document.getElementById('med-taken-success').classList.remove('open'); }

// ── CAREGIVER ──
function addCaregiverContact() {
  const name = prompt('Enter caregiver name (e.g. "Dad" or "Dr. Smith"):');
  if (!name || !name.trim()) return;
  showToast(`✅ ${name.trim()} added to your care team!`);
}
