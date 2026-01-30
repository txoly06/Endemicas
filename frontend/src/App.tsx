import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Landing from './pages/public/Landing';
import EducationalContent from './pages/public/EducationalContent';
import PublicContentDetail from './pages/public/PublicContentDetail';
import PublicAlerts from './pages/public/PublicAlerts';
import VerifyCase from './pages/public/VerifyCase';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardHome from './pages/admin/DashboardHome';
import Profile from './pages/admin/Profile';
import CaseList from './pages/admin/CaseList';
import CaseForm from './pages/admin/CaseForm';
import CaseDetails from './pages/admin/CaseDetails';
import MapView from './pages/admin/MapView';
import AlertsDashboard from './pages/admin/AlertsDashboard';
import Reports from './pages/admin/Reports';
import DiseaseRegistry from './pages/admin/DiseaseRegistry';
import ContentManager from './pages/admin/ContentManager';
import UserManagement from './pages/admin/UserManagement';
import DashboardLayout from './layouts/DashboardLayout';
import { useAuthStore } from './store/authStore';
import React from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  // In a real app, we might also check for specific roles here
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const { checkAuth } = useAuthStore();

  React.useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Portal Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/content" element={<EducationalContent />} />
          <Route path="/content/:slug" element={<PublicContentDetail />} />
          <Route path="/content/:slug" element={<PublicContentDetail />} />
          <Route path="/alerts" element={<PublicAlerts />} />
          <Route path="/verify/:code" element={<VerifyCase />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        } />

        <Route path="/register" element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        } />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="cases" element={<CaseList />} />
          <Route path="cases/new" element={<CaseForm />} />
          <Route path="cases/:id" element={<CaseDetails />} />
          <Route path="cases/:id/edit" element={<CaseForm />} />
          <Route path="map" element={<MapView />} />
          <Route path="alerts" element={<AlertsDashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="diseases" element={<DiseaseRegistry />} />
          <Route path="content" element={<ContentManager />} />
          <Route path="users" element={<UserManagement />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}



export default App;
