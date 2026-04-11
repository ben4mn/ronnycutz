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

const stampVariants = {
  hidden: {
    opacity: 0,
    scale: 0.6,
    rotate: -4,
  },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      delay: i * 0.08,
      type: 'spring',
      stiffness: 300,
      damping: 18,
    },
  }),
};

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
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={stampVariants}
              whileHover={{ scale: 1.03, rotate: 0.5, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
              whileTap={{ scale: 0.97, rotate: 0 }}
              style={{
                display: 'block',
                textDecoration: 'none',
                background: i % 2 === 0 ? '#FFF0EF' : '#EEF4FF',
                border: '2.5px solid #111',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '4px 4px 0 #111',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111', margin: 0 }}>{s.name}</h3>
                <span style={{ fontSize: '26px', fontWeight: 900, color: '#E03A2F', marginLeft: '12px' }}>${s.price}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: 600, marginBottom: s.description ? '8px' : '0' }}>{s.duration_min} min</div>
              {s.description && (
                <div style={{ fontSize: '12px', color: '#4A7FD4', fontWeight: 700, borderTop: '1.5px solid #ddd', paddingTop: '8px', marginTop: '8px' }}>
                  {s.description}
                </div>
              )}
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}