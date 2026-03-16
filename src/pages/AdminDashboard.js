import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  LayoutDashboard, Users, FileCheck, ArrowLeftRight,
  LogOut, Shield, CheckCircle, XCircle, Eye,
  ChevronRight, Bell, Download, DollarSign,
  Activity, UserCheck, Sun, Moon, Menu
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pendingKyc, setPendingKyc] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState('');

  const colors = isDark ? {
    bg: '#0A0F1E',
    sidebar: '#060B18',
    card: '#141B2D',
    cardAlt: '#1E2640',
    text: '#FFFFFF',
    textSecondary: '#AAB0C0',
    border: '#2A2F45',
    topBar: '#141B2D',
  } : {
    bg: '#F5F7FF',
    sidebar: '#0F1535',
    card: '#FFFFFF',
    cardAlt: '#F5F7FF',
    text: '#1A1A2E',
    textSecondary: '#888',
    border: '#E0E6F0',
    topBar: '#FFFFFF',
  };

  useEffect(() => { loadDashboard(); }, []);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(''), 3000);
  };

  const loadDashboard = async () => {
    try {
      const [statsRes, usersRes, txRes, kycRes] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/users'),
        api.get('/api/admin/transactions'),
        api.get('/api/admin/kyc/pending'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setTransactions(txRes.data.transactions || []);
      setPendingKyc(kycRes.data.kyc_list || []);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (userId, isBlocked) => {
    try {
      await api.post('/api/admin/block-user', { user_id: userId, block: !isBlocked });
      showToast(isBlocked ? 'User unblocked!' : 'User blocked!');
      loadDashboard();
    } catch (err) { console.error(err); }
  };

  const approveKyc = async (kycId) => {
    try {
      await api.post('/api/admin/kyc/approve', { kyc_id: kycId });
      showToast('KYC Approved!');
      loadDashboard();
    } catch (err) { console.error(err); }
  };

  const rejectKyc = async (kycId) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.post('/api/admin/kyc/reject', { kyc_id: kycId, reason });
      showToast('KYC Rejected!', true);
      loadDashboard();
    } catch (err) { console.error(err); }
  };

  const chartData = [
    { name: 'Mon', transfers: 30000, revenue: 2000 },
    { name: 'Tue', transfers: 45000, revenue: 3500 },
    { name: 'Wed', transfers: 28000, revenue: 1800 },
    { name: 'Thu', transfers: 52000, revenue: 4200 },
    { name: 'Fri', transfers: 38000, revenue: 2900 },
    { name: 'Sat', transfers: 61000, revenue: 5100 },
    { name: 'Sun', transfers: 42000, revenue: 3300 },
  ];

  const pieData = [
    { name: 'Transfers', value: stats?.total_volume || 100, color: '#1A73E8' },
    { name: 'Bills', value: (stats?.total_volume || 100) * 0.3, color: '#00C853' },
  ];

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'kyc', icon: FileCheck, label: 'KYC', badge: pendingKyc.length },
    { id: 'transactions', icon: ArrowLeftRight, label: 'Transactions' },
  ];

  const metricCards = [
    {
      label: 'Total Volume',
      value: `PKR ${((stats?.total_volume || 0) / 1000).toFixed(1)}K`,
      change: '+12.5%',
      icon: <DollarSign size={20} color="#fff" />,
      gradient: 'linear-gradient(135deg, #1A73E8, #0052CC)',
      shadow: 'rgba(26,115,232,0.3)',
    },
    {
      label: 'Total Transfers',
      value: stats?.total_transactions || 0,
      change: '+8.2%',
      icon: <Activity size={20} color="#fff" />,
      gradient: 'linear-gradient(135deg, #00C853, #007A32)',
      shadow: 'rgba(0,200,83,0.3)',
    },
    {
      label: 'Total Users',
      value: stats?.total_users || 0,
      change: '+5.4%',
      icon: <Users size={20} color="#fff" />,
      gradient: 'linear-gradient(135deg, #FF6B35, #CC4400)',
      shadow: 'rgba(255,107,53,0.3)',
    },
    {
      label: 'Pending KYC',
      value: stats?.pending_kyc || 0,
      change: 'Review now',
      icon: <UserCheck size={20} color="#fff" />,
      gradient: 'linear-gradient(135deg, #9C27B0, #6A0080)',
      shadow: 'rgba(156,39,176,0.3)',
    },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #E0E6F0', borderTop: '4px solid #1A73E8', borderRadius: '50%', margin: '0 auto 16px' }} />
        <p style={{ color: '#888', fontSize: '14px' }}>Loading Admin Panel...</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: toast.isError ? '#FF4444' : '#00C853', color: '#fff', padding: '12px 20px', borderRadius: '12px', zIndex: 9999, fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          <CheckCircle size={16} color="#fff" />
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? '220px' : '70px', background: colors.sidebar, minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '20px 0', transition: 'width 0.3s ease', position: 'sticky', top: 0, flexShrink: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 'bold', flexShrink: 0 }}>P</div>
          {sidebarOpen && <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>PayEase</span>}
        </div>

        {sidebarOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 12px 12px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '8px', padding: '6px 10px' }}>
            <Shield size={12} color="#FFD700" />
            <span style={{ color: '#FFD700', fontSize: '11px', fontWeight: '600' }}>Admin Panel</span>
          </div>
        )}

        <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', borderRadius: '10px', cursor: 'pointer', background: isActive ? 'rgba(26,115,232,0.2)' : 'transparent', borderLeft: isActive ? '3px solid #1A73E8' : '3px solid transparent', transition: 'all 0.2s' }} onClick={() => setActiveTab(item.id)}>
                <Icon size={20} color={isActive ? '#1A73E8' : '#AAB0C0'} />
                {sidebarOpen && <span style={{ fontSize: '14px', color: isActive ? '#fff' : '#AAB0C0', fontWeight: isActive ? '600' : '400', flex: 1 }}>{item.label}</span>}
                {item.badge > 0 && <div style={{ background: '#FF4444', color: '#fff', fontSize: '10px', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.badge}</div>}
              </div>
            );
          })}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 22px', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 'auto' }} onClick={logout}>
          <LogOut size={20} color="#FF4444" />
          {sidebarOpen && <span style={{ color: '#FF4444', fontSize: '14px', fontWeight: '500' }}>Log out</span>}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>

        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: colors.topBar, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${colors.border}` }} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={18} color={colors.textSecondary} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.text, margin: 0 }}>
                {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>
                {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: colors.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${colors.border}` }} onClick={toggleTheme}>
              {isDark ? <Sun size={18} color="#FFB300" /> : <Moon size={18} color="#1A73E8" />}
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: colors.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${colors.border}` }}>
              <Bell size={18} color={colors.textSecondary} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}>
              <Download size={16} color="#fff" />
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>Export</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px' }}>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                {metricCards.map((card, i) => (
                  <div key={i} style={{ background: card.gradient, borderRadius: '16px', padding: '20px', boxShadow: `0 8px 24px ${card.shadow}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
                      <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '20px' }}>{card.change}</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</p>
                    <h2 style={{ color: '#fff', fontSize: '26px', fontWeight: 'bold', margin: 0 }}>{card.value}</h2>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: colors.card, borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: colors.text, margin: 0 }}>Transaction Volume & Revenue</h3>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {[{ color: '#1A73E8', label: 'Transfers' }, { color: '#00C853', label: 'Revenue' }].map((l, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }} />
                          <span style={{ color: colors.textSecondary, fontSize: '12px' }}>{l.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#1A73E8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00C853" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00C853" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: colors.textSecondary }} />
                      <YAxis tick={{ fontSize: 11, fill: colors.textSecondary }} />
                      <Tooltip contentStyle={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.text }} />
                      <Area type="monotone" dataKey="transfers" stroke="#1A73E8" fill="url(#tg)" strokeWidth={2} />
                      <Area type="monotone" dataKey="revenue" stroke="#00C853" fill="url(#rg)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: colors.card, borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: colors.text, margin: '0 0 12px 0', alignSelf: 'flex-start' }}>Revenue Sources</h3>
                  <PieChart width={160} height={160}>
                    <Pie data={pieData} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {pieData.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                        <span style={{ color: colors.textSecondary, fontSize: '12px', flex: 1 }}>{item.name}</span>
                        <span style={{ color: colors.text, fontSize: '12px', fontWeight: '700' }}>PKR {(item.value / 1000).toFixed(1)}K</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: colors.card, borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${colors.border}`, overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: colors.text, margin: 0 }}>Recent Transactions</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => setActiveTab('transactions')}>
                    <span style={{ color: '#1A73E8', fontSize: '13px' }}>See All</span>
                    <ChevronRight size={14} color="#1A73E8" />
                  </div>
                </div>
                <TransactionTable transactions={transactions.slice(0, 5)} colors={colors} showAll={false} />
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div style={{ background: colors.card, borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${colors.border}`, overflow: 'auto' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: colors.text, margin: '0 0 16px 0' }}>All Users ({users.length})</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Phone', 'Balance', 'KYC', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${colors.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: '12px', fontSize: '13px', color: colors.text }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold', flexShrink: 0 }}>
                            {u.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: '500' }}>{u.full_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: colors.textSecondary }}>{u.email}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: colors.textSecondary }}>{u.phone}</td>
                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700', color: '#1A73E8' }}>PKR {u.balance?.toLocaleString() || '0'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: u.kyc_verified ? 'rgba(0,200,83,0.1)' : 'rgba(255,179,0,0.1)', color: u.kyc_verified ? '#00C853' : '#FFB300' }}>
                          {u.kyc_verified ? '✓ Verified' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: u.is_blocked ? 'rgba(255,68,68,0.1)' : 'rgba(0,200,83,0.1)', color: u.is_blocked ? '#FF4444' : '#00C853' }}>
                          {u.is_blocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {!u.is_admin && (
                          <button style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: u.is_blocked ? 'rgba(0,200,83,0.1)' : 'rgba(255,68,68,0.1)', color: u.is_blocked ? '#00C853' : '#FF4444' }} onClick={() => blockUser(u.id, u.is_blocked)}>
                            {u.is_blocked ? 'Unblock' : 'Block'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div style={{ background: colors.card, borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${colors.border}`, overflow: 'auto' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: colors.text, margin: '0 0 16px 0' }}>All Transactions ({transactions.length})</h3>
              <TransactionTable transactions={transactions} colors={colors} showAll={true} />
            </div>
          )}

          {/* KYC Tab */}
          {activeTab === 'kyc' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: colors.text, margin: 0 }}>Pending KYC ({pendingKyc.length})</h3>
              </div>
              {pendingKyc.length === 0 ? (
                <div style={{ background: colors.card, borderRadius: '16px', padding: '60px 20px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                  <CheckCircle size={48} color="#00C853" />
                  <h3 style={{ color: colors.text, margin: '16px 0 8px' }}>All Clear!</h3>
                  <p style={{ color: colors.textSecondary }}>No pending KYC requests</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px' }}>
                  {pendingKyc.map((kyc, i) => (
                    <div key={i} style={{ background: colors.card, borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${colors.border}` }}>
                      {/* User Info */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 'bold', flexShrink: 0 }}>
                          {kyc.user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: colors.text, fontWeight: 'bold', fontSize: '15px', margin: '0 0 3px 0' }}>{kyc.user?.full_name}</p>
                          <p style={{ color: colors.textSecondary, fontSize: '12px', margin: '0 0 2px 0' }}>{kyc.user?.email}</p>
                          <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>{kyc.user?.phone}</p>
                        </div>
                        <span style={{ background: 'rgba(255,179,0,0.1)', color: '#FFB300', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' }}>Pending</span>
                      </div>

                      {/* Details */}
                      <div style={{ background: colors.cardAlt, borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                          <span style={{ color: colors.textSecondary, fontSize: '12px' }}>ID Number</span>
                          <span style={{ color: colors.text, fontSize: '12px', fontWeight: '600' }}>{kyc.cnic_number}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                          <span style={{ color: colors.textSecondary, fontSize: '12px' }}>Submitted</span>
                          <span style={{ color: colors.text, fontSize: '12px', fontWeight: '600' }}>
                            {kyc['submitted-at'] ? new Date(kyc['submitted-at']).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Documents - FIXED WITH CLOUDINARY */}
                      <p style={{ color: colors.textSecondary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px 0' }}>
                        Documents — <span style={{ color: '#1A73E8' }}>Click to enlarge</span>
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                        {[
                          { label: 'ID Front', path: kyc.cnic_front },
                          { label: 'ID Back', path: kyc.cnic_back },
                          { label: 'Selfie', path: kyc.selfie },
                        ].map((doc, di) => (
                          <div key={di} style={{ borderRadius: '10px', overflow: 'hidden', background: colors.cardAlt, border: `1px solid ${colors.border}` }}>
                            <p style={{ color: colors.textSecondary, fontSize: '10px', fontWeight: '600', textAlign: 'center', padding: '4px', margin: 0, textTransform: 'uppercase' }}>{doc.label}</p>
                            {doc.path ? (
                              <div
                                style={{ position: 'relative', height: '90px', cursor: 'pointer', overflow: 'hidden' }}
                                onClick={() => setSelectedImage(doc.path)}
                              >
                                <img
                                  src={doc.path}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  alt={doc.label}
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div
                                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26,115,232,0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26,115,232,0.4)'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(26,115,232,0)'}
                                >
                                  <Eye size={18} color="#fff" />
                                </div>
                              </div>
                            ) : (
                              <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textSecondary, fontSize: '11px' }}>No image</div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg, #00C853, #007A32)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,200,83,0.3)' }}
                          onClick={() => approveKyc(kyc.id)}
                        >
                          <CheckCircle size={16} color="#fff" /> Approve
                        </button>
                        <button
                          style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg, #FF4444, #CC0000)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(255,68,68,0.3)' }}
                          onClick={() => rejectKyc(kyc.id)}
                        >
                          <XCircle size={16} color="#fff" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Viewer */}
      {selectedImage && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer' }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: '16px', padding: '20px', maxWidth: '650px', width: '90%', cursor: 'default' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Document Preview</p>
              <button
                style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F5F7FF', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                onClick={() => setSelectedImage(null)}
              >✕</button>
            </div>
            <img
              src={selectedImage}
              style={{ width: '100%', borderRadius: '12px', maxHeight: '70vh', objectFit: 'contain' }}
              alt="Document"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionTable({ transactions, colors, showAll }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {['From Wallet', 'To Wallet', 'Amount', 'Type', showAll ? 'Description' : null, 'Date', 'Status'].filter(Boolean).map(h => (
            <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${colors.border}` }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
            <td style={{ padding: '12px', fontSize: '12px', color: colors.textSecondary, fontFamily: 'monospace' }}>{tx.from_wallet}</td>
            <td style={{ padding: '12px', fontSize: '12px', color: colors.textSecondary, fontFamily: 'monospace' }}>{tx.to_wallet}</td>
            <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700', color: '#1A73E8' }}>PKR {tx.amount?.toLocaleString()}</td>
            <td style={{ padding: '12px' }}>
              <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: tx.type === 'deposit' ? 'rgba(0,200,83,0.1)' : 'rgba(26,115,232,0.1)', color: tx.type === 'deposit' ? '#00C853' : '#1A73E8' }}>{tx.type}</span>
            </td>
            {showAll && <td style={{ padding: '12px', fontSize: '13px', color: colors.textSecondary }}>{tx.description || '-'}</td>}
            <td style={{ padding: '12px', fontSize: '12px', color: colors.textSecondary }}>
              {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) : 'N/A'}
            </td>
            <td style={{ padding: '12px' }}>
              <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: 'rgba(0,200,83,0.1)', color: '#00C853' }}>{tx.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}