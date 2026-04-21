// ── INITIALIZATION ──
medData = buildMedData();
renderTodayMedications();
renderScheduleReminders();
updateProgress();
renderCurrentAlert();
checkMissedDoses();
renderWeekOverview();

// Check for missed doses every minute
setInterval(checkMissedDoses, 60000);
