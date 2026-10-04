// src/components/MotorCard.jsx
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import { useAuth } from "../hooks/useAuth";

const MotorCard = ({ motor }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const {
    id,
    name,
    category,
    price,
    originalPrice,
    rating,
    image,
    description,
    isPopular,
  } = motor;

  // ==== Klik tombol "Sewa Sekarang" → langsung booking ====
  const handleSewaClick = (e) => {
    e.stopPropagation(); // ← penting! biar tidak memicu onClick card
    if (isLoggedIn) {
      navigate(`/booking/${id}`);
    } else {
      navigate("/login");
    }
  };

  // ==== Klik area card → ke detail motor ====
  const handleCardClick = () => {
    navigate(`/motor/${id}`);
  };

  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const totalStars = 5;

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(totalStars)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < fullStars
                ? "fill-[#D4AF37] text-[#D4AF37]"
                : "text-gray-500 fill-gray-500"
            }`}
          />
        ))}
        <span className="ml-1 text-xs font-bold text-white">{rating}</span>
      </div>
    );
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-[#15203D] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all duration-300 hover:-translate-y-2 border border-white/5 flex flex-col justify-between cursor-pointer"
    >
      <div>
        <div className="relative h-52 overflow-hidden bg-[#0B132B]">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop";
            }}
            loading="lazy"
          />
          {isPopular && (
            <span className="absolute top-3 right-3 bg-[#D4AF37] text-[#0B132B] text-xs font-extrabold px-3 py-1 rounded-full shadow-md tracking-wider">
              🔥 POPULER
            </span>
          )}
          <span className="absolute bottom-3 left-3 bg-[#0B132B]/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full border border-white/20">
            {category}
          </span>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-black text-white line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
              {name}
            </h3>
            {renderStars()}
          </div>

          <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
            {description}
          </p>

          <div className="flex items-end gap-2 pt-2 border-t border-white/10">
            <span className="text-xl font-black text-[#D4AF37]">
              Rp {price.toLocaleString("id-ID")}
            </span>
            {originalPrice && (
              <span className="text-xs text-white/40 line-through pb-0.5">
                Rp {originalPrice.toLocaleString("id-ID")}
              </span>
            )}
            <span className="text-xs text-white/50 ml-auto font-medium">
              /hari
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0">
        <Button
          variant="solid"
          size="medium"
          fullWidth
          onClick={handleSewaClick}
          className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] hover:scale-102 border-none shadow-md font-bold"
        >
          📝 Sewa Sekarang
        </Button>
      </div>
    </div>
  );
};

export default MotorCard;