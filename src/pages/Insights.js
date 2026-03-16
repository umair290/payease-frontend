import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { accountService } from '../services/api';
import {
  ArrowLeft, TrendingUp, TrendingDown, Zap,
  Wifi, Wind, Phone, ArrowUpRight, ArrowDownLeft,
  Wallet, Calendar, BarChart2, PieChart, Target
} from 'lucide-react';
import {
  PieChart as RePie, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend
} from 'recharts';

const CATEGORY_CONFIG = {
  electricity: { label: 'Electricity', color: '#FFB300', icon: <Zap size={14} color="#FFB300" />, bg: 'rgba(255,179,0,0.1)' },
  gas:         { label: 'Gas',         color: '#FF6B35', icon: <Wind size={14} color="#FF6B35" />, bg: 'rgba(255,107,53,0.1)' },
  internet:    { label: 'Internet',    color: '#1A73E8', icon: <Wifi size={14} color="#1A73E8" />, bg: 'rgba(26,115,232,0.1)' },
  topup:       { label: 'Mobile',      color: '#00C853', icon: <Phone size={14} color="#00C853" />, bg: 'rgba(0,200,83,0.1)' },
  transfer:    { label: 'Transfers',   color: '#7C3AED', icon: <ArrowUpRight size={14} color="#7C3AED" />, bg: 'rgba(124,58,237,0.1)' },
  deposit:     { label: 'Deposits',    color: '#16A34A', icon: <ArrowDownLeft size={14} color="#16A34A" />, bg: 'rgba(22,163,74,0.1)' },
  other:       { label: 'Other',       color: '#6B7280', icon: <Wallet size={14} color="#6B7280" />, bg: 'rgba(107,114,128,0.1)' },
};

function categorize(tx) {
  if (tx.type === 'deposit') return 'deposit';
  if (tx.type === 'electricity') return 'electricity';
  if (tx.type === 'gas') return 'gas';
  if (tx.type === 'internet') return 'internet';
  if (tx.type === 'topup') return 'topup';
  if (tx.type === 'transfer') return 'transfer';
  return 'other';
}

const CustomTooltip = ({ active, payload, label, colors }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      <p style={{ color: colors.textSecondary, fontSize: '11px', margin: '0 0 4px 0', fontWeight: '600' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: '13px', fontWeight: '700', margin: '2px 0' }}>
          PKR {Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function Insights() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('month');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await accountService.getTransactions();
      setTransactions(res.data.transactions || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const parseDate = (d) => {
    if (!d) return null;
    try { return new Date(d.replace(' ', 'T')); } catch { return null; }
  };

  // Filter by period
  const now = new Date();
  const filtered = transactions.filter(tx => {
    const d = parseDate(tx.date || tx.created_at);
    if (!d) return false;
    if (period === 'week') return (now - d) <= 7 * 86400000;
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === 'year') return d.getFullYear() === now.getFullYear();
    return true;
  });

  const debits = filtered.filter(t => t.direction === 'debit');
  const credits = filtered.filter(t => t.direction === 'credit');

  const totalSpent = debits.reduce((s, t) => s + t.amount, 0);
  const totalReceived = credits.reduce((s, t) => s + t.amount, 0);
  const totalTx = filtered.length;

  // Category breakdown (spending only)
  const categoryMap = {};
  debits.forEach(tx => {
    const cat = categorize(tx);
    if (!categoryMap[cat]) categoryMap[cat] = 0;
    categoryMap[cat] += tx.amount;
  });

  const pieData = Object.entries(categoryMap)
    .map(([key, val]) => ({ name: CATEGORY_CONFIG[key]?.label || key, value: val, color: CATEGORY_CONFIG[key]?.color || '#888', key }))
    .sort((a, b) => b.value - a.value);

  // Monthly trend (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthTxs = transactions.filter(tx => {
      const td = parseDate(tx.date || tx.created_at);
      return td && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    const spent = monthTxs.filter(t => t.direction === 'debit').reduce((s, t) => s + t.amount, 0);
    const received = monthTxs.filter(t => t.direction === 'credit').reduce((s, t) => s + t.amount, 0);
    monthlyData.push({
      month: d.toLocaleDateString('en-PK', { month: 'short' }),
      spent, received
    });
  }

  // Daily breakdown for current period
  const dailyMap = {};
  filtered.forEach(tx => {
    const d = parseDate(tx.date || tx.created_at);
    if (!d) return;
    const key = d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
    if (!dailyMap[key]) dailyMap[key] = { day: key, spent: 0, received: 0 };
    if (tx.direction === 'debit') dailyMap[key].spent += tx.amount;
    else dailyMap[key].received += tx.amount;
  });
  const dailyData = Object.values(dailyMap).slice(-7);

  // Top spending categories
  const topCategories = pieData.slice(0, 4);

  // Recent big transactions
  const bigTx = [...debits].sort((a, b) => b.amount - a.amount).slice(0, 3);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: '36px', height: '36px', border: `3px solid ${colors.border}`, borderTop: '3px solid #1A73E8', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: colors.card, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <motion.div
          style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.actionBg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          whileTap={{ scale: 0.9 }} onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={20} color={colors.text} />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Spending Insights</h2>
          <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>Track your money flow</p>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Period Selector */}
      <div style={{ padding: '12px 16px', background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', background: colors.actionBg, borderRadius: '12px', padding: '4px', border: `1px solid ${colors.border}` }}>
          {[{ id: 'week', label: 'This Week' }, { id: 'month', label: 'This Month' }, { id: 'year', label: 'This Year' }].map(p => (
            <motion.button
              key={p.id}
              style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '10px', cursor: 'pointer', background: period === p.id ? '#1A73E8' : 'transparent', color: period === p.id ? '#fff' : colors.textSecondary, fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }}
              whileTap={{ scale: 0.97 }} onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <motion.div
            style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)', borderRadius: '16px', padding: '16px', position: 'relative', overflow: 'hidden' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <TrendingDown size={16} color="#fff" />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: '600', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Spent</p>
            <p style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>PKR {totalSpent.toLocaleString()}</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', margin: '4px 0 0 0' }}>{debits.length} transactions</p>
          </motion.div>

          <motion.div
            style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', borderRadius: '16px', padding: '16px', position: 'relative', overflow: 'hidden' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          >
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <TrendingUp size={16} color="#fff" />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: '600', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Received</p>
            <p style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>PKR {totalReceived.toLocaleString()}</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', margin: '4px 0 0 0' }}>{credits.length} transactions</p>
          </motion.div>
        </div>

        {/* Net Flow Card */}
        <motion.div
          style={{ background: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '14px' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: totalReceived - totalSpent >= 0 ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {totalReceived - totalSpent >= 0
              ? <TrendingUp size={22} color="#16A34A" />
              : <TrendingDown size={22} color="#DC2626" />
            }
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: colors.textSecondary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 3px 0' }}>Net Cash Flow</p>
            <p style={{ color: totalReceived - totalSpent >= 0 ? '#16A34A' : '#DC2626', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
              {totalReceived - totalSpent >= 0 ? '+' : '-'} PKR {Math.abs(totalReceived - totalSpent).toLocaleString()}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: colors.textSecondary, fontSize: '11px', margin: '0 0 3px 0' }}>Transactions</p>
            <p style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{totalTx}</p>
          </div>
        </motion.div>

        {/* Monthly Trend Chart */}
        <motion.div
          style={{ background: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${colors.border}` }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '700', margin: '0 0 2px 0' }}>6-Month Trend</h3>
              <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>Spending vs Income</p>
            </div>
            <BarChart2 size={18} color={colors.textSecondary} />
          </div>
          {monthlyData.every(d => d.spent === 0 && d.received === 0) ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ color: colors.textSecondary, fontSize: '13px', margin: 0 }}>No data available yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthlyData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: colors.textSecondary }} />
                <YAxis tick={{ fontSize: 9, fill: colors.textSecondary }} />
                <Tooltip content={<CustomTooltip colors={colors} />} />
                <Bar dataKey="spent" name="Spent" fill="#DC2626" radius={[4, 4, 0, 0]} opacity={0.85} />
                <Bar dataKey="received" name="Received" fill="#16A34A" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px' }}>
            {[{ color: '#DC2626', label: 'Spent' }, { color: '#16A34A', label: 'Received' }].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: l.color }} />
                <span style={{ color: colors.textSecondary, fontSize: '11px' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Spending by Category Pie */}
        {pieData.length > 0 && (
          <motion.div
            style={{ background: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${colors.border}` }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '700', margin: '0 0 2px 0' }}>Spending Breakdown</h3>
                <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>By category</p>
              </div>
              <PieChart size={18} color={colors.textSecondary} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <ResponsiveContainer width={130} height={130}>
                <RePie>
                  <Pie data={pieData} cx={60} cy={60} innerRadius={35} outerRadius={60} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `PKR ${Number(v).toLocaleString()}`} />
                </RePie>
              </ResponsiveContainer>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pieData.slice(0, 5).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color, flexShrink: 0 }} />
                    <span style={{ color: colors.textSecondary, fontSize: '11px', flex: 1 }}>{item.name}</span>
                    <span style={{ color: colors.text, fontSize: '11px', fontWeight: '700' }}>
                      {totalSpent > 0 ? Math.round((item.value / totalSpent) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Cards */}
        {topCategories.length > 0 && (
          <motion.div
            style={{ background: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${colors.border}` }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          >
            <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '700', margin: '0 0 14px 0' }}>Top Categories</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topCategories.map((cat, i) => {
                const pct = totalSpent > 0 ? (cat.value / totalSpent) * 100 : 0;
                const cfg = CATEGORY_CONFIG[cat.key] || CATEGORY_CONFIG.other;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {cfg.icon}
                        </div>
                        <span style={{ color: colors.text, fontSize: '13px', fontWeight: '600' }}>{cat.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: colors.text, fontSize: '13px', fontWeight: '700' }}>PKR {cat.value.toLocaleString()}</span>
                        <span style={{ color: colors.textSecondary, fontSize: '11px', marginLeft: '6px' }}>{Math.round(pct)}%</span>
                      </div>
                    </div>
                    <div style={{ height: '6px', background: colors.actionBg, borderRadius: '3px', overflow: 'hidden' }}>
                      <motion.div
                        style={{ height: '100%', borderRadius: '3px', background: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Daily Activity Line Chart */}
        {dailyData.length > 1 && (
          <motion.div
            style={{ background: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${colors.border}` }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          >
            <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>Daily Activity</h3>
            <p style={{ color: colors.textSecondary, fontSize: '11px', margin: '0 0 14px 0' }}>Last 7 days</p>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: colors.textSecondary }} />
                <YAxis tick={{ fontSize: 9, fill: colors.textSecondary }} />
                <Tooltip content={<CustomTooltip colors={colors} />} />
                <Line type="monotone" dataKey="spent" stroke="#DC2626" strokeWidth={2} dot={{ r: 3, fill: '#DC2626' }} name="Spent" />
                <Line type="monotone" dataKey="received" stroke="#16A34A" strokeWidth={2} dot={{ r: 3, fill: '#16A34A' }} name="Received" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Biggest Transactions */}
        {bigTx.length > 0 && (
          <motion.div
            style={{ background: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '80px', border: `1px solid ${colors.border}` }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          >
            <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '700', margin: '0 0 14px 0' }}>Biggest Expenses</h3>
            {bigTx.map((tx, i) => {
              const cfg = CATEGORY_CONFIG[categorize(tx)] || CATEGORY_CONFIG.other;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < bigTx.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.description || cfg.label}
                    </p>
                    <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>
                      {parseDate(tx.date)?.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <p style={{ color: '#DC2626', fontSize: '14px', fontWeight: '700', margin: 0, flexShrink: 0 }}>
                    - PKR {tx.amount.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            style={{ textAlign: 'center', padding: '60px 20px', background: colors.card, borderRadius: '20px', border: `1px solid ${colors.border}` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <BarChart2 size={28} color={colors.textSecondary} />
            </div>
            <p style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: '0 0 6px 0' }}>No data yet</p>
            <p style={{ color: colors.textSecondary, fontSize: '13px', margin: 0 }}>Make transactions to see insights</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}