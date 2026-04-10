import { motion } from 'framer-motion';
import gallery from '../data/gallery.json';
import shop from '../data/shop.json';
import { SectionHeader } from './Services.jsx';

export default function Gallery() {
  return (
    <section id="gallery" className="py-24 px-6 bg-charcoal-2">
      <div className="max-w-6xl mx-auto">
        <SectionHeader eyebrow="The Work" title="Recent Cuts" />

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-3">
          {gallery.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className={`relative overflow-hidden ${
                i % 5 === 0 ? 'row-span-2 aspect-[3/4] md:aspect-[3/5]' : 'aspect-square'
              }`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 hover:scale-105 transition-all duration-500"
              />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href={shop.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brass hover:text-cream transition-colors text-sm uppercase tracking-[0.2em]"
          >
            More on Instagram <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
