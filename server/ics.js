import db from './db.js';

const CRLF = '\r\n';

function formatICSDate(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function escapeText(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function foldLine(line) {
  if (line.length <= 75) return line;
  const parts = [];
  let i = 0;
  while (i < line.length) {
    parts.push((i === 0 ? '' : ' ') + line.slice(i, i + 73));
    i += 73;
  }
  return parts.join(CRLF);
}

function bookingToVEvent(booking, baseUrl) {
  const start = new Date(booking.start_iso);
  const end = new Date(start.getTime() + booking.duration_min * 60 * 1000);
  const uid = `booking-${booking.id}@ronnycutz.com`;
  const summary = `${booking.service_name} — ${booking.client_name}`;
  const description = [
    `Service: ${booking.service_name}`,
    `Client: ${booking.client_name}`,
    `Phone: ${booking.client_phone}`,
    `Email: ${booking.client_email}`,
    booking.notes ? `Notes: ${booking.notes}` : null,
    `Cancel: ${baseUrl}/api/bookings/${booking.id}/cancel?token=${booking.cancel_token}`,
  ]
    .filter(Boolean)
    .join('\n');

  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
    `DTSTART:${formatICSDate(start.toISOString())}`,
    `DTEND:${formatICSDate(end.toISOString())}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `STATUS:${booking.status === 'confirmed' ? 'CONFIRMED' : 'CANCELLED'}`,
    'END:VEVENT',
  ];
  return lines.map(foldLine).join(CRLF);
}

export function buildFeed(baseUrl) {
  const bookings = db
    .prepare(
      `SELECT * FROM bookings WHERE status = 'confirmed'
       AND start_iso >= datetime('now', '-1 day')
       ORDER BY start_iso ASC`
    )
    .all();

  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RonnyCutz//Booking Feed//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:RonnyCutz Bookings',
    'X-WR-TIMEZONE:America/New_York',
    'REFRESH-INTERVAL;VALUE=DURATION:PT5M',
    'X-PUBLISHED-TTL:PT5M',
  ];

  const events = bookings.map((b) => bookingToVEvent(b, baseUrl));
  const footer = ['END:VCALENDAR'];

  return [...header, ...events, ...footer].join(CRLF) + CRLF;
}

export function buildSingleEvent(booking, baseUrl) {
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RonnyCutz//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
  ];
  const event = bookingToVEvent(booking, baseUrl);
  const footer = ['END:VCALENDAR'];
  return [...header, event, ...footer].join(CRLF) + CRLF;
}
