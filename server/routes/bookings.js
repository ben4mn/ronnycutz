import express from 'express';
import crypto from 'crypto';
import db from '../db.js';
import { sendBookingEmails } from '../email.js';
import { buildSingleEvent } from '../ics.js';
import services from '../../src/data/services.json' with { type: 'json' };
import hours from '../../src/data/hours.json' with { type: 'json' };
import { getAvailability } from '../availability.js';

const router = express.Router();

function getBaseUrl(req) {
  return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
}

router.post('/', async (req, res) => {
  const { service_id, start_iso, client_name, client_phone, client_email, notes } = req.body || {};

  if (!service_id || !start_iso || !client_name || !client_phone || !client_email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const service = services.find((s) => s.id === service_id);
  if (!service) return res.status(400).json({ error: 'Unknown service' });

  const start = new Date(start_iso);
  if (Number.isNaN(start.getTime())) return res.status(400).json({ error: 'Invalid start_iso' });
  if (start.getTime() < Date.now() + 30 * 60 * 1000) {
    return res.status(400).json({ error: 'Slot is in the past or too soon' });
  }

  const normalizedIso = start.toISOString();
  const dateYMD = normalizedIso.slice(0, 10);
  const openSlots = getAvailability(dateYMD, service.duration_min, hours);
  if (!openSlots.includes(normalizedIso)) {
    return res.status(409).json({ error: 'Slot no longer available' });
  }

  const cancel_token = crypto.randomBytes(16).toString('hex');

  try {
    const insert = db.prepare(
      `INSERT INTO bookings
       (service_id, service_name, service_price, start_iso, duration_min,
        client_name, client_phone, client_email, notes, status, cancel_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)`
    );
    const result = insert.run(
      service.id,
      service.name,
      service.price,
      normalizedIso,
      service.duration_min,
      client_name.trim(),
      client_phone.trim(),
      client_email.trim().toLowerCase(),
      notes?.trim() || null,
      cancel_token
    );

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);

    sendBookingEmails(booking, getBaseUrl(req)).catch((e) =>
      console.error('[bookings] email failed:', e.message)
    );

    res.status(201).json({
      id: booking.id,
      service_name: booking.service_name,
      start_iso: booking.start_iso,
      duration_min: booking.duration_min,
      ics_url: `/api/bookings/${booking.id}.ics`,
      cancel_url: `/api/bookings/${booking.id}/cancel?token=${cancel_token}`,
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Slot was just taken' });
    }
    console.error('[bookings] insert error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.get('/:id.ics', (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).send('Not found');
  const ics = buildSingleEvent(booking, getBaseUrl(req));
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="ronnycutz-${booking.id}.ics"`);
  res.send(ics);
});

router.get('/:id/cancel', (req, res) => {
  const { token } = req.query;
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking || booking.cancel_token !== token) {
    return res.status(404).send('Invalid cancellation link');
  }
  if (booking.status === 'cancelled') {
    return res.send(renderCancelPage('This booking is already cancelled.'));
  }
  db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(booking.id);
  res.send(renderCancelPage('Your booking has been cancelled.'));
});

function renderCancelPage(message) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>RonnyCutz</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      body { background:#0a0a0a; color:#f5f0e6; font-family:Inter,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; padding:24px; }
      .box { max-width:420px; text-align:center; background:#141414; padding:40px; border:1px solid #1c1c1c; border-radius:12px; }
      h1 { font-family:'Playfair Display',Georgia,serif; color:#c9a449; margin-top:0; }
      a { color:#c9a449; }
    </style></head><body><div class="box">
    <h1>RonnyCutz</h1><p>${message}</p><p><a href="/">Back to site →</a></p>
    </div></body></html>`;
}

export default router;
