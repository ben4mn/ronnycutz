import { motion } from 'framer-motion';
import shop from '../data/shop.json';
import hours from '../data/hours.json';
import { SectionHeader } from './Services.jsx';

const DAY_LABELS = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday'
};

function fmt(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h > 12 ? h - 12 : h}:${String(m).padStart(2,'0')} ${ampm}`;
}

export default function Hours() {
  const days = Object.entries(hours);
  return (
    <section id="hours" style={{ padding: '44px 28px', background: '#F5F8FF', borderBottom: '3px solid #111' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <SectionHeader eyebrow="Location & Hours" title="When We're Open" blue />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxWidth: '500px', marginBottom: '24px' }}>
          {days.filter(([d]) => !['saturday','sunday'].includes(d)).map(([day, info], i) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              style={{
                background: info.closed ? '#f5f5f5' : '#fff',
                border: '2.5px solid #111',
                borderRadius: '12px',
                padding: '16px 20px',
                boxShadow: '3px 3px 0 #111',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '14px', color: '#111' }}>{DAY_LABELS[day]}</span>
              <span style={{ fontWeight: 700, fontSize: '13px', color: info.closed ? '#aaa' : '#4A7FD4' }}>
                {info.closed ? 'Closed' : `${fmt(info.open)}+`}
              </span>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 }}
            style={{
              background: '#f5f5f5',
              border: '2.5px solid #111',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: '3px 3px 0 #111',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 800, fontSize: '14px', color: '#111' }}>Fri – Sun</span>
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#aaa' }}>Closed</span>
          </motion.div>
        </div>
        <a
          href={shop.map_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#fff',
            border: '2.5px solid #111',
            borderRadius: '9999px',
            padding: '10px 20px',
            boxShadow: '3px 3px 0 #111',
            fontSize: '14px',
            fontWeight: 700,
            color: '#111',
            textDecoration: 'none',
          }}
        >
          📍 {shop.address}
        </a>
      </div>
    </section>
  );
}