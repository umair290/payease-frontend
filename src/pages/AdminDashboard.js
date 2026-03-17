import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  LayoutDashboard, Users, FileCheck, ArrowLeftRight,
  LogOut, Shield, CheckCircle, XCircle, Eye,
  ChevronRight, Bell, Download, DollarSign,
  Activity, UserCheck, Sun, Moon, Menu, X,
  TrendingUp, TrendingDown, AlertTriangle,
  RefreshCw, Search, Filter, MoreVertical,
  Zap, Globe, Lock, Clock, ArrowUpRight,
  ArrowDownLeft, Settings, BarChart2, PieChart as PieIcon,
  CreditCard, Wallet, ShieldCheck, AlertCircle,
  Trash2, Edit2, FileText, CheckSquare, XSquare,
  Activity as ActivityIcon, UserX, UserCheck as UserCheckIcon,
  MessageSquare, ClipboardList
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line
} from 'recharts';

const ADMIN_COLORS = {
  dark: {
    bg: '#0D1117', sidebar: '#010409', card: '#161B22', cardAlt: '#1C2333',
    text: '#F0F6FC', textSecondary: '#8B949E', border: '#21262D', topBar: '#161B22',
    accent: '#1F6FEB', success: '#238636', successText: '#3FB950',
    error: '#DA3633', errorText: '#F85149', warning: '#9E6A03', warningText: '#D29922',
    inputBg: '#0D1117',
  },
  light: {
    bg: '#F6F8FA', sidebar: '#1A1F2E', card: '#FFFFFF', cardAlt: '#F6F8FA',
    text: '#1A1F2E', textSecondary: '#6B7280', border: '#E5E7EB', topBar: '#FFFFFF',
    accent: '#1A73E8', success: '#DCFCE7', successText: '#16A34A',
    error: '#FEE2E2', errorText: '#DC2626', warning: '#FEF9C3', warningText: '#CA8A04',
    inputBg: '#F6F8FA',
  }
};

const weekData = [
  { day: 'Mon', volume: 45000, users: 12, revenue: 2200 },
  { day: 'Tue', volume: 62000, users: 18, revenue: 3100 },
  { day: 'Wed', volume: 38000, users: 9,  revenue: 1900 },
  { day: 'Thu', volume: 78000, users: 24, revenue: 3900 },
  { day: 'Fri', volume: 55000, users: 16, revenue: 2750 },
  { day: 'Sat', volume: 92000, users: 31, revenue: 4600 },
  { day: 'Sun', volume: 67000, users: 22, revenue: 3350 },
];

const monthData = [
  { month: 'Sep', volume: 320000, users: 145 },
  { month: 'Oct', volume: 410000, users: 198 },
  { month: 'Nov', volume: 380000, users: 167 },
  { month: 'Dec', volume: 520000, users: 243 },
  { month: 'Jan', volume: 490000, users: 219 },
  { month: 'Feb', volume: 610000, users: 287 },
];

// ── Confirm Dialog ──
const ConfirmDialog = ({ show, title, message, onConfirm, onCancel, c, confirmText = 'Confirm', confirmColor = '#DC2626', children }) => {
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: c.card, borderRadius: '16px', width: '100%', maxWidth: '380px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)', padding: '20px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
            <AlertTriangle size={24} color="#fff" />
          </div>
          <h3 style={{ color: '#fff', fontSize: '17px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{title}</h3>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', margin: 0 }}>{message}</p>
        </div>
        <div style={{ padding: '16px' }}>
          {children}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button style={{ flex: 1, padding: '11px', background: 'transparent', color: c.textSecondary, border: `1.5px solid ${c.border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }} onClick={onCancel}>
              Cancel
            </button>
            <button style={{ flex: 1, padding: '11px', background: `linear-gradient(135deg, ${confirmColor}, ${confirmColor}CC)`, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Edit User Modal ──
const EditUserModal = ({ show, user, onClose, onSave, c }) => {
  const [form, setForm] = useState({ full_name: '', phone: '', date_of_birth: '', cnic_number: '', full_name_on_card: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        full_name:         user.full_name || '',
        phone:             user.phone || '',
        date_of_birth:     user.kyc?.date_of_birth || '',
        cnic_number:       user.kyc?.cnic_number || '',
        full_name_on_card: user.kyc?.full_name_on_card || '',
        reason:            ''
      });
      setError('');
    }
  }, [user]);

  if (!show || !user) return null;

  const handleSave = async () => {
    if (!form.reason.trim()) { setError('Please provide a reason for this update'); return; }
    setLoading(true); setError('');
    try {
      await onSave(user.id, form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    }
    setLoading(false);
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: `1.5px solid ${c.border}`, borderRadius: '10px', background: c.inputBg, color: c.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { color: c.textSecondary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: c.card, borderRadius: '16px', width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '17px', fontWeight: 'bold', margin: 0 }}>Edit User Account</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0 }}>{user.full_name} — {user.email}</p>
          </div>
          <button style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <X size={16} color="#fff" />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Section: Basic Info */}
          <p style={{ color: c.textSecondary, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px 0', borderBottom: `1px solid ${c.border}`, paddingBottom: '6px' }}>Basic Information</p>

          <div>
            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Full name" />
          </div>

          <div>
            <label style={labelStyle}>Phone Number</label>
            <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone number" />
          </div>

          {/* Section: KYC Info */}
          <p style={{ color: c.textSecondary, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '8px 0 4px 0', borderBottom: `1px solid ${c.border}`, paddingBottom: '6px' }}>KYC Information</p>

          <div>
            <label style={labelStyle}>Date of Birth</label>
            <input style={inputStyle} value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} placeholder="e.g. 01-01-1995" />
          </div>

          <div>
            <label style={labelStyle}>CNIC Number</label>
            <input style={inputStyle} value={form.cnic_number} onChange={e => setForm(f => ({ ...f, cnic_number: e.target.value }))} placeholder="e.g. 12345-1234567-1" />
          </div>

          <div>
            <label style={labelStyle}>Name on Card</label>
            <input style={inputStyle} value={form.full_name_on_card} onChange={e => setForm(f => ({ ...f, full_name_on_card: e.target.value }))} placeholder="Name as on CNIC" />
          </div>

          {/* Reason */}
          <p style={{ color: c.textSecondary, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '8px 0 4px 0', borderBottom: `1px solid ${c.border}`, paddingBottom: '6px' }}>Reason for Update</p>

          <div>
            <label style={labelStyle}>Reason (required — sent to user in email)</label>
            <textarea
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="Explain why this update is being made"
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={14} color="#DC2626" />
              <span style={{ color: '#DC2626', fontSize: '12px' }}>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button style={{ flex: 1, padding: '12px', background: 'transparent', color: c.textSecondary, border: `1.5px solid ${c.border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }} onClick={onClose}>
              Cancel
            </button>
            <button
              style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}
              onClick={handleSave} disabled={loading}
            >
              {loading ? 'Saving...' : 'Save and Notify User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { logout }       = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const c = isDark ? ADMIN_COLORS.dark : ADMIN_COLORS.light;

  const [stats,        setStats]        = useState(null);
  const [users,        setUsers]        = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pendingKyc,   setPendingKyc]   = useState([]);
  const [logs,         setLogs]         = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [activeTab,    setActiveTab]    = useState('dashboard');
  const [loading,      setLoading]      = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [toast,        setToast]        = useState(null);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [chartView,    setChartView]    = useState('week');

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({ show: false, user: null, reason: '' });

  // Edit modal
  const [editModal, setEditModal] = useState({ show: false, user: null });

  useEffect(() => { loadDashboard(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, txRes, kycRes, logsRes, reqRes] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/users'),
        api.get('/api/admin/transactions'),
        api.get('/api/admin/kyc/pending'),
        api.get('/api/admin/logs'),
        api.get('/api/admin/change-requests'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setTransactions(txRes.data.transactions || []);
      setPendingKyc(kycRes.data.kyc_list || []);
      setLogs(logsRes.data.logs || []);
      setChangeRequests(reqRes.data.requests || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const blockUser = async (userId, isBlocked) => {
    try {
      await api.post('/api/admin/block-user', { user_id: userId, block: !isBlocked });
      showToast(isBlocked ? 'User unblocked' : 'User blocked');
      loadDashboard();
    } catch (err) { showToast('Action failed', 'error'); }
  };

  const deleteUser = async () => {
    if (!deleteDialog.user) return;
    try {
      await api.post('/api/admin/delete-user', {
        user_id: deleteDialog.user.id,
        reason:  deleteDialog.reason || 'Policy violation'
      });
      showToast(`${deleteDialog.user.full_name} deleted successfully`);
      setDeleteDialog({ show: false, user: null, reason: '' });
      loadDashboard();
    } catch (err) {
      showToast(err.response?.data?.error || 'Deletion failed', 'error');
    }
  };

  const updateUser = async (userId, form) => {
    const res = await api.post('/api/admin/update-user', {
      user_id:           userId,
      full_name:         form.full_name,
      phone:             form.phone,
      date_of_birth:     form.date_of_birth,
      cnic_number:       form.cnic_number,
      full_name_on_card: form.full_name_on_card,
      reason:            form.reason,
    });
    showToast('User updated and notified via email');
    loadDashboard();
    return res;
  };

  const approveKyc = async (kycId) => {
    try {
      await api.post('/api/admin/kyc/approve', { kyc_id: kycId });
      showToast('KYC approved — email sent to user');
      loadDashboard();
    } catch (err) { showToast('Approval failed', 'error'); }
  };

  const rejectKyc = async (kycId) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.post('/api/admin/kyc/reject', { kyc_id: kycId, reason });
      showToast('KYC rejected — email sent to user');
      loadDashboard();
    } catch (err) { showToast('Rejection failed', 'error'); }
  };

  const approveChangeRequest = async (requestId) => {
    try {
      await api.post('/api/admin/change-requests/approve', { request_id: requestId });
      showToast('Change request approved and applied');
      loadDashboard();
    } catch (err) { showToast('Failed to approve', 'error'); }
  };

  const rejectChangeRequest = async (requestId) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.post('/api/admin/change-requests/reject', { request_id: requestId, reason });
      showToast('Change request rejected');
      loadDashboard();
    } catch (err) { showToast('Failed to reject', 'error'); }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.includes(searchQuery)
  );

  const filteredTx = transactions.filter(tx =>
    tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.from_wallet?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.to_wallet?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = logs.filter(l =>
    l.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { id: 'dashboard',       icon: LayoutDashboard, label: 'Overview' },
    { id: 'analytics',       icon: BarChart2,        label: 'Analytics' },
    { id: 'users',           icon: Users,            label: 'Users',          count: users.length },
    { id: 'kyc',             icon: FileCheck,        label: 'KYC Review',     badge: pendingKyc.length },
    { id: 'transactions',    icon: ArrowLeftRight,   label: 'Transactions',   count: transactions.length },
    { id: 'change-requests', icon: ClipboardList,    label: 'Change Requests', badge: changeRequests.filter(r => r.status === 'pending').length },
    { id: 'logs',            icon: ActivityIcon,     label: 'Activity Logs',  count: logs.length },
    { id: 'security',        icon: Shield,           label: 'Security' },
    { id: 'settings',        icon: Settings,         label: 'Settings' },
  ];

  const metricCards = [
    { label: 'Total Volume',    value: `PKR ${((stats?.total_volume || 0) / 1000).toFixed(1)}K`, sub: 'All time',        up: true,  icon: <DollarSign size={18} color="#fff" />, grad: 'linear-gradient(135deg, #1A73E8, #0052CC)', shadow: 'rgba(26,115,232,0.25)' },
    { label: 'Transactions',    value: stats?.total_transactions || 0,                            sub: 'Total records',  up: true,  icon: <Activity size={18} color="#fff" />,    grad: 'linear-gradient(135deg, #16A34A, #15803D)', shadow: 'rgba(22,163,74,0.25)' },
    { label: 'Total Users',     value: stats?.total_users || 0,                                   sub: 'Registered',     up: true,  icon: <Users size={18} color="#fff" />,        grad: 'linear-gradient(135deg, #EA580C, #C2410C)', shadow: 'rgba(234,88,12,0.25)' },
    { label: 'Pending KYC',     value: stats?.pending_kyc || 0,                                   sub: 'Requires review',up: false, icon: <UserCheck size={18} color="#fff" />,    grad: 'linear-gradient(135deg, #7C3AED, #5B21B6)', shadow: 'rgba(124,58,237,0.25)' },
  ];

  const pieData = [
    { name: 'Transfers', value: 60, color: '#1A73E8' },
    { name: 'Bills',     value: 25, color: '#16A34A' },
    { name: 'Deposits',  value: 15, color: '#EA580C' },
  ];

  const txTypeData = [
    { name: 'Transfer', value: transactions.filter(t => t.type === 'transfer').length, color: '#1A73E8' },
    { name: 'Deposit',  value: transactions.filter(t => t.type === 'deposit').length,  color: '#16A34A' },
    { name: 'Bill',     value: transactions.filter(t => ['electricity','gas','internet','topup'].includes(t.type)).length, color: '#EA580C' },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '44px', height: '44px', border: `3px solid ${c.border}`, borderTop: '3px solid #1A73E8', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: c.textSecondary, fontSize: '14px' }}>Loading Admin Portal...</p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: '10px', padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <p style={{ color: c.textSecondary, fontSize: '11px', margin: '0 0 6px 0', fontWeight: '600' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: '13px', fontWeight: '700', margin: '2px 0' }}>
            {p.name}: PKR {p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  const Sidebar = () => (
    <div style={{ width: sidebarOpen ? '240px' : '64px', background: c.sidebar, minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '16px 0', transition: 'width 0.25s ease', position: 'sticky', top: 0, flexShrink: 0, zIndex: 100, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: sidebarOpen ? '0 16px 20px' : '0 14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', fontWeight: 'bold', flexShrink: 0 }}>P</div>
        {sidebarOpen && (
          <div>
            <p style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: 0, lineHeight: 1 }}>PayEase</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin Portal</p>
          </div>
        )}
      </div>

      {sidebarOpen && (
        <div style={{ margin: '0 12px 12px', background: 'rgba(26,115,232,0.15)', border: '1px solid rgba(26,115,232,0.3)', borderRadius: '8px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={11} color="#1A73E8" />
          <span style={{ color: '#1A73E8', fontSize: '11px', fontWeight: '600' }}>Super Admin</span>
          <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#3FB950' }} />
        </div>
      )}

      <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: sidebarOpen ? '10px 12px' : '10px 0', paddingLeft: sidebarOpen ? '12px' : '14px', borderRadius: '10px', cursor: 'pointer', background: isActive ? 'rgba(26,115,232,0.2)' : 'transparent', transition: 'all 0.15s', position: 'relative' }}
              onClick={() => setActiveTab(item.id)}
            >
              {isActive && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '20px', borderRadius: '0 3px 3px 0', background: '#1A73E8' }} />}
              <Icon size={17} color={isActive ? '#1A73E8' : 'rgba(255,255,255,0.45)'} />
              {sidebarOpen && (
                <>
                  <span style={{ fontSize: '13px', color: isActive ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: isActive ? '600' : '400', flex: 1 }}>{item.label}</span>
                  {item.badge > 0 && <div style={{ background: '#DC2626', color: '#fff', fontSize: '10px', fontWeight: 'bold', minWidth: '18px', height: '18px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{item.badge}</div>}
                  {item.count > 0 && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>{item.count}</span>}
                </>
              )}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: '12px 8px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: sidebarOpen ? '10px 12px' : '10px 14px', borderRadius: '10px', cursor: 'pointer' }} onClick={logout}>
          <LogOut size={17} color="rgba(248,81,73,0.7)" />
          {sidebarOpen && <span style={{ color: 'rgba(248,81,73,0.8)', fontSize: '13px', fontWeight: '500' }}>Sign Out</span>}
        </div>
      </div>
    </div>
  );

  const TopBar = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', background: c.topBar, borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: c.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${c.border}` }} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={16} color={c.textSecondary} />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: c.text, margin: 0 }}>
            {navItems.find(n => n.id === activeTab)?.label || 'Overview'}
          </h1>
          <p style={{ color: c.textSecondary, fontSize: '12px', margin: 0 }}>
            {new Date().toLocaleDateString('en-PK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: c.cardAlt, border: `1px solid ${c.border}`, borderRadius: '10px', padding: '0 12px', gap: '8px' }}>
          <Search size={14} color={c.textSecondary} />
          <input
            style={{ padding: '8px 0', border: 'none', background: 'transparent', color: c.text, fontSize: '13px', outline: 'none', width: '180px' }}
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && <div onClick={() => setSearchQuery('')} style={{ cursor: 'pointer' }}><X size={13} color={c.textSecondary} /></div>}
        </div>
        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: c.cardAlt, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={toggleTheme}>
          {isDark ? <Sun size={16} color="#CA8A04" /> : <Moon size={16} color="#1A73E8" />}
        </div>
        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: c.cardAlt, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={loadDashboard}>
          <RefreshCw size={15} color={c.textSecondary} />
        </div>
        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: c.cardAlt, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }} onClick={() => setActiveTab('kyc')}>
          <Bell size={15} color={c.textSecondary} />
          {(pendingKyc.length + changeRequests.filter(r => r.status === 'pending').length) > 0 && (
            <div style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626', border: `2px solid ${c.topBar}` }} />
          )}
        </div>
      </div>
    </div>
  );

  const MetricCard = ({ card }) => (
    <div style={{ background: card.grad, borderRadius: '16px', padding: '20px', boxShadow: `0 8px 24px ${card.shadow}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '3px 8px' }}>
          {card.up ? <TrendingUp size={11} color="#fff" /> : <AlertTriangle size={11} color="#fff" />}
          <span style={{ color: '#fff', fontSize: '10px', fontWeight: '600' }}>{card.sub}</span>
        </div>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{card.label}</p>
      <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', margin: 0, lineHeight: 1.1 }}>{card.value}</h2>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: c.bg, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? '#DC2626' : '#16A34A', color: '#fff', padding: '12px 20px', borderRadius: '12px', zIndex: 99999, fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
          <CheckCircle size={15} color="#fff" /> {toast.msg}
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        show={deleteDialog.show}
        title="Delete User Account"
        message="This action is permanent and cannot be undone."
        onConfirm={deleteUser}
        onCancel={() => setDeleteDialog({ show: false, user: null, reason: '' })}
        confirmText="Delete Permanently"
        confirmColor="#DC2626"
        c={c}
      >
        <p style={{ color: c.textSecondary, fontSize: '13px', margin: '0 0 12px 0', lineHeight: '1.6', textAlign: 'center' }}>
          You are about to permanently delete <strong style={{ color: c.text }}>{deleteDialog.user?.full_name}</strong>. Their wallet, transactions, and KYC data will be removed. A confirmation email will be sent to them.
        </p>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ color: c.textSecondary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Deletion Reason</label>
          <input
            style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${c.border}`, borderRadius: '10px', background: c.inputBg, color: c.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            placeholder="e.g. Terms of service violation"
            value={deleteDialog.reason}
            onChange={e => setDeleteDialog(d => ({ ...d, reason: e.target.value }))}
          />
        </div>
      </ConfirmDialog>

      {/* Edit User Modal */}
      <EditUserModal
        show={editModal.show}
        user={editModal.user}
        onClose={() => setEditModal({ show: false, user: null })}
        onSave={updateUser}
        c={c}
      />

      <Sidebar />

      <div style={{ flex: 1, overflow: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar />

        <div style={{ padding: '20px 24px', flex: 1 }}>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
                {metricCards.map((card, i) => <MetricCard key={i} card={card} />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
                {[
                  { label: 'Verified Users',     value: users.filter(u => u.kyc_verified).length,  icon: <ShieldCheck size={16} color="#16A34A" /> },
                  { label: 'Blocked Users',      value: users.filter(u => u.is_blocked).length,    icon: <Lock size={16} color="#DC2626" /> },
                  { label: 'Pending Requests',   value: changeRequests.filter(r => r.status === 'pending').length, icon: <ClipboardList size={16} color="#7C3AED" /> },
                ].map((stat, i) => (
                  <div key={i} style={{ background: c.card, borderRadius: '14px', padding: '16px', border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: c.cardAlt, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{stat.icon}</div>
                    <div>
                      <p style={{ color: c.textSecondary, fontSize: '11px', margin: '0 0 2px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{stat.label}</p>
                      <p style={{ color: c.text, fontSize: '22px', fontWeight: 'bold', margin: 0 }}>{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '14px', marginBottom: '20px' }}>
                <div style={{ background: c.card, borderRadius: '16px', padding: '20px', border: `1px solid ${c.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.text, margin: '0 0 2px 0' }}>Transaction Volume</h3>
                      <p style={{ color: c.textSecondary, fontSize: '12px', margin: 0 }}>Daily PKR volume</p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['week', 'month'].map(v => (
                        <button key={v} style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', background: chartView === v ? '#1A73E8' : c.cardAlt, color: chartView === v ? '#fff' : c.textSecondary, transition: 'all 0.2s' }} onClick={() => setChartView(v)}>
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartView === 'week' ? weekData : monthData}>
                      <defs>
                        <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#1A73E8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
                      <XAxis dataKey={chartView === 'week' ? 'day' : 'month'} tick={{ fontSize: 11, fill: c.textSecondary }} />
                      <YAxis tick={{ fontSize: 10, fill: c.textSecondary }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="volume" stroke="#1A73E8" fill="url(#vg)" strokeWidth={2} name="Volume" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: c.card, borderRadius: '16px', padding: '20px', border: `1px solid ${c.border}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.text, margin: '0 0 4px 0' }}>Revenue Mix</h3>
                  <p style={{ color: c.textSecondary, fontSize: '12px', margin: '0 0 14px 0' }}>By transaction type</p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <PieChart width={160} height={160}>
                      <Pie data={pieData} cx={75} cy={75} innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {pieData.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color, flexShrink: 0 }} />
                        <span style={{ color: c.textSecondary, fontSize: '12px', flex: 1 }}>{item.name}</span>
                        <span style={{ color: c.text, fontSize: '12px', fontWeight: '700' }}>{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ background: c.card, borderRadius: '16px', border: `1px solid ${c.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${c.border}` }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.text, margin: 0 }}>Recent Transactions</h3>
                    <p style={{ color: c.textSecondary, fontSize: '12px', margin: 0 }}>Latest activity</p>
                  </div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#1A73E8', fontSize: '13px', fontWeight: '600' }} onClick={() => setActiveTab('transactions')}>
                    View all <ChevronRight size={14} color="#1A73E8" />
                  </button>
                </div>
                <div style={{ overflow: 'auto' }}>
                  <TxTable transactions={transactions.slice(0, 6)} c={c} />
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === 'analytics' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ background: c.card, borderRadius: '16px', padding: '20px', border: `1px solid ${c.border}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.text, margin: '0 0 4px 0' }}>Weekly Revenue</h3>
                  <p style={{ color: c.textSecondary, fontSize: '12px', margin: '0 0 16px 0' }}>PKR revenue per day</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={weekData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: c.textSecondary }} />
                      <YAxis tick={{ fontSize: 10, fill: c.textSecondary }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" fill="#1A73E8" radius={[6, 6, 0, 0]} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: c.card, borderRadius: '16px', padding: '20px', border: `1px solid ${c.border}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.text, margin: '0 0 4px 0' }}>Monthly Growth</h3>
                  <p style={{ color: c.textSecondary, fontSize: '12px', margin: '0 0 16px 0' }}>Volume trend over 6 months</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={monthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: c.textSecondary }} />
                      <YAxis tick={{ fontSize: 10, fill: c.textSecondary }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="volume" stroke="#16A34A" strokeWidth={2.5} dot={{ fill: '#16A34A', r: 4 }} name="Volume" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ background: c.card, borderRadius: '16px', padding: '20px', border: `1px solid ${c.border}`, marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.text, margin: '0 0 16px 0' }}>Transaction Type Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {txTypeData.map((item, i) => (
                    <div key={i} style={{ background: c.cardAlt, borderRadius: '14px', padding: '16px', border: `1px solid ${c.border}`, textAlign: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                        <CreditCard size={20} color={item.color} />
                      </div>
                      <p style={{ color: c.textSecondary, fontSize: '12px', margin: '0 0 4px 0', fontWeight: '600' }}>{item.name}</p>
                      <p style={{ color: c.text, fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: c.card, borderRadius: '16px', padding: '20px', border: `1px solid ${c.border}` }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.text, margin: '0 0 16px 0' }}>Top Users by Balance</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[...users].sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 5).map((u, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: c.cardAlt, borderRadius: '12px', border: `1px solid ${c.border}` }}>
                      <span style={{ color: c.textSecondary, fontSize: '13px', fontWeight: '700', width: '20px' }}>#{i + 1}</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 'bold', flexShrink: 0 }}>
                        {u.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: c.text, fontSize: '13px', fontWeight: '600', margin: 0 }}>{u.full_name}</p>
                        <p style={{ color: c.textSecondary, fontSize: '11px', margin: 0 }}>{u.email}</p>
                      </div>
                      <span style={{ color: '#1A73E8', fontSize: '14px', fontWeight: '700' }}>PKR {(u.balance || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── USERS TAB ── */}
          {activeTab === 'users' && (
            <div style={{ background: c.card, borderRadius: '16px', border: `1px solid ${c.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${c.border}` }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.text, margin: 0 }}>All Users</h3>
                  <p style={{ color: c.textSecondary, fontSize: '12px', margin: 0 }}>{filteredUsers.length} of {users.length} users</p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ background: 'rgba(22,163,74,0.1)', color: '#16A34A', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' }}>{users.filter(u => u.kyc_verified).length} Verified</span>
                  <span style={{ background: 'rgba(220,38,38,0.1)', color: '#DC2626', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' }}>{users.filter(u => u.is_blocked).length} Blocked</span>
                </div>
              </div>
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: c.cardAlt }}>
                      {['User', 'Contact', 'Balance', 'KYC', 'Status', 'Joined', 'Actions'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: '600', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${c.border}` }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold', flexShrink: 0 }}>
                              {u.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ color: c.text, fontSize: '13px', fontWeight: '600', margin: 0 }}>{u.full_name}</p>
                              {u.is_admin && <span style={{ color: '#1A73E8', fontSize: '10px', fontWeight: '600', background: 'rgba(26,115,232,0.1)', padding: '1px 6px', borderRadius: '4px' }}>Admin</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <p style={{ color: c.text, fontSize: '12px', margin: '0 0 2px 0' }}>{u.email}</p>
                          <p style={{ color: c.textSecondary, fontSize: '11px', margin: 0 }}>{u.phone}</p>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ color: '#1A73E8', fontSize: '13px', fontWeight: '700' }}>PKR {(u.balance || 0).toLocaleString()}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: u.kyc_verified ? 'rgba(22,163,74,0.1)' : 'rgba(202,138,4,0.1)', color: u.kyc_verified ? '#16A34A' : '#CA8A04' }}>
                            {u.kyc_verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: u.is_blocked ? 'rgba(220,38,38,0.1)' : 'rgba(22,163,74,0.1)', color: u.is_blocked ? '#DC2626' : '#16A34A' }}>
                            {u.is_blocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: c.textSecondary, fontSize: '12px' }}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {!u.is_admin ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {/* Edit */}
                              <button
                                style={{ padding: '5px 10px', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: 'rgba(124,58,237,0.1)', color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => setEditModal({ show: true, user: u })}
                              >
                                <Edit2 size={12} color="#7C3AED" /> Edit
                              </button>
                              {/* Block/Unblock */}
                              <button
                                style={{ padding: '5px 10px', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: u.is_blocked ? 'rgba(22,163,74,0.1)' : 'rgba(202,138,4,0.1)', color: u.is_blocked ? '#16A34A' : '#CA8A04' }}
                                onClick={() => blockUser(u.id, u.is_blocked)}
                              >
                                {u.is_blocked ? 'Unblock' : 'Block'}
                              </button>
                              {/* Delete */}
                              <button
                                style={{ padding: '5px 10px', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: 'rgba(220,38,38,0.1)', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => setDeleteDialog({ show: true, user: u, reason: '' })}
                              >
                                <Trash2 size={12} color="#DC2626" /> Delete
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: c.textSecondary, fontSize: '12px' }}>Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── KYC TAB ── */}
          {activeTab === 'kyc' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Pending Review', value: pendingKyc.length, color: '#CA8A04', bg: 'rgba(202,138,4,0.1)', border: 'rgba(202,138,4,0.2)', icon: <Clock size={18} color="#CA8A04" /> },
                  { label: 'Verified Users', value: users.filter(u => u.kyc_verified).length, color: '#16A34A', bg: 'rgba(22,163,74,0.1)', border: 'rgba(22,163,74,0.2)', icon: <CheckCircle size={18} color="#16A34A" /> },
                  { label: 'Total Users', value: users.length, color: '#1A73E8', bg: 'rgba(26,115,232,0.1)', border: 'rgba(26,115,232,0.2)', icon: <FileCheck size={18} color="#1A73E8" /> },
                ].map((stat, i) => (
                  <div key={i} style={{ background: c.card, borderRadius: '14px', padding: '16px', border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: stat.bg, border: `1px solid ${stat.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{stat.icon}</div>
                    <div>
                      <p style={{ color: c.textSecondary, fontSize: '11px', margin: '0 0 2px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{stat.label}</p>
                      <p style={{ color: stat.color, fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {pendingKyc.length === 0 ? (
                <div style={{ background: c.card, borderRadius: '16px', padding: '60px 20px', textAlign: 'center', border: `1px solid ${c.border}` }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle size={32} color="#16A34A" />
                  </div>
                  <h3 style={{ color: c.text, margin: '0 0 6px 0' }}>All Caught Up</h3>
                  <p style={{ color: c.textSecondary, margin: 0, fontSize: '14px' }}>No pending KYC applications to review</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '16px' }}>
                  {pendingKyc.map((kyc, i) => (
                    <div key={i} style={{ background: c.card, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${c.border}` }}>
                      <div style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                            {kyc.user?.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ color: '#fff', fontSize: '15px', fontWeight: '700', margin: 0 }}>{kyc.user?.full_name}</p>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0 }}>{kyc.user?.email}</p>
                          </div>
                        </div>
                        <span style={{ background: 'rgba(255,179,0,0.2)', color: '#FFD700', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255,215,0,0.3)' }}>
                          Pending Review
                        </span>
                      </div>
                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ background: c.cardAlt, borderRadius: '12px', padding: '12px', marginBottom: '14px', border: `1px solid ${c.border}` }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {[
                              { label: 'ID Number',       value: kyc.cnic_number },
                              { label: 'Phone',           value: kyc.user?.phone },
                              { label: 'Date of Birth',   value: kyc.date_of_birth || 'N/A' },
                              { label: 'Name on Card',    value: kyc.full_name_on_card || 'N/A' },
                            ].map((row, ri) => (
                              <div key={ri}>
                                <p style={{ color: c.textSecondary, fontSize: '10px', fontWeight: '600', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{row.label}</p>
                                <p style={{ color: c.text, fontSize: '12px', fontWeight: '600', margin: 0 }}>{row.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <p style={{ color: c.textSecondary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px 0' }}>Documents — Click to enlarge</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                          {[
                            { label: 'ID Front', path: kyc.cnic_front },
                            { label: 'ID Back',  path: kyc.cnic_back },
                            { label: 'Selfie',   path: kyc.selfie },
                          ].map((doc, di) => (
                            <div key={di} style={{ borderRadius: '10px', overflow: 'hidden', background: c.cardAlt, border: `1px solid ${c.border}` }}>
                              <p style={{ color: c.textSecondary, fontSize: '9px', fontWeight: '700', textAlign: 'center', padding: '4px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{doc.label}</p>
                              {doc.path ? (
                                <div style={{ position: 'relative', height: '80px', cursor: 'pointer', overflow: 'hidden' }} onClick={() => setSelectedImage(doc.path)}>
                                  <img src={doc.path} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={doc.label} />
                                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,115,232,0.5)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                                    <Eye size={16} color="#fff" />
                                  </div>
                                </div>
                              ) : (
                                <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.textSecondary, fontSize: '11px' }}>No image</div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg, #16A34A, #15803D)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            onClick={() => approveKyc(kyc.id)}
                          >
                            <CheckCircle size={15} color="#fff" /> Approve
                          </button>
                          <button
                            style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg, #DC2626, #B91C1C)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            onClick={() => rejectKyc(kyc.id)}
                          >
                            <XCircle size={15} color="#fff" /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TRANSACTIONS TAB ── */}
          {activeTab === 'transactions' && (
            <div style={{ background: c.card, borderRadius: '16px', border: `1px solid ${c.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${c.border}` }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.text, margin: 0 }}>All Transactions</h3>
                  <p style={{ color: c.textSecondary, fontSize: '12px', margin: 0 }}>{filteredTx.length} records</p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['transfer', 'deposit', 'bill'].map(type => (
                    <span key={type} style={{ background: c.cardAlt, color: c.textSecondary, fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${c.border}` }}>
                      {transactions.filter(t => t.type === type || (type === 'bill' && ['electricity','gas','internet','topup'].includes(t.type))).length} {type}s
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ overflow: 'auto' }}>
                <TxTable transactions={filteredTx} c={c} showAll />
              </div>
            </div>
          )}

          {/* ── CHANGE REQUESTS TAB ── */}
          {activeTab === 'change-requests' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Pending',  value: changeRequests.filter(r => r.status === 'pending').length,  color: '#CA8A04', bg: 'rgba(202,138,4,0.1)' },
                  { label: 'Approved', value: changeRequests.filter(r => r.status === 'approved').length, color: '#16A34A', bg: 'rgba(22,163,74,0.1)' },
                  { label: 'Rejected', value: changeRequests.filter(r => r.status === 'rejected').length, color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
                ].map((stat, i) => (
                  <div key={i} style={{ background: c.card, borderRadius: '14px', padding: '16px', border: `1px solid ${c.border}`, textAlign: 'center' }}>
                    <p style={{ color: c.textSecondary, fontSize: '11px', margin: '0 0 4px 0', fontWeight: '600', textTransform: 'uppercase' }}>{stat.label}</p>
                    <p style={{ color: stat.color, fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {changeRequests.length === 0 ? (
                <div style={{ background: c.card, borderRadius: '16px', padding: '60px 20px', textAlign: 'center', border: `1px solid ${c.border}` }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: c.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <ClipboardList size={28} color={c.textSecondary} />
                  </div>
                  <h3 style={{ color: c.text, margin: '0 0 6px 0' }}>No Change Requests</h3>
                  <p style={{ color: c.textSecondary, margin: 0, fontSize: '14px' }}>Users have not submitted any requests yet</p>
                </div>
              ) : (
                <div style={{ background: c.card, borderRadius: '16px', border: `1px solid ${c.border}` }}>
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}` }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.text, margin: 0 }}>All Change Requests</h3>
                    <p style={{ color: c.textSecondary, fontSize: '12px', margin: 0 }}>Users requesting admin-only field changes</p>
                  </div>
                  <div style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: c.cardAlt }}>
                          {['User', 'Field', 'Requested Value', 'Reason', 'Submitted', 'Status', 'Actions'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: '600', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {changeRequests.map((req, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${c.border}` }}>
                            <td style={{ padding: '12px 16px' }}>
                              <p style={{ color: c.text, fontSize: '13px', fontWeight: '600', margin: 0 }}>{req.user_name}</p>
                              <p style={{ color: c.textSecondary, fontSize: '11px', margin: 0 }}>{req.user_email}</p>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px' }}>
                                {req.field?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', color: c.text, fontSize: '13px', fontWeight: '600' }}>{req.new_value}</td>
                            <td style={{ padding: '12px 16px', color: c.textSecondary, fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.reason}</td>
                            <td style={{ padding: '12px 16px', color: c.textSecondary, fontSize: '12px', whiteSpace: 'nowrap' }}>{req.submitted_at}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: req.status === 'pending' ? 'rgba(202,138,4,0.1)' : req.status === 'approved' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', color: req.status === 'pending' ? '#CA8A04' : req.status === 'approved' ? '#16A34A' : '#DC2626' }}>
                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {req.status === 'pending' ? (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    style={{ padding: '5px 10px', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: 'rgba(22,163,74,0.1)', color: '#16A34A' }}
                                    onClick={() => approveChangeRequest(req.id)}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    style={{ padding: '5px 10px', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: 'rgba(220,38,38,0.1)', color: '#DC2626' }}
                                    onClick={() => rejectChangeRequest(req.id)}
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ color: c.textSecondary, fontSize: '12px' }}>{req.processed_at || 'Processed'}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ACTIVITY LOGS TAB ── */}
          {activeTab === 'logs' && (
            <div style={{ background: c.card, borderRadius: '16px', border: `1px solid ${c.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${c.border}` }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.text, margin: 0 }}>Activity Logs</h3>
                  <p style={{ color: c.textSecondary, fontSize: '12px', margin: 0 }}>{filteredLogs.length} entries — most recent first</p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ background: c.cardAlt, color: c.textSecondary, fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${c.border}` }}>
                    Last {Math.min(logs.length, 500)} records
                  </span>
                </div>
              </div>
              {filteredLogs.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: c.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <ActivityIcon size={28} color={c.textSecondary} />
                  </div>
                  <p style={{ color: c.text, fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' }}>No logs yet</p>
                  <p style={{ color: c.textSecondary, fontSize: '13px', margin: 0 }}>Activity will appear here as users interact with the platform</p>
                </div>
              ) : (
                <div style={{ overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: c.cardAlt }}>
                        {['User', 'Action', 'Detail', 'IP Address', 'Timestamp'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: '600', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log, i) => {
                        const isAdmin   = log.action.includes('Deleted') || log.action.includes('Updated') || log.action.includes('Approved') || log.action.includes('Rejected');
                        const isSecurity = log.action.includes('blocked') || log.action.includes('login') || log.action.includes('Alert');
                        const color = isAdmin ? '#7C3AED' : isSecurity ? '#DC2626' : '#1A73E8';
                        const bg    = isAdmin ? 'rgba(124,58,237,0.08)' : isSecurity ? 'rgba(220,38,38,0.08)' : 'rgba(26,115,232,0.08)';
                        return (
                          <tr key={i} style={{ borderBottom: `1px solid ${c.border}` }}>
                            <td style={{ padding: '11px 16px' }}>
                              <p style={{ color: c.text, fontSize: '13px', fontWeight: '600', margin: 0 }}>{log.user_name}</p>
                              <p style={{ color: c.textSecondary, fontSize: '11px', margin: 0 }}>{log.user_email}</p>
                            </td>
                            <td style={{ padding: '11px 16px' }}>
                              <span style={{ background: bg, color, fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                                {log.action}
                              </span>
                            </td>
                            <td style={{ padding: '11px 16px', color: c.textSecondary, fontSize: '12px', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {log.detail}
                            </td>
                            <td style={{ padding: '11px 16px', color: c.textSecondary, fontSize: '12px', fontFamily: 'monospace' }}>
                              {log.ip}
                            </td>
                            <td style={{ padding: '11px 16px', color: c.textSecondary, fontSize: '12px', whiteSpace: 'nowrap' }}>
                              {log.timestamp}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === 'security' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {[
                  { title: 'Fraud Detection',      desc: 'Large transfers (PKR 25,000+) trigger alerts and emails', icon: <AlertCircle size={20} color="#DC2626" />, bg: 'rgba(220,38,38,0.1)', status: 'Active' },
                  { title: 'KYC Enforcement',       desc: 'KYC verification required before any money transfer', icon: <ShieldCheck size={20} color="#16A34A" />, bg: 'rgba(22,163,74,0.1)', status: 'Enabled' },
                  { title: 'Transfer Limits',       desc: 'Maximum PKR 50,000 per transaction enforced', icon: <Lock size={20} color="#CA8A04" />, bg: 'rgba(202,138,4,0.1)', status: 'Enforced' },
                  { title: 'Session Timeout',       desc: 'Users are automatically logged out after 30 minutes of inactivity', icon: <Clock size={20} color="#1A73E8" />, bg: 'rgba(26,115,232,0.1)', status: 'Active' },
                  { title: 'New Device Alerts',     desc: 'Email alert sent when a new device or browser logs in', icon: <Globe size={20} color="#7C3AED" />, bg: 'rgba(124,58,237,0.1)', status: 'Active' },
                  { title: 'Rapid Transfer Monitor', desc: '3+ transfers in 5 minutes triggers unusual activity alert', icon: <Zap size={20} color="#EA580C" />, bg: 'rgba(234,88,12,0.1)', status: 'Active' },
                ].map((item, i) => (
                  <div key={i} style={{ background: c.card, borderRadius: '16px', padding: '20px', border: `1px solid ${c.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.icon}
                      </div>
                      <span style={{ background: 'rgba(22,163,74,0.1)', color: '#16A34A', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' }}>
                        {item.status}
                      </span>
                    </div>
                    <h4 style={{ color: c.text, fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0' }}>{item.title}</h4>
                    <p style={{ color: c.textSecondary, fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Blocked Users */}
              <div style={{ background: c.card, borderRadius: '16px', border: `1px solid ${c.border}` }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.text, margin: 0 }}>
                    Blocked Users ({users.filter(u => u.is_blocked).length})
                  </h3>
                </div>
                {users.filter(u => u.is_blocked).length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ color: c.textSecondary, margin: 0 }}>No blocked users at this time</p>
                  </div>
                ) : (
                  users.filter(u => u.is_blocked).map((u, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: `1px solid ${c.border}` }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', fontWeight: 'bold' }}>
                        {u.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: c.text, fontSize: '13px', fontWeight: '600', margin: 0 }}>{u.full_name}</p>
                        <p style={{ color: c.textSecondary, fontSize: '11px', margin: 0 }}>{u.email}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          style={{ padding: '6px 14px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: 'rgba(22,163,74,0.1)', color: '#16A34A' }}
                          onClick={() => blockUser(u.id, true)}
                        >
                          Unblock
                        </button>
                        <button
                          style={{ padding: '6px 14px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: 'rgba(220,38,38,0.1)', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setDeleteDialog({ show: true, user: u, reason: '' })}
                        >
                          <Trash2 size={12} color="#DC2626" /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { title: 'System Status', items: [
                  { label: 'API Server',     status: 'Operational', color: '#16A34A' },
                  { label: 'Database',       status: 'Operational', color: '#16A34A' },
                  { label: 'Email Service',  status: 'Operational', color: '#16A34A' },
                  { label: 'File Storage',   status: 'Operational', color: '#16A34A' },
                ]},
                { title: 'App Configuration', items: [
                  { label: 'Transfer Limit',   status: 'PKR 50,000',  color: '#1A73E8' },
                  { label: 'KYC Required',     status: 'Yes',         color: '#16A34A' },
                  { label: 'OTP Expiry',       status: '10 minutes',  color: '#1A73E8' },
                  { label: 'Session Timeout',  status: '30 minutes',  color: '#CA8A04' },
                ]},
              ].map((section, si) => (
                <div key={si} style={{ background: c.card, borderRadius: '16px', border: `1px solid ${c.border}` }}>
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}` }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.text, margin: 0 }}>{section.title}</h3>
                  </div>
                  <div style={{ padding: '8px 20px' }}>
                    {section.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < section.items.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                        <span style={{ color: c.textSecondary, fontSize: '13px' }}>{item.label}</span>
                        <span style={{ color: item.color, fontSize: '13px', fontWeight: '600', background: `${item.color}15`, padding: '3px 10px', borderRadius: '20px' }}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Image Viewer */}
      {selectedImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer' }} onClick={() => setSelectedImage(null)}>
          <div style={{ background: c.card, borderRadius: '16px', padding: '20px', maxWidth: '640px', width: '90%', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ color: c.text, fontSize: '14px', fontWeight: '600', margin: 0 }}>Document Preview</p>
              <button style={{ width: '30px', height: '30px', borderRadius: '8px', background: c.cardAlt, border: `1px solid ${c.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedImage(null)}>
                <X size={14} color={c.text} />
              </button>
            </div>
            <img src={selectedImage} style={{ width: '100%', borderRadius: '10px', maxHeight: '65vh', objectFit: 'contain' }} alt="Document" />
          </div>
        </div>
      )}
    </div>
  );
}

function TxTable({ transactions, c, showAll }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
      <thead>
        <tr style={{ background: c.cardAlt }}>
          {['From', 'To', 'Amount', 'Type', showAll ? 'Description' : null, 'Date', 'Status'].filter(Boolean).map(h => (
            <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: '600', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${c.border}` }}>
            <td style={{ padding: '11px 16px', fontSize: '12px', color: c.textSecondary, fontFamily: 'monospace' }}>{tx.from_wallet || '—'}</td>
            <td style={{ padding: '11px 16px', fontSize: '12px', color: c.textSecondary, fontFamily: 'monospace' }}>{tx.to_wallet || '—'}</td>
            <td style={{ padding: '11px 16px' }}>
              <span style={{ color: '#1A73E8', fontSize: '13px', fontWeight: '700' }}>PKR {tx.amount?.toLocaleString()}</span>
            </td>
            <td style={{ padding: '11px 16px' }}>
              <span style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: tx.type === 'deposit' ? 'rgba(22,163,74,0.1)' : tx.type === 'transfer' ? 'rgba(26,115,232,0.1)' : 'rgba(234,88,12,0.1)', color: tx.type === 'deposit' ? '#16A34A' : tx.type === 'transfer' ? '#1A73E8' : '#EA580C' }}>
                {tx.type}
              </span>
            </td>
            {showAll && <td style={{ padding: '11px 16px', fontSize: '12px', color: c.textSecondary, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || '—'}</td>}
            <td style={{ padding: '11px 16px', fontSize: '12px', color: c.textSecondary, whiteSpace: 'nowrap' }}>
              {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            </td>
            <td style={{ padding: '11px 16px' }}>
              <span style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: 'rgba(22,163,74,0.1)', color: '#16A34A' }}>
                {tx.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
