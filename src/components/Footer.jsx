// src/components/Footer.jsx
import { Bike, MessageCircle, Music } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { icon: MessageCircle, href: "https://wa.me/6281112345678", label: "WhatsApp" },
    { icon: Music, href: "#", label: "TikTok" },
  ];

  return (
    <footer id="contact" className="bg-[#0B132B] border-t border-[#F9A826]/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bike className="w-8 h-8 text-[#F9A826]" />
              <span className="text-2xl font-black tracking-tight text-white">
                4<span className="text-[#F9A826]">N</span>
              </span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed max-w-xs">
              Explore All Corners with 4N! Kunci kebebasan menaklukkan setiap jengkal jalanan.
            </p>
          </div>

          {/* Quick Nav */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#hero" className="text-white/50 hover:text-[#F9A826]">Beranda</a></li>
              <li><a href="#motor" className="text-white/50 hover:text-[#F9A826]">Koleksi Motor</a></li>
              <li><a href="#about" className="text-white/50 hover:text-[#F9A826]">Tentang Kami</a></li>
            </ul>
          </div>

          {/* Kontak */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Hubungi Kami
            </h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-[#F9A826] hover:text-[#0B132B] transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
            <div className="pt-1 text-xs space-y-1">
              <p className="text-white/50">📞 WhatsApp: <span className="text-white/80">0811 1234 5678</span></p>
              <p className="text-white/50">✉️ Email: <span className="text-white/80">hello@4n.id</span></p>
            </div>
          </div>
        </div>

        <div className="pt-8 text-center text-xs text-white/30">
          &copy; {new Date().getFullYear()} 4N — Explore All Corners. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;