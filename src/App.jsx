import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DemoCard from './components/DemoCard';
import SectionDivider from './components/SectionDivider';
import ProblemSection from './components/ProblemSection';
import HowItWorks from './components/HowItWorks';
import SchemesSection from './components/SchemesSection';
import TechStack from './components/TechStack';
import WaitlistSection from './components/WaitlistSection';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <DemoCard />
      <SectionDivider />
      <ProblemSection />
      <SectionDivider />
      <HowItWorks />
      <SectionDivider />
      <SchemesSection />
      <SectionDivider />
      <TechStack />
      <SectionDivider />
      <WaitlistSection />
      <Footer />
    </>
  );
}
