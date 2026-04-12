import { motion } from 'framer-motion';
import shop from '../data/shop.json';
import hours from '../data/hours.json';
import { SectionHeader } from './Services.jsx';

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
];

function fmt(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return hour + ':' + String(m).padStart(2, '0') + ' ' + ampm;
}

function lastSlot(closeStr) {
  const [h, m] = closeStr.split(':').map(Number);
  const totalMin = h * 60 + m - 60;
  const lh = String(Math.floor(totalMin / 60)).padStart(2, '0');
  const lm = String(totalMin % 60).padStart(2, '0');
  return fmt(lh + ':' + lm);
}

export default function Hours() {
  const phone = shop.phone || '';
  const phoneDigits = phone.replace(/\D/g, '');

  return (
    <section id="hours" style={{ padding: '36px 16px', background: '#F5F8FF', borderBottom: '3px solid #111' }}>
      <style>{`
        .hours-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 500px; margin-bottom: 20px; }
        @media (max-width: 500px) { .hours-grid { grid-template-columns: 1fr; max-width: 100%; } }
        .hours-contact { display: flex; gap: 10px; flex-wrap: wrap; }
      `}</style>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <SectionHeader eyebrow="Location & Hours" title="Service Hours" blue />
        <div className="hours-grid">
          {DAYS.map((d, i) => {
            const slots = hours[d.key];
            const open = slots && slots.length > 0;
            return (
              <motion.div key={d.key}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}
                style={{ background: open ? '#fff' : '#f5f5f5', border: '2.5px solid #111', borderRadius: '12px', padding: '14px 16px', boxShadow: '3px 3px 0 #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontWeight: 800, fontSize: '14px', color: '#111' }}>{d.label}</span>
                <span style={{ fontWeight: 700, fontSize: '12px', color: open ? '#4A7FD4' : '#aaa' }}>
                  {open ? fmt(slots[0][0]) + ' - ' + lastSlot(slots[0][1]) : 'Closed'}
                </span>
              </motion.div>
            );
          })}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.24 }}
            style={{ background: '#f5f5f5', border: '2.5px solid #111', borderRadius: '12px', padding: '14px 16px', boxShadow: '3px 3px 0 #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span style={{ fontWeight: 800, fontSize: '14px', color: '#111' }}>Fri - Sun</span>
            <span style={{ fontWeight: 700, fontSize: '12px', color: '#aaa' }}>Closed</span>
          </motion.div>
          <div style={{ visibility: 'hidden', borderRadius: '12px', padding: '14px 16px' }} className="hide-mobile" />
        </div>
        <div className="hours-contact">
          <a href={shop.map_url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', border: '2.5px solid #111', borderRadius: '9999px', padding: '10px 16px', boxShadow: '3px 3px 0 #111', fontSize: '13px', fontWeight: 700, color: '#111', textDecoration: 'none' }}>
            {shop.address}
          </a>
          {phone && (
            <a href={'tel:' + phoneDigits}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#E03A2F', border: '2.5px solid #111', borderRadius: '9999px', padding: '10px 16px', boxShadow: '3px 3px 0 #111', fontSize: '13px', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
              {phone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}