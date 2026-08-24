import db from './db.js';

const SLOT_STEP_MIN = 60;
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function parseHM(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

function dateToLocalYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

export function buildSlots(dateYMD, durationMin, hours) {
  const [y, m, d] = dateYMD.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayKey = DAY_KEYS[date.getDay()];
  const windows = hours[dayKey];
  if (!windows || windows.length === 0) return [];
  const slots = [];
  for (const [openStr, closeStr] of windows) {
    const open = parseHM(openStr);
    const close = parseHM(closeStr);
    for (let t = open; t + durationMin <= close; t += SLOT_STEP_MIN) {
      const hh = String(Math.floor(t / 60)).padStart(2, '0');
      const mm = String(t % 60).padStart(2, '0');
      const local = new Date(y, m - 1, d, Number(hh), Number(mm), 0, 0);
      slots.push(local.toISOString());
    }
  }
  return slots;
}

function filterAvailable(all, dateYMD, durationMin) {
  if (all.length === 0) return [];
  const dayStart = new Date(dateYMD + 'T00:00:00');
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const bookings = db.prepare(
    "SELECT start_iso, duration_min FROM bookings WHERE status IN ('confirmed', 'pending') AND start_iso >= ? AND start_iso < ?"
  ).all(dayStart.toISOString(), dayEnd.toISOString());
  const blocks = db.prepare(
    "SELECT start_iso, end_iso FROM blocked_slots WHERE start_iso < ? AND end_iso > ?"
  ).all(dayEnd.toISOString(), dayStart.toISOString());
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

export function getAvailability(dateYMD, durationMin, hours) {
  return filterAvailable(buildSlots(dateYMD, durationMin, hours), dateYMD, durationMin);
}

export function getAfterHoursAvailability(dateYMD, durationMin, hours, afterHours) {
  const ahSlots = buildSlots(dateYMD, durationMin, afterHours);
  if (ahSlots.length === 0) return [];
  const regular = new Set(buildSlots(dateYMD, durationMin, hours));
  const unique = ahSlots.filter((s) => !regular.has(s));
  return filterAvailable(unique, dateYMD, durationMin);
}

export { dateToLocalYMD };