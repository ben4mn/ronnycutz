import { motion } from 'framer-motion';
import services from '../data/services.json';

export default function Services() {
  return (
    <section id="services" className="py-24 px-6 bg-charcoal">
      <div className="max-w-5xl mx-auto">
        <SectionHeader eyebrow="The Menu" title="Services" />

        <div className="grid sm:grid-cols-2 gap-5 mt-14">
          {services.map((s, i) => (
            <motion.a
              key={s.id}
              href="#book"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative p-7 bg-charcoal-2 border border-charcoal-3 hover:border-brass/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-display text-2xl text-cream group-hover:text-brass transition-colors">
                  {s.name}
                </h3>
                <div className="text-right shrink-0">
                  <div className="text-brass text-2xl font-display">${s.price}</div>
                  <div className="text-text-subtle text-xs uppercase tracking-widest">
                    {s.duration_min} min
                  </div>
                </div>
              </div>
              <p className="text-cream/70 text-sm leading-relaxed">{s.description}</p>
              <div className="mt-5 text-brass text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Book this →
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title }) {
  return (
    <div className="text-center">
      <p className="text-brass uppercase tracking-[0.3em] text-xs mb-4">{eyebrow}</p>
      <h2 className="font-display text-4xl sm:text-5xl text-cream">{title}</h2>
      <div className="brass-divider w-24 mx-auto mt-6" />
    </div>
  );
}
