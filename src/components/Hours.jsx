import hours from '../data/hours.json';
import shop from '../data/shop.json';
import { SectionHeader } from './Services.jsx';

const DAYS = [
  ['mon', 'Monday'],
  ['tue', 'Tuesday'],
  ['wed', 'Wednesday'],
  ['thu', 'Thursday'],
  ['fri', 'Friday'],
  ['sat', 'Saturday'],
  ['sun', 'Sunday'],
];

function fmt(hm) {
  const [h, m] = hm.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const hh = h % 12 || 12;
  return m === 0 ? `${hh}${ampm}` : `${hh}:${String(m).padStart(2, '0')}${ampm}`;
}

export default function Hours() {
  return (
    <section id="visit" className="py-24 px-6 bg-charcoal-2">
      <div className="max-w-5xl mx-auto">
        <SectionHeader eyebrow="The Shop" title="Hours & Location" />

        <div className="mt-14 grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="font-display text-2xl text-brass mb-6">Hours</h3>
            <ul className="divide-y divide-charcoal-3">
              {DAYS.map(([key, label]) => {
                const windows = hours[key];
                return (
                  <li key={key} className="flex justify-between py-3 text-cream">
                    <span>{label}</span>
                    <span className="text-text-subtle">
                      {windows && windows.length
                        ? windows.map((w) => `${fmt(w[0])} – ${fmt(w[1])}`).join(', ')
                        : 'Closed'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-2xl text-brass mb-6">Visit</h3>
            <address className="not-italic text-cream leading-relaxed mb-4">
              {shop.address.line1}
              <br />
              {shop.address.city}
            </address>
            <div className="space-y-2 text-cream/80 text-sm mb-6">
              <div>
                <a href={`tel:${shop.phone.replace(/\s/g, '')}`} className="hover:text-brass">
                  {shop.phone_display}
                </a>
              </div>
              <div>
                <a
                  href={shop.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brass"
                >
                  @{shop.instagram}
                </a>
              </div>
            </div>
            <div className="aspect-video overflow-hidden border border-charcoal-3">
              <iframe
                title="Map"
                src={shop.map_embed}
                className="w-full h-full grayscale contrast-125 opacity-80"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
