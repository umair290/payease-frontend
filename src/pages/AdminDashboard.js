import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  LayoutDashboard, Users, FileCheck, ArrowLeftRight,
  LogOut, Shield, CheckCircle, XCircle, Eye,
  ChevronRight, Bell, DollarSign, Activity,
  UserCheck, Sun, Moon, Menu, X, TrendingUp,
  AlertTriangle, RefreshCw, Search, Zap, Globe,
  Lock, Clock, ArrowUpRight, Settings, BarChart2,
  CreditCard, ShieldCheck, AlertCircle, Trash2,
  Edit2, FileText, CheckSquare, XSquare,
  Activity as ActivityIcon, ClipboardList, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line
} from 'recharts';

// ── Color system ──
const C = {
  dark: {
    bg: '#070C18', sidebar: '#0A0F1E', card: 'rgba(255,255,255,0.03)',
    cardSolid: '#0D1324', cardAlt: 'rgba(255,255,255,0.04)',
    text: '#F0F6FC', textSec: 'rgba(255,255,255,0.45)',
    border: 'rgba(255,255,255,0.06)', topBar: '#0A0F1E',
    inputBg: 'rgba(255,255,255,0.04)',
  },
  light: {
    bg: '#F0F4FF', sidebar: '#0F1629', card: '#FFFFFF',
    cardSolid: '#FFFFFF', cardAlt: '#F8FAFF',
    text: '#0F172A', textSec: '#94A3B8',
    border: 'rgba(0,0,0,0.06)', topBar: '#FFFFFF',
    inputBg: '#F8FAFF',
  }
};

const weekData  = [
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
const ConfirmDialog = ({ show, title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmColor = '#DC2626', c, children }) => {
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: c.cardSolid, borderRadius: '20px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', border: `1px solid ${c.border}` }}>
        <div style={{ background: `linear-gradient(135deg,${confirmColor},${confirmColor}CC)`, padding: '22px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '1px solid rgba(255,255,255,0.25)' }}>
            <AlertTriangle size={26} color="#fff" />
          </div>
          <h3 style={{ color: '#fff', fontSize: '17px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>{title}</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0 }}>{message}</p>
        </div>
        <div style={{ padding: '18px' }}>
          {children}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button style={{ flex: 1, padding: '12px', background: 'transparent', color: c.textSec, border: `1.5px solid ${c.border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }} onClick={onCancel}>Cancel</button>
            <button style={{ flex: 1, padding: '12px', background: `linear-gradient(135deg,${confirmColor},${confirmColor}CC)`, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '800', boxShadow: `0 4px 16px ${confirmColor}40` }} onClick={onConfirm}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Edit User Modal ──
const EditUserModal = ({ show, user, onClose, onSave, c }) => {
  const [form,    setForm]    = useState({ full_name: '', phone: '', date_of_birth: '', cnic_number: '', full_name_on_card: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name || '', phone: user.phone || '', date_of_birth: user.kyc?.date_of_birth || '', cnic_number: user.kyc?.cnic_number || '', full_name_on_card: user.kyc?.full_name_on_card || '', reason: '' });
      setError('');
    }
  }, [user]);

  if (!show || !user) return null;

  const handleSave = async () => {
    if (!form.reason.trim()) { setError('Please provide a reason for this update'); return; }
    setLoading(true); setError('');
    try { await onSave(user.id, form); onClose(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to update user'); }
    setLoading(false);
  };

  const iStyle = { width: '100%', padding: '11px 14px', border: `1.5px solid ${c.border}`, borderRadius: '11px', background: c.inputBg, color: c.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontWeight: '500', fontFamily: '-apple-system, sans-serif' };
  const lStyle = { color: c.textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '5px' };
  const secStyle = { color: c.textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '14px 0 8px 0', paddingBottom: '6px', borderBottom: `1px solid ${c.border}` };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: c.cardSolid, borderRadius: '20px', width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${c.border}` }}>
        <div style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', padding: '20px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />
          <div>
            <h3 style={{ color: '#fff', fontSize: '17px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>Edit User Account</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>{user.full_name} · {user.email}</p>
          </div>
          <button style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <X size={16} color="#fff" />
          </button>
        </div>
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={secStyle}>Basic Information</p>
          <div><label style={lStyle}>Full Name</label><input style={iStyle} value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Full name" /></div>
          <div><label style={lStyle}>Phone Number</label><input style={iStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone number" /></div>
          <p style={secStyle}>KYC Information</p>
          <div><label style={lStyle}>Date of Birth</label><input style={iStyle} value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} placeholder="e.g. 01-01-1995" /></div>
          <div><label style={lStyle}>CNIC Number</label><input style={iStyle} value={form.cnic_number} onChange={e => setForm(f => ({ ...f, cnic_number: e.target.value }))} placeholder="e.g. 12345-1234567-1" /></div>
          <div><label style={lStyle}>Name on Card</label><input style={iStyle} value={form.full_name_on_card} onChange={e => setForm(f => ({ ...f, full_name_on_card: e.target.value }))} placeholder="Name as on CNIC" /></div>
          <p style={secStyle}>Reason for Update</p>
          <div><label style={lStyle}>Reason (required — sent to user)</label>
            <textarea style={{ ...iStyle, minHeight: '80px', resize: 'vertical' }} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Explain why this update is being made" />
          </div>
          {error && <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={13} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '12px' }}>{error}</span></div>}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button style={{ flex: 1, padding: '12px', background: 'transparent', color: c.textSec, border: `1.5px solid ${c.border}`, borderRadius: '11px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }} onClick={onClose}>Cancel</button>
            <button style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', color: '#fff', border: 'none', borderRadius: '11px', fontSize: '13px', cursor: 'pointer', fontWeight: '800', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }} onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save & Notify User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Custom Tooltip ──
const ChartTooltip = ({ active, payload, label, c }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: c.cardSolid, border: `1px solid ${c.border}`, borderRadius: '12px', padding: '10px 14px', boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }}>
      <p style={{ color: c.textSec, fontSize: '10px', margin: '0 0 6px 0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: '12px', fontWeight: '700', margin: '2px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: p.color, display: 'inline-block' }} />
          {p.name}: PKR {p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

// ── TX Table ──
function TxTable({ transactions, c, showAll }) {
  const cols = ['From', 'To', 'Amount', 'Type', showAll ? 'Description' : null, 'Date', 'Status'].filter(Boolean);
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
      <thead>
        <tr style={{ background: c.cardAlt }}>
          {cols.map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '10px', fontWeight: '700', color: c.textSec, textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${c.border}` }}>
            <td style={{ padding: '11px 16px', fontSize: '12px', color: c.textSec, fontFamily: 'monospace' }}>{tx.from_wallet || '—'}</td>
            <td style={{ padding: '11px 16px', fontSize: '12px', color: c.textSec, fontFamily: 'monospace' }}>{tx.to_wallet || '—'}</td>
            <td style={{ padding: '11px 16px' }}><span style={{ color: '#1A73E8', fontSize: '13px', fontWeight: '800' }}>PKR {tx.amount?.toLocaleString()}</span></td>
            <td style={{ padding: '11px 16px' }}>
              <span style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: tx.type === 'deposit' ? 'rgba(22,163,74,0.12)' : tx.type === 'transfer' ? 'rgba(26,115,232,0.12)' : 'rgba(234,88,12,0.12)', color: tx.type === 'deposit' ? '#16A34A' : tx.type === 'transfer' ? '#1A73E8' : '#EA580C' }}>
                {tx.type}
              </span>
            </td>
            {showAll && <td style={{ padding: '11px 16px', fontSize: '12px', color: c.textSec, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || '—'}</td>}
            <td style={{ padding: '11px 16px', fontSize: '11px', color: c.textSec, whiteSpace: 'nowrap' }}>{tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
            <td style={{ padding: '11px 16px' }}><span style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: 'rgba(22,163,74,0.12)', color: '#16A34A' }}>{tx.status}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AdminDashboard() {
  const { logout }           = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const c = isDark ? C.dark : C.light;

  const [stats,          setStats]          = useState(null);
  const [users,          setUsers]          = useState([]);
  const [transactions,   setTransactions]   = useState([]);
  const [pendingKyc,     setPendingKyc]     = useState([]);
  const [logs,           setLogs]           = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [activeTab,      setActiveTab]      = useState('dashboard');
  const [loading,        setLoading]        = useState(true);
  const [selectedImage,  setSelectedImage]  = useState(null);
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [toast,          setToast]          = useState(null);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [chartView,      setChartView]      = useState('week');
  const [deleteDialog,   setDeleteDialog]   = useState({ show: false, user: null, reason: '' });
  const [editModal,      setEditModal]      = useState({ show: false, user: null });

  useEffect(() => { loadDashboard(); }, []);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [sR, uR, tR, kR, lR, rR] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/users'),
        api.get('/api/admin/transactions'),
        api.get('/api/admin/kyc/pending'),
        api.get('/api/admin/logs'),
        api.get('/api/admin/change-requests'),
      ]);
      setStats(sR.data);
      setUsers(uR.data.users || []);
      setTransactions(tR.data.transactions || []);
      setPendingKyc(kR.data.kyc_list || []);
      setLogs(lR.data.logs || []);
      setChangeRequests(rR.data.requests || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const blockUser = async (userId, isBlocked) => {
    try { await api.post('/api/admin/block-user', { user_id: userId, block: !isBlocked }); showToast(isBlocked ? 'User unblocked' : 'User blocked'); loadDashboard(); }
    catch { showToast('Action failed', 'error'); }
  };

  const deleteUser = async () => {
    if (!deleteDialog.user) return;
    try {
      await api.post('/api/admin/delete-user', { user_id: deleteDialog.user.id, reason: deleteDialog.reason || 'Policy violation' });
      showToast(`${deleteDialog.user.full_name} deleted`);
      setDeleteDialog({ show: false, user: null, reason: '' });
      loadDashboard();
    } catch (err) { showToast(err.response?.data?.error || 'Deletion failed', 'error'); }
  };

  const updateUser = async (userId, form) => {
    const res = await api.post('/api/admin/update-user', { user_id: userId, ...form });
    showToast('User updated and notified');
    loadDashboard();
    return res;
  };

  const approveKyc = async (kycId) => {
    try { await api.post('/api/admin/kyc/approve', { kyc_id: kycId }); showToast('KYC approved'); loadDashboard(); }
    catch { showToast('Approval failed', 'error'); }
  };

  const rejectKyc = async (kycId) => {
    const reason = window.prompt('Rejection reason:');
    if (!reason) return;
    try { await api.post('/api/admin/kyc/reject', { kyc_id: kycId, reason }); showToast('KYC rejected'); loadDashboard(); }
    catch { showToast('Rejection failed', 'error'); }
  };

  const approveChangeRequest = async (id) => {
    try { await api.post('/api/admin/change-requests/approve', { request_id: id }); showToast('Request approved'); loadDashboard(); }
    catch { showToast('Failed', 'error'); }
  };

  const rejectChangeRequest = async (id) => {
    const reason = window.prompt('Rejection reason:');
    if (!reason) return;
    try { await api.post('/api/admin/change-requests/reject', { request_id: id, reason }); showToast('Request rejected'); loadDashboard(); }
    catch { showToast('Failed', 'error'); }
  };

  const filteredUsers = users.filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone?.includes(searchQuery));
  const filteredTx    = transactions.filter(tx => tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) || tx.from_wallet?.toLowerCase().includes(searchQuery.toLowerCase()) || tx.to_wallet?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredLogs  = logs.filter(l => l.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) || l.action?.toLowerCase().includes(searchQuery.toLowerCase()) || l.user_email?.toLowerCase().includes(searchQuery.toLowerCase()));

  const navItems = [
    { id: 'dashboard',       icon: LayoutDashboard, label: 'Overview' },
    { id: 'analytics',       icon: BarChart2,        label: 'Analytics' },
    { id: 'users',           icon: Users,            label: 'Users',           count: users.length },
    { id: 'kyc',             icon: FileCheck,        label: 'KYC Review',      badge: pendingKyc.length },
    { id: 'transactions',    icon: ArrowLeftRight,   label: 'Transactions',    count: transactions.length },
    { id: 'change-requests', icon: ClipboardList,    label: 'Change Requests', badge: changeRequests.filter(r => r.status === 'pending').length },
    { id: 'logs',            icon: ActivityIcon,     label: 'Activity Logs',   count: logs.length },
    { id: 'security',        icon: Shield,           label: 'Security' },
    { id: 'settings',        icon: Settings,         label: 'Settings' },
  ];

  const metricCards = [
    { label: 'Total Volume',   value: `PKR ${((stats?.total_volume || 0)/1000).toFixed(1)}K`, sub: 'All time',       icon: <DollarSign size={18} color="#fff" />, grad: 'linear-gradient(135deg,#1A1FEF,#1A73E8)', shadow: 'rgba(26,115,232,0.4)' },
    { label: 'Transactions',   value: stats?.total_transactions || 0,                          sub: 'Total records',  icon: <Activity size={18} color="#fff" />,    grad: 'linear-gradient(135deg,#134E5E,#16A34A)', shadow: 'rgba(22,163,74,0.4)' },
    { label: 'Total Users',    value: stats?.total_users || 0,                                 sub: 'Registered',     icon: <Users size={18} color="#fff" />,        grad: 'linear-gradient(135deg,#EA580C,#C2410C)', shadow: 'rgba(234,88,12,0.4)' },
    { label: 'Pending KYC',    value: stats?.pending_kyc || 0,                                 sub: 'Needs review',   icon: <UserCheck size={18} color="#fff" />,    grad: 'linear-gradient(135deg,#7C3AED,#5B21B6)', shadow: 'rgba(124,58,237,0.4)' },
  ];

  const pieData   = [{ name: 'Transfers', value: 60, color: '#1A73E8' }, { name: 'Bills', value: 25, color: '#16A34A' }, { name: 'Deposits', value: 15, color: '#EA580C' }];
  const txTypeData = [
    { name: 'Transfer', value: transactions.filter(t => t.type === 'transfer').length, color: '#1A73E8' },
    { name: 'Deposit',  value: transactions.filter(t => t.type === 'deposit').length,  color: '#16A34A' },
    { name: 'Bill',     value: transactions.filter(t => ['electricity','gas','internet','topup'].includes(t.type)).length, color: '#EA580C' },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg, flexDirection: 'column', gap: '20px', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(26,115,232,0.4)', animation: 'pulse 1.5s ease-in-out infinite' }}>
        <Shield size={28} color="#fff" />
      </div>
      <p style={{ color: c.textSec, fontSize: '14px', fontWeight: '600' }}>Loading Admin Portal...</p>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>
    </div>
  );

  // ── SIDEBAR ──
  const Sidebar = () => (
    <div style={{ width: sidebarOpen ? '240px' : '64px', background: c.sidebar, minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0', transition: 'width 0.25s ease', position: 'sticky', top: 0, flexShrink: 0, zIndex: 100, overflow: 'hidden', borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}` }}>

      {/* Logo area */}
      <div style={{ padding: sidebarOpen ? '20px 16px 16px' : '20px 14px 16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(26,115,232,0.4)' }}>
            <span style={{ color: '#fff', fontSize: '18px', fontWeight: '800' }}>P</span>
          </div>
          {sidebarOpen && (
            <div>
              <p style={{ color: '#fff', fontSize: '16px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', lineHeight: 1 }}>PayEase</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Admin Portal</p>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <div style={{ marginTop: '12px', background: 'rgba(26,115,232,0.12)', border: '1px solid rgba(26,115,232,0.2)', borderRadius: '10px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={11} color="#1A73E8" />
            <span style={{ color: '#1A73E8', fontSize: '11px', fontWeight: '700' }}>Super Admin</span>
            <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#3FB950', boxShadow: '0 0 6px rgba(63,185,80,0.6)' }} />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(item => {
          const Icon     = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div key={item.id}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: sidebarOpen ? '10px 12px' : '10px 0', paddingLeft: sidebarOpen ? '12px' : '14px', borderRadius: '12px', cursor: 'pointer', background: isActive ? 'rgba(26,115,232,0.15)' : 'transparent', transition: 'all 0.15s', position: 'relative' }}
              onClick={() => setActiveTab(item.id)}
            >
              {isActive && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '20px', borderRadius: '0 3px 3px 0', background: 'linear-gradient(180deg,#1A73E8,#7C3AED)' }} />}
              <Icon size={17} color={isActive ? '#1A73E8' : 'rgba(255,255,255,0.35)'} />
              {sidebarOpen && (
                <>
                  <span style={{ fontSize: '13px', color: isActive ? '#fff' : 'rgba(255,255,255,0.45)', fontWeight: isActive ? '700' : '500', flex: 1 }}>{item.label}</span>
                  {item.badge > 0 && <div style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)', color: '#fff', fontSize: '10px', fontWeight: '800', minWidth: '18px', height: '18px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', boxShadow: '0 2px 8px rgba(220,38,38,0.4)' }}>{item.badge}</div>}
                  {item.count > 0 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', fontWeight: '600' }}>{item.count}</span>}
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 8px', borderTop: `1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: sidebarOpen ? '10px 12px' : '10px 14px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.15s' }}
          onClick={logout}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,81,73,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={17} color="rgba(248,81,73,0.6)" />
          {sidebarOpen && <span style={{ color: 'rgba(248,81,73,0.7)', fontSize: '13px', fontWeight: '600' }}>Sign Out</span>}
        </div>
      </div>
    </div>
  );

  // ── TOP BAR ──
  const TopBar = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', background: c.topBar, borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(12px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: c.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${c.border}` }} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={15} color={c.textSec} />
        </div>
        <div>
          <h1 style={{ fontSize: '17px', fontWeight: '800', color: c.text, margin: 0, letterSpacing: '-0.3px' }}>
            {navItems.find(n => n.id === activeTab)?.label || 'Overview'}
          </h1>
          <p style={{ color: c.textSec, fontSize: '11px', margin: 0, fontWeight: '500' }}>
            {new Date().toLocaleDateString('en-PK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', background: c.cardAlt, border: `1px solid ${c.border}`, borderRadius: '11px', padding: '0 12px', gap: '8px' }}>
          <Search size={13} color={c.textSec} />
          <input style={{ padding: '8px 0', border: 'none', background: 'transparent', color: c.text, fontSize: '13px', outline: 'none', width: '180px', fontWeight: '500' }}
            placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          {searchQuery && <div onClick={() => setSearchQuery('')} style={{ cursor: 'pointer' }}><X size={12} color={c.textSec} /></div>}
        </div>

        {/* Icon buttons */}
        {[
          { icon: isDark ? <Sun size={15} color="#F59E0B" /> : <Moon size={15} color="#1A73E8" />, action: toggleTheme },
          { icon: <RefreshCw size={14} color={c.textSec} />, action: loadDashboard },
        ].map((btn, i) => (
          <div key={i} style={{ width: '34px', height: '34px', borderRadius: '10px', background: c.cardAlt, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={btn.action}>
            {btn.icon}
          </div>
        ))}

        {/* Bell */}
        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: c.cardAlt, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }} onClick={() => setActiveTab('kyc')}>
          <Bell size={14} color={c.textSec} />
          {(pendingKyc.length + changeRequests.filter(r => r.status === 'pending').length) > 0 && (
            <div style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', borderRadius: '50%', background: '#DC2626', border: `2px solid ${c.topBar}`, boxShadow: '0 0 6px rgba(220,38,38,0.5)' }} />
          )}
        </div>
      </div>
    </div>
  );

  // ── METRIC CARD ──
  const MetricCard = ({ card }) => (
    <div style={{ background: card.grad, borderRadius: '18px', padding: '20px', boxShadow: `0 12px 32px ${card.shadow}`, position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>{card.icon}</div>
        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', borderRadius: '20px', padding: '3px 9px', border: '1px solid rgba(255,255,255,0.15)' }}>
          <span style={{ color: '#fff', fontSize: '10px', fontWeight: '700' }}>{card.sub}</span>
        </div>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>{card.label}</p>
      <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: '800', margin: 0, lineHeight: 1.1, letterSpacing: '-0.5px' }}>{card.value}</h2>
    </div>
  );

  // ── SECTION HEADER helper ──
  const SectionHeader = ({ title, sub, right }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${c.border}` }}>
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: c.text, margin: 0, letterSpacing: '-0.2px' }}>{title}</h3>
        {sub && <p style={{ color: c.textSec, fontSize: '11px', margin: 0, fontWeight: '500' }}>{sub}</p>}
      </div>
      {right}
    </div>
  );

  const cardStyle = { background: c.card, borderRadius: '18px', border: `1px solid ${c.border}`, boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.05)' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: c.bg, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}} * { scrollbar-width: thin; scrollbar-color: ${isDark ? 'rgba(255,255,255,0.08) transparent' : 'rgba(0,0,0,0.08) transparent'}; }`}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? 'linear-gradient(135deg,#DC2626,#B91C1C)' : 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', padding: '12px 20px', borderRadius: '14px', zIndex: 99999, fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.15)' }}>
          <CheckCircle size={14} color="#fff" /> {toast.msg}
        </div>
      )}

      <ConfirmDialog show={deleteDialog.show} title="Delete User Account" message="This action is permanent and cannot be undone."
        onConfirm={deleteUser} onCancel={() => setDeleteDialog({ show: false, user: null, reason: '' })}
        confirmText="Delete Permanently" confirmColor="#DC2626" c={c}>
        <p style={{ color: c.textSec, fontSize: '13px', margin: '0 0 12px 0', lineHeight: '1.6', textAlign: 'center' }}>
          Deleting <strong style={{ color: c.text }}>{deleteDialog.user?.full_name}</strong>. Their wallet, transactions and KYC data will be removed.
        </p>
        <div>
          <label style={{ color: c.textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>Deletion Reason</label>
          <input style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${c.border}`, borderRadius: '10px', background: c.inputBg, color: c.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            placeholder="e.g. Terms of service violation" value={deleteDialog.reason} onChange={e => setDeleteDialog(d => ({ ...d, reason: e.target.value }))} />
        </div>
      </ConfirmDialog>

      <EditUserModal show={editModal.show} user={editModal.user} onClose={() => setEditModal({ show: false, user: null })} onSave={updateUser} c={c} />

      <Sidebar />

      <div style={{ flex: 1, overflow: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar />

        <div style={{ padding: '20px 24px', flex: 1 }}>

          {/* ── OVERVIEW ── */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '18px' }}>
                {metricCards.map((card, i) => <MetricCard key={i} card={card} />)}
              </div>

              {/* Quick stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '18px' }}>
                {[
                  { label: 'Verified Users',   value: users.filter(u => u.kyc_verified).length, icon: <ShieldCheck size={16} color="#16A34A" />, grad: 'linear-gradient(135deg,#16A34A,#15803D)', bg: 'rgba(22,163,74,0.1)', border: 'rgba(22,163,74,0.15)' },
                  { label: 'Blocked Users',    value: users.filter(u => u.is_blocked).length,   icon: <Lock size={16} color="#DC2626" />,        grad: 'linear-gradient(135deg,#DC2626,#B91C1C)', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.15)' },
                  { label: 'Pending Requests', value: changeRequests.filter(r => r.status === 'pending').length, icon: <ClipboardList size={16} color="#7C3AED" />, grad: 'linear-gradient(135deg,#7C3AED,#5B21B6)', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.15)' },
                ].map((s, i) => (
                  <div key={i} style={{ ...cardStyle, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: s.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 6px 16px ${s.border}` }}>
                      {React.cloneElement(s.icon, { color: '#fff' })}
                    </div>
                    <div>
                      <p style={{ color: c.textSec, fontSize: '10px', margin: '0 0 3px 0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</p>
                      <p style={{ color: c.text, fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart + Pie */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '14px', marginBottom: '18px' }}>
                <div style={cardStyle}>
                  <SectionHeader title="Transaction Volume" sub="Daily PKR volume"
                    right={
                      <div style={{ display: 'flex', gap: '4px', background: c.cardAlt, borderRadius: '10px', padding: '3px', border: `1px solid ${c.border}` }}>
                        {['week','month'].map(v => (
                          <button key={v} style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', background: chartView === v ? 'linear-gradient(135deg,#1A73E8,#7C3AED)' : 'transparent', color: chartView === v ? '#fff' : c.textSec, transition: 'all 0.2s', boxShadow: chartView === v ? '0 2px 8px rgba(26,115,232,0.35)' : 'none' }} onClick={() => setChartView(v)}>
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                          </button>
                        ))}
                      </div>
                    }
                  />
                  <div style={{ padding: '16px 20px' }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={chartView === 'week' ? weekData : monthData} margin={{ left: -10, right: 4 }}>
                        <defs>
                          <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#1A73E8" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#1A73E8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'} />
                        <XAxis dataKey={chartView === 'week' ? 'day' : 'month'} tick={{ fontSize: 10, fill: c.textSec, fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: c.textSec }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip c={c} />} />
                        <Area type="monotone" dataKey="volume" stroke="#1A73E8" fill="url(#vg)" strokeWidth={2.5} name="Volume" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={cardStyle}>
                  <SectionHeader title="Revenue Mix" sub="By transaction type" />
                  <div style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <PieChart width={160} height={160}>
                        <Pie data={pieData} cx={75} cy={75} innerRadius={46} outerRadius={72} dataKey="value" strokeWidth={0}>
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                      {pieData.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: item.color, flexShrink: 0 }} />
                          <span style={{ color: c.textSec, fontSize: '12px', flex: 1, fontWeight: '500' }}>{item.name}</span>
                          <span style={{ color: c.text, fontSize: '12px', fontWeight: '800' }}>{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent transactions */}
              <div style={cardStyle}>
                <SectionHeader title="Recent Transactions" sub="Latest activity"
                  right={<button style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(26,115,232,0.1)', border: '1px solid rgba(26,115,232,0.2)', borderRadius: '10px', padding: '6px 12px', cursor: 'pointer', color: '#1A73E8', fontSize: '12px', fontWeight: '700' }} onClick={() => setActiveTab('transactions')}>
                    View all <ChevronRight size={13} color="#1A73E8" />
                  </button>}
                />
                <div style={{ overflow: 'auto' }}><TxTable transactions={transactions.slice(0,6)} c={c} /></div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {activeTab === 'analytics' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {[
                  { title: 'Weekly Revenue', sub: 'PKR revenue per day', chart: <BarChart data={weekData}><CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'} /><XAxis dataKey="day" tick={{ fontSize: 10, fill: c.textSec, fontWeight: 600 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 9, fill: c.textSec }} axisLine={false} tickLine={false} /><Tooltip content={<ChartTooltip c={c} />} /><Bar dataKey="revenue" fill="url(#bg)" radius={[6,6,0,0]} name="Revenue"><Cell fill="url(#bg)" /></Bar></BarChart> },
                  { title: 'Monthly Growth', sub: 'Volume trend over 6 months', chart: <LineChart data={monthData}><CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'} /><XAxis dataKey="month" tick={{ fontSize: 10, fill: c.textSec, fontWeight: 600 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 9, fill: c.textSec }} axisLine={false} tickLine={false} /><Tooltip content={<ChartTooltip c={c} />} /><Line type="monotone" dataKey="volume" stroke="#16A34A" strokeWidth={2.5} dot={{ fill: '#16A34A', r: 4, strokeWidth: 0 }} name="Volume" /></LineChart> },
                ].map((ch, i) => (
                  <div key={i} style={cardStyle}>
                    <SectionHeader title={ch.title} sub={ch.sub} />
                    <div style={{ padding: '16px 20px' }}>
                      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1A73E8" /><stop offset="100%" stopColor="#7C3AED" /></linearGradient></defs>
                      <ResponsiveContainer width="100%" height={220}>{ch.chart}</ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ ...cardStyle, marginBottom: '16px' }}>
                <SectionHeader title="Transaction Type Breakdown" />
                <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                  {txTypeData.map((item, i) => (
                    <div key={i} style={{ background: c.cardAlt, borderRadius: '16px', padding: '18px', border: `1px solid ${c.border}`, textAlign: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '15px', background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', border: `1px solid ${item.color}25` }}>
                        <CreditCard size={22} color={item.color} />
                      </div>
                      <p style={{ color: c.textSec, fontSize: '11px', margin: '0 0 4px 0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.name}</p>
                      <p style={{ color: c.text, fontSize: '26px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={cardStyle}>
                <SectionHeader title="Top Users by Balance" sub="Sorted by wallet balance" />
                <div style={{ padding: '8px 16px 16px' }}>
                  {[...users].sort((a,b) => (b.balance||0)-(a.balance||0)).slice(0,5).map((u, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', background: c.cardAlt, borderRadius: '14px', border: `1px solid ${c.border}`, marginTop: '8px' }}>
                      <span style={{ color: c.textSec, fontSize: '12px', fontWeight: '800', width: '20px' }}>#{i+1}</span>
                      <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '800', flexShrink: 0 }}>
                        {u.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: c.text, fontSize: '13px', fontWeight: '700', margin: 0 }}>{u.full_name}</p>
                        <p style={{ color: c.textSec, fontSize: '11px', margin: 0 }}>{u.email}</p>
                      </div>
                      <span style={{ color: '#1A73E8', fontSize: '14px', fontWeight: '800' }}>PKR {(u.balance||0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === 'users' && (
            <div style={cardStyle}>
              <SectionHeader title="All Users" sub={`${filteredUsers.length} of ${users.length} users`}
                right={<div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ background: 'rgba(22,163,74,0.1)', color: '#16A34A', fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(22,163,74,0.15)' }}>{users.filter(u=>u.kyc_verified).length} Verified</span>
                  <span style={{ background: 'rgba(220,38,38,0.1)', color: '#DC2626', fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(220,38,38,0.15)' }}>{users.filter(u=>u.is_blocked).length} Blocked</span>
                </div>}
              />
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: c.cardAlt }}>
                      {['User','Contact','Balance','KYC','Status','Joined','Actions'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '10px', fontWeight: '700', color: c.textSec, textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${c.border}` }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '800', flexShrink: 0, boxShadow: '0 4px 10px rgba(26,115,232,0.3)' }}>
                              {u.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ color: c.text, fontSize: '13px', fontWeight: '700', margin: 0 }}>{u.full_name}</p>
                              {u.is_admin && <span style={{ color: '#1A73E8', fontSize: '9px', fontWeight: '800', background: 'rgba(26,115,232,0.1)', padding: '1px 6px', borderRadius: '4px' }}>Admin</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <p style={{ color: c.text, fontSize: '12px', margin: '0 0 2px 0', fontWeight: '500' }}>{u.email}</p>
                          <p style={{ color: c.textSec, fontSize: '11px', margin: 0 }}>{u.phone}</p>
                        </td>
                        <td style={{ padding: '12px 16px' }}><span style={{ color: '#1A73E8', fontSize: '13px', fontWeight: '800' }}>PKR {(u.balance||0).toLocaleString()}</span></td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: u.kyc_verified ? 'rgba(22,163,74,0.1)' : 'rgba(202,138,4,0.1)', color: u.kyc_verified ? '#16A34A' : '#CA8A04', border: `1px solid ${u.kyc_verified ? 'rgba(22,163,74,0.15)' : 'rgba(202,138,4,0.15)'}` }}>
                            {u.kyc_verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: u.is_blocked ? 'rgba(220,38,38,0.1)' : 'rgba(22,163,74,0.1)', color: u.is_blocked ? '#DC2626' : '#16A34A', border: `1px solid ${u.is_blocked ? 'rgba(220,38,38,0.15)' : 'rgba(22,163,74,0.15)'}` }}>
                            {u.is_blocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: c.textSec, fontSize: '11px' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {!u.is_admin ? (
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button style={{ padding: '5px 10px', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: 'rgba(124,58,237,0.1)', color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(124,58,237,0.15)' }} onClick={() => setEditModal({ show: true, user: u })}>
                                <Edit2 size={11} /> Edit
                              </button>
                              <button style={{ padding: '5px 10px', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: u.is_blocked ? 'rgba(22,163,74,0.1)' : 'rgba(202,138,4,0.1)', color: u.is_blocked ? '#16A34A' : '#CA8A04', border: `1px solid ${u.is_blocked ? 'rgba(22,163,74,0.15)' : 'rgba(202,138,4,0.15)'}` }} onClick={() => blockUser(u.id, u.is_blocked)}>
                                {u.is_blocked ? 'Unblock' : 'Block'}
                              </button>
                              <button style={{ padding: '5px 10px', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: 'rgba(220,38,38,0.1)', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(220,38,38,0.15)' }} onClick={() => setDeleteDialog({ show: true, user: u, reason: '' })}>
                                <Trash2 size={11} /> Delete
                              </button>
                            </div>
                          ) : <span style={{ color: c.textSec, fontSize: '11px', fontWeight: '600' }}>Protected</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── KYC ── */}
          {activeTab === 'kyc' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '18px' }}>
                {[
                  { label: 'Pending Review', value: pendingKyc.length, grad: 'linear-gradient(135deg,#92400E,#CA8A04)', shadow: 'rgba(202,138,4,0.35)', icon: <Clock size={20} color="#fff" /> },
                  { label: 'Verified Users', value: users.filter(u=>u.kyc_verified).length, grad: 'linear-gradient(135deg,#134E5E,#16A34A)', shadow: 'rgba(22,163,74,0.35)', icon: <CheckCircle size={20} color="#fff" /> },
                  { label: 'Total Users',    value: users.length, grad: 'linear-gradient(135deg,#1A1FEF,#1A73E8)', shadow: 'rgba(26,115,232,0.35)', icon: <FileCheck size={20} color="#fff" /> },
                ].map((s,i) => (
                  <div key={i} style={{ background: s.grad, borderRadius: '16px', padding: '18px', boxShadow: `0 8px 24px ${s.shadow}`, position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0' }}>{s.label}</p>
                        <p style={{ color: '#fff', fontSize: '28px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>{s.value}</p>
                      </div>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {pendingKyc.length === 0 ? (
                <div style={{ ...cardStyle, padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ width: '68px', height: '68px', borderRadius: '22px', background: 'linear-gradient(135deg,#16A34A,#15803D)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(22,163,74,0.35)' }}>
                    <CheckCircle size={32} color="#fff" />
                  </div>
                  <h3 style={{ color: c.text, margin: '0 0 6px 0', fontWeight: '800', letterSpacing: '-0.3px' }}>All Caught Up!</h3>
                  <p style={{ color: c.textSec, margin: 0, fontSize: '13px' }}>No pending KYC applications to review</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px,1fr))', gap: '16px' }}>
                  {pendingKyc.map((kyc, i) => (
                    <div key={i} style={{ ...cardStyle, overflow: 'hidden' }}>
                      <div style={{ background: 'linear-gradient(135deg,#1A1FEF,#1A73E8)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: '800', border: '1px solid rgba(255,255,255,0.25)' }}>
                            {kyc.user?.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ color: '#fff', fontSize: '15px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>{kyc.user?.full_name}</p>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>{kyc.user?.email}</p>
                          </div>
                        </div>
                        <span style={{ background: 'rgba(252,211,77,0.2)', color: '#FCD34D', fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(252,211,77,0.3)', position: 'relative', zIndex: 1 }}>Pending</span>
                      </div>

                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ background: c.cardAlt, borderRadius: '12px', padding: '12px', marginBottom: '14px', border: `1px solid ${c.border}` }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {[
                              { label: 'ID Number',     value: kyc.cnic_number },
                              { label: 'Phone',         value: kyc.user?.phone },
                              { label: 'Date of Birth', value: kyc.date_of_birth || 'N/A' },
                              { label: 'Name on Card',  value: kyc.full_name_on_card || 'N/A' },
                            ].map((row, ri) => (
                              <div key={ri}>
                                <p style={{ color: c.textSec, fontSize: '9px', fontWeight: '700', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{row.label}</p>
                                <p style={{ color: c.text, fontSize: '12px', fontWeight: '700', margin: 0 }}>{row.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <p style={{ color: c.textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px 0' }}>Documents — Click to enlarge</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                          {[{ label: 'ID Front', path: kyc.cnic_front }, { label: 'ID Back', path: kyc.cnic_back }, { label: 'Selfie', path: kyc.selfie }].map((doc, di) => (
                            <div key={di} style={{ borderRadius: '12px', overflow: 'hidden', background: c.cardAlt, border: `1px solid ${c.border}` }}>
                              <p style={{ color: c.textSec, fontSize: '9px', fontWeight: '700', textAlign: 'center', padding: '5px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{doc.label}</p>
                              {doc.path ? (
                                <div style={{ position: 'relative', height: '80px', cursor: 'pointer', overflow: 'hidden' }} onClick={() => setSelectedImage(doc.path)}>
                                  <img src={doc.path} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={doc.label} />
                                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,115,232,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,115,232,0.55)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(26,115,232,0)'}>
                                    <Eye size={16} color="#fff" />
                                  </div>
                                </div>
                              ) : <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.textSec, fontSize: '11px' }}>No image</div>}
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }} onClick={() => approveKyc(kyc.id)}>
                            <CheckCircle size={15} color="#fff" /> Approve
                          </button>
                          <button style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#DC2626,#B91C1C)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(220,38,38,0.35)' }} onClick={() => rejectKyc(kyc.id)}>
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

          {/* ── TRANSACTIONS ── */}
          {activeTab === 'transactions' && (
            <div style={cardStyle}>
              <SectionHeader title="All Transactions" sub={`${filteredTx.length} records`}
                right={<div style={{ display: 'flex', gap: '6px' }}>
                  {['transfer','deposit','bill'].map(type => (
                    <span key={type} style={{ background: c.cardAlt, color: c.textSec, fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${c.border}` }}>
                      {transactions.filter(t => t.type === type || (type === 'bill' && ['electricity','gas','internet','topup'].includes(t.type))).length} {type}s
                    </span>
                  ))}
                </div>}
              />
              <div style={{ overflow: 'auto' }}><TxTable transactions={filteredTx} c={c} showAll /></div>
            </div>
          )}

          {/* ── CHANGE REQUESTS ── */}
          {activeTab === 'change-requests' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '18px' }}>
                {[
                  { label: 'Pending',  value: changeRequests.filter(r=>r.status==='pending').length,  grad: 'linear-gradient(135deg,#92400E,#CA8A04)', shadow: 'rgba(202,138,4,0.35)' },
                  { label: 'Approved', value: changeRequests.filter(r=>r.status==='approved').length, grad: 'linear-gradient(135deg,#134E5E,#16A34A)', shadow: 'rgba(22,163,74,0.35)' },
                  { label: 'Rejected', value: changeRequests.filter(r=>r.status==='rejected').length, grad: 'linear-gradient(135deg,#7F1D1D,#DC2626)', shadow: 'rgba(220,38,38,0.35)' },
                ].map((s,i) => (
                  <div key={i} style={{ background: s.grad, borderRadius: '16px', padding: '18px', boxShadow: `0 8px 24px ${s.shadow}`, position: 'relative', overflow: 'hidden', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0' }}>{s.label}</p>
                    <p style={{ color: '#fff', fontSize: '30px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {changeRequests.length === 0 ? (
                <div style={{ ...cardStyle, padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ width: '68px', height: '68px', borderRadius: '22px', background: c.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <ClipboardList size={28} color={c.textSec} />
                  </div>
                  <h3 style={{ color: c.text, margin: '0 0 6px 0', fontWeight: '800' }}>No Change Requests</h3>
                  <p style={{ color: c.textSec, margin: 0, fontSize: '13px' }}>Users have not submitted any requests yet</p>
                </div>
              ) : (
                <div style={cardStyle}>
                  <SectionHeader title="All Change Requests" sub="User-submitted field change requests" />
                  <div style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: c.cardAlt }}>
                          {['User','Field','New Value','Reason','Submitted','Status','Actions'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '10px', fontWeight: '700', color: c.textSec, textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {changeRequests.map((req, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${c.border}` }}>
                            <td style={{ padding: '12px 16px' }}>
                              <p style={{ color: c.text, fontSize: '13px', fontWeight: '700', margin: 0 }}>{req.user_name}</p>
                              <p style={{ color: c.textSec, fontSize: '11px', margin: 0 }}>{req.user_email}</p>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(124,58,237,0.15)' }}>
                                {req.field?.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', color: c.text, fontSize: '13px', fontWeight: '700' }}>{req.new_value}</td>
                            <td style={{ padding: '12px 16px', color: c.textSec, fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.reason}</td>
                            <td style={{ padding: '12px 16px', color: c.textSec, fontSize: '11px', whiteSpace: 'nowrap' }}>{req.submitted_at}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: req.status === 'pending' ? 'rgba(202,138,4,0.1)' : req.status === 'approved' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', color: req.status === 'pending' ? '#CA8A04' : req.status === 'approved' ? '#16A34A' : '#DC2626', border: `1px solid ${req.status === 'pending' ? 'rgba(202,138,4,0.15)' : req.status === 'approved' ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)'}` }}>
                                {req.status.charAt(0).toUpperCase()+req.status.slice(1)}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {req.status === 'pending' ? (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                  <button style={{ padding: '5px 10px', border: '1px solid rgba(22,163,74,0.15)', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: 'rgba(22,163,74,0.1)', color: '#16A34A' }} onClick={() => approveChangeRequest(req.id)}>Approve</button>
                                  <button style={{ padding: '5px 10px', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: 'rgba(220,38,38,0.1)', color: '#DC2626' }} onClick={() => rejectChangeRequest(req.id)}>Reject</button>
                                </div>
                              ) : <span style={{ color: c.textSec, fontSize: '11px' }}>{req.processed_at || 'Processed'}</span>}
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

          {/* ── ACTIVITY LOGS ── */}
          {activeTab === 'logs' && (
            <div style={cardStyle}>
              <SectionHeader title="Activity Logs" sub={`${filteredLogs.length} entries — most recent first`}
                right={<span style={{ background: c.cardAlt, color: c.textSec, fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${c.border}` }}>Last {Math.min(logs.length,500)} records</span>}
              />
              {filteredLogs.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ width: '68px', height: '68px', borderRadius: '22px', background: c.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <ActivityIcon size={28} color={c.textSec} />
                  </div>
                  <p style={{ color: c.text, fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0' }}>No logs yet</p>
                  <p style={{ color: c.textSec, fontSize: '12px', margin: 0 }}>Activity will appear here as users interact with the platform</p>
                </div>
              ) : (
                <div style={{ overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: c.cardAlt }}>
                        {['User','Action','Detail','IP Address','Timestamp'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '10px', fontWeight: '700', color: c.textSec, textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log, i) => {
                        const isAdmin    = log.action.includes('Deleted')||log.action.includes('Updated')||log.action.includes('Approved')||log.action.includes('Rejected');
                        const isSecurity = log.action.includes('blocked')||log.action.includes('login')||log.action.includes('Alert');
                        const color = isAdmin ? '#7C3AED' : isSecurity ? '#DC2626' : '#1A73E8';
                        const bg    = isAdmin ? 'rgba(124,58,237,0.1)' : isSecurity ? 'rgba(220,38,38,0.1)' : 'rgba(26,115,232,0.1)';
                        const brd   = isAdmin ? 'rgba(124,58,237,0.15)' : isSecurity ? 'rgba(220,38,38,0.15)' : 'rgba(26,115,232,0.15)';
                        return (
                          <tr key={i} style={{ borderBottom: `1px solid ${c.border}` }}>
                            <td style={{ padding: '11px 16px' }}>
                              <p style={{ color: c.text, fontSize: '12px', fontWeight: '700', margin: 0 }}>{log.user_name}</p>
                              <p style={{ color: c.textSec, fontSize: '10px', margin: 0 }}>{log.user_email}</p>
                            </td>
                            <td style={{ padding: '11px 16px' }}>
                              <span style={{ background: bg, color, fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap', border: `1px solid ${brd}` }}>{log.action}</span>
                            </td>
                            <td style={{ padding: '11px 16px', color: c.textSec, fontSize: '11px', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.detail}</td>
                            <td style={{ padding: '11px 16px', color: c.textSec, fontSize: '11px', fontFamily: 'monospace' }}>{log.ip}</td>
                            <td style={{ padding: '11px 16px', color: c.textSec, fontSize: '11px', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                {[
                  { title: 'Fraud Detection',       desc: 'Large transfers (PKR 25,000+) trigger alerts and emails', grad: 'linear-gradient(135deg,#7F1D1D,#DC2626)', icon: <AlertCircle size={20} color="#fff" />, status: 'Active' },
                  { title: 'KYC Enforcement',        desc: 'KYC verification required before any money transfer', grad: 'linear-gradient(135deg,#134E5E,#16A34A)', icon: <ShieldCheck size={20} color="#fff" />, status: 'Enabled' },
                  { title: 'Transfer Limits',        desc: 'Maximum PKR 50,000 per transaction enforced backend-only', grad: 'linear-gradient(135deg,#92400E,#CA8A04)', icon: <Lock size={20} color="#fff" />, status: 'Enforced' },
                  { title: 'Session Timeout',        desc: 'Users are automatically logged out after 30 minutes', grad: 'linear-gradient(135deg,#1A1FEF,#1A73E8)', icon: <Clock size={20} color="#fff" />, status: 'Active' },
                  { title: 'New Device Alerts',      desc: 'Email alert sent when a new device or browser logs in', grad: 'linear-gradient(135deg,#3B1F8C,#7C3AED)', icon: <Globe size={20} color="#fff" />, status: 'Active' },
                  { title: 'Rapid Transfer Monitor', desc: '3+ transfers in 5 minutes triggers unusual activity alert', grad: 'linear-gradient(135deg,#9A3412,#EA580C)', icon: <Zap size={20} color="#fff" />, status: 'Active' },
                ].map((item, i) => (
                  <div key={i} style={cardStyle}>
                    <div style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: item.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 16px rgba(0,0,0,0.2)` }}>{item.icon}</div>
                        <span style={{ background: 'rgba(22,163,74,0.1)', color: '#16A34A', fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(22,163,74,0.15)' }}>{item.status}</span>
                      </div>
                      <h4 style={{ color: c.text, fontSize: '14px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.2px' }}>{item.title}</h4>
                      <p style={{ color: c.textSec, fontSize: '12px', margin: 0, lineHeight: '1.6', fontWeight: '500' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={cardStyle}>
                <SectionHeader title={`Blocked Users (${users.filter(u=>u.is_blocked).length})`} />
                {users.filter(u=>u.is_blocked).length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}><p style={{ color: c.textSec, margin: 0, fontWeight: '500' }}>No blocked users at this time</p></div>
                ) : (
                  users.filter(u=>u.is_blocked).map((u, i, arr) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: i < arr.length-1 ? `1px solid ${c.border}` : 'none' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', fontWeight: '800', border: '1px solid rgba(220,38,38,0.15)' }}>
                        {u.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: c.text, fontSize: '13px', fontWeight: '700', margin: 0 }}>{u.full_name}</p>
                        <p style={{ color: c.textSec, fontSize: '11px', margin: 0 }}>{u.email}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button style={{ padding: '6px 14px', border: '1px solid rgba(22,163,74,0.15)', borderRadius: '9px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: 'rgba(22,163,74,0.1)', color: '#16A34A' }} onClick={() => blockUser(u.id, true)}>Unblock</button>
                        <button style={{ padding: '6px 14px', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '9px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: 'rgba(220,38,38,0.1)', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setDeleteDialog({ show: true, user: u, reason: '' })}>
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { title: 'System Status', icon: <Activity size={16} color="#16A34A" />, items: [
                  { label: 'API Server',    status: 'Operational', color: '#16A34A' },
                  { label: 'Database',      status: 'Operational', color: '#16A34A' },
                  { label: 'Email Service', status: 'Operational', color: '#16A34A' },
                  { label: 'File Storage',  status: 'Operational', color: '#16A34A' },
                ]},
                { title: 'App Configuration', icon: <Settings size={16} color="#1A73E8" />, items: [
                  { label: 'Transfer Limit',  status: 'PKR 50,000', color: '#1A73E8' },
                  { label: 'KYC Required',    status: 'Yes',        color: '#16A34A' },
                  { label: 'OTP Expiry',      status: '10 minutes', color: '#1A73E8' },
                  { label: 'Session Timeout', status: '30 minutes', color: '#CA8A04' },
                ]},
              ].map((sec, si) => (
                <div key={si} style={cardStyle}>
                  <SectionHeader title={sec.title} right={<div style={{ width: '32px', height: '32px', borderRadius: '10px', background: c.cardAlt, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sec.icon}</div>} />
                  <div style={{ padding: '4px 20px 12px' }}>
                    {sec.items.map((item, i, arr) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length-1 ? `1px solid ${c.border}` : 'none' }}>
                        <span style={{ color: c.textSec, fontSize: '13px', fontWeight: '500' }}>{item.label}</span>
                        <span style={{ color: item.color, fontSize: '12px', fontWeight: '800', background: `${item.color}12`, padding: '3px 10px', borderRadius: '20px', border: `1px solid ${item.color}20` }}>{item.status}</span>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer' }} onClick={() => setSelectedImage(null)}>
          <div style={{ background: c.cardSolid, borderRadius: '20px', padding: '20px', maxWidth: '640px', width: '90%', cursor: 'default', border: `1px solid ${c.border}`, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ color: c.text, fontSize: '14px', fontWeight: '700', margin: 0 }}>Document Preview</p>
              <button style={{ width: '32px', height: '32px', borderRadius: '10px', background: c.cardAlt, border: `1px solid ${c.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedImage(null)}>
                <X size={14} color={c.text} />
              </button>
            </div>
            <img src={selectedImage} style={{ width: '100%', borderRadius: '12px', maxHeight: '65vh', objectFit: 'contain' }} alt="Document" />
          </div>
        </div>
      )}
    </div>
  );
}
