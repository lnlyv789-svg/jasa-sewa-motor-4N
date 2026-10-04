// src/pages/admin/AdminMotorsPage.jsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, Edit3, Trash2, Bike, AlertTriangle, X
} from "lucide-react";
import { motorData } from "../../data/motorData";
import { formatRupiah } from "../../data/dummyStats";

const AdminMotorsPage = () => {
  const navigate = useNavigate();
  const [motors, setMotors] = useState(motorData);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ==== Filter + Search ====
  const filteredMotors = useMemo(() => {
    let list = [...motors];

    if (activeFilter !== "Semua") {
      list = list.filter((m) => m.category === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q));
    }

    return list;
  }, [motors, activeFilter, searchQuery]);

  // ==== Statistik ringkas ====
  const stats = useMemo(() => ({
    total: motors.length,
    available: motors.filter((m) => m.status !== "rented" && m.status !== "maintenance").length,
    popular: motors.filter((m) => m.isPopular).length,
  }), [motors]);

  // ==== Status Badge ====
  const StatusBadge = ({ status }) => {
    const map = {
      available: { label: "Tersedia", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      rented: { label: "Disewa", color: "bg-orange-100 text-orange-700 border-orange-200" },
      maintenance: { label: "Maintenance", color: "bg-slate-100 text-slate-600 border-slate-200" },
    };
    // Default semua available (dummy tidak punya field status)
    const s = map[status] || map.available;
    return (
      <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.color}`}>
        {s.label}
      </span>
    );
  };

  // ==== Kategori Badge ====
  const CategoryBadge = ({ category }) => {
    const map = {
      Matic: "bg-blue-50 text-blue-700 border-blue-200",
      Gigi: "bg-purple-50 text-purple-700 border-purple-200",
      Sport: "bg-red-50 text-red-700 border-red-200",
      Trail: "bg-amber-50 text-amber-700 border-amber-200",
    };
    const color = map[category] || "bg-slate-100 text-slate-600 border-slate-200";
    return (
      <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${color}`}>
        {category}
      </span>
    );
  };

  // ==== Handle Delete ====
  const handleDelete = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setTimeout(() => {
      setMotors(motors.filter((m) => m.id !== deleteTarget.id));
      setIsDeleting(false);
      setDeleteTarget(null);
    }, 600);
  };

  // ==== Filters ====
  const filters = ["Semua", "Matic", "Gigi", "Sport", "Trail"];

  return (
    <div className="space-y-6">

      {/* ============================================================ */}
      {/* HEADER                                                        */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0B132B]">
            Kelola Motor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tambah, edit, dan atur ketersediaan motor 4N.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/motors/new")}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0B132B] text-white text-sm font-bold hover:bg-[#1a2a4a] transition-all shadow-lg shadow-[#0B132B]/10"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Tambah Motor
        </button>
      </div>

      {/* ============================================================ */}
      {/* STAT CARDS MINI                                               */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Bike className="w-5 h-5 text-blue-600" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Motor</p>
            <p className="text-lg font-black text-[#0B132B]">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Bike className="w-5 h-5 text-emerald-600" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-xs text-slate-500">Tersedia</p>
            <p className="text-lg font-black text-[#0B132B]">{stats.available}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-[#D4AF37]/20 rounded-lg">
            <Bike className="w-5 h-5 text-[#D4AF37]" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-xs text-slate-500">Populer</p>
            <p className="text-lg font-black text-[#0B132B]">{stats.popular}</p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SEARCH + FILTER                                               */}
      {/* ============================================================ */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama motor..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-[#0B132B] placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeFilter === f
                  ? "bg-[#0B132B] text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TABEL MOTOR                                                   */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filteredMotors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Motor
                  </th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Kategori
                  </th>
                  <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Harga / Hari
                  </th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Rating
                  </th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMotors.map((motor) => (
                  <tr
                    key={motor.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Motor info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={motor.image}
                          alt={motor.name}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200&h=200&fit=crop";
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#0B132B] truncate max-w-[220px]">
                            {motor.name}
                          </p>
                          {motor.isPopular && (
                            <span className="text-[10px] font-bold text-[#D4AF37]">
                              🔥 Populer
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="px-5 py-4">
                      <CategoryBadge category={motor.category} />
                    </td>

                    {/* Harga */}
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-black text-[#0B132B]">
                        {formatRupiah(motor.price)}
                      </p>
                      {motor.originalPrice && (
                        <p className="text-[11px] text-slate-400 line-through">
                          {formatRupiah(motor.originalPrice)}
                        </p>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-[#D4AF37]">★</span>
                        <span className="text-sm font-bold text-[#0B132B]">{motor.rating}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={motor.status} />
                    </td>

                    {/* Aksi */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/admin/motors/${motor.id}/edit`)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" strokeWidth={2.2} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(motor)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2.2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ==== Empty State ==== */
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bike className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-[#0B132B] mb-1">
              Tidak ada motor
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {searchQuery
                ? `Tidak ada hasil untuk "${searchQuery}".`
                : `Belum ada motor di kategori ${activeFilter.toLowerCase()}.`}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm font-bold text-[#D4AF37] hover:underline"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* INFO FOOTER                                                   */}
      {/* ============================================================ */}
      {filteredMotors.length > 0 && (
        <p className="text-xs text-slate-500 text-center">
          Menampilkan <span className="font-bold text-[#0B132B]">{filteredMotors.length}</span> dari{" "}
          <span className="font-bold text-[#0B132B]">{motors.length}</span> motor
        </p>
      )}

      {/* ============================================================ */}
      {/* MODAL KONFIRMASI HAPUS                                        */}
      {/* ============================================================ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden">

            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={2.2} />
                </div>
                <h3 className="text-lg font-black text-[#0B132B]">Hapus Motor?</h3>
              </div>
              {!isDeleting && (
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                Motor <span className="font-bold text-[#0B132B]">{deleteTarget.name}</span> akan dihapus permanen dari daftar. Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>

            <div className="p-5 pt-0 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMotorsPage;