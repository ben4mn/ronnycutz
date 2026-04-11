import Hero from '../components/Hero.jsx';
import Services from '../components/Services.jsx';
import Gallery from '../components/Gallery.jsx';
import BookingSection from '../components/Booking/BookingSection.jsx';
import Hours from '../components/Hours.jsx';
import Footer from '../components/Footer.jsx';
import StickyMobileBar from '../components/StickyMobileBar.jsx';

function Stripe() {
  return <div className="stripe-divider" />;
}

function Nav() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', background: '#fff', borderBottom: '3px solid #111', position: 'sticky', top: 0, zIndex: 50 }}>
      <span style={{ fontSize: '22px', fontWeight: 900 }}>
        <span style={{ color: '#4A7FD4', WebkitTextStroke: '0.5px #111' }}>Ronny</span>
        <span style={{ color: '#E03A2F', WebkitTextStroke: '0.5px #111' }}>Cutz</span>
      </span>
      <div style={{ display: 'flex', gap: '20px' }}>
        {['Services','Hours','Gallery'].map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} style={{ color: '#111', fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}>{l}</a>
        ))}
      </div>
      <a href="#book" style={{ background: '#E03A2F', color: 'white', padding: '9px 22px', borderRadius: '9999px', fontSize: '13px', fontWeight: 800, textDecoration: 'none', border: '2.5px solid #111', boxShadow: '3px 3px 0 #111' }}>
        Book Now ✂
      </a>
    </nav>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: '#fff', color: '#111', minHeight: '100vh', paddingBottom: '4rem' }} className="sm:pb-0">
      <Nav />
      <Hero />
      <Stripe />
      <Services />
      <Stripe />
      <Hours />
      <Stripe />
      <Gallery />
      <Stripe />
      <BookingSection />
      <Footer />
      <StickyMobileBar />
    </div>
  );
}