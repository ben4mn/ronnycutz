import shop from '../data/shop.json';

export default function StickyMobileBar() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-charcoal/95 backdrop-blur border-t border-brass/30 px-4 py-3 flex gap-3"
         style={{ paddingBottom: `calc(0.75rem + env(safe-area-inset-bottom))` }}>
      {shop.phone && (
        <a
          href={`tel:${shop.phone.replace(/\s/g, '')}`}
          className="flex-1 py-3 text-center border border-cream/20 text-cream text-sm uppercase tracking-widest"
        >
          Call
        </a>
      )}
      <a
        href="#book"
        className="flex-[2] py-3 text-center bg-brass text-charcoal font-semibold text-sm uppercase tracking-widest"
      >
        Book Now
      </a>
    </div>
  );
}
