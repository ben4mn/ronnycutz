import { useEffect } from 'react';
import shop from '../data/shop.json';
import { SectionHeader } from './Services.jsx';

export default function Gallery() {
  useEffect(() => {
    // Load Instagram embed script
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section id="gallery" className="py-24 px-6 bg-charcoal-2">
      <div className="max-w-6xl mx-auto">
        <SectionHeader eyebrow="The Work" title="Recent Cuts" />
        <p className="text-center text-cream/60 mt-4 mb-12 text-sm tracking-wide">
          Follow <a href={shop.instagram_url} target="_blank" rel="noopener noreferrer" className="text-brass hover:text-cream transition-colors">@{shop.instagram}</a> for the latest cuts
        </p>

        {/* Instagram embed grid */}
        <div className="flex flex-col items-center gap-6">
          <blockquote
            className="instagram-media w-full max-w-xl"
            data-instgrm-permalink="https://www.instagram.com/ronnycutz_/"
            data-instgrm-version="14"
            style={{ background: '#1a1a26', border: '1px solid rgba(74,127,212,0.2)', borderRadius: '8px', margin: '0 auto' }}
          />
        </div>

        <div className="text-center mt-12">
          <a
            href={shop.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold rounded-sm transition-colors"
          >
            View Full Instagram →
          </a>
        </div>
      </div>
    </section>
  );
}