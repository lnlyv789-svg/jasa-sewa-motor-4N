// src/pages/user/BookingPage.jsx
import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, Calendar, MapPin, CreditCard,
  Shield, Truck, Bike, Info, CheckCircle2, Loader2, AlertCircle
} from "lucide-react";
import { getMotorById } from "../../services/motorservice";
import { createOrder, generateOrderId, generateInvoiceNumber } from "../../services/orderService";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/Button";

const BookingPage = () => {
  const { motorId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // ==== State Motor ====
  const [motor, setMotor] = useState(null);
  const [isLoadingMotor, setIsLoadingMotor] = useState(true);
  const [motorError, setMotorError] = useState("");

  // ==== State Form ====
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    start_date: "",
    duration_days: 1,
    pickup_method: "self",
    delivery_address: "",
    identity_type: "ktp",
    payment_type: "dp",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ==== Fetch motor + prefill user data ====
  useEffect(() => {
    const fetchMotor = async () => {
      setIsLoadingMotor(true);
      setMotorError("");

      const result = await getMotorById(motorId);

      if (!result.success || !result.data) {
        setMotorError("Motor tidak ditemukan.");
        setIsLoadingMotor(false);
        return;
      }

      setMotor(result.data);
      setIsLoadingMotor(false);
    };

    if (motorId) fetchMotor();
  }, [motorId]);

  // ==== Prefill data user ke form ====
  useEffect(() => {
    if (profile || user) {
      setFormData((prev) => ({
        ...prev,
        customer_name: profile?.full_name || "",
        customer_email: user?.email || "",
        customer_phone: profile?.phone || "",
      }));
    }
  }, [profile, user]);

  // ==== Kalkulasi total ====
  const calculation = useMemo(() => {
    if (!motor) return { total: 0, paid: 0, due: 0 };

    const total = motor.price * formData.duration_days;
    const paid = formData.payment_type === "dp" ? Math.round(total * 0.5) : total;
    const due = total - paid;

    return { total, paid, due };
  }, [motor, formData.duration_days, formData.payment_type]);

  // ==== Handle input change ====
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
    if (submitError) setSubmitError("");
  };

  // ==== Validasi ====
  const validate = () => {
    const newErrors = {};
    if (!formData.customer_name.trim()) newErrors.customer_name = "Nama wajib diisi";
    if (!formData.customer_email.trim()) newErrors.customer_email = "Email wajib diisi";
    if (!formData.customer_phone.trim()) newErrors.customer_phone = "No HP wajib diisi";
    if (!formData.start_date) newErrors.start_date = "Tanggal mulai wajib diisi";
    if (formData.duration_days < 1) newErrors.duration_days = "Minimal 1 hari";

    if (formData.pickup_method === "delivery" && !formData.delivery_address.trim()) {
      newErrors.delivery_address = "Alamat pengantaran wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==== Handle submit → insert ke Supabase ====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Pastikan user login
    if (!user?.id) {
      setSubmitError("Kamu harus login dulu untuk melakukan booking.");
      return;
    }

    setIsSubmitting(true);

    const orderId = generateOrderId();
    const invoiceNumber = generateInvoiceNumber();

    const orderPayload = {
      orderId,
      invoiceNumber,
      userId: user.id,
      motorId: motor.id,
      startDate: formData.start_date,
      durationDays: formData.duration_days,
      totalPrice: calculation.total,
      paymentType: formData.payment_type,
      amountPaid: 0,
      amountDue: calculation.total,
      customerName: formData.customer_name.trim(),
      customerEmail: formData.customer_email.trim(),
      customerPhone: formData.customer_phone.trim(),
      pickupMethod: formData.pickup_method,
      deliveryAddress: formData.delivery_address || null,
      identityType: formData.identity_type,
      identityHeld: false,
      paymentStatus: "unpaid",
      rentalStatus: "pending",
    };

    const result = await createOrder(orderPayload);

    if (!result.success) {
      setSubmitError(result.error || "Gagal membuat pesanan. Coba lagi.");
      setIsSubmitting(false);
      return;
    }

    // Simpan motor info ke localStorage agar CheckoutPage bisa tampilkan data motor
    // (karena CheckoutPage fetch by orderId, tapi butuh info motor)
    localStorage.setItem(
      `orderMotor_${orderId}`,
      JSON.stringify({
        motor_id: motor.id,
        motor_name: motor.name,
        motor_image: motor.image,
        motor_price: motor.price,
      })
    );

    setIsSubmitting(false);
    navigate(`/checkout/${orderId}`);
  };

  const hasError = (field) => !!errors[field];

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (isLoadingMotor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] mx-auto animate-spin mb-4" />
        <p className="text-white/60 text-sm">Memuat data motor...</p>
      </div>
    );
  }

  // ============================================================
  // ERROR / NOT FOUND
  // ============================================================
  if (motorError || !motor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-black text-white mb-2">Motor tidak ditemukan</h1>
        <p className="text-white/60 mb-6">{motorError || "Motor yang kamu cari tidak tersedia."}</p>
        <Button
          variant="solid"
          size="medium"
          onClick={() => navigate("/motor")}
          className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] font-bold border-none"
        >
          ← Kembali ke Katalog
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* TOMBOL KEMBALI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pt-8">
        <button
          onClick={() => navigate(`/motor/${motor.id}`)}
          className="flex items-center gap-2 text-white/60 hover:text-[#D4AF37] transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Detail Motor
        </button>
      </section>

      {/* HEADER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pt-6 pb-8">
        <span className="inline-block text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20 mb-4">
          Form Booking
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-white">
          Lengkapi <span className="text-[#D4AF37]">Data Pemesanan</span>
        </h1>
        <p className="text-white/60 mt-2 text-sm md:text-base">
          Isi data dengan benar. Identitas asli akan ditahan saat pengambilan motor.
        </p>
      </section>

      {/* ERROR BANNER */}
      {submitError && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pb-4">
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-400">Gagal Membuat Pesanan</p>
              <p className="text-xs text-red-300/80 mt-0.5">{submitError}</p>
            </div>
          </div>
        </section>
      )}

      {/* KONTEN: 2 KOLOM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ==================================================== */}
            {/* KOLOM KIRI: FORM                                      */}
            {/* ==================================================== */}
            <div className="lg:col-span-2 space-y-6">

              {/* KELOMPOK 1: DATA DIRI */}
              <div className="bg-[#15203D] rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                  <div className="p-2.5 bg-[#D4AF37]/10 rounded-xl">
                    <User className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-black text-white">Data Diri</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                      Nama Lengkap <span className="text-[#FF6B35]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) => handleChange("customer_name", e.target.value)}
                      className={`w-full bg-[#0B132B] border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all ${
                        hasError("customer_name")
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-white/10 focus:border-[#D4AF37]"
                      }`}
                      placeholder="Nama sesuai KTP"
                    />
                    {hasError("customer_name") && (
                      <p className="text-xs text-red-400 mt-1">⚠️ {errors.customer_name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1.5">
                        Email <span className="text-[#FF6B35]">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.customer_email}
                        onChange={(e) => handleChange("customer_email", e.target.value)}
                        className={`w-full bg-[#0B132B] border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all ${
                          hasError("customer_email")
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-white/10 focus:border-[#D4AF37]"
                        }`}
                        placeholder="email@contoh.com"
                      />
                      {hasError("customer_email") && (
                        <p className="text-xs text-red-400 mt-1">⚠️ {errors.customer_email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1.5">
                        No WhatsApp <span className="text-[#FF6B35]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.customer_phone}
                        onChange={(e) => handleChange("customer_phone", e.target.value)}
                        className={`w-full bg-[#0B132B] border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all ${
                          hasError("customer_phone")
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-white/10 focus:border-[#D4AF37]"
                        }`}
                        placeholder="081234567890"
                      />
                      {hasError("customer_phone") && (
                        <p className="text-xs text-red-400 mt-1">⚠️ {errors.customer_phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* KELOMPOK 2: JADWAL SEWA */}
              <div className="bg-[#15203D] rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                  <div className="p-2.5 bg-[#D4AF37]/10 rounded-xl">
                    <Calendar className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-black text-white">Jadwal Sewa</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                      Tanggal Mulai <span className="text-[#FF6B35]">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => handleChange("start_date", e.target.value)}
                      className={`w-full bg-[#0B132B] border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all [color-scheme:dark] ${
                        hasError("start_date")
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-white/10 focus:border-[#D4AF37]"
                      }`}
                    />
                    {hasError("start_date") && (
                      <p className="text-xs text-red-400 mt-1">⚠️ {errors.start_date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                      Durasi (Hari) <span className="text-[#FF6B35]">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={formData.duration_days}
                      onChange={(e) => handleChange("duration_days", parseInt(e.target.value) || 1)}
                      className={`w-full bg-[#0B132B] border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all ${
                        hasError("duration_days")
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-white/10 focus:border-[#D4AF37]"
                      }`}
                    />
                    {hasError("duration_days") && (
                      <p className="text-xs text-red-400 mt-1">⚠️ {errors.duration_days}</p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-white/40 mt-3 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" />
                  Maksimal 30 hari per pemesanan.
                </p>
              </div>

              {/* KELOMPOK 3: METODE PENGAMBILAN */}
              <div className="bg-[#15203D] rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                  <div className="p-2.5 bg-[#D4AF37]/10 rounded-xl">
                    <MapPin className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-black text-white">Metode Pengambilan</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => handleChange("pickup_method", "self")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.pickup_method === "self"
                        ? "bg-[#D4AF37]/10 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10"
                        : "bg-[#0B132B] border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Bike className={`w-5 h-5 mt-0.5 ${formData.pickup_method === "self" ? "text-[#D4AF37]" : "text-white/60"}`} />
                      <div>
                        <p className={`font-bold text-sm ${formData.pickup_method === "self" ? "text-[#D4AF37]" : "text-white"}`}>
                          Ambil Sendiri
                        </p>
                        <p className="text-xs text-white/50 mt-0.5">
                          Datang ke garasi 4N terdekat.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange("pickup_method", "delivery")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.pickup_method === "delivery"
                        ? "bg-[#D4AF37]/10 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10"
                        : "bg-[#0B132B] border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Truck className={`w-5 h-5 mt-0.5 ${formData.pickup_method === "delivery" ? "text-[#D4AF37]" : "text-white/60"}`} />
                      <div>
                        <p className={`font-bold text-sm ${formData.pickup_method === "delivery" ? "text-[#D4AF37]" : "text-white"}`}>
                          Diantar
                        </p>
                        <p className="text-xs text-white/50 mt-0.5">
                          Hanya untuk jarak ≤ 5 km.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {formData.pickup_method === "delivery" && (
                  <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                      Alamat Pengantaran <span className="text-[#FF6B35]">*</span>
                    </label>
                    <textarea
                      value={formData.delivery_address}
                      onChange={(e) => handleChange("delivery_address", e.target.value)}
                      rows={3}
                      className={`w-full bg-[#0B132B] border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all resize-none ${
                        hasError("delivery_address")
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-white/10 focus:border-[#D4AF37]"
                      }`}
                      placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota"
                    />
                    {hasError("delivery_address") && (
                      <p className="text-xs text-red-400 mt-1">⚠️ {errors.delivery_address}</p>
                    )}
                    <p className="text-xs text-[#F9A826] mt-2 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      Admin akan verifikasi jarak alamatmu. Kalau lebih dari 5 km, pesanan bisa ditolak.
                    </p>
                  </div>
                )}
              </div>

              {/* KELOMPOK 4: IDENTITAS */}
              <div className="bg-[#15203D] rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                  <div className="p-2.5 bg-[#D4AF37]/10 rounded-xl">
                    <Shield className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-black text-white">Identitas yang Ditahan</h3>
                </div>

                <p className="text-xs text-white/60 mb-4 flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#F9A826] mt-0.5 flex-shrink-0" />
                  Bawa identitas <strong className="text-white">asli</strong> saat pengambilan motor. Akan ditahan selama masa sewa.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "ktp", label: "KTP" },
                    { value: "sim_c", label: "SIM C" },
                    { value: "sim_a", label: "SIM A" },
                    { value: "paspor", label: "Paspor" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleChange("identity_type", opt.value)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        formData.identity_type === opt.value
                          ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]"
                          : "bg-[#0B132B] border-white/10 text-white/70 hover:border-white/30"
                      }`}
                    >
                      <p className="font-bold text-sm">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* KELOMPOK 5: PEMBAYARAN */}
              <div className="bg-[#15203D] rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                  <div className="p-2.5 bg-[#D4AF37]/10 rounded-xl">
                    <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-black text-white">Metode Pembayaran</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange("payment_type", "dp")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.payment_type === "dp"
                        ? "bg-[#FF6B35]/10 border-[#FF6B35] shadow-lg shadow-[#FF6B35]/10"
                        : "bg-[#0B132B] border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`font-black text-base ${formData.payment_type === "dp" ? "text-[#FF6B35]" : "text-white"}`}>
                          DP 50%
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                          Bayar setengah sekarang, sisa saat ambil motor.
                        </p>
                      </div>
                      {formData.payment_type === "dp" && (
                        <CheckCircle2 className="w-5 h-5 text-[#FF6B35] flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange("payment_type", "full")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.payment_type === "full"
                        ? "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10"
                        : "bg-[#0B132B] border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`font-black text-base ${formData.payment_type === "full" ? "text-emerald-400" : "text-white"}`}>
                          Full Payment
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                          Bayar lunas sekarang. Lebih hemat waktu.
                        </p>
                      </div>
                      {formData.payment_type === "full" && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* ==================================================== */}
            {/* KOLOM KANAN: RINGKASAN                                */}
            {/* ==================================================== */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4">

                {/* Card Motor */}
                <div className="bg-[#15203D] rounded-2xl overflow-hidden border border-[#D4AF37]/20">
                  <div className="relative h-40 bg-[#0B132B]">
                    <img
                      src={motor.image}
                      alt={motor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop";
                      }}
                    />
                    <span className="absolute top-3 left-3 bg-[#D4AF37] text-[#0B132B] text-xs font-extrabold px-3 py-1 rounded-full">
                      {motor.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-white">{motor.name}</h3>
                    <p className="text-xs text-white/50 mt-1">
                      Rp {motor.price.toLocaleString("id-ID")} /hari
                    </p>
                  </div>
                </div>

                {/* Card Rincian */}
                <div className="bg-[#15203D] rounded-2xl p-5 border border-white/5">
                  <h3 className="font-black text-white mb-4 pb-3 border-b border-white/10">
                    💰 Rincian Biaya
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-white/70">
                      <span>Harga Sewa</span>
                      <span className="text-white font-medium">
                        Rp {motor.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Durasi</span>
                      <span className="text-white font-medium">{formData.duration_days} hari</span>
                    </div>

                    <div className="border-t border-white/10 pt-3 flex justify-between">
                      <span className="text-white font-bold">Total</span>
                      <span className="text-white font-black text-lg">
                        Rp {calculation.total.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="border-t border-white/10 pt-3 space-y-2">
                      <div className="flex justify-between text-[#FF6B35]">
                        <span className="font-bold">
                          {formData.payment_type === "dp" ? "Bayar Sekarang (DP 50%)" : "Bayar Sekarang"}
                        </span>
                        <span className="font-black">
                          Rp {calculation.paid.toLocaleString("id-ID")}
                        </span>
                      </div>
                      {calculation.due > 0 && (
                        <div className="flex justify-between text-white/50 text-xs">
                          <span>Sisa (bayar saat ambil)</span>
                          <span>Rp {calculation.due.toLocaleString("id-ID")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tombol Submit */}
                <Button
                  type="submit"
                  variant="solid"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] font-black border-none shadow-lg shadow-[#D4AF37]/20 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Lanjut ke Pembayaran →"
                  )}
                </Button>

                <p className="text-xs text-white/40 text-center">
                  Dengan melanjutkan, kamu setuju dengan{" "}
                  <span className="text-[#D4AF37] underline cursor-pointer">Syarat & Ketentuan</span>{" "}
                  4N.
                </p>
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};

export default BookingPage;