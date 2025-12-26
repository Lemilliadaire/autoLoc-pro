// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginForm from "./Components/LoginForm";
import RegisterForm from "./Components/RegisterForm";
import ForgotPasswordForm from "./Components/ForgotPasswordForm";
import ResetPasswordForm from "./Components/ResetPasswordForm";
import ProtectedRoute from "./Components/ProtectedRoute";
import Navbar from "./Components/Navbar";
import LoadingSpinner from "./Components/LoadingSpinner";
import { useAuth } from "./hooks/useAuth";
import Footer from "./Components/Footer";
import ClientsPage from "./Pages/Admin/ClientsPage";
import CategoriesPage from "./Pages/Admin/CategoriesPage";
import CategoriesPublicPage from "./Pages/Public/CategoriesPublicPage";
import VoituresPublicPage from "./Pages/Public/VoituresPublicPage";
import VoitureDetailPage from "./Pages/Public/VoitureDetailPage";
import VoituresAdminPage from "./Pages/Admin/VoituresAdminPage";
import VoitureEditPage from "./Pages/Admin/VoitureEditPage";
import AgencesPublicPage from "./Pages/Public/AgencesPublicPage";
import AgenceDetailPage from "./Pages/Public/AgenceDetailPage";
import AgencesAdminPage from "./Pages/Admin/AgencesAdminPage";
import HomePage from "./Pages/Home/HomePage";
import AdminDashboardPage from "./Pages/Admin/AdminDashboardPage";
import AdminLayout from "./Pages/Admin/AdminLayout";
import UserDashboardPage from "./Pages/User/UserDashboardPage";
import ReservationsAdminPage from "./Pages/Admin/ReservationsAdminPage";
import AdminProfilePage from "./Pages/Admin/AdminProfilePage";
import UserLayout from "./Pages/User/UserLayout";
import ProfilPage from "./Pages/User/ProfilPage";
import ContactPage from "./Pages/Public/ContactPage";
import MesReservationsPage from "./Pages/User/MesReservationsPage";
import MentionsLegalesPage from "./Pages/Public/MentionsLegalesPage";
import ConfidentialitePage from "./Pages/Public/ConfidentialitePage";

const Unauthorized = () => <h2>Accès refusé ❌</h2>;

const AppContent: React.FC = () => {
  const { loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  const isAdminPath = location.pathname.startsWith('/admin');
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname) ||
    location.pathname.startsWith('/reset-password');

  return (
    <div className="d-flex flex-column min-vh-100">
      {!isAuthPage && <Navbar />}
      <div className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
          <Route path="/categories-public" element={<CategoriesPublicPage />} />
          <Route path="/categories-public/:id" element={<CategoriesPublicPage />} />
          <Route path="/agences-public" element={<AgencesPublicPage />} />
          <Route path="/agences-public/:id" element={<AgenceDetailPage />} />
          <Route path="/voitures-public" element={<VoituresPublicPage />} />
          <Route path="/voitures-public/:id" element={<VoitureDetailPage />}
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
          <Route path="/confidentialite" element={<ConfidentialitePage />} />
          <Route
            element={
              <ProtectedRoute requiredRole="user">
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<UserDashboardPage />} />
            <Route path="/mes-reservations" element={<MesReservationsPage />} />
            <Route path="/profil" element={<ProfilPage />} />
          </Route>
          <Route
            path="/admin"
            element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="voitures/edit/:id" element={<VoitureEditPage />} />
            <Route path="voitures" element={<VoituresAdminPage />} />
            <Route path="agences" element={<AgencesAdminPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="reservations" element={<ReservationsAdminPage />} />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </div>
      {!isAdminPath && !isAuthPage && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
