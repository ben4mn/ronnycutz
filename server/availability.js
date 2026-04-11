import db from './db.js';

const SLOT_STEP_MIN = 60;
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const TZ = 'America/Chicago';

function parseHM(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

function dateToLocalYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function buildSlots(dateYMD, durationMin, hours) {
  const [y, m, d] = dateYMD.split('-').map(Number);
  // Use Intl to get the day-of-week in Chicago time
  const refDate = new Date(`${dateYMD}T12:00:00Z`);
  const dayName = refDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: TZ }).toLowerCase();
  const dayKey = dayName.substring(0, 3);
  const windows = hours[dayKey];
  if (!windows || windows.length === 0) return [];

  const slots = [];
  for (const [openStr, closeStr] of windows) {
    const open = parseHM(openStr);
    const close = parseHM(closeStr);
    for (let t = open; t + durationMin <= close; t += SLOT_STEP_MIN) {
      const hh = String(Math.floor(t / 60)).padStart(2, '0');
      const mm = String(t % 60).padStart(2, '0');
      // Build time in Chicago timezone using Intl
      const localStr = `${dateYMD}T${hh}:${mm}:00`;
      // Parse as Chicago local time → UTC
      const chicagoDate = new Date(new Date(localStr).toLocaleString('en-US', { timeZone: TZ }));
      const utcDate = new Date(localStr);
      const offset = utcDate - chicagoDate;
      const slotUtc = new Date(utcDate.getTime() + offset);
      slots.push(slotUtc.toISOString());
    }
  }
  return slots;
}

export function getAvailability(dateYMD, durationMin, hours) {
  const all = buildSlots(dateYMD, durationMin, hours);
  if (all.length === 0) return [];
  const dayStart = new Date(`${dateYMD}T00:00:00Z`);
  const dayEnd = new Date(dayStart.getTime() + 48 * 60 * 60 * 1000);
  const bookings = db
    .prepare(
      `SELECT start_iso, duration_min FROM bookings
       WHERE status IN ('confirmed', 'pending')
       AND start_iso >= ? AND start_iso < ?`
    )
    .all(dayStart.toISOString(), dayEnd.toISOString());
  const blocks = db
    .prepare(
      `SELECT start_iso, end_iso FROM blocked_slots
       WHERE start_iso < ? AND end_iso > ?`
    )
    .all(dayEnd.toISOString(), dayStart.toISOString());
  const now = Date.now();
  return all.filter((slotIso) => {
    const slotStart = new Date(slotIso).getTime();
    const slotEnd = slotStart + durationMin * 60 * 1000;
    if (slotStart < now + 60 * 60 * 1000) return false;
    for (const b of bookings) {
      const bStart = new Date(b.start_iso).getTime();
      const bEnd = bStart + b.duration_min * 60 * 1000;
      if (slotStart < bEnd && slotEnd > bStart) return false;
    }
    for (const bl of blocks) {
      const blStart = new Date(bl.start_iso).getTime();
      const blEnd = new Date(bl.end_iso).getTime();
      if (slotStart < blEnd && slotEnd > blStart) return false;
    }
    return true;
  });
}

export { dateToLocalYMD };