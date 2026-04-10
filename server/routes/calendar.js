import express from 'express';
import { buildFeed } from '../ics.js';

const router = express.Router();

router.get('/calendar.ics', (req, res) => {
  const { token } = req.query;
  if (!process.env.CALENDAR_FEED_TOKEN || token !== process.env.CALENDAR_FEED_TOKEN) {
    return res.status(401).send('Unauthorized');
  }
  const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const feed = buildFeed(baseUrl);
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(feed);
});

export default router;
