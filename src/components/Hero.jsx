import { motion } from 'framer-motion';
import shop from '../data/shop.json';

export default function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] flex items-center overflow-hidden bg-white">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(circle, #e0e0e0 1.5px, transparent 1.5px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <span className="inline-block bg-[#4A7FD4] text-white text-xs font-extrabold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0_#111]">
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
            className="h-32 sm:h-44 w-auto"
            style={{ filter: 'drop-shadow(3px 3px 0px #111)' }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-600 text-lg sm:text-xl max-w-lg mb-10 font-medium"
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
            className="group inline-flex items-center justify-center px-8 py-4 bg-[#E03A2F] text-white font-extrabold rounded-full border-[2.5px] border-black shadow-[4px_4px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_#111] transition-all"
          >
            Book an Appointment
            <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a
            href={shop.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-extrabold rounded-full border-[2.5px] border-black shadow-[4px_4px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_#111] transition-all"
          >
            @{shop.instagram}
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-black/30 text-xs tracking-widest uppercase hidden sm:block">
        scroll
      </div>
    </section>
  );
}