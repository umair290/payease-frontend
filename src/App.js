import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Bills from './pages/Bills';
import SendMoney from './pages/SendMoney';
import KYC from './pages/KYC';
import AdminDashboard from './pages/AdminDashboard';
import QRCodePage from './pages/QRCode';
import History from './pages/History';
import Notifications from './pages/Notifications';

const LoadingSpinner = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F4FF' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid #E0E6F0', borderTop: '3px solid #1A73E8', borderRadius: '50%' }} />
  </div>
);

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!token) return <Navigate to="/login" />;
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  return storedUser?.is_admin ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/kyc" element={<PrivateRoute><KYC /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/bills" element={<PrivateRoute><Bills /></PrivateRoute>} />
            <Route path="/send" element={<PrivateRoute><SendMoney /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/qr" element={<PrivateRoute><QRCodePage /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;