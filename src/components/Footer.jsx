import shop from '../data/shop.json';

export default function Footer() {
  return (
    <footer className="py-12 px-6 bg-charcoal border-t border-charcoal-3">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-display text-2xl text-cream">
          {shop.name}<span className="text-brass">.</span>
        </div>
        <div className="flex gap-6 text-sm text-text-subtle">
          <a href={`tel:${shop.phone.replace(/\s/g, '')}`} className="hover:text-brass">
            Call
          </a>
          <a href={shop.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-brass">
            Instagram
          </a>
          <a href="#book" className="hover:text-brass">
            Book
          </a>
        </div>
        <p className="text-text-subtle text-xs">© {new Date().getFullYear()} RonnyCutz</p>
      </div>
    </footer>
  );
}
