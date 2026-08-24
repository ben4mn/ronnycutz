import express from 'express';
import crypto from 'crypto';
import db from '../db.js';
import { sendBookingEmails } from '../email.js';
import { buildSingleEvent } from '../ics.js';
import services from '../../src/data/services.json' with { type: 'json' };
import hours from '../../src/data/hours.json' with { type: 'json' };
import afterHours from '../../src/data/afterHours.json' with { type: 'json' };
import { getAvailability, getAfterHoursAvailability } from '../availability.js';

const router = express.Router();

const AFTER_HOURS_SURCHARGE = 30;

const FAKE_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','tempmail.com','throwaway.email',
  'fakeinbox.com','trashmail.com','yopmail.com','sharklasers.com',
  'guerrillamailblock.com','grr.la','guerrillamail.info','spam4.me',
  'test.com','fake.com','example.com','noemail.com','nospam.com',
  'dispostable.com','maildrop.cc','getairmail.com','mailnull.com'
]);

function getBaseUrl(req) {
  return process.env.PUBLIC_BASE_URL || (req.protocol + '://' + req.get('host'));
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) return false;
  const domain = email.split('@')[1].toLowerCase();
  if (FAKE_DOMAINS.has(domain)) return false;
  return true;
}

router.post('/', async (req, res) => {
  const { service_id, start_iso, client_name, client_phone, client_email, notes } = req.body || {};

  if (!service_id || !start_iso || !client_name || !client_phone || !client_email) {
    return res.status(400).json({ error: 'All fields including a valid email are required' });
  }

  if (!isValidEmail(client_email.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  const sid = parseInt(service_id, 10);
  const service = services.find((s) => s.id === sid);
  if (!service) return res.status(400).json({ error: 'Unknown service' });

  const start = new Date(start_iso);
  if (Number.isNaN(start.getTime())) return res.status(400).json({ error: 'Invalid start_iso' });
  if (start.getTime() < Date.now() + 30 * 60 * 1000) {
    return res.status(400).json({ error: 'Slot is in the past or too soon' });
  }

  const normalizedIso = start.toISOString();
  const dateYMD = new Date(normalizedIso).toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
  const openSlots = getAvailability(dateYMD, service.duration_min, hours);
  const afterHoursSlots = getAfterHoursAvailability(dateYMD, service.duration_min, hours, afterHours);
  const isAfterHours = afterHoursSlots.includes(normalizedIso);
  if (!openSlots.includes(normalizedIso) && !isAfterHours) {
    return res.status(409).json({ error: 'Slot no longer available' });
  }

  const bookingPrice = service.price + (isAfterHours ? AFTER_HOURS_SURCHARGE : 0);
  const bookingName = isAfterHours ? service.name + ' — After-hours' : service.name;

  const cancel_token = crypto.randomBytes(16).toString('hex');
  try {
    const insert = db.prepare(
      "INSERT INTO bookings (service_id, service_name, service_price, start_iso, duration_min, client_name, client_phone, client_email, notes, status, cancel_token, after_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)"
    );
    const result = insert.run(
      service.id, bookingName, bookingPrice, normalizedIso, service.duration_min,
      client_name.trim(), client_phone.trim(), client_email.trim().toLowerCase(),
      notes?.trim() || null, cancel_token, isAfterHours ? 1 : 0
    );
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
    sendBookingEmails(booking, getBaseUrl(req)).catch((e) => console.error('[bookings] email failed:', e.message));
    res.status(201).json({
      id: booking.id, service_name: booking.service_name,
      start_iso: booking.start_iso, duration_min: booking.duration_min,
      status: 'pending',
      ics_url: '/api/bookings/' + booking.id + '.ics',
      cancel_url: '/api/bookings/' + booking.id + '/cancel?token=' + cancel_token,
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Slot was just taken' });
    console.error('[bookings] insert error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.get('/:id.ics', (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).send('Not found');
  const ics = buildSingleEvent(booking, getBaseUrl(req));
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="ronnycutz-' + booking.id + '.ics"');
  res.send(ics);
});

router.get('/:id/cancel', (req, res) => {
  const { token } = req.query;
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking || booking.cancel_token !== token) return res.status(404).send('Invalid cancellation link');
  if (booking.status === 'cancelled') return res.send(renderPage('This booking is already cancelled.'));
  const hoursUntil = (new Date(booking.start_iso) - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < 24) {
    return res.send(renderPage('Cancellations require at least 24 hours notice. Please contact Aaron directly at (915) 408-6981 to cancel last minute.'));
  }
  db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(booking.id);
  res.send(renderPage('Your booking has been cancelled successfully.'));
});

function renderPage(message) {
  return '<!doctype html><html><head><meta charset="utf-8"><title>RonnyCutz</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#FFF9F0;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px}.box{max-width:420px;text-align:center;background:#fff;padding:40px;border:3px solid #111;border-radius:12px;box-shadow:5px 5px 0 #111}h1{color:#E03A2F;margin-top:0}a{color:#4A7FD4}</style></head><body><div class="box"><h1>RonnyCutz</h1><p>' + message + '</p><p><a href="/">Back to site</a></p></div></body></html>';
}

export default router;