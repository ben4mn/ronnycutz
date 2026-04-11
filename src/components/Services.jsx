import { motion } from 'framer-motion';
import services from '../data/services.json';

export function SectionHeader({ eyebrow, title, blue }) {
  return (
    <div className="mb-8">
      <span className={blue ? 'section-pill-blue' : 'section-pill-red'}>{eyebrow}</span>
      <h2 style={{ fontSize: '30px', fontWeight: 900, marginTop: '12px', color: '#111' }}>{title}</h2>
    </div>
  );
}

export default function Services() {
  return (
    <section id="services" style={{ padding: '44px 28px', background: '#fff', borderBottom: '3px solid #111' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <SectionHeader eyebrow="What We Offer" title="Services" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {services.map((s, i) => (
            <motion.a
              key={s.id}
              href="#book"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              style={{
                display: 'block',
                textDecoration: 'none',
                background: i % 2 === 0 ? '#FFF0EF' : '#EEF4FF',
                border: '2.5px solid #111',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '4px 4px 0 #111',
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #111'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 #111'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111', margin: 0 }}>{s.name}</h3>
                <span style={{ fontSize: '26px', fontWeight: 900, color: '#E03A2F', marginLeft: '12px' }}>${s.price}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: 600, marginBottom: '8px' }}>{s.duration_minutes} min</div>
              {s.description && (
                <div style={{ fontSize: '12px', color: '#4A7FD4', fontWeight: 700, borderTop: '1.5px solid #ddd', paddingTop: '8px', marginTop: '8px' }}>
                  ✦ {s.description}
                </div>
              )}
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}