import express from 'express';
import services from '../../src/data/services.json' with { type: 'json' };
import hours from '../../src/data/hours.json' with { type: 'json' };
import afterHours from '../../src/data/afterHours.json' with { type: 'json' };
import { getAvailability, getAfterHoursAvailability } from '../availability.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { date, service_id } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'date (YYYY-MM-DD) required' });
  }
  const sid = parseInt(service_id, 10);
  const service = services.find((s) => s.id === sid);
  if (!service) return res.status(400).json({ error: 'Unknown service_id' });
  const slots = getAvailability(date, service.duration_min, hours);
  const afterHoursSlots = getAfterHoursAvailability(date, service.duration_min, hours, afterHours);
  res.json({ date, service_id: sid, duration_min: service.duration_min, slots, afterHoursSlots });
});

export default router;