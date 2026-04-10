import Hero from '../components/Hero.jsx';
import Services from '../components/Services.jsx';
import Gallery from '../components/Gallery.jsx';
import BookingSection from '../components/Booking/BookingSection.jsx';
import Hours from '../components/Hours.jsx';
import Footer from '../components/Footer.jsx';
import StickyMobileBar from '../components/StickyMobileBar.jsx';

export default function LandingPage() {
  return (
    <div className="bg-charcoal text-cream min-h-screen pb-16 sm:pb-0">
      <Hero />
      <Services />
      <Gallery />
      <BookingSection />
      <Hours />
      <Footer />
      <StickyMobileBar />
    </div>
  );
}
