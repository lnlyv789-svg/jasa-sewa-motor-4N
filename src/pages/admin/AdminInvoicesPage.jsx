// src/pages/admin/AdminInvoicesPage.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Receipt, Eye, Download, X, CheckCircle2,
  AlertCircle, Printer, Bike, Loader2, RefreshCw
} from "lucide-react";
import { toPng } from "html-to-image";
import { getAllOrders } from "../../services/orderService";
import { formatRupiah } from "../../data/dummyStats";

const AdminInvoicesPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewOrder, setPreviewOrder] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const invoiceRef = useRef(null);

  // ==== Fetch orders dari Supabase ====
  const fetchOrders = async () => {
    setIsLoading(true);
    setErrorMsg("");

    const result = await getAllOrders();

    if (!result.success) {
      setErrorMsg(result.error || "Gagal memuat data invoice.");
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
  const filteredInvoices = useMemo(() => {
    let list = [...orders];

    if (activeTab === "paid") {
      list = list.filter((o) => o.paymentStatus === "paid");
    } else if (activeTab === "partial") {
      list = list.filter((o) => o.paymentStatus === "partial_paid");
    } else if (activeTab === "unpaid") {
      list = list.filter((o) => o.paymentStatus === "unpaid");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.invoiceNumber.toLowerCase().includes(q) ||
          o.orderId.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, activeTab, searchQuery]);

  // ==== Hitung jumlah ====
  const counts = useMemo(() => ({
    semua: orders.length,
    paid: orders.filter((o) => o.paymentStatus === "paid").length,
    partial: orders.filter((o) => o.paymentStatus === "partial_paid").length,
    unpaid: orders.filter((o) => o.paymentStatus === "unpaid").length,
  }), [orders]);

  // ==== Total pendapatan (dari semua order) ====
  const totalRevenue = useMemo(
    () => orders.reduce((s, o) => s + (o.amountPaid || 0), 0),
    [orders]
  );

  // ==== Payment Badge ====
  const PaymentBadge = ({ status }) => {
    const map = {
      paid: { label: "Lunas", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      partial_paid: { label: "DP 50%", color: "bg-orange-100 text-orange-700 border-orange-200" },
      unpaid: { label: "Belum Bayar", color: "bg-slate-100 text-slate-600 border-slate-200" },
      failed: { label: "Gagal", color: "bg-red-100 text-red-700 border-red-200" },
    };
    const s = map[status] || map.unpaid;
    return (
      <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.color}`}>
        {s.label}
      </span>
    );
  };

  // ==== Handle download PNG ====
  const handleDownload = async () => {
    if (!invoiceRef.current || !previewOrder) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(invoiceRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `Invoice-4N-${previewOrder.invoiceNumber.replace(/\//g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal download:", err);
      alert("Gagal mengunduh invoice. Coba lagi ya!");
    } finally {
      setIsDownloading(false);
    }
  };

  // ==== Tabs ====
  const tabs = [
    { id: "semua", label: "Semua", count: counts.semua },
    { id: "paid", label: "Lunas", count: counts.paid },
    { id: "partial", label: "DP", count: counts.partial },
    { id: "unpaid", label: "Belum Bayar", count: counts.unpaid },
  ];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#0B132B]">
          Daftar Invoice
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Semua invoice dari seluruh pesanan customer.
        </p>
      </div>

      {/* ERROR */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700 mb-1">Gagal Memuat Invoice</p>
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

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Receipt className="w-5 h-5 text-blue-600" strokeWidth={2.2} />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Total Invoice</p>
          <p className="text-xl font-black text-[#0B132B] mt-1">{counts.semua}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.2} />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Invoice Lunas</p>
          <p className="text-xl font-black text-[#0B132B] mt-1">{counts.paid}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-[#D4AF37]/20 rounded-xl">
              <Receipt className="w-5 h-5 text-[#D4AF37]" strokeWidth={2.2} />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Total Pendapatan</p>
          <p className="text-xl font-black text-[#0B132B] mt-1">
            {formatRupiah(totalRevenue)}
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari no. invoice, order ID, atau nama customer..."
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

        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className="w-10 h-10 text-[#D4AF37] mx-auto animate-spin mb-3" />
            <p className="text-slate-500 text-sm">Memuat invoice...</p>
          </div>
        )}

        {!isLoading && !errorMsg && (
          <>
            {filteredInvoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">No. Invoice</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Customer</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Motor</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Tanggal</th>
                      <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Total</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-[#0B132B] font-mono">
                            {order.invoiceNumber}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{order.orderId}</p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-[#0B132B]">{order.customerName}</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{order.customerEmail}</p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-700 truncate max-w-[180px]">
                            {order.motorName || "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-xs font-semibold text-[#0B132B]">
                            {new Date(order.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-black text-[#0B132B]">
                            {formatRupiah(order.totalPrice)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <PaymentBadge status={order.paymentStatus} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setPreviewOrder(order)}
                              className="p-2 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                              title="Preview Invoice"
                            >
                              <Eye className="w-4 h-4" strokeWidth={2.2} />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/orders/${order.id}`)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0B132B] hover:bg-slate-100 transition-colors"
                            >
                              Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-[#0B132B] mb-1">
                  Tidak ada invoice
                </h3>
                <p className="text-sm text-slate-500">
                  {searchQuery
                    ? `Tidak ada hasil untuk "${searchQuery}".`
                    : "Belum ada invoice."}
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
      {!isLoading && filteredInvoices.length > 0 && (
        <p className="text-xs text-slate-500 text-center">
          Menampilkan <span className="font-bold text-[#0B132B]">{filteredInvoices.length}</span> dari{" "}
          <span className="font-bold text-[#0B132B]">{orders.length}</span> invoice
        </p>
      )}

      {/* MODAL PREVIEW INVOICE */}
      {previewOrder && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 py-8 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden my-4">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-black text-[#0B132B]">Preview Invoice</h3>
                <p className="text-xs text-slate-500">{previewOrder.invoiceNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] transition-all disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" strokeWidth={2.2} />
                  {isDownloading ? "..." : "Download"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                  title="Cetak"
                >
                  <Printer className="w-4 h-4" strokeWidth={2.2} />
                </button>
                <button
                  onClick={() => setPreviewOrder(null)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={2.2} />
                </button>
              </div>
            </div>

            {/* Invoice Content */}
            <div ref={invoiceRef} className="bg-white p-6 text-[#0B132B]">
              <div className="flex items-start justify-between pb-4 mb-4 border-b-2 border-[#0B132B]">
                <div>
                  <div className="flex items-center gap-2">
                    <Bike className="w-6 h-6 text-[#D4AF37]" />
                    <span className="text-xl font-black">4N</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Explore All Corners with 4N!</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-black">INVOICE</h2>
                  <p className="text-xs font-mono text-slate-600">{previewOrder.invoiceNumber}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(previewOrder.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className={`px-3 py-1.5 rounded text-xs font-bold text-center mb-4 ${
                previewOrder.paymentStatus === "paid"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {previewOrder.paymentStatus === "paid" ? "✓ LUNAS" : "🟡 PARTIAL PAID (DP 50%)"}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                <div>
                  <p className="text-slate-500 uppercase text-[9px] font-bold tracking-wider mb-1">Ditagihkan Kepada</p>
                  <p className="font-bold text-sm">{previewOrder.customerName}</p>
                  <p className="text-slate-600">{previewOrder.customerEmail}</p>
                  <p className="text-slate-600">{previewOrder.customerPhone}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 uppercase text-[9px] font-bold tracking-wider mb-1">Detail Pesanan</p>
                  <p className="text-slate-600">Order ID: <span className="font-bold">{previewOrder.orderId}</span></p>
                  <p className="text-slate-600">Motor: <span className="font-bold">{previewOrder.motorName || "-"}</span></p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 mb-4 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Mulai</span>
                  <span className="font-medium">{previewOrder.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Durasi</span>
                  <span className="font-medium">{previewOrder.durationDays} hari</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pengambilan</span>
                  <span className="font-medium">
                    {previewOrder.pickupMethod === "delivery" ? "Diantar" : "Ambil Sendiri"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Sewa</span>
                  <span className="font-bold">{formatRupiah(previewOrder.totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sudah Dibayar</span>
                  <span className="font-bold text-emerald-600">- {formatRupiah(previewOrder.amountPaid)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t-2 border-dashed border-slate-300">
                  <span className="font-black">
                    {previewOrder.amountDue > 0 ? "Sisa Pembayaran" : "Total Dibayar"}
                  </span>
                  <span className={`text-base font-black ${
                    previewOrder.amountDue > 0 ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {formatRupiah(previewOrder.amountDue > 0 ? previewOrder.amountDue : previewOrder.amountPaid)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 text-center">
                <p className="text-[10px] font-bold">Terima kasih telah mempercayai 4N! 🏍️</p>
                <p className="text-[9px] text-slate-500 mt-0.5">cs@4n.id • 0811-1234-5678</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoicesPage;