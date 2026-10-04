// src/sections/FeaturesSection.jsx
import { Clock, Shield, Wallet } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: <Clock className="w-8 h-8 text-[#F9A826]" strokeWidth={1.5} />,
      title: "Reservasi Kilat",
      description: "Pilih motor, tentukan tanggal, dan selesaikan DP dalam 2 menit tanpa antri.",
      badge: "⏱️ Anti Ribet",
    },
    {
      icon: <Shield className="w-8 h-8 text-[#F9A826]" strokeWidth={1.5} />,
      title: "Mesin Selalu Prima",
      description: "Servis rutin berkala, dilengkapi helm bersih dan mantel hujan di setiap unit.",
      badge: "🛡️ 100% Siap Jalan",
    },
    {
      icon: <Wallet className="w-8 h-8 text-[#F9A826]" strokeWidth={1.5} />,
      title: "Harga Transparan",
      description: "Mulai Rp 50.000/hari. Sistem DP 50% yang fleksibel tanpa biaya tersembunyi.",
      badge: "💰 DP Fleksibel",
    },
  ];

  return (
    <section id="about" className="py-20 bg-[#0B132B] border-t border-[#F9A826]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-[#F9A826] tracking-widest uppercase bg-[#F9A826]/10 px-4 py-1.5 rounded-full border border-[#F9A826]/20">
            Standar Layanan
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-4">
            Alasan Memilih <span className="text-[#F9A826]">4N</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto mt-3 text-sm md:text-base">
            Bukan sekadar persewaan. Kami menyediakan kendaraan andalan untuk perjalananmu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#F9A826]/40 transition-all duration-300 hover:-translate-y-1"
            >
              <span className="inline-block text-xs font-bold text-[#0B132B] bg-[#F9A826] px-3 py-1 rounded-full mb-5">
                {feature.badge}
              </span>

              <div className="mb-5 inline-block p-3 bg-[#F9A826]/10 rounded-xl">
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>

              <p className="text-white/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;