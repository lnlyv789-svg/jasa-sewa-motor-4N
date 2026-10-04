// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Package, Clock, Bike, ChevronRight,
  ArrowUpRight, Wallet, AlertCircle, Loader2
} from "lucide-react";
import { getAllOrders } from "../../services/orderService";
import { getAllMotors } from "../../services/motorService";
import { useAuth } from "../../hooks/useAuth";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [orders, setOrders] = useState([]);
  const [motors, setMotors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==== Fetch orders + motors paralel ====
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const [ordersResult, motorsResult] = await Promise.all([
        getAllOrders(),
        getAllMotors(),
      ]);

      if (ordersResult.success) setOrders(ordersResult.data);
      if (motorsResult.success) setMotors(motorsResult.data);

      setIsLoading(false);
    };

    fetchData();
  }, []);

  // ==== Stats (dihitung dari data beneran) ====
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + (o.amountPaid || 0), 0);

    const monthlyRevenue = orders
      .filter((o) => {
        const created = new Date(o.createdAt);
        const now = new Date();
        return created.getMonth() === now.getMonth() &&
               created.getFullYear() === now.getFullYear();
      })
      .reduce((s, o) => s + (o.amountPaid || 0), 0);

    const totalOrders = orders.length;
    const pendingVerification = orders.filter((o) => o.rentalStatus === "menunggu_verifikasi").length;
    const activeRentals = orders.filter((o) => o.rentalStatus === "aktif").length;
    const availableMotors = motors.filter((m) => m.status === "available").length;
    const totalMotors = motors.length;

    return {
      totalRevenue,
      monthlyRevenue,
      totalOrders,
      pendingVerification,
      activeRentals,
      availableMotors,
      totalMotors,
    };
  }, [orders, motors]);

  // ==== Weekly revenue (7 hari terakhir) ====
  const weeklyRevenue = useMemo(() => {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const result = [];
    const now = new Date();

    // 7 hari terakhir
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().split("T")[0];

      const revenue = orders
        .filter((o) => o.createdAt && o.createdAt.startsWith(dayKey))
        .reduce((s, o) => s + (o.amountPaid || 0), 0);

      result.push({
        day: days[d.getDay()],
        date: dayKey,
        revenue,
        isToday: i === 0,
      });
    }

    return result;
  }, [orders]);

  const maxRevenue = Math.max(...weeklyRevenue.map((d) => d.revenue), 1);

  // ==== Top motors (agregasi dari orders) ====
  const topMotors = useMemo(() => {
    // Count order per motor_id
    const counts = {};
    orders.forEach((o) => {
      if (o.motorId) {
        counts[o.motorId] = (counts[o.motorId] || 0) + 1;
      }
    });

    // Map ke motor
    const sorted = Object.entries(counts)
      .map(([motorId, count]) => {
        const motor = motors.find((m) => m.id === motorId);
        return {
          motor_id: motorId,
          name: motor?.name || "Motor tidak ditemukan",
          image: motor?.image,
          total_rented: count,
        };
      })
      .sort((a, b) => b.total_rented - a.total_rented)
      .slice(0, 3);

    return sorted;
  }, [orders, motors]);

  // ==== Recent orders ====
  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [orders]
  );

  // ==== Status Badge ====
  const StatusBadge = ({ status }) => {
    const map = {
      pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200" },
      menunggu_verifikasi: { label: "Verifikasi", color: "bg-orange-100 text-orange-700 border-orange-200" },
      aktif: { label: "Aktif", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      selesai: { label: "Selesai", color: "bg-slate-100 text-slate-600 border-slate-200" },
      dibatalkan: { label: "Batal", color: "bg-red-100 text-red-700 border-red-200" },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.color}`}>
        {s.label}
      </span>
    );
  };

  const formatRupiah = (num) => `Rp ${(num || 0).toLocaleString("id-ID")}`;

  // ============================================================
  // LOADING
  // ============================================================
  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-12 h-12 text-[#D4AF37] mx-auto animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER SAPAAN */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0B132B]">
            Selamat datang, {profile?.full_name?.split(" ")[0] || "Admin"}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Berikut ringkasan performa 4N hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200">
          <Clock className="w-3.5 h-3.5" />
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* 4 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <Wallet className="w-5 h-5 text-emerald-600" strokeWidth={2.2} />
            </div>
            {stats.monthlyRevenue > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                Bulan ini
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">Total Pendapatan</p>
          <p className="text-xl font-black text-[#0B132B] mt-1">
            {formatRupiah(stats.totalRevenue)}
          </p>
          {stats.monthlyRevenue > 0 && (
            <p className="text-[11px] text-emerald-600 mt-1 font-medium">
              + {formatRupiah(stats.monthlyRevenue)} bulan ini
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Package className="w-5 h-5 text-blue-600" strokeWidth={2.2} />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Total Pesanan</p>
          <p className="text-xl font-black text-[#0B132B] mt-1">{stats.totalOrders}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-orange-50 rounded-xl">
              <AlertCircle className="w-5 h-5 text-orange-600" strokeWidth={2.2} />
            </div>
            {stats.pendingVerification > 0 && (
              <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                Perlu Aksi
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">Menunggu Verifikasi</p>
          <p className="text-xl font-black text-[#0B132B] mt-1">{stats.pendingVerification}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-purple-50 rounded-xl">
              <Bike className="w-5 h-5 text-purple-600" strokeWidth={2.2} />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Motor Sedang Disewa</p>
          <p className="text-xl font-black text-[#0B132B] mt-1">
            {stats.activeRentals}{" "}
            <span className="text-sm text-slate-400 font-medium">/ {stats.totalMotors}</span>
          </p>
        </div>
      </div>

      {/* 2 KOLOM: Grafik + Top Motors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Grafik */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-black text-[#0B132B]">Pendapatan Mingguan</h2>
              <p className="text-xs text-slate-500 mt-0.5">7 hari terakhir</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              {formatRupiah(weeklyRevenue.reduce((s, d) => s + d.revenue, 0))}
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 h-48">
            {weeklyRevenue.map((day, idx) => {
              const heightPercent = (day.revenue / maxRevenue) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-[#0B132B] bg-slate-100 px-2 py-1 rounded whitespace-nowrap">
                    {day.revenue > 0 ? `Rp ${(day.revenue / 1000).toFixed(0)}rb` : "-"}
                  </div>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80 ${
                        day.isToday
                          ? "bg-[#D4AF37]"
                          : day.revenue > 0
                          ? "bg-[#0B132B]"
                          : "bg-slate-100"
                      }`}
                      style={{ height: `${Math.max(heightPercent, 3)}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-semibold ${day.isToday ? "text-[#D4AF37]" : "text-slate-500"}`}>
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Motors */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-black text-[#0B132B]">Motor Terpopuler</h2>
            <button
              onClick={() => navigate("/admin/motors")}
              className="text-xs font-bold text-[#D4AF37] hover:underline"
            >
              Lihat
            </button>
          </div>

          {topMotors.length > 0 ? (
            <div className="space-y-3">
              {topMotors.map((motor, idx) => (
                <div key={motor.motor_id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      idx === 0
                        ? "bg-[#D4AF37] text-white"
                        : idx === 1
                        ? "bg-slate-200 text-slate-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {motor.image ? (
                    <img
                      src={motor.image}
                      alt={motor.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200&h=200&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Bike className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0B132B] truncate">{motor.name}</p>
                    <p className="text-[10px] text-slate-500">{motor.total_rented}x disewa</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bike className="w-10 h-10 text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-xs text-slate-500">Belum ada data</p>
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Motor Tersedia</span>
              <span className="font-bold text-[#0B132B]">
                {stats.availableMotors} / {stats.totalMotors}
              </span>
            </div>
            <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#f0c85a] rounded-full transition-all"
                style={{
                  width: `${stats.totalMotors > 0 ? (stats.availableMotors / stats.totalMotors) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABEL PESANAN TERBARU */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-[#0B132B]">Pesanan Terbaru</h2>
            <p className="text-xs text-slate-500 mt-0.5">5 pesanan terakhir</p>
          </div>
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex items-center gap-1 text-xs font-bold text-[#D4AF37] hover:underline"
          >
            Lihat Semua
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Order ID</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Customer</th>
                  <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Total</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {order.orderId}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div>
                        <p className="text-sm font-bold text-[#0B132B]">{order.customerName}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-sm font-black text-[#0B132B]">
                        {formatRupiah(order.totalPrice)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={order.rentalStatus} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="text-xs font-bold text-[#D4AF37] hover:underline"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-sm text-slate-500">Belum ada pesanan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;