import { motion } from 'framer-motion';
import shop from '../data/shop.json';

export default function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] flex items-center overflow-hidden">
      <div className="absolute inset-0 hero-grain" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/70 to-charcoal" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-24">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-brass uppercase tracking-[0.3em] text-xs sm:text-sm mb-6"
        >
          Est. ◆ @{shop.instagram}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] text-cream mb-6"
        >
          {shop.name}<span className="text-brass">.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-cream/80 text-lg sm:text-xl max-w-lg mb-10 font-display italic"
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
            className="group inline-flex items-center justify-center px-8 py-4 bg-brass text-charcoal font-semibold rounded-sm hover:bg-brass-2 transition-colors"
          >
            Book an Appointment
            <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a
            href={shop.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 border border-cream/20 text-cream hover:border-brass hover:text-brass transition-colors rounded-sm"
          >
            @{shop.instagram}
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cream/40 text-xs tracking-widest uppercase hidden sm:block">
        scroll
      </div>
    </section>
  );
}
