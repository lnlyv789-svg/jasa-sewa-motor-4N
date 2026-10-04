import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../sections/HeroSection";
import FeaturesSection from "../sections/FeaturesSection";
import MotorListSection from "../sections/MotorListSection";
import TestimonialsSection from "../sections/TestimonialsSection";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#0B132B]">
      {/* Navbar (Sticky di atas) */}
      <Navbar />
      
      {/* Hero Section (Fullscreen) */}
      <HeroSection />
      
      {/* Features Section (3 Keunggulan) */}
      <FeaturesSection />
      
      {/* Motor List Section (Grid Motor) */}
      <MotorListSection />
      
      {/* Testimonials Section (Kata Pelanggan) */}
      <TestimonialsSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;