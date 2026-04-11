import express from 'express';
import db from '../db.js';
import { sendApprovalEmail, sendDenialEmail } from '../email.js';

const router = express.Router();

function requireToken(req, res, next) {
  const token = req.query.token || req.headers['x-admin-token'];
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function getBaseUrl(req) {
  return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
}

router.get('/config', requireToken, (req, res) => {
  const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const host = base.replace(/^https?:\/\//, '');
  const feedToken = process.env.CALENDAR_FEED_TOKEN || '';
  const httpsUrl = `${base}/api/calendar.ics?token=${feedToken}`;
  const webcalUrl = `webcal://${host}/api/calendar.ics?token=${feedToken}`;
  res.json({ calendar_feed_url_https: httpsUrl, calendar_feed_url_webcal: webcalUrl, feed_configured: Boolean(feedToken) });
});

router.get('/bookings', requireToken, (req, res) => {
  const rows = db.prepare(
    `SELECT id, service_name, service_price, start_iso, duration_min, client_name, client_phone, client_email, notes, status, created_at
     FROM bookings WHERE start_iso >= datetime('now', '-7 days') ORDER BY start_iso ASC`
  ).all();
  res.json({ bookings: rows });
});

router.post('/bookings/:id/approve', requireToken, async (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Not found' });
  db.prepare("UPDATE bookings SET status = 'confirmed' WHERE id = ?").run(booking.id);
  const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id);
  sendApprovalEmail(updated, getBaseUrl(req)).catch(e => console.error('[admin] approval email failed:', e.message));
  res.json({ success: true });
});

router.post('/bookings/:id/deny', requireToken, async (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Not found' });
  db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(booking.id);
  const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id);
  sendDenialEmail(updated, getBaseUrl(req)).catch(e => console.error('[admin] denial email failed:', e.message));
  res.json({ success: true });
});

router.post('/bookings/:id/cancel', requireToken, (req, res) => {
  const result = db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  res.json({ success: result.changes > 0 });
});

router.get('/blocks', requireToken, (req, res) => {
  const rows = db.prepare(`SELECT * FROM blocked_slots WHERE end_iso >= datetime('now') ORDER BY start_iso ASC`).all();
  res.json({ blocks: rows });
});

router.post('/blocks', requireToken, (req, res) => {
  const { start_iso, end_iso, reason } = req.body || {};
  if (!start_iso || !end_iso) return res.status(400).json({ error: 'start_iso and end_iso required' });
  const result = db.prepare('INSERT INTO blocked_slots (start_iso, end_iso, reason) VALUES (?, ?, ?)').run(start_iso, end_iso, reason || null);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.delete('/blocks/:id', requireToken, (req, res) => {
  db.prepare('DELETE FROM blocked_slots WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;