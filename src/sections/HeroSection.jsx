// src/sections/HeroSection.jsx
import Button from "../components/Button";

const HeroSection = () => {
  const handleCariMotorClick = () => {
    const motorSection = document.getElementById("motor");
    if (motorSection) {
      motorSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePelajariClick = () => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden bg-[#0B132B]">
      
      {/* Background Gambar Lokal */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{
          backgroundImage: "url('/images/landing-page.jpg')",
        }}
      />
      
      {/* Overlay Gradien Gelap Maskulin */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0B132B]/90 via-[#0B132B]/70 to-[#0B132B]" />
      
      {/* Konten Utama */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">

        <span className="inline-block px-4 py-1.5 mb-6 text-xs sm:text-sm font-bold tracking-widest uppercase text-[#F9A826] bg-[#F9A826]/10 rounded-full border border-[#F9A826]/30">
          🔥 Rental Roda Dua Terbaik Nusantara
        </span>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black leading-[1.1] tracking-tight">
          Penakluk Jalanan.
          <br />
          Jelajahi Sudut Bersama <span className="text-[#F9A826]">4N</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
          Sewa armada Matic, Bebek, hingga Sport impianmu dalam 2 menit. Mesin terawat, siap terjang setiap petualangan tanpa ribet.
        </p>

        {/* Tombol Aksi */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            variant="solid" 
            size="large" 
            className="text-lg px-10 shadow-lg shadow-[#F9A826]/20"
            onClick={handleCariMotorClick}
          >
            🏍️ Pilih Motor Sekarang
          </Button>
          <Button 
            variant="outline" 
            size="large" 
            className="text-lg px-10 border-white/40 text-white hover:bg-white hover:text-[#0B132B]"
            onClick={handlePelajariClick}
          >
            Pelajari Keunggulan
          </Button>
        </div>

        {/* Statistik */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-black text-[#F9A826]">15 Armada</p>
            <p className="text-sm text-white/50">Siap Dipakai</p>
          </div>
          <div className="w-px h-10 bg-white/10 hidden sm:block" />
          <div>
            <p className="text-2xl sm:text-3xl font-black text-[#F9A826]">100%</p>
            <p className="text-sm text-white/50">Mesin Terawat</p>
          </div>
          <div className="w-px h-10 bg-white/10 hidden sm:block" />
          <div>
            <p className="text-2xl sm:text-3xl font-black text-[#F9A826]">4.9/5</p>
            <p className="text-sm text-white/50">Rating Petualang</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;