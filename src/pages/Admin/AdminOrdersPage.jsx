// src/pages/admin/AdminOrdersPage.jsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Eye, Package, Loader2, AlertCircle, RefreshCw
} from "lucide-react";
import { getAllOrders } from "../../services/orderService";
import { formatRupiah } from "../../data/dummyStats";

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("semua");
  const [searchQuery, setSearchQuery] = useState("");

  // ==== Fetch semua orders dari Supabase ====
  const fetchOrders = async () => {
    setIsLoading(true);
    setErrorMsg("");

    const result = await getAllOrders();

    if (!result.success) {
      setErrorMsg(result.error || "Gagal memuat data pesanan.");
      setIsLoading(false);
      return;
    }

    setOrders(result.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==== Filter + Search ====
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    // Filter status
    switch (activeTab) {
      case "pending":
        list = list.filter((o) => o.rentalStatus === "pending");
        break;
      case "verifikasi":
        list = list.filter((o) => o.rentalStatus === "menunggu_verifikasi");
        break;
      case "aktif":
        list = list.filter((o) => o.rentalStatus === "aktif");
        break;
      case "selesai":
        list = list.filter((o) => o.rentalStatus === "selesai");
        break;
      case "batal":
        list = list.filter((o) => o.rentalStatus === "dibatalkan");
        break;
      case "semua":
      default:
        break;
    }

    // Filter search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.invoiceNumber.toLowerCase().includes(q)
      );
    }

    // Sort: terbaru dulu
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, activeTab, searchQuery]);

  // ==== Hitung jumlah per tab ====
  const counts = useMemo(() => ({
    semua: orders.length,
    pending: orders.filter((o) => o.rentalStatus === "pending").length,
    verifikasi: orders.filter((o) => o.rentalStatus === "menunggu_verifikasi").length,
    aktif: orders.filter((o) => o.rentalStatus === "aktif").length,
    selesai: orders.filter((o) => o.rentalStatus === "selesai").length,
    batal: orders.filter((o) => o.rentalStatus === "dibatalkan").length,
  }), [orders]);

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
      <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.color}`}>
        {s.label}
      </span>
    );
  };

  // ==== Payment Badge ====
  const PaymentBadge = ({ order }) => {
    if (order.paymentStatus === "paid") {
      return <span className="text-[11px] font-bold text-emerald-600">✓ Lunas</span>;
    }
    if (order.paymentStatus === "partial_paid") {
      return <span className="text-[11px] font-bold text-orange-600">DP 50%</span>;
    }
    return <span className="text-[11px] font-bold text-slate-400">Belum Bayar</span>;
  };

  // ==== Tabs config ====
  const tabs = [
    { id: "semua", label: "Semua", count: counts.semua },
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "verifikasi", label: "Verifikasi", count: counts.verifikasi },
    { id: "aktif", label: "Aktif", count: counts.aktif },
    { id: "selesai", label: "Selesai", count: counts.selesai },
    { id: "batal", label: "Batal", count: counts.batal },
  ];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#0B132B]">
          Kelola Pesanan
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Lihat, verifikasi, dan kelola semua pesanan dari pelanggan.
        </p>
      </div>

      {/* ERROR */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700 mb-1">Gagal Memuat Pesanan</p>
            <p className="text-xs text-red-600">{errorMsg}</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Lagi
          </button>
        </div>
      )}

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari Order ID, invoice, nama customer, atau email..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-[#0B132B] placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
        />
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-[#0B132B] text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id
                ? "bg-[#D4AF37] text-[#0B132B]"
                : "bg-slate-100 text-slate-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TABEL */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className="w-10 h-10 text-[#D4AF37] mx-auto animate-spin mb-3" />
            <p className="text-slate-500 text-sm">Memuat pesanan...</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !errorMsg && (
          <>
            {filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Order ID</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Customer</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Tanggal</th>
                      <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Total</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Bayar</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono font-bold text-[#0B132B]">
                            {order.orderId}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{order.invoiceNumber}</p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-[#0B132B]">{order.customerName}</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{order.customerEmail}</p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-xs font-semibold text-[#0B132B]">{order.startDate}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-black text-[#0B132B]">
                            {formatRupiah(order.totalPrice)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <PaymentBadge order={order} />
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={order.rentalStatus} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#0B132B] hover:text-[#D4AF37] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#D4AF37]/10"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-[#0B132B] mb-1">
                  Tidak ada pesanan
                </h3>
                <p className="text-sm text-slate-500">
                  {searchQuery
                    ? `Tidak ada hasil untuk "${searchQuery}".`
                    : orders.length === 0
                    ? "Belum ada pesanan yang masuk."
                    : `Tidak ada pesanan dengan status ${tabs.find((t) => t.id === activeTab)?.label.toLowerCase()}.`}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-sm font-bold text-[#D4AF37] hover:underline mt-3"
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* INFO FOOTER */}
      {!isLoading && filteredOrders.length > 0 && (
        <p className="text-xs text-slate-500 text-center">
          Menampilkan <span className="font-bold text-[#0B132B]">{filteredOrders.length}</span> dari{" "}
          <span className="font-bold text-[#0B132B]">{orders.length}</span> pesanan
        </p>
      )}
    </div>
  );
};

export default AdminOrdersPage;