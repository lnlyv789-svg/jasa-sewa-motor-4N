// src/layouts/AdminLayout.jsx
import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Bike, Wallet, Receipt,
  Globe, LogOut, Menu, Bell, ChevronRight
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true },
    { name: "Pesanan", path: "/admin/orders", icon: Package },
    { name: "Motor", path: "/admin/motors", icon: Bike },
    { name: "Refund", path: "/admin/refunds", icon: Wallet },
    { name: "Invoice", path: "/admin/invoices", icon: Receipt },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleMenuClick = () => {
    if (window.innerWidth < 1024) closeSidebar();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F1F5F9]">

      {/* ============================================================ */}
      {/* TOPBAR (FULL WIDTH)                                           */}
      {/* ============================================================ */}
      <header className="h-16 flex-shrink-0 bg-[#0B132B] border-b border-[#D4AF37]/10 flex items-center justify-between px-4 md:px-6 z-50">
        
        {/* ==== KIRI: Hamburger + Logo ==== */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-white/80" strokeWidth={2.2} />
          </button>

          <Link to="/admin" className="flex items-center gap-2.5 group">
            <Bike className="w-6 h-6 text-[#D4AF37] group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-lg font-black tracking-tight text-white">
              4<span className="text-[#D4AF37]">N</span>
            </span>
            <span className="hidden sm:inline text-[10px] font-semibold text-[#D4AF37]/60 uppercase tracking-widest border-l border-white/10 pl-2.5 ml-1">
              Admin Panel
            </span>
          </Link>
        </div>

        {/* ==== KANAN: Notif + Profile + Logout ==== */}
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Bell className="w-5 h-5 text-white/70" strokeWidth={2.2} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF6B35] rounded-full ring-2 ring-[#0B132B]" />
          </button>

          <div className="flex items-center gap-3 pl-3 ml-1 border-l border-white/10">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-white leading-tight">
                {user?.full_name || "Admin"}
              </p>
              <p className="text-[11px] text-white/40">
                {user?.email || "admin@4n.id"}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0B132B] font-black text-sm">
              {user?.full_name?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 px-3 py-2 ml-1 rounded-lg text-sm font-semibold text-white/60 hover:bg-[#FF6B35]/10 hover:text-[#FF6B35] transition-all"
          >
            <LogOut className="w-4 h-4" strokeWidth={2.2} />
            <span className="hidden md:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* BODY (Sidebar + Konten)                                       */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ==== OVERLAY (mobile only) ==== */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={closeSidebar}
          />
        )}

        {/* ============================================================ */}
        {/* SIDEBAR                                                       */}
        {/* ============================================================ */}
        <aside
          className={`
            fixed lg:relative top-16 lg:top-0 left-0 z-40
            h-[calc(100vh-4rem)] lg:h-full
            bg-[#0B132B] flex flex-col flex-shrink-0
            transition-all duration-300 ease-in-out
            ${isSidebarOpen
              ? "w-64 translate-x-0"
              : "w-64 -translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden"
            }
          `}
        >
          {/* Inner wrapper: fixed width biar konten tidak gepeng */}
          <div className="w-64 h-full flex flex-col flex-shrink-0">

            {/* ==== MENU LABEL ==== */}
            <div className="px-6 pt-5 pb-2 flex-shrink-0">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Menu Utama
              </p>
              <p className="text-[11px] text-[#D4AF37]/70 mt-0.5 font-medium">
                Role: Administrator
              </p>
            </div>

            {/* ==== MENU LIST ==== */}
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleMenuClick}
                    className={`
                      group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all
                      ${active
                        ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                      }
                    `}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] transition-colors flex-shrink-0 ${
                        active ? "text-[#D4AF37]" : "text-white/40 group-hover:text-white/80"
                      }`}
                      strokeWidth={2.2}
                    />
                    <span className="truncate">{item.name}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37] flex-shrink-0" />
                    )}
                  </Link>
                );
              })}

              <div className="pt-3 mt-3 border-t border-white/5">
                <Link
                  to="/"
                  target="_blank"
                  onClick={handleMenuClick}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:bg-white/5 hover:text-white transition-all group"
                >
                  <Globe className="w-[18px] h-[18px] text-white/40 group-hover:text-white/80 flex-shrink-0" strokeWidth={2.2} />
                  <span className="truncate">Lihat Website</span>
                </Link>
              </div>
            </nav>

            {/* ==== FOOTER SIDEBAR: Info singkat ==== */}
            <div className="p-3 border-t border-white/5 flex-shrink-0">
              <div className="px-3 py-2.5">
                <p className="text-[10px] text-white/30 leading-relaxed">
                  © {new Date().getFullYear()} 4N — Explore All Corners.
                </p>
                <p className="text-[10px] text-[#D4AF37]/50 mt-0.5">
                  v1.0.0
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* KONTEN AREA                                                   */}
        {/* ============================================================ */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* ==== KONTEN ==== */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;