import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import JobList from './pages/jobs/JobList';
import JobForm from './pages/jobs/JobForm';
import JobDetail from './pages/jobs/JobDetail';
import Layout from './components/layout/Layout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalyses from './pages/admin/AdminAnalyses';
import Settings from './pages/Settings';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={loadingStyle}>Chargement...</div>;
  return user ? children : <Navigate to="/login" />;
}

function PrivateLayout({ children }) {
  return (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <PrivateLayout><Dashboard /></PrivateLayout>
        } />
        <Route path="/jobs" element={
          <PrivateLayout><JobList /></PrivateLayout>
        } />
        <Route path="/jobs/new" element={
          <PrivateLayout><JobForm /></PrivateLayout>
        } />
        <Route path="/jobs/:id" element={
          <PrivateLayout><JobDetail /></PrivateLayout>
        } />

        <Route path="*" element={<Navigate to="/dashboard" />} />

        <Route path="/admin" element={
          <PrivateLayout><AdminDashboard /></PrivateLayout>
        } />
        <Route path="/admin/users" element={
          <PrivateLayout><AdminUsers /></PrivateLayout>
        } />
        <Route path="/admin/analyses" element={
          <PrivateLayout><AdminAnalyses /></PrivateLayout>
        } />

        <Route path="/settings" element={
          <PrivateLayout><Settings /></PrivateLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

const loadingStyle = {
  display: 'flex', alignItems: 'center',
  justifyContent: 'center', minHeight: '100vh',
  fontSize: '16px', color: '#6B7280',
};