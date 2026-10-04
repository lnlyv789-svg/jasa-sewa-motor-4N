// src/layouts/UserLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-[#0B132B] flex flex-col">
      {/* Navbar (fixed di atas) */}
      <Navbar />

      {/* Konten Utama */}
      {/* pt-20 = memberi ruang agar konten tidak tertutup navbar (h-20) */}
      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UserLayout;