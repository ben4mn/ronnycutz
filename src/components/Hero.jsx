import { motion } from 'framer-motion';
import shop from '../data/shop.json';

export default function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] flex items-center overflow-hidden bg-charcoal hero-grain">
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #E03A2F 1.25px, transparent 1.25px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/0 via-charcoal/0 to-charcoal pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <span className="inline-block bg-charcoal-2 text-brass text-xs font-semibold tracking-[0.3em] uppercase px-4 py-1.5 rounded-full border border-brass/40">
            @{shop.instagram} · Lubbock, TX
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <img
            src="/logo.jpg"
            alt="RonnyCutz"
            className="h-32 sm:h-44 w-auto rounded-lg"
            style={{ filter: 'drop-shadow(0 6px 24px rgba(224,58,47,0.3))' }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-text-subtle text-lg sm:text-xl max-w-lg mb-10"
        >
          {shop.tagline}.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <a
            href="#book"
            className="group inline-flex items-center justify-center px-8 py-4 bg-brass text-charcoal font-semibold tracking-wide hover:bg-brass-2 transition-colors"
          >
            Book an Appointment
            <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a
            href={shop.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 border border-cream/30 text-cream font-semibold tracking-wide hover:border-brass hover:text-brass transition-colors"
          >
            @{shop.instagram}
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-subtle text-xs tracking-[0.3em] uppercase hidden sm:block">
        scroll
      </div>
    </section>
  );
}