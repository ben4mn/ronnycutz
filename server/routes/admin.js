import express from 'express';
import db from '../db.js';
import { sendApprovalEmail, sendDenialEmail, sendReminderEmail, sendPricingAnnouncement } from '../email.js';

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
  // Default to the last 7 days for day-to-day use; pass ?days=N for more history
  // (the calendar and clients views request a full year).
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 1000);
  const rows = db.prepare(
    `SELECT id, service_name, service_price, start_iso, duration_min, client_name, client_phone, client_email, notes, status, after_hours, created_at
     FROM bookings WHERE start_iso >= datetime('now', '-' || ? || ' days') ORDER BY start_iso ASC`
  ).all(String(days));
  res.json({ bookings: rows });
});

// Aggregated client "CRM" view: one row per client with visit history,
// typical rebooking cadence, and how overdue they are for a cut.
router.get('/clients', requireToken, (req, res) => {
  const rows = db.prepare(
    `SELECT client_email AS email, client_name AS name, client_phone AS phone,
            service_name, service_price, start_iso, status
     FROM bookings ORDER BY start_iso ASC`
  ).all();

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const DEFAULT_CADENCE = 28;
  const map = new Map();

  for (const r of rows) {
    const key = (r.email || r.phone || '').toLowerCase().trim();
    if (!key) continue;
    if (!map.has(key)) map.set(key, { name: r.name, email: r.email, phone: r.phone, visits: [], upcoming: [] });
    const c = map.get(key);
    if (r.name) c.name = r.name;
    if (r.phone) c.phone = r.phone;
    if (r.email) c.email = r.email;
    const t = new Date(r.start_iso).getTime();
    if (r.status === 'confirmed') {
      if (t <= now) c.visits.push({ iso: r.start_iso, t, price: r.service_price || 0 });
      else c.upcoming.push({ iso: r.start_iso, t });
    }
  }

  const archivedKeys = new Set(
    db.prepare('SELECT client_key FROM archived_clients').all().map((r) => r.client_key)
  );
  const wantArchived = req.query.archived === '1';

  const clients = [];
  for (const [key, c] of map.entries()) {
    const isArchived = archivedKeys.has(key);
    if (wantArchived ? !isArchived : isArchived) continue;
    c.visits.sort((a, b) => a.t - b.t);
    const n = c.visits.length;
    const last = n ? c.visits[n - 1] : null;
    const totalSpent = c.visits.reduce((s, v) => s + v.price, 0);
    let cadence = DEFAULT_CADENCE;
    if (n >= 2) {
      let sum = 0;
      for (let i = 1; i < n; i++) sum += (c.visits[i].t - c.visits[i - 1].t) / DAY;
      cadence = Math.max(5, Math.round(sum / (n - 1)));
    }
    const daysSince = last ? Math.floor((now - last.t) / DAY) : null;
    const nextUpcoming = c.upcoming.sort((a, b) => a.t - b.t)[0] || null;
    const dueInDays = (last && !nextUpcoming) ? (cadence - daysSince) : null;
    clients.push({
      key,
      name: c.name, email: c.email, phone: c.phone,
      visits: n, totalSpent,
      lastVisitIso: last ? last.iso : null,
      daysSinceLast: daysSince,
      cadenceDays: n >= 1 ? cadence : null,
      nextApptIso: nextUpcoming ? nextUpcoming.iso : null,
      dueInDays,
    });
  }

  clients.sort((a, b) => {
    const av = a.dueInDays == null ? Infinity : a.dueInDays;
    const bv = b.dueInDays == null ? Infinity : b.dueInDays;
    return av - bv;
  });

  res.json({ clients, archivedCount: archivedKeys.size, generatedAt: new Date().toISOString() });
});

router.post('/clients/archive', requireToken, (req, res) => {
  const key = (req.body && req.body.key ? String(req.body.key) : '').toLowerCase().trim();
  if (!key) return res.status(400).json({ error: 'key required' });
  db.prepare('INSERT OR IGNORE INTO archived_clients (client_key) VALUES (?)').run(key);
  res.json({ success: true });
});

router.post('/clients/unarchive', requireToken, (req, res) => {
  const key = (req.body && req.body.key ? String(req.body.key) : '').toLowerCase().trim();
  if (!key) return res.status(400).json({ error: 'key required' });
  db.prepare('DELETE FROM archived_clients WHERE client_key = ?').run(key);
  res.json({ success: true });
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


router.post('/send-reminder', requireToken, async (req, res) => {
  const { to, name, subject, html } = req.body;
  if (!to || !name || !subject || !html) return res.status(400).json({ error: 'Missing fields' });
  try {
    await sendReminderEmail({ to, name, subject, html });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Broadcast the pricing announcement to all past clients.
// Defaults to a dry run; only sends when the body has { confirm: true }.
router.post('/broadcast', requireToken, async (req, res) => {
  const confirm = req.body && req.body.confirm === true;
  const rows = db.prepare(
    'SELECT client_email AS email, MIN(client_name) AS name FROM bookings GROUP BY client_email'
  ).all();
  const recipients = rows.filter(
    (r) => r.email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(r.email)
  );

  if (!confirm) {
    return res.json({ dryRun: true, recipientCount: recipients.length });
  }

  const baseUrl = getBaseUrl(req);
  let sent = 0;
  const failures = [];
  for (const r of recipients) {
    const firstName = (r.name || '').trim().split(/\s+/)[0] || '';
    try {
      await sendPricingAnnouncement({ to: r.email, firstName, baseUrl });
      sent += 1;
    } catch (e) {
      failures.push({ email: r.email, error: e.message });
      console.error('[broadcast] failed for', r.email, e.message);
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  res.json({ dryRun: false, total: recipients.length, sent, failed: failures.length, failures });
});

export default router;
