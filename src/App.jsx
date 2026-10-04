// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


// Layouts
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./Layouts/AdminLayout";

// Protected
import ProtectedRoute from "./components/ProtectedRoute";

//buat Auth 
import { AuthProvider } from "./context/AuthContext";

// Pages - Publik & Auth
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Pages - User Area
import DashboardPage from "./pages/users/DashboardPage";
import BookingPage from "./pages/users/BookingPage";
import RiwayatPage from "./pages/users/RiwayatPage";
import InvoicePage from "./pages/users/InvoicePage";
import ProfilePage from "./pages/users/ProfilePage";
import MotorCatalogPage from "./pages/users/MotorCatalogPage";
import MotorDetailPage from "./pages/users/MotorDetailPage";
import OrderDetailPage from "./pages/users/OrderDetailPage";
import CheckoutPage from "./pages/users/CheckoutPage";

//etmin
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminOrdersPage from "./pages/Admin/AdminOrdersPage";
import AdminOrderDetailPage from "./pages/Admin/AdminOrderDetailPage";
import AdminMotorsPage from "./pages/Admin/AdminMotorsPage";
import AdminMotorFormPage from "./pages/Admin/AdminMotorFormPage";
import AdminRefundsPage from "./pages/Admin/AdminRefundsPage";
import AdminInvoicesPage from "./pages/Admin/AdminInvoicesPage";
function App() {
  return (
    <AuthProvider>
    <Router>
      <div className="App min-h-screen bg-[#0B132B] text-white selection:bg-[#D4AF37] selection:text-[#0B132B]">
        <Routes>
          {/* Publik */}
          <Route path="/" element={<HomePage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Area */}
          <Route element ={<ProtectedRoute />} >
            <Route element={<UserLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/motor" element={<MotorCatalogPage />} />
              <Route path="/motor/:id" element={<MotorDetailPage />} />
              <Route path="/booking/:motorId" element={<BookingPage />} />
              <Route path="/checkout/:orderId" element={<CheckoutPage />} />
              <Route path="/invoice/:orderId" element={<InvoicePage />} />
              <Route path="/riwayat" element={<RiwayatPage />} />
              <Route path="/riwayat/:orderId" element={<OrderDetailPage />} />
            </Route>
          </Route>

          {/* Admin Area (halaman belum dibuat, cukup 1 route dulu) */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="/admin/motors" element={<AdminMotorsPage />} />
              <Route path="/admin/motors/new" element={<AdminMotorFormPage />} />
              <Route path="/admin/motors/:id/edit" element={<AdminMotorFormPage />} />    
              <Route path="admin/refunds" element={<AdminRefundsPage />} />
              <Route path="admin/invoices" element={<AdminInvoicesPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
    </AuthProvider>

  );
}

export default App;