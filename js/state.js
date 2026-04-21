// ── CONSTANTS ──
const STORAGE_KEY = 'medeaseAppState';
const MED_ICON = '💊';

const MED_BACKGROUND_COLORS = [
  '#FDECEA',
  '#EAF4EC',
  '#EBF5FB',
  '#FEF3E6',
  '#F4ECF7'
];

const REMINDER_DOT_COLORS = [
  'var(--maroon)',
  'var(--green)',
  'var(--blue)',
  'var(--orange)'
];

// ── DEFAULT STATE ──
const defaultAppState = {
  takenMeds: {},
  dismissedAlerts: [],
  weekOverview: { M: false, T: null, W: null, Th: null, F: null, Sa: null, Su: null },
  medicines: [
    {
      id: 'metformin',
      name: 'Metformin',
      shape: 'Oval, white tablet · NEW: Z shown on one side, 69 on the other',
      image: 'drug_profiles/metformin.jpg',
      changed: true
    },
    {
      id: 'lisinopril',
      name: 'Lisinopril',
      shape: 'Small, round, pink tablet, E3 shown on one side',
      image: 'drug_profiles/lisinopril.jpeg',
      changed: false
    },
    {
      id: 'atorvastatin',
      name: 'Atorvastatin',
      shape: 'Oval, white, 11 shown on one side',
      image: 'drug_profiles/atorvastatin.png',
      changed: false
    }
  ],
  reminders: [
    {
      id: 'metformin-reminder',
      medId: 'metformin',
      label: 'Breakfast time',
      time: '8:00 AM',
      dosage: '500 mg',
      reminderType: 'Alarm Set',
      speaker: 'No speaker alarm',
      smallNote: 'With breakfast 🍳',
      steps: [
        'Take 1 tablet (500mg)',
        'Swallow with a full glass of water 💧',
        'Take with your breakfast — this helps your stomach',
        'Do NOT skip doses. If you forget, see the Missed Dose box below.'
      ]
    },
    {
      id: 'lisinopril-reminder',
      medId: 'lisinopril',
      label: 'Lunchtime',
      time: '12:00 PM',
      dosage: '10 mg',
      reminderType: 'Alarm Set',
      speaker: 'Smart speaker',
      smallNote: 'With lunch 🥗',
      steps: [
        'Take 1 tablet (10mg)',
        'Swallow with water 💧',
        'Take at lunchtime — same time every day',
        'You can take with or without food'
      ]
    },
    {
      id: 'atorvastatin-reminder',
      medId: 'atorvastatin',
      label: 'Bedtime routine',
      time: '9:00 PM',
      dosage: '20 mg',
      reminderType: 'Alarm Set',
      speaker: 'No speaker alarm',
      smallNote: 'Before bed 🌙',
      steps: [
        'Take 1 tablet (20mg)',
        'Swallow with water 💧',
        'Take at the same time each night before bed 🌙',
        'Avoid grapefruit juice while on this medicine'
      ]
    }
  ]
};

// ── LOAD / SAVE ──
function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultAppState);

  const parsed = JSON.parse(saved);
  return {
    ...structuredClone(defaultAppState),
    ...parsed,
    medicines: parsed.medicines || structuredClone(defaultAppState).medicines,
    reminders: parsed.reminders || structuredClone(defaultAppState).reminders,
    takenMeds: parsed.takenMeds || {},
    dismissedAlerts: parsed.dismissedAlerts || []
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

let appState = loadState();

// ── MED DATA LOOKUP ──
function buildMedData() {
  const data = {};
  appState.medicines.forEach(med => {
    data[med.id] = { name: med.name, shape: med.shape, image: med.image, changed: med.changed };
  });
  return data;
}

let medData = buildMedData();

// ── RESET ──
function resetAppState() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// ── TIME UTILITIES ──
function parseTimeString(timeStr) {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return { hours, minutes };
}

function reminderTimeToMinutes(timeStr) {
  const { hours, minutes } = parseTimeString(timeStr);
  return hours * 60 + minutes;
}
