import { motion } from 'framer-motion';
import shop from '../data/shop.json';

export default function Hero() {
  return (
    <section id="top" style={{ background: '#FFF9F0', borderTop: '8px solid #E03A2F', position: 'relative', overflow: 'hidden', minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 28px 80px', gap: '20px' }}>

      {/* Big background logo */}
      <div style={{ position: 'absolute', inset: '-20px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
        <img
          src="/logo.jpg"
          alt=""
          aria-hidden="true"
          style={{ width: '160%', maxWidth: 'none', opacity: 0.15, transform: 'rotate(-8deg)' }}
        />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

        <motion.a
          href={shop.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ background: '#4A7FD4', color: '#fff', fontSize: '11px', fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '9999px', border: '2px solid #111', boxShadow: '2px 2px 0 #111', textDecoration: 'none' }}
        >
          @{shop.instagram} . Lubbock, TX
        </motion.a>

        <motion.img
          src="/logo.jpg"
          alt="RonnyCutz"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ height: '180px', width: 'auto', filter: 'drop-shadow(3px 3px 0px #111)' }}
        />

        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ fontSize: '12px', fontWeight: 700, color: '#111', letterSpacing: '0.15em', textTransform: 'uppercase', border: '2px solid #111', padding: '5px 14px', borderRadius: '4px', background: 'rgba(255,255,255,0.9)' }}
        >
           {shop.address}
        </motion.span>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <a
            href="#book"
            style={{ background: '#4A7FD4', color: 'white', padding: '13px 28px', borderRadius: '9999px', fontWeight: 800, fontSize: '15px', textDecoration: 'none', border: '2.5px solid #111', boxShadow: '4px 4px 0 #111', display: 'inline-block' }}
          >
            Book an Appointment 
          </a>
          <a
            href="#services"
            style={{ background: '#fff', color: '#111', padding: '13px 28px', borderRadius: '9999px', fontWeight: 800, fontSize: '15px', textDecoration: 'none', border: '2.5px solid #111', boxShadow: '4px 4px 0 #111', display: 'inline-block' }}
          >
            See Services
          </a>
        </motion.div>

      </div>

      {/* Bottom stripe */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '14px', background: 'repeating-linear-gradient(90deg, #E03A2F 0px, #E03A2F 24px, #4A7FD4 24px, #4A7FD4 48px, #fff 48px, #fff 72px)', borderTop: '3px solid #111' }} />
    </section>
  );
}