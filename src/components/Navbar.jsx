// src/components/Navbar.jsx
import { useState } from "react";
import { Menu, X, Bike, Bell, ChevronDown, LayoutDashboard, History, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const navLinks = [
    { name: "Beranda", href: "/#hero" },
    { name: "Koleksi Motor", href: "/#motor" },
    { name: "Keunggulan", href: "/#about" },
    { name: "Kontak", href: "/#contact" },
  ];

 const handleLogout = async () => {
  setIsDropdownOpen(false);
  setIsOpen(false);
  await logout();
   window.location.href = "/";
};

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-[#0B132B]/90 backdrop-blur-md border-b border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="flex items-center justify-between h-20">

          {/* === LOGO === */}
          <a href="/#hero" className="flex items-center gap-2 group">
            <Bike className="w-8 h-8 text-[#D4AF37] group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-2xl font-black tracking-tight text-white">
              4<span className="text-[#D4AF37]">N</span>
            </span>
            <span className="hidden md:inline-block text-xs font-light text-[#D4AF37]/70 border-l border-[#D4AF37]/30 pl-3">
              Explore All Corners
            </span>
          </a>

          {/* === DESKTOP MENU === */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-white/80 hover:text-[#D4AF37] transition-all duration-200 hover:scale-105"
              >
                {link.name}
              </a>
            ))}

            {/* KONDISIONAL: Belum Login vs Sudah Login */}
            {!isLoggedIn ? (
              <div className="flex items-center gap-3 ml-4">
                <Button
                  variant="ghost"
                  size="small"
                  className="text-white/80 hover:text-white"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button
                  variant="solid"
                  size="small"
                  className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] font-bold border-none"
                  onClick={() => navigate("/register")}
                >
                  Daftar
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4 ml-4">
                {/* Tombol Notifikasi */}
                <button className="relative text-white/80 hover:text-[#D4AF37] transition-colors p-2">
                  <Bell className="w-5 h-5" />
                  {/* Dot merah penanda ada notif */}
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B35] rounded-full" />
                </button>

                {/* Avatar + Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center gap-2 focus:outline-none group"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0B132B] font-black text-sm shadow-md">
                      {user?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white/90 group-hover:text-[#D4AF37] transition-colors">
                      {user?.full_name?.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-white/60 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-[#15203D] rounded-xl border border-[#D4AF37]/20 shadow-2xl overflow-hidden">
                      {/* Info User */}
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-bold text-white">{user?.full_name}</p>
                        <p className="text-xs text-white/50 truncate">{user?.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => { setIsDropdownOpen(false); navigate(isAdmin ? "/admin" : "/dashboard"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {isAdmin ? "Dashboard Admin" : "Dashboard"}
                        </button>

                        {!isAdmin && (
                          <>
                            <button
                              onClick={() => { setIsDropdownOpen(false); navigate("/riwayat"); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-colors"
                            >
                              <History className="w-4 h-4" />
                              Riwayat Sewa
                            </button>
                            <button
                              onClick={() => { setIsDropdownOpen(false); navigate("/profil"); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-colors"
                            >
                              <User className="w-4 h-4" />
                              Profil Saya
                            </button>
                          </>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-white/10 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* === TOMBOL MOBILE HAMBURGER === */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white/80 hover:text-[#D4AF37] transition-colors p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* === MENU MOBILE DROPDOWN === */}
        <div
          className={`
            md:hidden overflow-hidden transition-all duration-300 ease-in-out
            ${isOpen ? "max-h-96 opacity-100 py-4 border-t border-[#D4AF37]/10" : "max-h-0 opacity-0"}
          `}
        >
          <div className="flex flex-col items-center gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-base font-medium text-white/80 hover:text-[#D4AF37] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}

            {!isLoggedIn ? (
              <div className="flex flex-col w-full gap-3 mt-2 px-4">
                <Button
                  variant="ghost"
                  size="medium"
                  fullWidth
                  onClick={() => { setIsOpen(false); navigate("/login"); }}
                >
                  Login
                </Button>
                <Button
                  variant="solid"
                  size="medium"
                  fullWidth
                  className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] font-bold border-none"
                  onClick={() => { setIsOpen(false); navigate("/register"); }}
                >
                  Daftar
                </Button>
              </div>
            ) : (
              <div className="flex flex-col w-full gap-2 mt-2 px-4 border-t border-white/10 pt-4">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-9 h-9 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0B132B] font-black text-sm">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user?.full_name}</p>
                    <p className="text-xs text-white/50">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="medium"
                  fullWidth
                  onClick={() => { setIsOpen(false); navigate(isAdmin ? "/admin" : "/dashboard"); }}
                >
                  {isAdmin ? "Dashboard Admin" : "Dashboard"}
                </Button>
                {!isAdmin && (
                  <Button
                    variant="ghost"
                    size="medium"
                    fullWidth
                    onClick={() => { setIsOpen(false); navigate("/riwayat"); }}
                  >
                    Riwayat Sewa
                  </Button>
                )}
                <Button
                  variant="solid"
                  size="medium"
                  fullWidth
                  className="bg-[#FF6B35] text-white hover:bg-[#e05a2a] font-bold border-none"
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                >
                  Keluar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;