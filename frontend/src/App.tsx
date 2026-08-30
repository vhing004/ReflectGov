import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './components/citizen/HomePage';
import { SubmitFeedbackPage } from './components/citizen/SubmitFeedbackPage';
import { TrackingDetailPage } from './components/citizen/TrackingDetailPage';
import { MapPage } from './components/citizen/MapPage';
import { LoginPage } from './components/auth/LoginPage';
import { OfficerLoginPage } from './components/auth/OfficerLoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { FeedbackManagementPage } from './components/admin/FeedbackManagementPage';
import { UserManagementPage } from './components/admin/UserManagementPage';

// Protected Route Component for Admin / Officer
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role === 'Citizen') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// Citizen Portal Layout Wrapper
const CitizenLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Public Citizen Portal Routes */}
          <Route path="/" element={<CitizenLayout><HomePage /></CitizenLayout>} />
          <Route path="/submit" element={<CitizenLayout><SubmitFeedbackPage /></CitizenLayout>} />
          <Route path="/track" element={<CitizenLayout><TrackingDetailPage /></CitizenLayout>} />
          <Route path="/map" element={<CitizenLayout><MapPage /></CitizenLayout>} />
          <Route path="/login" element={<CitizenLayout><LoginPage /></CitizenLayout>} />

          {/* 2. Private Government Officer Login Route (Chuyên dụng cho cán bộ) */}
          <Route path="/admin/login" element={<OfficerLoginPage />} />
          <Route path="/gov-portal" element={<OfficerLoginPage />} />

          {/* 3. Admin & Officer Operations Management Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="feedbacks" element={<FeedbackManagementPage />} />
            <Route path="users" element={<UserManagementPage />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
