import Hero from '@/components/landing/Hero';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import DoctorsSection from '@/components/landing/DoctorsSection';
import ContactSection from '@/components/landing/ContactSection';

export default function LandingPage() {
  return (
    <div className="bg-warm-white dark:bg-deep-teal-900 min-h-screen overflow-hidden">
      <Hero />
      <FeaturesGrid />
      <DoctorsSection />
      <ContactSection />
    </div>
  );
}
