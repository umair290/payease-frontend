import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { accountService } from '../services/api';
import {
  ArrowLeft, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownLeft, Target,
  BarChart2, Activity, Layers
} from 'lucide-react';
import {
  PieChart as RePie, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts';

const CATEGORY_CONFIG = {
  electricity: { label: 'Electricity', color: '#F59E0B', grad: 'linear-gradient(135deg,#F59E0B,#D97706)', icon: '⚡', bg: 'rgba(245,158,11,0.12)' },
  gas:         { label: 'Gas',         color: '#EA580C', grad: 'linear-gradient(135deg,#EA580C,#C2410C)', icon: '🔥', bg: 'rgba(234,88,12,0.12)' },
  internet:    { label: 'Internet',    color: '#1A73E8', grad: 'linear-gradient(135deg,#1A73E8,#0052CC)', icon: '📶', bg: 'rgba(26,115,232,0.12)' },
  topup:       { label: 'Mobile',      color: '#16A34A', grad: 'linear-gradient(135deg,#16A34A,#15803D)', icon: '📱', bg: 'rgba(22,163,74,0.12)' },
  transfer:    { label: 'Transfers',   color: '#7C3AED', grad: 'linear-gradient(135deg,#7C3AED,#5B21B6)', icon: '💸', bg: 'rgba(124,58,237,0.12)' },
  deposit:     { label: 'Deposits',    color: '#16A34A', grad: 'linear-gradient(135deg,#16A34A,#15803D)', icon: '💰', bg: 'rgba(22,163,74,0.12)' },
  bill:        { label: 'Bills',       color: '#EA580C', grad: 'linear-gradient(135deg,#EA580C,#C2410C)', icon: '🧾', bg: 'rgba(234,88,12,0.12)' },
  other:       { label: 'Other',       color: '#64748B', grad: 'linear-gradient(135deg,#64748B,#475569)', icon: '💳', bg: 'rgba(100,116,139,0.12)' },
};

function categorize(tx) {
  const t = tx.type?.toLowerCase() || '';
  if (t === 'deposit')     return 'deposit';
  if (t === 'electricity') return 'electricity';
  if (t === 'gas')         return 'gas';
  if (t === 'internet')    return 'internet';
  if (t === 'topup')       return 'topup';
  if (t === 'transfer')    return 'transfer';
  if (['electricity','gas','internet','topup'].some(b => tx.description?.toLowerCase().includes(b))) return 'bill';
  return 'other';
}

// ── Animated Number ──
function AnimNum({ value, prefix = '', suffix = '', color, size = '22px' }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current, end = value, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / 1000, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.floor(start + (end - start) * e));
      if (p < 1) requestAnimationFrame(tick);
      else { setDisplay(end); prev.current = end; }
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span style={{ color, fontSize: size, fontWeight: '800', letterSpacing: '-0.5px' }}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

// ── Tooltip ──
const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  const bg = isDark ? '#0F1629' : '#FFFFFF';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const text = isDark ? '#F0F6FC' : '#0F172A';
  const textSec = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8';
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '14px', padding: '12px 16px', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)' }}>
      <p style={{ color: textSec, fontSize: '11px', margin: '0 0 8px 0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: i < payload.length - 1 ? '4px' : 0 }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: p.color }} />
          <span style={{ color: text, fontSize: '12px', fontWeight: '700' }}>{p.name}: PKR {Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function Insights() {
  const { isDark } = useTheme();
  const navigate   = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [period,       setPeriod]       = useState('month');
  const [activeChart,  setActiveChart]  = useState('bar');

  const bg      = isDark ? '#0A0F1E' : '#F0F4FF';
  const card    = isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
  const border  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const text    = isDark ? '#F0F6FC' : '#0F172A';
  const textSec = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9';

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
    if (period === 'week')  return (now - d) <= 7 * 86400000;
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === 'year')  return d.getFullYear() === now.getFullYear();
    return true;
  });

  const debits  = filtered.filter(t => t.direction === 'debit');
  const credits = filtered.filter(t => t.direction === 'credit');
  const totalSpent    = debits.reduce((s, t) => s + t.amount, 0);
  const totalReceived = credits.reduce((s, t) => s + t.amount, 0);
  const netFlow = totalReceived - totalSpent;
  const savings = totalReceived > 0 ? Math.round((netFlow / totalReceived) * 100) : 0;

  const categoryMap = {};
  debits.forEach(tx => {
    const cat = categorize(tx);
    if (!categoryMap[cat]) categoryMap[cat] = 0;
    categoryMap[cat] += tx.amount;
  });
  const pieData = Object.entries(categoryMap)
    .map(([key, val]) => ({ name: CATEGORY_CONFIG[key]?.label || key, value: val, color: CATEGORY_CONFIG[key]?.color || '#888', key }))
    .sort((a, b) => b.value - a.value);

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthTxs = transactions.filter(tx => {
      const td = parseDate(tx.date || tx.created_at);
      return td && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    monthlyData.push({
      month:    d.toLocaleDateString('en-PK', { month: 'short' }),
      spent:    monthTxs.filter(t => t.direction === 'debit').reduce((s, t) => s + t.amount, 0),
      received: monthTxs.filter(t => t.direction === 'credit').reduce((s, t) => s + t.amount, 0),
    });
  }

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    const dayTxs = transactions.filter(tx => {
      const td = parseDate(tx.date || tx.created_at);
      return td && td.toDateString() === d.toDateString();
    });
    weeklyData.push({
      day:      days[d.getDay()],
      spent:    dayTxs.filter(t => t.direction === 'debit').reduce((s, t) => s + t.amount, 0),
      received: dayTxs.filter(t => t.direction === 'credit').reduce((s, t) => s + t.amount, 0),
    });
  }

  const chartData = period === 'week' ? weeklyData : monthlyData;
  const chartKey  = period === 'week' ? 'day' : 'month';
  const bigTx     = [...debits].sort((a, b) => b.amount - a.amount).slice(0, 4);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <motion.div
        style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(26,115,232,0.4)' }}
        animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
      >
        <BarChart2 size={28} color="#fff" />
      </motion.div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[0,1,2].map(i => (
          <motion.div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1A73E8' }}
            animate={{ opacity: [0.3,1,0.3], scale: [0.8,1.2,0.8] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: bg, maxWidth: '480px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* ── HERO HEADER ── */}
      <div style={{ background: 'linear-gradient(160deg,#1A1FEF 0%,#1A73E8 50%,#7C3AED 100%)', padding: '48px 20px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />

        {/* Back */}
        <motion.div
          style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '20px', position: 'relative', zIndex: 1 }}
          whileTap={{ scale: 0.88 }} onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={18} color="#fff" />
        </motion.div>

        {/* Title */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <BarChart2 size={18} color="#fff" />
            </div>
            <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>Spending Insights</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: '0 0 20px 0', fontWeight: '500' }}>
            {filtered.length} transactions · {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year'}
          </p>

          {/* Period tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '14px', padding: '4px', border: '1px solid rgba(255,255,255,0.15)', gap: '4px' }}>
            {[{ id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }, { id: 'year', label: 'Year' }].map(p => (
              <motion.button key={p.id}
                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '11px', cursor: 'pointer', background: period === p.id ? 'rgba(255,255,255,0.25)' : 'transparent', color: '#fff', fontSize: '13px', fontWeight: period === p.id ? '800' : '600', transition: 'all 0.2s', opacity: period === p.id ? 1 : 0.65, backdropFilter: period === p.id ? 'blur(4px)' : 'none', boxShadow: period === p.id ? '0 2px 12px rgba(0,0,0,0.15)' : 'none' }}
                whileTap={{ scale: 0.96 }} onClick={() => setPeriod(p.id)}
              >
                {p.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* ── NET FLOW CARD ── */}
        <motion.div
          style={{ background: 'linear-gradient(135deg,#0F1629 0%,#1a2544 100%)', borderRadius: '22px', padding: '20px', marginBottom: '14px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(26,115,232,0.2)', boxShadow: '0 16px 48px rgba(26,115,232,0.15)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        >
          {isDark ? null : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', opacity: 1, borderRadius: '22px' }} />}
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px 0' }}>Net Cash Flow</p>
                <div style={{ fontSize: '30px', fontWeight: '800', color: '#fff', letterSpacing: '-1px' }}>
                  <span style={{ fontSize: '18px', opacity: 0.7 }}>{netFlow >= 0 ? '+' : '-'} PKR </span>
                  <AnimNum value={Math.abs(netFlow)} color="#fff" size="28px" />
                </div>
              </div>
              <motion.div
                style={{ background: netFlow >= 0 ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)', borderRadius: '14px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid ${netFlow >= 0 ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}` }}
                animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity }}
              >
                {netFlow >= 0 ? <TrendingUp size={16} color="#4ADE80" /> : <TrendingDown size={16} color="#F87171" />}
                <span style={{ color: netFlow >= 0 ? '#4ADE80' : '#F87171', fontSize: '14px', fontWeight: '800' }}>
                  {savings >= 0 ? `+${savings}%` : `${savings}%`}
                </span>
              </motion.div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Received', value: totalReceived, color: '#4ADE80', count: credits.length, icon: <ArrowDownLeft size={11} color="#4ADE80" /> },
                { label: 'Spent',    value: totalSpent,    color: '#F87171', count: debits.length,  icon: <ArrowUpRight size={11} color="#F87171" /> },
                { label: 'Total',    value: filtered.length, color: '#fff', count: null, suffix: ' txns', noFormat: true },
              ].map((item, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', borderRadius: '14px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    {item.icon}
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
                  </div>
                  <p style={{ color: item.color, fontSize: '13px', fontWeight: '800', margin: '0 0 2px 0', letterSpacing: '-0.3px' }}>
                    {item.noFormat ? `${item.value}${item.suffix || ''}` : `PKR ${item.value.toLocaleString()}`}
                  </p>
                  {item.count !== null && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px', margin: 0 }}>{item.count} txns</p>}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── CHART CARD ── */}
        <motion.div
          style={{ background: card, borderRadius: '20px', padding: '18px', marginBottom: '14px', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: text, fontSize: '15px', fontWeight: '800', margin: '0 0 3px 0', letterSpacing: '-0.3px' }}>
                {period === 'week' ? 'Daily Activity' : '6-Month Trend'}
              </h3>
              <p style={{ color: textSec, fontSize: '11px', margin: 0, fontWeight: '500' }}>Income vs Spending</p>
            </div>
            {/* Chart type toggle */}
            <div style={{ display: 'flex', background: inputBg, borderRadius: '12px', padding: '3px', gap: '2px', border: `1px solid ${border}` }}>
              {[
                { id: 'bar',  icon: <BarChart2 size={14} /> },
                { id: 'area', icon: <Activity size={14} /> },
              ].map(c => (
                <motion.button key={c.id}
                  style={{ width: '34px', height: '34px', border: 'none', borderRadius: '10px', cursor: 'pointer', background: activeChart === c.id ? 'linear-gradient(135deg,#1A73E8,#7C3AED)' : 'transparent', color: activeChart === c.id ? '#fff' : textSec, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: activeChart === c.id ? '0 4px 12px rgba(26,115,232,0.35)' : 'none' }}
                  whileTap={{ scale: 0.9 }} onClick={() => setActiveChart(c.id)}
                >
                  {c.icon}
                </motion.button>
              ))}
            </div>
          </div>

          {chartData.every(d => d.spent === 0 && d.received === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>📊</div>
              <p style={{ color: textSec, fontSize: '13px', margin: 0, fontWeight: '500' }}>No data for this period</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={activeChart + period} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <ResponsiveContainer width="100%" height={200}>
                  {activeChart === 'bar' ? (
                    <BarChart data={chartData} barSize={10} barGap={3} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#DC2626" stopOpacity={1} />
                          <stop offset="100%" stopColor="#DC2626" stopOpacity={0.6} />
                        </linearGradient>
                        <linearGradient id="recvGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#16A34A" stopOpacity={1} />
                          <stop offset="100%" stopColor="#16A34A" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                      <XAxis dataKey={chartKey} tick={{ fontSize: 10, fill: textSec, fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: textSec }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip isDark={isDark} />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', radius: 6 }} />
                      <Bar dataKey="spent"    name="Spent"    fill="url(#spentGrad)" radius={[6,6,0,0]} />
                      <Bar dataKey="received" name="Received" fill="url(#recvGrad)"  radius={[6,6,0,0]} />
                    </BarChart>
                  ) : (
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="aSpent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#DC2626" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="aRecv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#16A34A" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                      <XAxis dataKey={chartKey} tick={{ fontSize: 10, fill: textSec, fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: textSec }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip isDark={isDark} />} />
                      <Area type="monotone" dataKey="spent"    stroke="#DC2626" fill="url(#aSpent)" strokeWidth={2.5} dot={{ r: 3, fill: '#DC2626', strokeWidth: 0 }} name="Spent" />
                      <Area type="monotone" dataKey="received" stroke="#16A34A" fill="url(#aRecv)"  strokeWidth={2.5} dot={{ r: 3, fill: '#16A34A', strokeWidth: 0 }} name="Received" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
            {[{ color: '#DC2626', label: 'Spent' }, { color: '#16A34A', label: 'Received' }].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: l.color }} />
                <span style={{ color: textSec, fontSize: '12px', fontWeight: '600' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── PIE BREAKDOWN ── */}
        {pieData.length > 0 && (
          <motion.div
            style={{ background: card, borderRadius: '20px', padding: '18px', marginBottom: '14px', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ color: text, fontSize: '15px', fontWeight: '800', margin: '0 0 3px 0', letterSpacing: '-0.3px' }}>Where Did It Go?</h3>
              <p style={{ color: textSec, fontSize: '11px', margin: 0, fontWeight: '500' }}>Spending breakdown by category</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Donut chart */}
              <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
                <ResponsiveContainer width={140} height={140}>
                  <RePie>
                    <Pie data={pieData} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={2} stroke={isDark ? '#0A0F1E' : '#F0F4FF'} animationBegin={0} animationDuration={900}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `PKR ${Number(v).toLocaleString()}`} contentStyle={{ background: isDark ? '#0F1629' : '#fff', border: `1px solid ${border}`, borderRadius: '10px', fontSize: '12px' }} />
                  </RePie>
                </ResponsiveContainer>
                {/* Center */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                  <p style={{ color: textSec, fontSize: '9px', margin: '0 0 2px 0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</p>
                  <p style={{ color: text, fontSize: '12px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
                    {(totalSpent / 1000).toFixed(1)}K
                  </p>
                </div>
              </div>

              {/* Category bars */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pieData.slice(0, 5).map((item, i) => {
                  const pct = totalSpent > 0 ? Math.round((item.value / totalSpent) * 100) : 0;
                  const cfg = CATEGORY_CONFIG[item.key] || CATEGORY_CONFIG.other;
                  return (
                    <motion.div key={i}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                    >
                      <span style={{ fontSize: '13px', flexShrink: 0 }}>{cfg.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span style={{ color: text, fontSize: '11px', fontWeight: '700' }}>{item.name}</span>
                          <span style={{ color: textSec, fontSize: '10px', fontWeight: '600' }}>{pct}%</span>
                        </div>
                        <div style={{ height: '5px', background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                          <motion.div
                            style={{ height: '100%', borderRadius: '3px', background: cfg.grad }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.9, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                      <span style={{ color: item.color, fontSize: '10px', fontWeight: '800', flexShrink: 0 }}>
                        {(item.value / 1000).toFixed(1)}K
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STATS GRID ── */}
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          {[
            { label: 'Avg. Transaction', value: debits.length > 0 ? Math.round(totalSpent / debits.length) : 0, icon: '📊', color: '#1A73E8', bg: isDark ? 'rgba(26,115,232,0.08)' : 'rgba(26,115,232,0.05)', brd: isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.12)', prefix: 'PKR ' },
            { label: 'Biggest Expense',  value: bigTx[0]?.amount || 0, icon: '🔝', color: '#DC2626', bg: isDark ? 'rgba(220,38,38,0.08)' : 'rgba(220,38,38,0.05)', brd: isDark ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.12)', prefix: 'PKR ' },
            { label: 'Categories',       value: pieData.length, icon: '🏷️', color: '#7C3AED', bg: isDark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.05)', brd: isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.12)', suffix: ' types' },
            { label: savings >= 0 ? 'Saving Rate' : 'Overspending', value: Math.abs(savings), icon: savings >= 0 ? '💎' : '⚠️', color: savings >= 0 ? '#16A34A' : '#DC2626', bg: savings >= 0 ? (isDark ? 'rgba(22,163,74,0.08)' : 'rgba(22,163,74,0.05)') : (isDark ? 'rgba(220,38,38,0.08)' : 'rgba(220,38,38,0.05)'), brd: savings >= 0 ? (isDark ? 'rgba(22,163,74,0.2)' : 'rgba(22,163,74,0.12)') : (isDark ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.12)'), suffix: '%' },
          ].map((stat, i) => (
            <motion.div key={i}
              style={{ background: stat.bg, borderRadius: '18px', padding: '16px', border: `1px solid ${stat.brd}` }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }}
            >
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>{stat.icon}</div>
              <p style={{ margin: '0 0 4px 0' }}>
                <AnimNum value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} color={stat.color} size="18px" />
              </p>
              <p style={{ color: textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── TOP EXPENSES ── */}
        {bigTx.length > 0 && (
          <motion.div
            style={{ background: card, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${border}`, marginBottom: '14px', boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          >
            <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={13} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ color: text, fontSize: '14px', fontWeight: '800', margin: 0, letterSpacing: '-0.2px' }}>Top Expenses</h3>
                <p style={{ color: textSec, fontSize: '10px', margin: 0, fontWeight: '500' }}>Largest transactions this period</p>
              </div>
            </div>

            {bigTx.map((tx, i) => {
              const cfg = CATEGORY_CONFIG[categorize(tx)] || CATEGORY_CONFIG.other;
              const pct = totalSpent > 0 ? (tx.amount / totalSpent) * 100 : 0;
              return (
                <motion.div key={i}
                  style={{ padding: '14px 18px', borderBottom: i < bigTx.length - 1 ? `1px solid ${border}` : 'none' }}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '13px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
                      {cfg.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: text, fontSize: '13px', fontWeight: '700', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tx.description || cfg.label}
                      </p>
                      <p style={{ color: textSec, fontSize: '11px', margin: 0 }}>
                        {parseDate(tx.date || tx.created_at)?.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                        <span style={{ marginLeft: '8px', color: cfg.color, fontWeight: '700' }}>{Math.round(pct)}% of spending</span>
                      </p>
                    </div>
                    <p style={{ color: '#DC2626', fontSize: '14px', fontWeight: '800', margin: 0, flexShrink: 0, letterSpacing: '-0.3px' }}>
                      PKR {tx.amount.toLocaleString()}
                    </p>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: '4px', background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: '3px', overflow: 'hidden', marginLeft: '52px' }}>
                    <motion.div
                      style={{ height: '100%', borderRadius: '3px', background: cfg.grad }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.08, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── EMPTY STATE ── */}
        {filtered.length === 0 && (
          <motion.div
            style={{ textAlign: 'center', padding: '60px 20px', background: card, borderRadius: '20px', border: `1px solid ${border}` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <motion.div
              style={{ fontSize: '52px', marginBottom: '16px', display: 'block' }}
              animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
            >
              📊
            </motion.div>
            <p style={{ color: text, fontSize: '17px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>No Data Yet</p>
            <p style={{ color: textSec, fontSize: '13px', margin: '0 0 20px 0', lineHeight: '1.6' }}>Make some transactions to see your spending insights here</p>
            <motion.button
              style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,115,232,0.35)' }}
              whileTap={{ scale: 0.97 }} onClick={() => navigate('/send')}
            >
              Send Money
            </motion.button>
          </motion.div>
        )}

        <div style={{ height: '40px' }} />
      </div>
    </div>
  );
}
