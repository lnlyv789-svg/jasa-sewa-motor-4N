// src/pages/admin/AdminMotorFormPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Bike, Star, AlertCircle, Upload, Loader2, CheckCircle2
} from "lucide-react";
import { getMotorById, createMotor, updateMotor } from "../../services/motorservice";
import { formatRupiah } from "../../data/dummyStats";
import Button from "../../components/Button";

const AdminMotorFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = !!id;

  // ==== State ====
  const [formData, setFormData] = useState({
    name: "",
    category: "Matic",
    price: "",
    originalPrice: "",
    rating: 5.0,
    image: "",
    description: "",
    isPopular: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [notFound, setNotFound] = useState(false);

  // ==== Prefill kalau edit mode ====
  useEffect(() => {
    if (!isEditMode) return;

    const fetchMotor = async () => {
      setIsLoadingData(true);
      const result = await getMotorById(id);

      if (!result.success || !result.data) {
        setNotFound(true);
        setIsLoadingData(false);
        return;
      }

      const m = result.data;
      setFormData({
        name: m.name || "",
        category: m.category || "Matic",
        price: m.price || "",
        originalPrice: m.originalPrice || "",
        rating: m.rating || 5.0,
        image: m.image || "",
        description: m.description || "",
        isPopular: m.isPopular || false,
      });
      setIsLoadingData(false);
    };

    fetchMotor();
  }, [id, isEditMode]);

  // ==== Handle perubahan input ====
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
    if (errorMsg) setErrorMsg("");
  };

  // ==== Validasi ====
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nama motor wajib diisi";
    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Harga harus lebih dari 0";
    }
    if (!formData.description.trim()) newErrors.description = "Deskripsi wajib diisi";
    if (formData.originalPrice && Number(formData.originalPrice) <= Number(formData.price)) {
      newErrors.originalPrice = "Harga coret harus lebih besar dari harga jual";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==== Handle submit ====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      rating: Number(formData.rating) || 5.0,
      image: formData.image.trim() || null,
      description: formData.description.trim(),
      isPopular: formData.isPopular,
    };

    let result;
    if (isEditMode) {
      result = await updateMotor(id, payload);
    } else {
      result = await createMotor(payload);
    }

    if (!result.success) {
      setErrorMsg(result.error || "Gagal menyimpan motor. Coba lagi.");
      setIsSaving(false);
      return;
    }

    // Sukses → redirect
    setIsSaving(false);
    navigate("/admin/motors");
  };

  const hasError = (field) => !!errors[field];
  const categories = ["Matic", "Gigi", "Sport"];

  // ============================================================
  // LOADING STATE (kalau edit + fetch)
  // ============================================================
  if (isLoadingData) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-12 h-12 text-[#D4AF37] mx-auto animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Memuat data motor...</p>
      </div>
    );
  }

  // ============================================================
  // NOT FOUND (edit tapi ID tidak ada)
  // ============================================================
  if (notFound) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🏍️</div>
        <h1 className="text-2xl font-black text-[#0B132B] mb-2">
          Motor tidak ditemukan
        </h1>
        <p className="text-slate-500 mb-6">ID: {id}</p>
        <Button
          variant="solid"
          size="medium"
          onClick={() => navigate("/admin/motors")}
          className="bg-[#0B132B] text-white hover:bg-[#1a2a4a] font-bold border-none"
        >
          ← Kembali ke Daftar Motor
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">

      {/* TOMBOL KEMBALI */}
      <button
        onClick={() => navigate("/admin/motors")}
        className="flex items-center gap-2 text-slate-500 hover:text-[#0B132B] transition-colors text-sm font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Motor
      </button>

      {/* HEADER */}
      <div>
        <span className="inline-block text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20 mb-3">
          {isEditMode ? "Edit Motor" : "Tambah Motor Baru"}
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-[#0B132B]">
          {isEditMode ? formData.name || "Edit Motor" : "Tambah Motor Baru"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isEditMode
            ? "Perbarui informasi motor yang sudah ada."
            : "Masukkan detail motor yang akan disewakan."}
        </p>
      </div>

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">Gagal Menyimpan</p>
            <p className="text-xs text-red-600 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* FORM + PREVIEW */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ================================================ */}
          {/* KOLOM KIRI: FORM                                  */}
          {/* ================================================ */}
          <div className="lg:col-span-2 space-y-5">

            {/* Info Dasar */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-sm font-black text-[#0B132B] uppercase tracking-wider mb-5 pb-3 border-b border-slate-100">
                📋 Informasi Dasar
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#0B132B] mb-1.5">
                    Nama Motor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-[#0B132B] focus:outline-none transition-all ${
                      hasError("name")
                        ? "border-red-300 focus:border-red-500 bg-red-50/30"
                        : "border-slate-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    }`}
                    placeholder="Contoh: Honda Beat Street (2016)"
                  />
                  {hasError("name") && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#0B132B] mb-1.5">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleChange("category", cat)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          formData.category === cat
                            ? "bg-[#0B132B] text-white shadow-md"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#0B132B] mb-1.5">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={4}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-[#0B132B] focus:outline-none transition-all resize-none ${
                      hasError("description")
                        ? "border-red-300 focus:border-red-500 bg-red-50/30"
                        : "border-slate-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    }`}
                    placeholder="Jelaskan keunggulan motor ini..."
                  />
                  {hasError("description") && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Harga & Rating */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-sm font-black text-[#0B132B] uppercase tracking-wider mb-5 pb-3 border-b border-slate-100">
                💰 Harga & Rating
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#0B132B] mb-1.5">
                    Harga / Hari <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      className={`w-full bg-slate-50 border rounded-xl pl-11 pr-4 py-3 text-sm text-[#0B132B] focus:outline-none transition-all ${
                        hasError("price")
                          ? "border-red-300 focus:border-red-500 bg-red-50/30"
                          : "border-slate-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      }`}
                      placeholder="85000"
                    />
                  </div>
                  {hasError("price") && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#0B132B] mb-1.5">
                    Harga Coret <span className="text-slate-400 font-normal text-xs">(opsional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => handleChange("originalPrice", e.target.value)}
                      className={`w-full bg-slate-50 border rounded-xl pl-11 pr-4 py-3 text-sm text-[#0B132B] focus:outline-none transition-all ${
                        hasError("originalPrice")
                          ? "border-red-300 focus:border-red-500 bg-red-50/30"
                          : "border-slate-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      }`}
                      placeholder="100000"
                    />
                  </div>
                  {hasError("originalPrice") && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.originalPrice}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#0B132B] mb-1.5">
                    Rating (0-5)
                  </label>
                  <div className="relative">
                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => handleChange("rating", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-[#0B132B] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#0B132B] mb-1.5">
                    Tandai sebagai Populer
                  </label>
                  <button
                    type="button"
                    onClick={() => handleChange("isPopular", !formData.isPopular)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                      formData.isPopular
                        ? "bg-[#D4AF37]/10 border-[#D4AF37]"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className={`text-sm font-bold ${formData.isPopular ? "text-[#D4AF37]" : "text-slate-500"}`}>
                      {formData.isPopular ? "🔥 Populer" : "Tidak Populer"}
                    </span>
                    <div
                      className={`w-10 h-6 rounded-full relative transition-all ${
                        formData.isPopular ? "bg-[#D4AF37]" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-md ${
                          formData.isPopular ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Gambar */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-sm font-black text-[#0B132B] uppercase tracking-wider mb-5 pb-3 border-b border-slate-100">
                🖼️ Gambar Motor
              </h2>

              <div>
                <label className="block text-sm font-bold text-[#0B132B] mb-1.5">
                  URL / Path Gambar
                </label>
                <div className="relative">
                  <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => handleChange("image", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-[#0B132B] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    placeholder="/images/Motor Matic/Honda BeAT 2025.png"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                  💡 Untuk sementara pakai path lokal. Upload file akan tersedia setelah integrasi Supabase Storage.
                </p>
              </div>
            </div>
          </div>

          {/* ================================================ */}
          {/* KOLOM KANAN: PREVIEW + SUBMIT                     */}
          {/* ================================================ */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">

              {/* Preview Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  👁️ Preview
                </p>

                <div className="bg-[#15203D] rounded-2xl overflow-hidden border border-white/5">
                  <div className="relative h-40 overflow-hidden bg-[#0B132B]">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bike className="w-12 h-12 text-white/20" strokeWidth={1.5} />
                      </div>
                    )}
                    {formData.isPopular && (
                      <span className="absolute top-2 right-2 bg-[#D4AF37] text-[#0B132B] text-[10px] font-extrabold px-2 py-1 rounded-full">
                        🔥 POPULER
                      </span>
                    )}
                    <span className="absolute bottom-2 left-2 bg-[#0B132B]/80 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/20">
                      {formData.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-black text-white line-clamp-1">
                      {formData.name || "Nama Motor"}
                    </h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(Number(formData.rating) || 0)
                              ? "fill-[#D4AF37] text-[#D4AF37]"
                              : "text-gray-500 fill-gray-500"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs font-bold text-white">
                        {formData.rating || 0}
                      </span>
                    </div>
                    <div className="flex items-end gap-2 pt-1">
                      <span className="text-lg font-black text-[#D4AF37]">
                        {formData.price ? formatRupiah(Number(formData.price)) : "Rp 0"}
                      </span>
                      {formData.originalPrice && (
                        <span className="text-xs text-white/40 line-through pb-0.5">
                          {formatRupiah(Number(formData.originalPrice))}
                        </span>
                      )}
                      <span className="text-xs text-white/50 ml-auto">/hari</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="solid"
                  size="large"
                  fullWidth
                  disabled={isSaving}
                  className="bg-[#0B132B] text-white hover:bg-[#1a2a4a] font-black border-none disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditMode ? "Update Motor" : "Simpan Motor"}
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/motors")}
                  disabled={isSaving}
                  className="w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminMotorFormPage;