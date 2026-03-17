import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { accountService } from '../services/api';
import {
  ArrowLeft, TrendingUp, TrendingDown, Zap,
  Wifi, Wind, Phone, ArrowUpRight, ArrowDownLeft,
  Wallet, Calendar, BarChart2, Target, Sparkles
} from 'lucide-react';
import {
  PieChart as RePie, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart
} from 'recharts';

const CATEGORY_CONFIG = {
  electricity: { label: 'Electricity', color: '#FFB300', icon: '⚡', bg: 'rgba(255,179,0,0.12)' },
  gas:         { label: 'Gas',         color: '#FF6B35', icon: '🔥', bg: 'rgba(255,107,53,0.12)' },
  internet:    { label: 'Internet',    color: '#1A73E8', icon: '📶', bg: 'rgba(26,115,232,0.12)' },
  topup:       { label: 'Mobile',      color: '#00C853', icon: '📱', bg: 'rgba(0,200,83,0.12)' },
  transfer:    { label: 'Transfers',   color: '#7C3AED', icon: '💸', bg: 'rgba(124,58,237,0.12)' },
  deposit:     { label: 'Deposits',    color: '#16A34A', icon: '💰', bg: 'rgba(22,163,74,0.12)' },
  bill:        { label: 'Bills',       color: '#EA580C', icon: '🧾', bg: 'rgba(234,88,12,0.12)' },
  other:       { label: 'Other',       color: '#6B7280', icon: '💳', bg: 'rgba(107,114,128,0.12)' },
};

function categorize(tx) {
  const t = tx.type?.toLowerCase() || '';
  if (t === 'deposit') return 'deposit';
  if (t === 'electricity') return 'electricity';
  if (t === 'gas') return 'gas';
  if (t === 'internet') return 'internet';
  if (t === 'topup') return 'topup';
  if (t === 'transfer') return 'transfer';
  if (['electricity','gas','internet','topup'].some(b => tx.description?.toLowerCase().includes(b))) return 'bill';
  return 'other';
}

const CustomTooltip = ({ active, payload, label, colors }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
      <p style={{ color: colors.textSecondary, fontSize: '11px', margin: '0 0 6px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: '13px', fontWeight: '700', margin: '2px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: p.color, display: 'inline-block' }} />
          {p.name}: PKR {Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const AnimatedCounter = ({ value, prefix = '', suffix = '', color, fontSize = '22px' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    const duration = 1000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <span style={{ color, fontSize, fontWeight: 'bold' }}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export default function Insights() {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [activeChart, setActiveChart] = useState('bar');

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
  const netFlow = totalReceived - totalSpent;
  const savings = totalReceived > 0 ? Math.round((netFlow / totalReceived) * 100) : 0;

  // Category breakdown
  const categoryMap = {};
  debits.forEach(tx => {
    const cat = categorize(tx);
    if (!categoryMap[cat]) categoryMap[cat] = 0;
    categoryMap[cat] += tx.amount;
  });
  const pieData = Object.entries(categoryMap)
    .map(([key, val]) => ({ name: CATEGORY_CONFIG[key]?.label || key, value: val, color: CATEGORY_CONFIG[key]?.color || '#888', key }))
    .sort((a, b) => b.value - a.value);

  // Monthly trend (6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthTxs = transactions.filter(tx => {
      const td = parseDate(tx.date || tx.created_at);
      return td && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    const spent = monthTxs.filter(t => t.direction === 'debit').reduce((s, t) => s + t.amount, 0);
    const received = monthTxs.filter(t => t.direction === 'credit').reduce((s, t) => s + t.amount, 0);
    monthlyData.push({ month: d.toLocaleDateString('en-PK', { month: 'short' }), spent, received });
  }

  // Weekly data
  const weeklyData = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayTxs = transactions.filter(tx => {
      const td = parseDate(tx.date || tx.created_at);
      return td && td.toDateString() === d.toDateString();
    });
    const spent = dayTxs.filter(t => t.direction === 'debit').reduce((s, t) => s + t.amount, 0);
    const received = dayTxs.filter(t => t.direction === 'credit').reduce((s, t) => s + t.amount, 0);
    weeklyData.push({ day: days[d.getDay()], spent, received });
  }

  const chartData = period === 'week' ? weeklyData : monthlyData;
  const chartKey = period === 'week' ? 'day' : 'month';
  const topCategories = pieData.slice(0, 5);
  const bigTx = [...debits].sort((a, b) => b.amount - a.amount).slice(0, 4);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: '36px', height: '36px', border: `3px solid ${colors.border}`, borderTop: '3px solid #1A73E8', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ background: colors.card, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 12px' }}>
          <motion.div
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.actionBg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            whileTap={{ scale: 0.9 }} onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={20} color={colors.text} />
          </motion.div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Spending Insights</h2>
            <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>
              {filtered.length} transactions · {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year'}
            </p>
          </div>
          <div style={{ width: 36 }} />
        </div>

        {/* Period Tabs */}
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ display: 'flex', background: colors.actionBg, borderRadius: '12px', padding: '3px', border: `1px solid ${colors.border}` }}>
            {[
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' },
              { id: 'year', label: 'Year' },
            ].map(p => (
              <motion.button
                key={p.id}
                style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '10px', cursor: 'pointer', background: period === p.id ? '#1A73E8' : 'transparent', color: period === p.id ? '#fff' : colors.textSecondary, fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', position: 'relative' }}
                whileTap={{ scale: 0.97 }} onClick={() => setPeriod(p.id)}
              >
                {period === p.id && (
                  <motion.div
                    layoutId="period-indicator"
                    style={{ position: 'absolute', inset: 0, borderRadius: '10px', background: '#1A73E8', zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {p.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Hero Summary Cards */}
        <motion.div
          style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', borderRadius: '20px', padding: '20px', marginBottom: '14px', position: 'relative', overflow: 'hidden' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', left: '20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px 0' }}>Net Cash Flow</p>
              <div style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>
                {netFlow >= 0 ? '+' : '-'} PKR {Math.abs(netFlow).toLocaleString()}
              </div>
            </div>
            <div style={{ background: netFlow >= 0 ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.25)', borderRadius: '12px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {netFlow >= 0 ? <TrendingUp size={16} color="#4ADE80" /> : <TrendingDown size={16} color="#F87171" />}
              <span style={{ color: netFlow >= 0 ? '#4ADE80' : '#F87171', fontSize: '13px', fontWeight: '700' }}>
                {savings >= 0 ? `${savings}%` : `${Math.abs(savings)}%`}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                <ArrowDownLeft size={12} color="rgba(255,255,255,0.7)" />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Received</span>
              </div>
              <p style={{ color: '#4ADE80', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>PKR {totalReceived.toLocaleString()}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', margin: '2px 0 0 0' }}>{credits.length} txns</p>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                <ArrowUpRight size={12} color="rgba(255,255,255,0.7)" />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Spent</span>
              </div>
              <p style={{ color: '#F87171', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>PKR {totalSpent.toLocaleString()}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', margin: '2px 0 0 0' }}>{debits.length} txns</p>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                <Target size={12} color="rgba(255,255,255,0.7)" />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Total</span>
              </div>
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>{filtered.length}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', margin: '2px 0 0 0' }}>transactions</p>
            </div>
          </div>
        </motion.div>

        {/* Chart Toggle + Chart */}
        <motion.div
          style={{ background: colors.card, borderRadius: '20px', padding: '16px', marginBottom: '14px', border: `1px solid ${colors.border}` }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '700', margin: '0 0 2px 0' }}>
                {period === 'week' ? 'Daily Activity' : '6-Month Trend'}
              </h3>
              <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>Income vs Spending</p>
            </div>
            {/* Chart Type Toggle */}
            <div style={{ display: 'flex', background: colors.actionBg, borderRadius: '10px', padding: '3px', gap: '2px', border: `1px solid ${colors.border}` }}>
              {[
                { id: 'bar', label: '▐▌' },
                { id: 'area', label: '∿' },
              ].map(c => (
                <motion.button
                  key={c.id}
                  style={{ padding: '5px 10px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeChart === c.id ? '#1A73E8' : 'transparent', color: activeChart === c.id ? '#fff' : colors.textSecondary, fontSize: '13px', fontWeight: '700', transition: 'all 0.2s' }}
                  whileTap={{ scale: 0.9 }} onClick={() => setActiveChart(c.id)}
                >
                  {c.label}
                </motion.button>
              ))}
            </div>
          </div>

          {chartData.every(d => d.spent === 0 && d.received === 0) ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ color: colors.textSecondary, fontSize: '13px', margin: 0 }}>No transaction data for this period</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeChart + period}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ResponsiveContainer width="100%" height={180}>
                  {activeChart === 'bar' ? (
                    <BarChart data={chartData} barSize={10} barGap={2}>
                      <defs>
                        <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#DC2626" stopOpacity={1} />
                          <stop offset="100%" stopColor="#DC2626" stopOpacity={0.7} />
                        </linearGradient>
                        <linearGradient id="receivedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#16A34A" stopOpacity={1} />
                          <stop offset="100%" stopColor="#16A34A" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                      <XAxis dataKey={chartKey} tick={{ fontSize: 10, fill: colors.textSecondary }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: colors.textSecondary }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip colors={colors} />} cursor={{ fill: colors.actionBg, radius: 4 }} />
                      <Bar dataKey="spent" name="Spent" fill="url(#spentGrad)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="received" name="Received" fill="url(#receivedGrad)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="areaSpent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="areaReceived" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                      <XAxis dataKey={chartKey} tick={{ fontSize: 10, fill: colors.textSecondary }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: colors.textSecondary }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip colors={colors} />} />
                      <Area type="monotone" dataKey="spent" stroke="#DC2626" fill="url(#areaSpent)" strokeWidth={2.5} dot={{ r: 3, fill: '#DC2626' }} name="Spent" />
                      <Area type="monotone" dataKey="received" stroke="#16A34A" fill="url(#areaReceived)" strokeWidth={2.5} dot={{ r: 3, fill: '#16A34A' }} name="Received" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
            {[{ color: '#DC2626', label: 'Spent' }, { color: '#16A34A', label: 'Received' }].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: l.color }} />
                <span style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '500' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Spending Breakdown Pie */}
        {pieData.length > 0 && (
          <motion.div
            style={{ background: colors.card, borderRadius: '20px', padding: '16px', marginBottom: '14px', border: `1px solid ${colors.border}` }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '700', margin: '0 0 2px 0' }}>Where Did It Go?</h3>
                <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>Spending by category</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
                <ResponsiveContainer width={140} height={140}>
                  <RePie>
                    <Pie data={pieData} cx={65} cy={65} innerRadius={38} outerRadius={65} dataKey="value" strokeWidth={2} stroke={colors.card}
                      animationBegin={0} animationDuration={800}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `PKR ${Number(v).toLocaleString()}`} contentStyle={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '8px' }} />
                  </RePie>
                </ResponsiveContainer>
                {/* Center label */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <p style={{ color: colors.textSecondary, fontSize: '9px', margin: '0 0 2px 0', fontWeight: '600', textTransform: 'uppercase' }}>Total</p>
                  <p style={{ color: colors.text, fontSize: '12px', fontWeight: 'bold', margin: 0 }}>
                    PKR {(totalSpent / 1000).toFixed(1)}K
                  </p>
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {pieData.slice(0, 5).map((item, i) => {
                  const pct = totalSpent > 0 ? Math.round((item.value / totalSpent) * 100) : 0;
                  const cfg = CATEGORY_CONFIG[item.key] || CATEGORY_CONFIG.other;
                  return (
                    <motion.div
                      key={i}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                    >
                      <span style={{ fontSize: '14px' }}>{cfg.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ color: colors.text, fontSize: '11px', fontWeight: '600' }}>{item.name}</span>
                          <span style={{ color: colors.textSecondary, fontSize: '10px' }}>{pct}%</span>
                        </div>
                        <div style={{ height: '4px', background: colors.actionBg, borderRadius: '2px', overflow: 'hidden' }}>
                          <motion.div
                            style={{ height: '100%', borderRadius: '2px', background: item.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                      <span style={{ color: item.color, fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>
                        {(item.value / 1000).toFixed(1)}K
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          {[
            {
              label: 'Avg. per Transaction',
              value: debits.length > 0 ? Math.round(totalSpent / debits.length) : 0,
              icon: '📊', color: '#1A73E8', bg: 'rgba(26,115,232,0.06)',
              border: 'rgba(26,115,232,0.15)', prefix: 'PKR '
            },
            {
              label: 'Biggest Expense',
              value: bigTx[0]?.amount || 0,
              icon: '🔝', color: '#DC2626', bg: 'rgba(220,38,38,0.06)',
              border: 'rgba(220,38,38,0.15)', prefix: 'PKR '
            },
            {
              label: 'Categories Used',
              value: pieData.length,
              icon: '🏷️', color: '#7C3AED', bg: 'rgba(124,58,237,0.06)',
              border: 'rgba(124,58,237,0.15)', suffix: ' types'
            },
            {
              label: savings >= 0 ? 'Saving Rate' : 'Over-spending',
              value: Math.abs(savings),
              icon: savings >= 0 ? '💎' : '⚠️',
              color: savings >= 0 ? '#16A34A' : '#DC2626',
              bg: savings >= 0 ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.06)',
              border: savings >= 0 ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
              suffix: '%'
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              style={{ background: stat.bg, borderRadius: '16px', padding: '14px', border: `1px solid ${stat.border}` }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }}
            >
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{stat.icon}</div>
              <p style={{ color: stat.color, fontSize: '16px', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                {stat.prefix || ''}{stat.value.toLocaleString()}{stat.suffix || ''}
              </p>
              <p style={{ color: colors.textSecondary, fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0 }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Biggest Expenses */}
        {bigTx.length > 0 && (
          <motion.div
            style={{ background: colors.card, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${colors.border}`, marginBottom: '80px' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          >
            <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${colors.border}` }}>
              <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '700', margin: '0 0 2px 0' }}>Top Expenses</h3>
              <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>Largest transactions this period</p>
            </div>
            {bigTx.map((tx, i) => {
              const cfg = CATEGORY_CONFIG[categorize(tx)] || CATEGORY_CONFIG.other;
              const pct = totalSpent > 0 ? (tx.amount / totalSpent) * 100 : 0;
              return (
                <motion.div
                  key={i}
                  style={{ padding: '12px 16px', borderBottom: i < bigTx.length - 1 ? `1px solid ${colors.border}` : 'none' }}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                      {cfg.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tx.description || cfg.label}
                      </p>
                      <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>
                        {parseDate(tx.date)?.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                        <span style={{ marginLeft: '6px', color: cfg.color, fontWeight: '600' }}>{Math.round(pct)}% of spending</span>
                      </p>
                    </div>
                    <p style={{ color: '#DC2626', fontSize: '14px', fontWeight: '700', margin: 0, flexShrink: 0 }}>
                      PKR {tx.amount.toLocaleString()}
                    </p>
                  </div>
                  <div style={{ height: '3px', background: colors.actionBg, borderRadius: '2px', overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', borderRadius: '2px', background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: 0.5 + i * 0.08, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
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
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
            <p style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: '0 0 6px 0' }}>No data for this period</p>
            <p style={{ color: colors.textSecondary, fontSize: '13px', margin: 0 }}>Make some transactions to see insights</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}