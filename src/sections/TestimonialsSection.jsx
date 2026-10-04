// src/sections/TestimonialsSection.jsx
import { testimonialData } from "../data/testimonialData";
import { Quote } from "lucide-react";

const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-[#0B132B] border-t border-[#F9A826]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-sm font-semibold text-[#F9A826] tracking-widest uppercase bg-[#F9A826]/10 px-4 py-1.5 rounded-full border border-[#F9A826]/20">
            Testimoni
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-4">
            Kata <span className="text-[#F9A826]">Petualang</span> Kami
          </h2>
          <p className="text-white/50 max-w-xl mx-auto mt-3 text-sm md:text-base">
            Mereka sudah merasakan kebebasan bersama 4N. Kini giliranmu!
          </p>
        </div>

        {/* Grid Testimoni: 1 kolom di HP, 3 kolom di desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonialData.map((item) => (
            <div
              key={item.id}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 hover:border-[#F9A826]/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col"
            >
              {/* Icon Kutipan */}
              <Quote className="w-8 h-8 text-[#F9A826]/30 mb-4 group-hover:text-[#F9A826]/60 transition-colors" />
              
              {/* Kutipan */}
              <p className="text-white/70 leading-relaxed text-sm md:text-base italic flex-grow">
                "{item.quote}"
              </p>

              {/* Garis Pemisah & Profil */}
              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#F9A826]/30 group-hover:border-[#F9A826] transition-colors"
                />
                <div>
                  <p className="font-bold text-white text-sm">
                    {item.name}
                  </p>
                  <p className="text-xs text-white/40">
                    {item.role}
                  </p>
                  <p className="text-xs text-[#F9A826]/60">
                    {item.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;