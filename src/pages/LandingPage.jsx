import Hero from '../components/Hero.jsx';
import Services from '../components/Services.jsx';
import Gallery from '../components/Gallery.jsx';
import BookingSection from '../components/Booking/BookingSection.jsx';
import Hours from '../components/Hours.jsx';
import Footer from '../components/Footer.jsx';
import Reviews from '../components/Reviews.jsx';
import StickyMobileBar from '../components/StickyMobileBar.jsx';

function Stripe() {
  return <div className="stripe-divider" />;
}

function Nav() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fff', borderBottom: '3px solid #111', position: 'sticky', top: 0, zIndex: 50 }}>
      <span style={{ fontSize: '20px', fontWeight: 900, flexShrink: 0 }}>
        <span style={{ color: '#4A7FD4', WebkitTextStroke: '0.5px #111' }}>Ronny</span>
        <span style={{ color: '#E03A2F', WebkitTextStroke: '0.5px #111' }}>Cutz</span>
      </span>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div className="nav-links-desktop" style={{ display: 'flex', gap: '16px' }}>
          {['Services','Hours','Gallery'].map(l => (
            <a key={l} href={'#' + l.toLowerCase()} style={{ color: '#111', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap' }}>{l}</a>
          ))}
        </div>
        <a href="#book" style={{ background: '#E03A2F', color: 'white', padding: '8px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: 800, textDecoration: 'none', border: '2px solid #111', boxShadow: '2px 2px 0 #111', whiteSpace: 'nowrap', flexShrink: 0 }}>
          Book Now
        </a>
      </div>
    </nav>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: '#fff', color: '#111', minHeight: '100vh', paddingBottom: '5rem' }}>
      <style>{`
        @media (max-width: 600px) {
          .nav-links-desktop { display: none !important; }
        }
      `}</style>
      <Nav />
      <Hero />
      <Stripe />
      <Services />
      <Stripe />
      <Hours />
      <Stripe />
      <Gallery />
      <Stripe />
      <Reviews />
      <Stripe />
      <BookingSection />
      <Footer />
      <StickyMobileBar />
    </div>
  );
}