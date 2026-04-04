import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  LayoutDashboard, Users, FileCheck, ArrowLeftRight,
  LogOut, Shield, CheckCircle, XCircle, Eye,
  ChevronRight, Bell, DollarSign, Activity,
  UserCheck, Sun, Moon, Menu, X,
  AlertTriangle, RefreshCw, Search, Zap, Globe,
  Lock, Clock, Settings, BarChart2,
  CreditCard, ShieldCheck, AlertCircle, Trash2,
  Edit2, Activity as ActivityIcon, ClipboardList,
  Download, Printer, MapPin, Monitor, Smartphone,
  Copy, ArrowDownLeft, ArrowUpRight as ArrowUp,
  Palette, Upload
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line
} from 'recharts';

// ─────────────────────────────────────────────
// COLOR SYSTEM
// ─────────────────────────────────────────────
const C = {
  dark: {
    bg: '#0B0F1A', sidebar: '#080C15', card: '#111827',
    cardAlt: '#1a2235', text: '#F1F5F9', textSec: '#64748B',
    border: '#1E293B', topBar: '#0D1117', inputBg: '#0D1117',
    hover: 'rgba(255,255,255,0.03)',
  },
  light: {
    bg: '#F8FAFC', sidebar: '#0F172A', card: '#FFFFFF',
    cardAlt: '#F1F5F9', text: '#0F172A', textSec: '#64748B',
    border: '#E2E8F0', topBar: '#FFFFFF', inputBg: '#F8FAFC',
    hover: '#F8FAFC',
  }
};

const WEEK = [
  { day: 'Mon', volume: 45000, txns: 12 },
  { day: 'Tue', volume: 62000, txns: 18 },
  { day: 'Wed', volume: 38000, txns: 9  },
  { day: 'Thu', volume: 78000, txns: 24 },
  { day: 'Fri', volume: 55000, txns: 16 },
  { day: 'Sat', volume: 92000, txns: 31 },
  { day: 'Sun', volume: 67000, txns: 22 },
];
const MONTH = [
  { m: 'Sep', volume: 320000 }, { m: 'Oct', volume: 410000 },
  { m: 'Nov', volume: 380000 }, { m: 'Dec', volume: 520000 },
  { m: 'Jan', volume: 490000 }, { m: 'Feb', volume: 610000 },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const fmt    = (n) => Number(n || 0).toLocaleString();
const fmtPKR = (n) => `PKR ${fmt(n)}`;

const TX_ID = (id, created_at) => {
  const ts  = created_at ? new Date(created_at).getTime() : Date.now();
  const pad = String(id || 0).padStart(6, '0');
  return `TXN-${pad}-${String(ts).slice(-6)}`;
};

// ── Detect if a Cloudinary URL is a video (liveness recording) ──
const isVideoUrl = (url) => {
  if (!url) return false;
  return (
    url.includes('.webm') ||
    url.includes('.mp4')  ||
    url.includes('.mov')  ||
    url.includes('/video/upload/')
  );
};

const printReceipt = (tx) => {
  const txId = TX_ID(tx.id, tx.created_at);
  const date = tx.created_at
    ? new Date(tx.created_at).toLocaleString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'N/A';
  const html = `<!DOCTYPE html><html><head><title>PayEase Receipt — ${txId}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,sans-serif;background:#f0f4ff;padding:40px 20px;display:flex;justify-content:center}
    .r{background:#fff;border-radius:20px;width:100%;max-width:420px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.12)}
    .h{background:linear-gradient(135deg,#1A73E8,#7C3AED);padding:32px;text-align:center}
    .logo{color:#fff;font-size:24px;font-weight:800;margin-bottom:6px;letter-spacing:-0.5px}
    .subtitle{color:rgba(255,255,255,.65);font-size:12px;margin-bottom:20px}
    .amt{color:#fff;font-size:36px;font-weight:800;letter-spacing:-1px}
    .status-badge{display:inline-block;background:rgba(255,255,255,.2);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;margin-top:10px;border:1px solid rgba(255,255,255,.25)}
    .b{padding:24px}
    .row{display:flex;justify-content:space-between;align-items:flex-start;padding:11px 0;border-bottom:1px solid #f0f4ff}
    .row:last-child{border:none}
    .lbl{color:#888;font-size:12px;font-weight:500}
    .val{font-size:12px;font-weight:700;color:#1A1A2E;text-align:right;max-width:220px;word-break:break-all}
    .txid{color:#1A73E8;font-family:monospace;font-size:11px;letter-spacing:0.3px}
    .f{background:#f8faff;border-top:1px solid #e0e6f0;padding:16px;text-align:center;color:#aab;font-size:10px;line-height:1.6}
    @media print{body{background:white;padding:0}.r{box-shadow:none;border-radius:0}}
  </style></head>
  <body><div class="r">
    <div class="h">
      <div class="logo">PayEase</div>
      <div class="subtitle">Digital Wallet & Payment Services</div>
      <div class="amt">${fmtPKR(tx.amount)}</div>
      <div class="status-badge">✓ Transaction Successful</div>
    </div>
    <div class="b">
      <div class="row"><span class="lbl">Transaction ID</span><span class="val txid">${txId}</span></div>
      <div class="row"><span class="lbl">Type</span><span class="val">${(tx.type || '').toUpperCase()}</span></div>
      <div class="row"><span class="lbl">From Wallet</span><span class="val">${tx.from_wallet || '—'}</span></div>
      <div class="row"><span class="lbl">To Wallet</span><span class="val">${tx.to_wallet || '—'}</span></div>
      <div class="row"><span class="lbl">Description</span><span class="val">${tx.description || '—'}</span></div>
      <div class="row"><span class="lbl">Amount</span><span class="val" style="color:#1A73E8;font-size:14px;font-weight:800">${fmtPKR(tx.amount)}</span></div>
      <div class="row"><span class="lbl">Direction</span><span class="val">${(tx.direction || 'debit').toUpperCase()}</span></div>
      <div class="row"><span class="lbl">Status</span><span class="val" style="color:#16A34A">${(tx.status || 'success').toUpperCase()}</span></div>
      <div class="row"><span class="lbl">Date & Time</span><span class="val">${date}</span></div>
    </div>
    <div class="f">
      PayEase Digital Wallet · payease.space<br>
      This is an official transaction receipt.<br>
      Keep this for your records.
    </div>
  </div></body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 600);
};

const exportCSV = (transactions) => {
  const headers = ['Transaction ID', 'Type', 'Direction', 'From Wallet', 'To Wallet', 'Amount (PKR)', 'Status', 'Description', 'Date'];
  const rows    = transactions.map(tx => [
    TX_ID(tx.id, tx.created_at),
    tx.type || '',
    tx.direction || 'debit',
    tx.from_wallet || '',
    tx.to_wallet   || '',
    tx.amount || 0,
    tx.status || 'success',
    tx.description || '',
    tx.created_at  || '',
  ]);
  const csv  = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `payease-transactions-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────
// SHARED MINI COMPONENTS
// ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    active:   { color: '#16A34A', bg: 'rgba(22,163,74,.1)',   border: 'rgba(22,163,74,.2)'   },
    blocked:  { color: '#DC2626', bg: 'rgba(220,38,38,.1)',   border: 'rgba(220,38,38,.2)'   },
    verified: { color: '#16A34A', bg: 'rgba(22,163,74,.1)',   border: 'rgba(22,163,74,.2)'   },
    pending:  { color: '#CA8A04', bg: 'rgba(202,138,4,.1)',   border: 'rgba(202,138,4,.2)'   },
    approved: { color: '#16A34A', bg: 'rgba(22,163,74,.1)',   border: 'rgba(22,163,74,.2)'   },
    rejected: { color: '#DC2626', bg: 'rgba(220,38,38,.1)',   border: 'rgba(220,38,38,.2)'   },
    success:  { color: '#16A34A', bg: 'rgba(22,163,74,.1)',   border: 'rgba(22,163,74,.2)'   },
    transfer: { color: '#1A73E8', bg: 'rgba(26,115,232,.1)',  border: 'rgba(26,115,232,.2)'  },
    deposit:  { color: '#16A34A', bg: 'rgba(22,163,74,.1)',   border: 'rgba(22,163,74,.2)'   },
    bill:     { color: '#EA580C', bg: 'rgba(234,88,12,.1)',   border: 'rgba(234,88,12,.2)'   },
  };
  const s = map[status?.toLowerCase()] || { color: '#64748B', bg: 'rgba(100,116,139,.1)', border: 'rgba(100,116,139,.2)' };
  return (
    <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', color: s.color, background: s.bg, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
};

const ChartTip = ({ active, payload, label, c }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: '10px', padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>
      <p style={{ color: c.textSec, fontSize: '10px', margin: '0 0 6px', fontWeight: '700', textTransform: 'uppercase' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: '12px', fontWeight: '700', margin: '2px 0' }}>
          {p.name}: {typeof p.value === 'number' && p.name !== 'txns' ? fmtPKR(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// TRANSACTION DETAIL MODAL
// ─────────────────────────────────────────────
const TxModal = ({ tx, onClose, c }) => {
  if (!tx) return null;
  const txId = TX_ID(tx.id, tx.created_at);
  const date = tx.created_at
    ? new Date(tx.created_at).toLocaleString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'N/A';
  const grad = tx.type === 'deposit'
    ? 'linear-gradient(135deg,#134E5E,#16A34A)'
    : tx.type === 'transfer'
    ? 'linear-gradient(135deg,#1A1FEF,#1A73E8)'
    : 'linear-gradient(135deg,#9A3412,#EA580C)';
  const copy = (text) => { try { navigator.clipboard.writeText(text); } catch(e) {} };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }} onClick={onClose}>
      <div style={{ background: c.card, borderRadius: '20px', width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.6)', border: `1px solid ${c.border}` }} onClick={e => e.stopPropagation()}>
        <div style={{ background: grad, padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)' }} />
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>Transaction Receipt</p>
              <p style={{ color: '#fff', fontSize: '28px', fontWeight: '800', margin: '0 0 6px', letterSpacing: '-1px' }}>{fmtPKR(tx.amount)}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <code style={{ color: 'rgba(255,255,255,.6)', fontSize: '11px', background: 'rgba(0,0,0,.2)', padding: '2px 8px', borderRadius: '5px' }}>{txId}</code>
                <button onClick={() => copy(txId)} style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)', borderRadius: '4px', padding: '2px 7px', cursor: 'pointer', color: '#fff', fontSize: '10px', fontWeight: '700' }}>Copy</button>
              </div>
            </div>
            <button onClick={onClose} style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X size={15} color="#fff" />
            </button>
          </div>
        </div>
        <div>
          {[
            { label: 'Transaction ID', value: txId,                     mono: true, copy: true },
            { label: 'Type',           value: tx.type?.toUpperCase()                           },
            { label: 'Direction',      value: (tx.direction || 'debit').toUpperCase(), dir: true },
            { label: 'From Wallet',    value: tx.from_wallet || '—',    mono: true             },
            { label: 'To Wallet',      value: tx.to_wallet   || '—',    mono: true             },
            { label: 'Amount',         value: fmtPKR(tx.amount),        highlight: true        },
            { label: 'Status',         value: tx.status || 'success',   isStatus: true         },
            { label: 'Description',    value: tx.description || '—'                            },
            { label: 'Date & Time',    value: date                                             },
          ].map((row, i, arr) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
              <span style={{ color: c.textSec, fontSize: '12px', fontWeight: '500', flexShrink: 0, minWidth: '110px' }}>{row.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                {row.isStatus ? <StatusBadge status={row.value} /> :
                  row.dir ? (
                    <span style={{ color: row.value === 'CREDIT' ? '#16A34A' : '#DC2626', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {row.value === 'CREDIT' ? <ArrowDownLeft size={12} /> : <ArrowUp size={12} />} {row.value}
                    </span>
                  ) : (
                    <span style={{ color: row.highlight ? '#1A73E8' : c.text, fontSize: '12px', fontWeight: row.highlight ? '800' : '600', fontFamily: row.mono ? 'monospace' : 'inherit', maxWidth: '240px', textAlign: 'right', wordBreak: 'break-all' }}>
                      {row.value}
                    </span>
                  )
                }
                {row.copy && (
                  <button onClick={() => copy(row.value)} style={{ background: c.cardAlt, border: `1px solid ${c.border}`, borderRadius: '5px', padding: '2px 7px', cursor: 'pointer', color: c.textSec, fontSize: '10px', fontWeight: '600' }}>Copy</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 24px', display: 'flex', gap: '8px', borderTop: `1px solid ${c.border}`, background: c.cardAlt }}>
          <button onClick={() => printReceipt(tx)} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(26,115,232,.3)' }}>
            <Printer size={14} /> Print Receipt
          </button>
          <button onClick={() => exportCSV([tx])} style={{ flex: 1, padding: '11px', background: 'transparent', color: c.text, border: `1.5px solid ${c.border}`, borderRadius: '11px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// USER PROFILE MODAL
// ─────────────────────────────────────────────
const UserProfileModal = ({ user, transactions, onClose, onBlock, onEdit, onDelete, c }) => {
  if (!user) return null;
  const userTxs  = transactions.filter(t => t.from_wallet === user.wallet_number || t.to_wallet === user.wallet_number).slice(0, 5);
  const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }} onClick={onClose}>
      <div style={{ background: c.card, borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,.6)', border: `1px solid ${c.border}` }} onClick={e => e.stopPropagation()}>
        <div style={{ background: 'linear-gradient(135deg,#1A1FEF,#1A73E8,#7C3AED)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)' }} />
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <X size={14} color="#fff" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#fff', border: '2px solid rgba(255,255,255,.25)', flexShrink: 0, overflow: 'hidden' }}>
              {user.avatar_url ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : initials}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontSize: '20px', fontWeight: '800', margin: '0 0 3px', letterSpacing: '-0.5px' }}>{user.full_name}</p>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '12px', margin: '0 0 8px' }}>{user.email} · {user.phone}</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: user.kyc_verified ? '✓ KYC Verified' : 'KYC Pending', color: user.kyc_verified ? '#4ADE80' : '#FCD34D' },
                  { label: user.is_blocked ? 'Blocked' : 'Active', color: user.is_blocked ? '#F87171' : '#4ADE80' },
                  ...(user.is_admin ? [{ label: 'Admin', color: '#C4B5FD' }] : []),
                ].map((b, i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,.15)', color: b.color, fontSize: '10px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', border: '1px solid rgba(255,255,255,.2)' }}>{b.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: `1px solid ${c.border}` }}>
          {[
            { label: 'Balance',      value: fmtPKR(user.balance || 0), color: '#1A73E8' },
            { label: 'Logins',       value: user.login_count || 0,     color: c.text   },
            { label: 'Member Since', value: user.created_at ? new Date(user.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: '2-digit' }) : 'N/A', color: c.text },
          ].map((s, i, arr) => (
            <div key={i} style={{ padding: '14px 16px', textAlign: 'center', borderRight: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
              <p style={{ color: c.textSec, fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: '14px', fontWeight: '800', margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}` }}>
          <p style={{ color: c.textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px' }}>Account Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Wallet Number', value: user.wallet_number || 'N/A', mono: true },
              { label: 'Last Login',    value: user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never' },
              { label: 'KYC Status',    value: user.kyc_verified ? 'Approved' : 'Pending', color: user.kyc_verified ? '#16A34A' : '#CA8A04' },
              { label: 'Onboarding',    value: user.onboarding_done ? 'Complete' : 'Pending', color: user.onboarding_done ? '#16A34A' : '#CA8A04' },
            ].map((row, i) => (
              <div key={i} style={{ background: c.cardAlt, borderRadius: '10px', padding: '10px 12px', border: `1px solid ${c.border}` }}>
                <p style={{ color: c.textSec, fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 3px' }}>{row.label}</p>
                <p style={{ color: row.color || c.text, fontSize: '12px', fontWeight: '700', margin: 0, fontFamily: row.mono ? 'monospace' : 'inherit' }}>{row.value}</p>
              </div>
            ))}
          </div>
        </div>
        {userTxs.length > 0 && (
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}` }}>
            <p style={{ color: c.textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px' }}>Recent Transactions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {userTxs.map((tx, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: c.cardAlt, borderRadius: '10px', border: `1px solid ${c.border}` }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: tx.direction === 'credit' ? 'rgba(22,163,74,.15)' : 'rgba(220,38,38,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {tx.direction === 'credit' ? <ArrowDownLeft size={14} color="#16A34A" /> : <ArrowUp size={14} color="#DC2626" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#1A73E8', fontSize: '11px', fontWeight: '700', margin: 0, fontFamily: 'monospace' }}>{TX_ID(tx.id, tx.created_at)}</p>
                    <p style={{ color: c.textSec, fontSize: '10px', margin: 0 }}>{tx.type} · {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) : ''}</p>
                  </div>
                  <span style={{ color: tx.direction === 'credit' ? '#16A34A' : '#DC2626', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>{fmtPKR(tx.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {!user.is_admin && (
          <div style={{ padding: '14px 20px', display: 'flex', gap: '8px' }}>
            <button onClick={() => { onEdit(user); onClose(); }} style={{ flex: 1, padding: '10px', background: 'rgba(124,58,237,.1)', color: '#7C3AED', border: '1px solid rgba(124,58,237,.2)', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <Edit2 size={12} /> Edit
            </button>
            <button onClick={() => { onBlock(user.id, user.is_blocked); onClose(); }} style={{ flex: 1, padding: '10px', background: user.is_blocked ? 'rgba(22,163,74,.1)' : 'rgba(202,138,4,.1)', color: user.is_blocked ? '#16A34A' : '#CA8A04', border: `1px solid ${user.is_blocked ? 'rgba(22,163,74,.2)' : 'rgba(202,138,4,.2)'}`, borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
              {user.is_blocked ? 'Unblock' : 'Block'}
            </button>
            <button onClick={() => { onDelete(user); onClose(); }} style={{ flex: 1, padding: '10px', background: 'rgba(220,38,38,.1)', color: '#DC2626', border: '1px solid rgba(220,38,38,.2)', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CONFIRM DIALOG
// ─────────────────────────────────────────────
const ConfirmDialog = ({ show, title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmColor = '#DC2626', c, children }) => {
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, padding: '20px' }}>
      <div style={{ background: c.card, borderRadius: '18px', width: '100%', maxWidth: '400px', overflow: 'hidden', border: `1px solid ${c.border}`, boxShadow: '0 32px 80px rgba(0,0,0,.5)' }}>
        <div style={{ background: `linear-gradient(135deg,${confirmColor},${confirmColor}CC)`, padding: '22px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)' }} />
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', border: '1px solid rgba(255,255,255,.25)' }}>
            <AlertTriangle size={24} color="#fff" />
          </div>
          <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '800', margin: '0 0 3px' }}>{title}</h3>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '12px', margin: 0 }}>{message}</p>
        </div>
        <div style={{ padding: '16px 18px' }}>
          {children}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button style={{ flex: 1, padding: '11px', background: 'transparent', color: c.textSec, border: `1.5px solid ${c.border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }} onClick={onCancel}>Cancel</button>
            <button style={{ flex: 1, padding: '11px', background: `linear-gradient(135deg,${confirmColor},${confirmColor}CC)`, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '800', boxShadow: `0 4px 14px ${confirmColor}40` }} onClick={onConfirm}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// EDIT USER MODAL
// ─────────────────────────────────────────────
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
    if (!form.reason.trim()) { setError('Reason is required'); return; }
    setLoading(true); setError('');
    try { await onSave(user.id, form); onClose(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to update'); }
    setLoading(false);
  };

  const iS = { width: '100%', padding: '10px 12px', border: `1.5px solid ${c.border}`, borderRadius: '10px', background: c.inputBg, color: c.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', fontWeight: '500' };
  const lS = { color: c.textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '5px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, padding: '20px' }}>
      <div style={{ background: c.card, borderRadius: '18px', width: '100%', maxWidth: '460px', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${c.border}`, boxShadow: '0 32px 80px rgba(0,0,0,.5)' }}>
        <div style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '800', margin: 0 }}>Edit User</h3>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '12px', margin: 0 }}>{user.full_name} · {user.email}</p>
          </div>
          <button style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <X size={14} color="#fff" />
          </button>
        </div>
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { key: 'full_name',         label: 'Full Name',    ph: 'Full name'            },
            { key: 'phone',             label: 'Phone',        ph: 'Phone number'         },
            { key: 'date_of_birth',     label: 'Date of Birth',ph: '01-01-1995'           },
            { key: 'cnic_number',       label: 'CNIC Number',  ph: '12345-1234567-1'      },
            { key: 'full_name_on_card', label: 'Name on Card', ph: 'Name as on CNIC'      },
          ].map(f => (
            <div key={f.key}>
              <label style={lS}>{f.label}</label>
              <input style={iS} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} />
            </div>
          ))}
          <div>
            <label style={lS}>Reason (required — sent to user)</label>
            <textarea style={{ ...iS, minHeight: '72px', resize: 'vertical' }} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for this update..." />
          </div>
          {error && (
            <div style={{ background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.15)', borderRadius: '9px', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <AlertCircle size={13} color="#DC2626" />
              <span style={{ color: '#DC2626', fontSize: '12px' }}>{error}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ flex: 1, padding: '11px', background: 'transparent', color: c.textSec, border: `1.5px solid ${c.border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }} onClick={onClose}>Cancel</button>
            <button style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '800', boxShadow: '0 4px 12px rgba(124,58,237,.35)', opacity: loading ? 0.7 : 1 }} onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save & Notify User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
export default function AdminDashboard() {
  const { logout }          = useAuth();
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
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [toast,          setToast]          = useState(null);
  const [chartView,      setChartView]      = useState('week');
  const [searchQuery,    setSearchQuery]    = useState('');
  const searchRef = useRef(null);

  const [selectedImage,    setSelectedImage]    = useState(null);
  const [selectedTx,       setSelectedTx]       = useState(null);
  const [selectedUser,     setSelectedUser]      = useState(null);
  const [deleteDialog,     setDeleteDialog]      = useState({ show: false, user: null, reason: '' });
  const [editModal,        setEditModal]         = useState({ show: false, user: null });
  const [kycRejectModal,   setKycRejectModal]    = useState({ show: false, kycId: null, reason: '' });
  const [crRejectModal,    setCrRejectModal]     = useState({ show: false, id: null, reason: '' });
  const [wlConfig,      setWlConfig]      = useState(null);
  const [wlForm,        setWlForm]        = useState(null);
  const [wlSaving,      setWlSaving]      = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => { loadDashboard(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

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
    try {
      const wlR = await api.get('/api/admin/whitelabel');
      setWlConfig(wlR.data.config);
      setWlForm({ ...wlR.data.config });
    } catch(e) {}
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
    } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const updateUser = async (userId, form) => {
    const res = await api.post('/api/admin/update-user', { user_id: userId, ...form });
    showToast('User updated and notified');
    loadDashboard();
    return res;
  };

  const approveKyc = async (kycId) => {
    try { await api.post('/api/admin/kyc/approve', { kyc_id: kycId }); showToast('KYC approved ✓'); loadDashboard(); }
    catch { showToast('Approval failed', 'error'); }
  };

  const rejectKycConfirm = async () => {
    if (!kycRejectModal.reason.trim()) return;
    try {
      await api.post('/api/admin/kyc/reject', { kyc_id: kycRejectModal.kycId, reason: kycRejectModal.reason });
      showToast('KYC rejected');
      setKycRejectModal({ show: false, kycId: null, reason: '' });
      loadDashboard();
    } catch { showToast('Rejection failed', 'error'); }
  };

  const approveChangeRequest = async (id) => {
    try { await api.post('/api/admin/change-requests/approve', { request_id: id }); showToast('Request approved'); loadDashboard(); }
    catch { showToast('Failed', 'error'); }
  };

  const rejectCrConfirm = async () => {
    if (!crRejectModal.reason.trim()) return;
    try {
      await api.post('/api/admin/change-requests/reject', { request_id: crRejectModal.id, reason: crRejectModal.reason });
      showToast('Request rejected');
      setCrRejectModal({ show: false, id: null, reason: '' });
      loadDashboard();
    } catch { showToast('Failed', 'error'); }
  };

  const q      = searchQuery.toLowerCase();
  const fUsers = users.filter(u => !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q));
  const fTx    = transactions.filter(tx => !q || TX_ID(tx.id, tx.created_at).toLowerCase().includes(q) || tx.description?.toLowerCase().includes(q) || tx.from_wallet?.includes(q) || tx.to_wallet?.includes(q) || tx.type?.includes(q));
  const fLogs  = logs.filter(l => !q || l.user_name?.toLowerCase().includes(q) || l.action?.toLowerCase().includes(q) || l.detail?.toLowerCase().includes(q) || l.ip?.includes(q));

  const loadWhitelabel = async () => {
    try {
      const res = await api.get('/api/admin/whitelabel');
      setWlConfig(res.data.config);
      setWlForm({ ...res.data.config });
    } catch(e) { console.error(e); }
  };

  const saveWhitelabel = async () => {
    if (!wlForm) return;
    setWlSaving(true);
    try {
      const res = await api.post('/api/admin/whitelabel', wlForm);
      setWlConfig(res.data.config);
      setWlForm({ ...res.data.config });
      showToast('Branding saved!');
    } catch(err) { showToast(err.response?.data?.error || 'Save failed', 'error'); }
    setWlSaving(false);
  };

  const uploadLogo = async (file) => {
    if (!file) return;
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const res = await api.post('/api/admin/whitelabel/upload-logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setWlForm(f => ({ ...f, logo_url: res.data.logo_url }));
      showToast('Logo uploaded!');
    } catch(err) { showToast(err.response?.data?.error || 'Upload failed', 'error'); }
    setLogoUploading(false);
  };

  const exportWlConfig = () => {
    if (!wlConfig) return;
    const blob = new Blob([JSON.stringify(wlConfig, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `payease-whitelabel-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navItems = [
    { id: 'dashboard',       icon: LayoutDashboard, label: 'Overview' },
    { id: 'users',           icon: Users,           label: 'Users',           count: users.length },
    { id: 'kyc',             icon: FileCheck,       label: 'KYC Review',      badge: pendingKyc.length },
    { id: 'transactions',    icon: ArrowLeftRight,  label: 'Transactions',    count: transactions.length },
    { id: 'change-requests', icon: ClipboardList,   label: 'Change Requests', badge: changeRequests.filter(r => r.status === 'pending').length },
    { id: 'logs',            icon: ActivityIcon,    label: 'Activity Logs',   count: logs.length },
    { id: 'security',        icon: Shield,          label: 'Security' },
    { id: 'settings',        icon: Settings,        label: 'Settings' },
    { id: 'branding',        icon: Palette,         label: 'Branding' },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg, flexDirection: 'column', gap: '16px', fontFamily: '-apple-system,sans-serif' }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Shield size={24} color="#fff" />
      </div>
      <p style={{ color: c.textSec, fontSize: '13px', fontWeight: '600', margin: 0 }}>Loading Admin Portal...</p>
    </div>
  );

  const card = { background: c.card, borderRadius: '14px', border: `1px solid ${c.border}`, overflow: 'hidden' };

  const SH = ({ title, sub, right }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: `1px solid ${c.border}` }}>
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: c.text, margin: 0 }}>{title}</h3>
        {sub && <p style={{ color: c.textSec, fontSize: '11px', margin: '1px 0 0' }}>{sub}</p>}
      </div>
      {right}
    </div>
  );

  const TH = ({ label }) => (
    <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: '10px', fontWeight: '700', color: c.textSec, textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap', background: c.cardAlt }}>{label}</th>
  );

  const metricCards = [
    { label: 'Total Volume',   value: `PKR ${((stats?.total_volume || 0)/1000).toFixed(1)}K`, sub: 'All time',  icon: <DollarSign size={16} color="#fff" />, grad: 'linear-gradient(135deg,#1A1FEF,#1A73E8)', sh: 'rgba(26,115,232,.35)'  },
    { label: 'Transactions',   value: stats?.total_transactions || 0,                          sub: 'Total',     icon: <Activity   size={16} color="#fff" />, grad: 'linear-gradient(135deg,#134E5E,#16A34A)', sh: 'rgba(22,163,74,.35)'   },
    { label: 'Total Users',    value: stats?.total_users || 0,                                 sub: 'Registered',icon: <Users      size={16} color="#fff" />, grad: 'linear-gradient(135deg,#9A3412,#EA580C)', sh: 'rgba(234,88,12,.35)'   },
    { label: 'Pending KYC',    value: stats?.pending_kyc || 0,                                 sub: 'Needs review',icon:<UserCheck size={16} color="#fff" />, grad: 'linear-gradient(135deg,#3B1F8C,#7C3AED)', sh: 'rgba(124,58,237,.35)' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: c.bg, fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>
      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${c.border};border-radius:4px}
        button,input,textarea{font-family:-apple-system,BlinkMacSystemFont,sans-serif}
      `}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? '#DC2626' : '#16A34A', color: '#fff', padding: '10px 18px', borderRadius: '10px', zIndex: 9999999, fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 8px 24px rgba(0,0,0,.3)', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,.15)' }}>
          <CheckCircle size={14} color="#fff" /> {toast.msg}
        </div>
      )}

      {/* ── MODALS ── */}
      {selectedTx    && <TxModal tx={selectedTx} onClose={() => setSelectedTx(null)} c={c} />}
      {selectedUser  && <UserProfileModal user={selectedUser} transactions={transactions} onClose={() => setSelectedUser(null)} onBlock={blockUser} onEdit={u => setEditModal({ show: true, user: u })} onDelete={u => setDeleteDialog({ show: true, user: u, reason: '' })} c={c} />}

      <ConfirmDialog show={deleteDialog.show} title="Delete User Account" message="This is permanent and cannot be undone."
        onConfirm={deleteUser} onCancel={() => setDeleteDialog({ show: false, user: null, reason: '' })}
        confirmText="Delete Permanently" confirmColor="#DC2626" c={c}>
        <p style={{ color: c.textSec, fontSize: '12px', margin: '0 0 10px', textAlign: 'center' }}>
          Deleting <strong style={{ color: c.text }}>{deleteDialog.user?.full_name}</strong> — all data will be removed.
        </p>
        <input style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${c.border}`, borderRadius: '9px', background: c.inputBg, color: c.text, fontSize: '13px', outline: 'none' }}
          placeholder="Reason for deletion..." value={deleteDialog.reason} onChange={e => setDeleteDialog(d => ({ ...d, reason: e.target.value }))} />
      </ConfirmDialog>

      <EditUserModal show={editModal.show} user={editModal.user} onClose={() => setEditModal({ show: false, user: null })} onSave={updateUser} c={c} />

      <ConfirmDialog show={kycRejectModal.show} title="Reject KYC Application" message="User will be notified with your reason."
        onConfirm={rejectKycConfirm} onCancel={() => setKycRejectModal({ show: false, kycId: null, reason: '' })}
        confirmText="Reject & Notify" confirmColor="#DC2626" c={c}>
        <textarea style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${c.border}`, borderRadius: '9px', background: c.inputBg, color: c.text, fontSize: '13px', outline: 'none', minHeight: '72px', resize: 'vertical', fontFamily: 'inherit' }}
          placeholder="Rejection reason (required)..."
          value={kycRejectModal.reason} onChange={e => setKycRejectModal(p => ({ ...p, reason: e.target.value }))} />
      </ConfirmDialog>

      <ConfirmDialog show={crRejectModal.show} title="Reject Change Request" message="User will be notified."
        onConfirm={rejectCrConfirm} onCancel={() => setCrRejectModal({ show: false, id: null, reason: '' })}
        confirmText="Reject" confirmColor="#DC2626" c={c}>
        <textarea style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${c.border}`, borderRadius: '9px', background: c.inputBg, color: c.text, fontSize: '13px', outline: 'none', minHeight: '60px', resize: 'vertical', fontFamily: 'inherit' }}
          placeholder="Reason..." value={crRejectModal.reason} onChange={e => setCrRejectModal(p => ({ ...p, reason: e.target.value }))} />
      </ConfirmDialog>

      {/* ── SIDEBAR ── */}
      <div style={{ width: sidebarOpen ? '220px' : '52px', background: c.sidebar, minHeight: '100vh', display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease', position: 'sticky', top: 0, flexShrink: 0, zIndex: 50, borderRight: '1px solid rgba(255,255,255,.05)', overflow: 'hidden' }}>
        <div style={{ padding: sidebarOpen ? '16px 14px 12px' : '16px 10px 12px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', minWidth: '32px', borderRadius: '9px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: '16px', fontWeight: '800' }}>P</span>
            </div>
            {sidebarOpen && (
              <div>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: '800', margin: 0, lineHeight: 1 }}>PayEase</p>
                <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '9px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Portal</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <div style={{ marginTop: '10px', background: 'rgba(26,115,232,.15)', border: '1px solid rgba(26,115,232,.25)', borderRadius: '8px', padding: '5px 9px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#3FB950', flexShrink: 0 }} />
              <span style={{ color: '#60A5FA', fontSize: '10px', fontWeight: '700' }}>Super Admin · Online</span>
            </div>
          )}
        </div>
        <nav style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: '1px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const Icon     = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div key={item.id}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: sidebarOpen ? '8px 10px' : '8px', justifyContent: sidebarOpen ? 'flex-start' : 'center', borderRadius: '8px', cursor: 'pointer', background: isActive ? 'rgba(26,115,232,.2)' : 'transparent', transition: 'background 0.1s', position: 'relative', minHeight: '36px' }}
                onClick={() => setActiveTab(item.id)}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,.05)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {isActive && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '2px', height: '16px', borderRadius: '0 2px 2px 0', background: '#1A73E8' }} />}
                <Icon size={15} color={isActive ? '#60A5FA' : 'rgba(255,255,255,.35)'} style={{ flexShrink: 0 }} />
                {sidebarOpen && (
                  <>
                    <span style={{ fontSize: '12px', color: isActive ? '#fff' : 'rgba(255,255,255,.45)', fontWeight: isActive ? '600' : '400', flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
                    {item.badge > 0 && <div style={{ background: '#DC2626', color: '#fff', fontSize: '9px', fontWeight: '800', minWidth: '16px', height: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{item.badge}</div>}
                    {item.count > 0 && !item.badge && <span style={{ color: 'rgba(255,255,255,.2)', fontSize: '10px' }}>{item.count}</span>}
                  </>
                )}
              </div>
            );
          })}
        </nav>
        <div style={{ padding: '8px 6px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: sidebarOpen ? '8px 10px' : '8px', justifyContent: sidebarOpen ? 'flex-start' : 'center', borderRadius: '8px', cursor: 'pointer' }}
            onClick={logout}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,81,73,.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={15} color="rgba(248,81,73,.6)" style={{ flexShrink: 0 }} />
            {sidebarOpen && <span style={{ color: 'rgba(248,81,73,.7)', fontSize: '12px', fontWeight: '500' }}>Sign Out</span>}
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>

        {/* ── TOPBAR ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: c.topBar, borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{ width: '30px', height: '30px', borderRadius: '8px', background: c.cardAlt, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={14} color={c.textSec} />
            </button>
            <div>
              <h1 style={{ fontSize: '15px', fontWeight: '700', color: c.text, margin: 0 }}>{navItems.find(n => n.id === activeTab)?.label || 'Overview'}</h1>
              <p style={{ color: c.textSec, fontSize: '10px', margin: 0 }}>{new Date().toLocaleDateString('en-PK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: c.cardAlt, border: `1px solid ${c.border}`, borderRadius: '9px', padding: '0 10px', gap: '7px' }}>
              <Search size={12} color={c.textSec} style={{ flexShrink: 0 }} />
              <input ref={searchRef} type="text"
                style={{ padding: '7px 0', border: 'none', background: 'transparent', color: c.text, fontSize: '12px', outline: 'none', width: '160px' }}
                placeholder="Search users, txns, logs..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, flexShrink: 0 }}>
                  <X size={11} color={c.textSec} />
                </button>
              )}
            </div>
            {[
              { icon: isDark ? <Sun size={13} color="#F59E0B" /> : <Moon size={13} color="#1A73E8" />, action: toggleTheme },
              { icon: <RefreshCw size={12} color={c.textSec} />, action: loadDashboard },
            ].map((b, i) => (
              <button key={i} style={{ width: '30px', height: '30px', borderRadius: '8px', background: c.cardAlt, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={b.action}>
                {b.icon}
              </button>
            ))}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setActiveTab('kyc')} style={{ width: '30px', height: '30px', borderRadius: '8px', background: c.cardAlt, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Bell size={13} color={c.textSec} />
              </button>
              {(pendingKyc.length + changeRequests.filter(r => r.status === 'pending').length) > 0 && (
                <div style={{ position: 'absolute', top: '7px', right: '7px', width: '6px', height: '6px', borderRadius: '50%', background: '#DC2626' }} />
              )}
            </div>
          </div>
        </div>

        {/* ── PAGE CONTENT ── */}
        <div style={{ padding: '18px 20px', flex: 1 }}>

          {/* ═══════════ OVERVIEW ═══════════ */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '14px' }}>
                {metricCards.map((mc, i) => (
                  <div key={i} style={{ background: mc.grad, borderRadius: '14px', padding: '16px', boxShadow: `0 8px 24px ${mc.sh}`, position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,.1)' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)' }} />
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>{mc.icon}</div>
                    <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '10px', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>{mc.label}</p>
                    <p style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: '0 0 2px', letterSpacing: '-0.5px' }}>{mc.value}</p>
                    <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '10px', margin: 0 }}>{mc.sub}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '14px' }}>
                {[
                  { label: 'Verified Users',   value: users.filter(u => u.kyc_verified).length, color: '#16A34A', icon: <ShieldCheck size={14} color="#16A34A" /> },
                  { label: 'Blocked Users',    value: users.filter(u => u.is_blocked).length,   color: '#DC2626', icon: <Lock size={14} color="#DC2626" /> },
                  { label: 'Pending Requests', value: changeRequests.filter(r => r.status === 'pending').length, color: '#7C3AED', icon: <ClipboardList size={14} color="#7C3AED" /> },
                ].map((s, i) => (
                  <div key={i} style={{ ...card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '10px', background: `${s.color}15`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                    <div>
                      <p style={{ color: c.textSec, fontSize: '10px', margin: '0 0 2px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
                      <p style={{ color: s.color, fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '12px', marginBottom: '14px' }}>
                <div style={card}>
                  <SH title="Transaction Volume" sub="PKR volume over time"
                    right={
                      <div style={{ display: 'flex', gap: '3px', background: c.cardAlt, borderRadius: '8px', padding: '3px', border: `1px solid ${c.border}` }}>
                        {['week','month'].map(v => (
                          <button key={v} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', background: chartView === v ? '#1A73E8' : 'transparent', color: chartView === v ? '#fff' : c.textSec, transition: 'all 0.15s' }} onClick={() => setChartView(v)}>
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                          </button>
                        ))}
                      </div>
                    }
                  />
                  <div style={{ padding: '14px 16px' }}>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={chartView === 'week' ? WEEK : MONTH} margin={{ left: -10, right: 4 }}>
                        <defs>
                          <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#1A73E8" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#1A73E8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
                        <XAxis dataKey={chartView === 'week' ? 'day' : 'm'} tick={{ fontSize: 10, fill: c.textSec }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: c.textSec }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTip c={c} />} />
                        <Area type="monotone" dataKey="volume" stroke="#1A73E8" fill="url(#vg)" strokeWidth={2} name="volume" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={card}>
                  <SH title="Revenue Mix" sub="By type" />
                  <div style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <PieChart width={130} height={130}>
                        <Pie data={[{ v: 60, color: '#1A73E8' }, { v: 25, color: '#16A34A' }, { v: 15, color: '#EA580C' }]}
                          cx={60} cy={60} innerRadius={38} outerRadius={60} dataKey="v" strokeWidth={0}>
                          {[{ color: '#1A73E8' }, { color: '#16A34A' }, { color: '#EA580C' }].map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                      </PieChart>
                    </div>
                    {[{ n: 'Transfers', v: '60%', col: '#1A73E8' }, { n: 'Bills', v: '25%', col: '#16A34A' }, { n: 'Deposits', v: '15%', col: '#EA580C' }].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: item.col, flexShrink: 0 }} />
                        <span style={{ color: c.textSec, fontSize: '11px', flex: 1 }}>{item.n}</span>
                        <span style={{ color: c.text, fontSize: '11px', fontWeight: '700' }}>{item.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={card}>
                <SH title="Recent Transactions" sub="Click any row for full details + receipt"
                  right={<button style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(26,115,232,.1)', border: '1px solid rgba(26,115,232,.2)', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', color: '#1A73E8', fontSize: '11px', fontWeight: '700' }} onClick={() => setActiveTab('transactions')}>
                    View all <ChevronRight size={12} color="#1A73E8" />
                  </button>}
                />
                <div style={{ overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>{['TX ID','Type','Amount','From','To','Date','Status'].map(h => <TH key={h} label={h} />)}</tr></thead>
                    <tbody>
                      {transactions.slice(0, 6).map((tx, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${c.border}`, cursor: 'pointer', transition: 'background 0.1s' }}
                          onClick={() => setSelectedTx(tx)}
                          onMouseEnter={e => e.currentTarget.style.background = c.hover}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '10px 16px' }}><code style={{ color: '#1A73E8', fontSize: '11px', fontWeight: '700', background: 'rgba(26,115,232,.08)', padding: '2px 7px', borderRadius: '5px' }}>{TX_ID(tx.id, tx.created_at)}</code></td>
                          <td style={{ padding: '10px 16px' }}><StatusBadge status={tx.type} /></td>
                          <td style={{ padding: '10px 16px', color: c.text, fontSize: '13px', fontWeight: '800' }}>{fmtPKR(tx.amount)}</td>
                          <td style={{ padding: '10px 16px', fontSize: '11px', color: c.textSec, fontFamily: 'monospace' }}>{tx.from_wallet || '—'}</td>
                          <td style={{ padding: '10px 16px', fontSize: '11px', color: c.textSec, fontFamily: 'monospace' }}>{tx.to_wallet || '—'}</td>
                          <td style={{ padding: '10px 16px', fontSize: '11px', color: c.textSec, whiteSpace: 'nowrap' }}>{tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
                          <td style={{ padding: '10px 16px' }}><StatusBadge status={tx.status || 'success'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ USERS ═══════════ */}
          {activeTab === 'users' && (
            <div style={card}>
              <SH title="All Users" sub={`${fUsers.length} of ${users.length} · Click row to view full profile`}
                right={<div style={{ display: 'flex', gap: '5px' }}>
                  <span style={{ background: 'rgba(22,163,74,.1)', color: '#16A34A', fontSize: '10px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', border: '1px solid rgba(22,163,74,.15)' }}>{users.filter(u => u.kyc_verified).length} Verified</span>
                  <span style={{ background: 'rgba(220,38,38,.1)', color: '#DC2626', fontSize: '10px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', border: '1px solid rgba(220,38,38,.15)' }}>{users.filter(u => u.is_blocked).length} Blocked</span>
                </div>}
              />
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['User','Email / Phone','Balance','Last Login','Last IP','Device','KYC','Status','Actions'].map(h => <TH key={h} label={h} />)}</tr></thead>
                  <tbody>
                    {fUsers.map((u, i) => {
                      const userLogs  = logs.filter(l => l.user_email === u.email && /login/i.test(l.action));
                      const lastLog   = userLogs[0];
                      const lastIp    = lastLog?.ip || '—';
                      const rawAgent  = lastLog?.detail?.match(/Device: ([^—\n]+)/)?.[1]?.trim() || '—';
                      const isMobile  = /mobile|android|iphone/i.test(rawAgent);
                      const agentShort = rawAgent.length > 18 ? rawAgent.slice(0, 18) + '...' : rawAgent;
                      return (
                        <tr key={i} style={{ borderBottom: `1px solid ${c.border}`, cursor: 'pointer', transition: 'background 0.1s' }}
                          onClick={() => setSelectedUser(u)}
                          onMouseEnter={e => e.currentTarget.style.background = c.hover}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                              <div style={{ width: '32px', height: '32px', minWidth: '32px', borderRadius: '9px', background: u.is_blocked ? 'rgba(220,38,38,.15)' : 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '800', overflow: 'hidden' }}>
                                {u.avatar_url ? <img src={u.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : u.full_name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p style={{ color: c.text, fontSize: '12px', fontWeight: '700', margin: 0, whiteSpace: 'nowrap' }}>{u.full_name}</p>
                                {u.is_admin && <span style={{ color: '#7C3AED', fontSize: '9px', fontWeight: '700', background: 'rgba(124,58,237,.1)', padding: '1px 5px', borderRadius: '3px' }}>Admin</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <p style={{ color: c.text, fontSize: '11px', margin: '0 0 1px', whiteSpace: 'nowrap' }}>{u.email}</p>
                            <p style={{ color: c.textSec, fontSize: '10px', margin: 0 }}>{u.phone}</p>
                          </td>
                          <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                            <span style={{ color: '#1A73E8', fontSize: '12px', fontWeight: '800' }}>{fmtPKR(u.balance || 0)}</span>
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <p style={{ color: c.text, fontSize: '10px', margin: 0, whiteSpace: 'nowrap' }}>
                              {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                            </p>
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <code style={{ color: lastIp !== '—' ? '#1A73E8' : c.textSec, fontSize: '10px', background: lastIp !== '—' ? 'rgba(26,115,232,.08)' : 'transparent', padding: lastIp !== '—' ? '2px 6px' : 0, borderRadius: '4px' }}>{lastIp}</code>
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {isMobile ? <Smartphone size={11} color={c.textSec} /> : <Monitor size={11} color={c.textSec} />}
                              <span style={{ color: c.textSec, fontSize: '10px' }}>{agentShort}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 16px' }}><StatusBadge status={u.kyc_verified ? 'verified' : 'pending'} /></td>
                          <td style={{ padding: '10px 16px' }}><StatusBadge status={u.is_blocked ? 'blocked' : 'active'} /></td>
                          <td style={{ padding: '10px 16px' }} onClick={e => e.stopPropagation()}>
                            {!u.is_admin ? (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button style={{ padding: '4px 8px', border: '1px solid rgba(124,58,237,.2)', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', background: 'rgba(124,58,237,.1)', color: '#7C3AED' }} onClick={() => setEditModal({ show: true, user: u })}>Edit</button>
                                <button style={{ padding: '4px 8px', border: `1px solid ${u.is_blocked ? 'rgba(22,163,74,.2)' : 'rgba(202,138,4,.2)'}`, borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', background: u.is_blocked ? 'rgba(22,163,74,.1)' : 'rgba(202,138,4,.1)', color: u.is_blocked ? '#16A34A' : '#CA8A04' }} onClick={() => blockUser(u.id, u.is_blocked)}>
                                  {u.is_blocked ? 'Unblock' : 'Block'}
                                </button>
                                <button style={{ padding: '4px 8px', border: '1px solid rgba(220,38,38,.2)', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', background: 'rgba(220,38,38,.1)', color: '#DC2626' }} onClick={() => setDeleteDialog({ show: true, user: u, reason: '' })}>Del</button>
                              </div>
                            ) : <span style={{ color: c.textSec, fontSize: '10px' }}>Protected</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════ KYC ═══════════ */}
          {activeTab === 'kyc' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '14px' }}>
                {[
                  { label: 'Pending Review', value: pendingKyc.length,                       grad: 'linear-gradient(135deg,#92400E,#CA8A04)', sh: 'rgba(202,138,4,.25)', icon: <Clock        size={18} color="#fff" /> },
                  { label: 'Verified Users', value: users.filter(u => u.kyc_verified).length, grad: 'linear-gradient(135deg,#134E5E,#16A34A)', sh: 'rgba(22,163,74,.25)', icon: <CheckCircle  size={18} color="#fff" /> },
                  { label: 'Total Users',    value: users.length,                              grad: 'linear-gradient(135deg,#1A1FEF,#1A73E8)', sh: 'rgba(26,115,232,.25)',icon: <FileCheck    size={18} color="#fff" /> },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.grad, borderRadius: '12px', padding: '16px', boxShadow: `0 6px 20px ${s.sh}`, border: '1px solid rgba(255,255,255,.1)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px' }}>{s.label}</p>
                        <p style={{ color: '#fff', fontSize: '26px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>{s.value}</p>
                      </div>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {pendingKyc.length === 0 ? (
                <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
                  <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(22,163,74,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <CheckCircle size={26} color="#16A34A" />
                  </div>
                  <h3 style={{ color: c.text, margin: '0 0 4px', fontWeight: '700' }}>All Caught Up</h3>
                  <p style={{ color: c.textSec, margin: 0, fontSize: '12px' }}>No pending KYC applications</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(420px,1fr))', gap: '14px' }}>
                  {pendingKyc.map((kyc, i) => (
                    <div key={i} style={{ ...card }}>
                      <div style={{ background: 'linear-gradient(135deg,#1A1FEF,#1A73E8)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', fontWeight: '800' }}>
                            {kyc.user?.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ color: '#fff', fontSize: '14px', fontWeight: '700', margin: 0 }}>{kyc.user?.full_name}</p>
                            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '11px', margin: 0 }}>{kyc.user?.email}</p>
                          </div>
                        </div>
                        <span style={{ background: 'rgba(252,211,77,.2)', color: '#FCD34D', fontSize: '10px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', border: '1px solid rgba(252,211,77,.3)' }}>Pending</span>
                      </div>
                      <div style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                          {[
                            { label: 'CNIC Number',  value: kyc.cnic_number },
                            { label: 'Phone',         value: kyc.user?.phone },
                            { label: 'Date of Birth', value: kyc.date_of_birth || 'N/A' },
                            { label: 'Name on Card',  value: kyc.full_name_on_card || 'N/A' },
                          ].map((row, ri) => (
                            <div key={ri} style={{ background: c.cardAlt, borderRadius: '8px', padding: '8px 10px', border: `1px solid ${c.border}` }}>
                              <p style={{ color: c.textSec, fontSize: '9px', fontWeight: '700', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{row.label}</p>
                              <p style={{ color: c.text, fontSize: '11px', fontWeight: '700', margin: 0 }}>{row.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* ── DOCUMENTS — smart media: image for CNIC, video player for selfie ── */}
                        <p style={{ color: c.textSec, fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 6px' }}>Documents (click to enlarge)</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                          {[
                            { label: 'ID Front', path: kyc.cnic_front },
                            { label: 'ID Back',  path: kyc.cnic_back  },
                            { label: 'Selfie',   path: kyc.selfie      },
                          ].map((doc, di) => (
                            <div key={di} style={{ borderRadius: '8px', overflow: 'hidden', background: c.cardAlt, border: `1px solid ${c.border}` }}>
                              <p style={{ color: c.textSec, fontSize: '8px', fontWeight: '700', textAlign: 'center', padding: '4px', margin: 0, textTransform: 'uppercase' }}>{doc.label}</p>
                              {doc.path ? (
                                isVideoUrl(doc.path) ? (
                                  // ── VIDEO: liveness recording — clickable to open fullscreen ──
                                  <div style={{ cursor: 'pointer' }} onClick={() => setSelectedImage(doc.path)}>
                                    <video
                                      src={doc.path}
                                      style={{ width: '100%', height: '72px', display: 'block', objectFit: 'cover', pointerEvents: 'none' }}
                                      preload="metadata"
                                      muted
                                    />
                                    <div style={{ background: 'rgba(220,38,38,0.12)', padding: '3px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(220,38,38,0.2)' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#DC2626' }} />
                                        <span style={{ color: '#DC2626', fontSize: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Video</span>
                                      </div>
                                      <span style={{ color: '#DC2626', fontSize: '8px', fontWeight: '700' }}>Play</span>
                                    </div>
                                  </div>
                                ) : (
                                  // ── IMAGE: CNIC front/back ──
                                  <div style={{ position: 'relative', height: '72px', cursor: 'pointer', overflow: 'hidden' }} onClick={() => setSelectedImage(doc.path)}>
                                    <img src={doc.path} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={doc.label} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,115,232,.5)'}
                                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                      <Eye size={14} color="#fff" />
                                    </div>
                                  </div>
                                )
                              ) : (
                                <div style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.textSec, fontSize: '10px' }}>No file</div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', boxShadow: '0 4px 12px rgba(22,163,74,.3)' }} onClick={() => approveKyc(kyc.id)}>
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#DC2626,#B91C1C)', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', boxShadow: '0 4px 12px rgba(220,38,38,.3)' }} onClick={() => setKycRejectModal({ show: true, kycId: kyc.id, reason: '' })}>
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TRANSACTIONS ═══════════ */}
          {activeTab === 'transactions' && (
            <div style={card}>
              <SH title="All Transactions" sub={`${fTx.length} records · Click any row for details & receipt`}
                right={
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['transfer','deposit'].map(type => (
                      <span key={type} style={{ background: c.cardAlt, color: c.textSec, fontSize: '10px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', border: `1px solid ${c.border}` }}>
                        {transactions.filter(t => t.type === type).length} {type}s
                      </span>
                    ))}
                    <button style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(26,115,232,.1)', border: '1px solid rgba(26,115,232,.2)', borderRadius: '8px', padding: '3px 10px', cursor: 'pointer', color: '#1A73E8', fontSize: '10px', fontWeight: '700' }} onClick={() => exportCSV(fTx)}>
                      <Download size={11} /> Export CSV
                    </button>
                  </div>
                }
              />
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['TX ID','Type','Amount','Direction','From','To','Description','Date','Status',''].map(h => <TH key={h} label={h} />)}</tr></thead>
                  <tbody>
                    {fTx.map((tx, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${c.border}`, cursor: 'pointer', transition: 'background 0.1s' }}
                        onClick={() => setSelectedTx(tx)}
                        onMouseEnter={e => e.currentTarget.style.background = c.hover}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '10px 16px' }}><code style={{ color: '#1A73E8', fontSize: '11px', fontWeight: '700', background: 'rgba(26,115,232,.08)', padding: '2px 7px', borderRadius: '5px', whiteSpace: 'nowrap' }}>{TX_ID(tx.id, tx.created_at)}</code></td>
                        <td style={{ padding: '10px 16px' }}><StatusBadge status={tx.type} /></td>
                        <td style={{ padding: '10px 16px', color: c.text, fontSize: '13px', fontWeight: '800', whiteSpace: 'nowrap' }}>{fmtPKR(tx.amount)}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', color: tx.direction === 'credit' ? '#16A34A' : '#DC2626', whiteSpace: 'nowrap' }}>
                            {tx.direction === 'credit' ? <ArrowDownLeft size={11} /> : <ArrowUp size={11} />}
                            {(tx.direction || 'debit').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '11px', color: c.textSec, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{tx.from_wallet || '—'}</td>
                        <td style={{ padding: '10px 16px', fontSize: '11px', color: c.textSec, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{tx.to_wallet || '—'}</td>
                        <td style={{ padding: '10px 16px', fontSize: '11px', color: c.textSec, maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || '—'}</td>
                        <td style={{ padding: '10px 16px', fontSize: '11px', color: c.textSec, whiteSpace: 'nowrap' }}>{tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
                        <td style={{ padding: '10px 16px' }}><StatusBadge status={tx.status || 'success'} /></td>
                        <td style={{ padding: '10px 16px' }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => printReceipt(tx)} style={{ background: 'none', border: `1px solid ${c.border}`, borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', color: c.textSec, fontSize: '10px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            <Printer size={10} /> Print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════ CHANGE REQUESTS ═══════════ */}
          {activeTab === 'change-requests' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '14px' }}>
                {[
                  { label: 'Pending',  value: changeRequests.filter(r => r.status === 'pending').length,  grad: 'linear-gradient(135deg,#92400E,#CA8A04)', sh: 'rgba(202,138,4,.25)'  },
                  { label: 'Approved', value: changeRequests.filter(r => r.status === 'approved').length, grad: 'linear-gradient(135deg,#134E5E,#16A34A)', sh: 'rgba(22,163,74,.25)'  },
                  { label: 'Rejected', value: changeRequests.filter(r => r.status === 'rejected').length, grad: 'linear-gradient(135deg,#7F1D1D,#DC2626)', sh: 'rgba(220,38,38,.25)'  },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.grad, borderRadius: '12px', padding: '16px', boxShadow: `0 6px 20px ${s.sh}`, textAlign: 'center', border: '1px solid rgba(255,255,255,.1)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)' }} />
                    <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 3px' }}>{s.label}</p>
                    <p style={{ color: '#fff', fontSize: '28px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>{s.value}</p>
                  </div>
                ))}
              </div>
              {changeRequests.length === 0 ? (
                <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
                  <ClipboardList size={28} color={c.textSec} style={{ marginBottom: '10px' }} />
                  <p style={{ color: c.text, fontSize: '14px', fontWeight: '700', margin: '0 0 4px' }}>No Change Requests</p>
                  <p style={{ color: c.textSec, fontSize: '12px', margin: 0 }}>No users have submitted requests yet</p>
                </div>
              ) : (
                <div style={card}>
                  <SH title="All Change Requests" sub="User-submitted field update requests" />
                  <div style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr>{['User','Field','New Value','Reason','Submitted','Status','Actions'].map(h => <TH key={h} label={h} />)}</tr></thead>
                      <tbody>
                        {changeRequests.map((req, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${c.border}` }}>
                            <td style={{ padding: '11px 16px' }}>
                              <p style={{ color: c.text, fontSize: '12px', fontWeight: '700', margin: 0 }}>{req.user_name}</p>
                              <p style={{ color: c.textSec, fontSize: '10px', margin: 0 }}>{req.user_email}</p>
                            </td>
                            <td style={{ padding: '11px 16px' }}>
                              <span style={{ background: 'rgba(124,58,237,.1)', color: '#7C3AED', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '5px', border: '1px solid rgba(124,58,237,.15)' }}>
                                {req.field?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </td>
                            <td style={{ padding: '11px 16px', color: c.text, fontSize: '12px', fontWeight: '700' }}>{req.new_value}</td>
                            <td style={{ padding: '11px 16px', color: c.textSec, fontSize: '11px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.reason}</td>
                            <td style={{ padding: '11px 16px', color: c.textSec, fontSize: '11px', whiteSpace: 'nowrap' }}>{req.submitted_at}</td>
                            <td style={{ padding: '11px 16px' }}><StatusBadge status={req.status} /></td>
                            <td style={{ padding: '11px 16px' }}>
                              {req.status === 'pending' ? (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button style={{ padding: '4px 10px', border: '1px solid rgba(22,163,74,.2)', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', background: 'rgba(22,163,74,.1)', color: '#16A34A' }} onClick={() => approveChangeRequest(req.id)}>Approve</button>
                                  <button style={{ padding: '4px 10px', border: '1px solid rgba(220,38,38,.2)', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', background: 'rgba(220,38,38,.1)', color: '#DC2626' }} onClick={() => setCrRejectModal({ show: true, id: req.id, reason: '' })}>Reject</button>
                                </div>
                              ) : <span style={{ color: c.textSec, fontSize: '10px' }}>{req.processed_at || 'Done'}</span>}
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

          {/* ═══════════ ACTIVITY LOGS ═══════════ */}
          {activeTab === 'logs' && (
            <div style={card}>
              <SH title="Activity Logs" sub={`${fLogs.length} entries · IP address and device tracked per event`}
                right={<span style={{ background: c.cardAlt, color: c.textSec, fontSize: '10px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', border: `1px solid ${c.border}` }}>Latest {Math.min(logs.length, 500)}</span>}
              />
              {fLogs.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center' }}>
                  <ActivityIcon size={24} color={c.textSec} style={{ marginBottom: '10px' }} />
                  <p style={{ color: c.text, fontSize: '14px', fontWeight: '700', margin: '0 0 4px' }}>No Logs Yet</p>
                  <p style={{ color: c.textSec, fontSize: '12px', margin: 0 }}>Activity will appear here as users interact</p>
                </div>
              ) : (
                <div style={{ overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>{['User','Action','Detail','IP Address','Device','Timestamp'].map(h => <TH key={h} label={h} />)}</tr></thead>
                    <tbody>
                      {fLogs.map((log, i) => {
                        const isAdmin    = /deleted|updated|approved|rejected/i.test(log.action);
                        const isSecurity = /blocked|login|alert|fraud/i.test(log.action);
                        const color = isAdmin ? '#7C3AED' : isSecurity ? '#DC2626' : '#1A73E8';
                        const bg    = isAdmin ? 'rgba(124,58,237,.1)' : isSecurity ? 'rgba(220,38,38,.1)' : 'rgba(26,115,232,.1)';
                        const brd   = isAdmin ? 'rgba(124,58,237,.15)' : isSecurity ? 'rgba(220,38,38,.15)' : 'rgba(26,115,232,.15)';
                        const deviceMatch = log.detail?.match(/Device: ([^—\n]+)/);
                        const deviceStr   = deviceMatch?.[1]?.trim() || '—';
                        const isMobile    = /mobile|android|iphone/i.test(deviceStr);
                        const deviceShort = deviceStr.length > 22 ? deviceStr.slice(0, 22) + '…' : deviceStr;
                        return (
                          <tr key={i} style={{ borderBottom: `1px solid ${c.border}` }}>
                            <td style={{ padding: '10px 16px' }}>
                              <p style={{ color: c.text, fontSize: '11px', fontWeight: '700', margin: 0 }}>{log.user_name}</p>
                              <p style={{ color: c.textSec, fontSize: '10px', margin: 0 }}>{log.user_email}</p>
                            </td>
                            <td style={{ padding: '10px 16px' }}>
                              <span style={{ background: bg, color, fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '5px', border: `1px solid ${brd}`, whiteSpace: 'nowrap' }}>{log.action}</span>
                            </td>
                            <td style={{ padding: '10px 16px', color: c.textSec, fontSize: '11px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.detail}>{log.detail}</td>
                            <td style={{ padding: '10px 16px' }}>
                              {log.ip && log.ip !== '—'
                                ? <code style={{ color: '#1A73E8', fontSize: '11px', background: 'rgba(26,115,232,.08)', padding: '2px 7px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                                    <MapPin size={9} color="#1A73E8" /> {log.ip}
                                  </code>
                                : <span style={{ color: c.textSec, fontSize: '11px' }}>—</span>
                              }
                            </td>
                            <td style={{ padding: '10px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                {isMobile ? <Smartphone size={11} color={c.textSec} /> : <Monitor size={11} color={c.textSec} />}
                                <span style={{ color: c.textSec, fontSize: '10px' }}>{deviceShort}</span>
                              </div>
                            </td>
                            <td style={{ padding: '10px 16px', color: c.textSec, fontSize: '11px', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ SECURITY ═══════════ */}
          {activeTab === 'security' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                {[
                  { title: 'Fraud Detection',        desc: 'Transfers ≥ PKR 25,000 trigger email alerts and in-app warnings',     grad: 'linear-gradient(135deg,#7F1D1D,#DC2626)', icon: <AlertCircle  size={18} color="#fff" />, status: 'Active'   },
                  { title: 'KYC Enforcement',         desc: 'Identity verification is required before any money transfer',         grad: 'linear-gradient(135deg,#134E5E,#16A34A)', icon: <ShieldCheck  size={18} color="#fff" />, status: 'Enabled'  },
                  { title: 'Transfer Limits',         desc: 'PKR 50,000 maximum per transaction, enforced server-side',            grad: 'linear-gradient(135deg,#92400E,#CA8A04)', icon: <Lock         size={18} color="#fff" />, status: 'Enforced' },
                  { title: 'JWT Refresh Tokens',      desc: '15-min access tokens, 30-day refresh tokens with blocklist',         grad: 'linear-gradient(135deg,#1A1FEF,#1A73E8)', icon: <Clock        size={18} color="#fff" />, status: 'Active'   },
                  { title: 'New Device Alerts',       desc: 'Email notification sent on first login from a new device or IP',     grad: 'linear-gradient(135deg,#3B1F8C,#7C3AED)', icon: <Globe        size={18} color="#fff" />, status: 'Active'   },
                  { title: 'Rapid Transfer Monitor',  desc: '3+ transfers within 5 minutes triggers suspicious activity flag',    grad: 'linear-gradient(135deg,#9A3412,#EA580C)', icon: <Zap          size={18} color="#fff" />, status: 'Active'   },
                ].map((item, i) => (
                  <div key={i} style={card}>
                    <div style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: item.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,.2)' }}>{item.icon}</div>
                        <span style={{ background: 'rgba(22,163,74,.1)', color: '#16A34A', fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(22,163,74,.15)' }}>{item.status}</span>
                      </div>
                      <h4 style={{ color: c.text, fontSize: '13px', fontWeight: '700', margin: '0 0 4px' }}>{item.title}</h4>
                      <p style={{ color: c.textSec, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={card}>
                <SH title={`Blocked Users (${users.filter(u => u.is_blocked).length})`} />
                {users.filter(u => u.is_blocked).length === 0 ? (
                  <div style={{ padding: '36px', textAlign: 'center' }}><p style={{ color: c.textSec, margin: 0, fontSize: '13px' }}>No blocked users</p></div>
                ) : (
                  users.filter(u => u.is_blocked).map((u, i, arr) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(220,38,38,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', fontWeight: '800', border: '1px solid rgba(220,38,38,.15)', flexShrink: 0 }}>
                        {u.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: c.text, fontSize: '13px', fontWeight: '700', margin: 0 }}>{u.full_name}</p>
                        <p style={{ color: c.textSec, fontSize: '11px', margin: 0 }}>{u.email}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button style={{ padding: '6px 12px', border: '1px solid rgba(22,163,74,.2)', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: 'rgba(22,163,74,.1)', color: '#16A34A' }} onClick={() => blockUser(u.id, true)}>Unblock</button>
                        <button style={{ padding: '6px 12px', border: '1px solid rgba(220,38,38,.2)', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: 'rgba(220,38,38,.1)', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '3px' }} onClick={() => setDeleteDialog({ show: true, user: u, reason: '' })}>
                          <Trash2 size={10} /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ═══════════ SETTINGS ═══════════ */}
          {activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { title: 'System Status', icon: <Activity size={15} color="#16A34A" />, items: [
                  { label: 'API Server',          status: 'Operational', color: '#16A34A' },
                  { label: 'PostgreSQL (Railway)', status: 'Operational', color: '#16A34A' },
                  { label: 'Resend Email',         status: 'Operational', color: '#16A34A' },
                  { label: 'Cloudinary CDN',       status: 'Operational', color: '#16A34A' },
                ]},
                { title: 'App Configuration', icon: <Settings size={15} color="#1A73E8" />, items: [
                  { label: 'Max Transfer',  status: 'PKR 50,000',  color: '#1A73E8' },
                  { label: 'KYC Required', status: 'Yes',          color: '#16A34A' },
                  { label: 'OTP Expiry',   status: '10 minutes',   color: '#1A73E8' },
                  { label: 'Access Token', status: '15 minutes',   color: '#CA8A04' },
                  { label: 'Refresh Token',status: '30 days',      color: '#16A34A' },
                  { label: 'Rate Limiting',status: 'Enabled',      color: '#16A34A' },
                ]},
              ].map((sec, si) => (
                <div key={si} style={card}>
                  <SH title={sec.title} right={<div style={{ width: '28px', height: '28px', borderRadius: '8px', background: c.cardAlt, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sec.icon}</div>} />
                  <div style={{ padding: '4px 18px 10px' }}>
                    {sec.items.map((item, i, arr) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                        <span style={{ color: c.textSec, fontSize: '12px' }}>{item.label}</span>
                        <span style={{ color: item.color, fontSize: '11px', fontWeight: '700', background: `${item.color}12`, padding: '2px 9px', borderRadius: '20px', border: `1px solid ${item.color}20` }}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ── MEDIA VIEWER — handles both images and liveness videos ── */}

          {/* ══ BRANDING ══ */}
          {activeTab === 'branding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Brand Identity */}
              <div style={{ background: c.card, borderRadius: '16px', border: `1px solid ${c.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: '10px', background: c.cardAlt }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Globe size={16} color="#fff" /></div>
                  <div>
                    <p style={{ color: c.text, fontSize: '14px', fontWeight: '700', margin: 0 }}>Brand Identity</p>
                    <p style={{ color: c.textSec, fontSize: '11px', margin: 0 }}>App name, tagline, logo</p>
                  </div>
                </div>
                <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[{ key: 'app_name', label: 'App Name', ph: 'e.g. PayEase' }, { key: 'tagline', label: 'Tagline', ph: 'e.g. Your Digital Wallet' }].map(f => (
                      <div key={f.key}>
                        <label style={{ color: c.textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '5px' }}>{f.label}</label>
                        <input style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${wlForm?.[f.key] ? '#1A73E8' : c.border}`, borderRadius: '10px', background: c.inputBg, color: c.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }}
                          value={wlForm?.[f.key] || ''} onChange={e => setWlForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[{ key: 'support_email', label: 'Support Email', ph: 'support@yourapp.com' }, { key: 'website_url', label: 'Website URL', ph: 'https://yourapp.com' }].map(f => (
                      <div key={f.key}>
                        <label style={{ color: c.textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '5px' }}>{f.label}</label>
                        <input style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${c.border}`, borderRadius: '10px', background: c.inputBg, color: c.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                          value={wlForm?.[f.key] || ''} onChange={e => setWlForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={{ color: c.textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '8px' }}>Logo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '14px', background: c.cardAlt, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {wlForm?.logo_url ? <img src={wlForm.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} /> : <Palette size={24} color={c.textSec} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'rgba(26,115,232,0.1)', color: '#1A73E8', border: '1px solid rgba(26,115,232,0.2)', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: logoUploading ? 'not-allowed' : 'pointer', opacity: logoUploading ? 0.6 : 1 }}>
                          {logoUploading ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</> : <><Upload size={13} /> Upload Logo</>}
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadLogo(e.target.files[0])} disabled={logoUploading} />
                        </label>
                        {wlForm?.logo_url && <button onClick={() => setWlForm(p => ({ ...p, logo_url: '' }))} style={{ marginLeft: '8px', padding: '9px 14px', background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Remove</button>}
                        <p style={{ color: c.textSec, fontSize: '10px', margin: '6px 0 0 0' }}>PNG or SVG · recommended 200×200px</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Palette */}
              <div style={{ background: c.card, borderRadius: '16px', border: `1px solid ${c.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: '10px', background: c.cardAlt }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#EA580C,#CA8A04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Palette size={16} color="#fff" /></div>
                  <div>
                    <p style={{ color: c.text, fontSize: '14px', fontWeight: '700', margin: 0 }}>Color Palette</p>
                    <p style={{ color: c.textSec, fontSize: '11px', margin: 0 }}>Primary, secondary and accent colors</p>
                  </div>
                </div>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
                    {[
                      { key: 'primary_color',   label: 'Primary',   hint: 'Buttons, headers, links' },
                      { key: 'secondary_color', label: 'Secondary', hint: 'Accents, gradients' },
                      { key: 'accent_color',    label: 'Accent',    hint: 'Success states, badges' },
                    ].map(col => (
                      <div key={col.key}>
                        <label style={{ color: c.textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '8px' }}>{col.label}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: `1.5px solid ${c.border}`, borderRadius: '10px', background: c.inputBg }}>
                          <input type="color" value={wlForm?.[col.key] || '#000000'} onChange={e => setWlForm(p => ({ ...p, [col.key]: e.target.value }))}
                            style={{ width: '28px', height: '28px', border: 'none', borderRadius: '6px', padding: 0, cursor: 'pointer', background: 'transparent', flexShrink: 0 }} />
                          <input type="text" value={wlForm?.[col.key] || ''} onChange={e => setWlForm(p => ({ ...p, [col.key]: e.target.value }))}
                            style={{ flex: 1, border: 'none', background: 'transparent', color: c.text, fontSize: '12px', fontWeight: '700', outline: 'none', fontFamily: 'monospace' }} placeholder="#1A73E8" maxLength={7} />
                        </div>
                        <p style={{ color: c.textSec, fontSize: '10px', margin: '4px 0 0 0' }}>{col.hint}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p style={{ color: c.textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px 0' }}>Live Preview</p>
                    <div style={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${c.border}`, maxWidth: '320px' }}>
                      <div style={{ background: `linear-gradient(135deg,${wlForm?.primary_color||'#1A73E8'},${wlForm?.secondary_color||'#7C3AED'})`, padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          {wlForm?.logo_url
                            ? <img src={wlForm.logo_url} style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'contain', background: 'rgba(255,255,255,0.2)', padding: '3px' }} alt="logo" />
                            : <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Palette size={14} color="#fff" /></div>
                          }
                          <span style={{ color: '#fff', fontSize: '14px', fontWeight: '800' }}>{wlForm?.app_name || 'YourApp'}</span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', margin: '0 0 4px 0' }}>Total Balance</p>
                        <p style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: 0 }}>PKR 50,000</p>
                      </div>
                      <div style={{ background: c.card, padding: '12px 16px' }}>
                        <p style={{ color: c.textSec, fontSize: '11px', margin: '0 0 8px 0' }}>{wlForm?.tagline || 'Your digital wallet'}</p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {[{ label: 'Send', colorKey: 'primary_color', def: '#1A73E8' }, { label: 'Deposit', colorKey: 'accent_color', def: '#16A34A' }, { label: 'History', colorKey: 'secondary_color', def: '#7C3AED' }].map(btn => (
                            <div key={btn.label} style={{ flex: 1, padding: '8px', background: `${wlForm?.[btn.colorKey]||btn.def}18`, borderRadius: '8px', textAlign: 'center' }}>
                              <p style={{ color: wlForm?.[btn.colorKey] || btn.def, fontSize: '10px', fontWeight: '700', margin: 0 }}>{btn.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Toggles */}
              <div style={{ background: c.card, borderRadius: '16px', border: `1px solid ${c.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: '10px', background: c.cardAlt }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#16A34A,#15803D)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={16} color="#fff" /></div>
                  <div>
                    <p style={{ color: c.text, fontSize: '14px', fontWeight: '700', margin: 0 }}>Feature Toggles</p>
                    <p style={{ color: c.textSec, fontSize: '11px', margin: 0 }}>Enable or disable features for this deployment</p>
                  </div>
                </div>
                <div style={{ padding: '6px 0' }}>
                  {[
                    { key: 'bills',        label: 'Utility Bills',     desc: 'Electricity, gas, internet payments' },
                    { key: 'bill_split',   label: 'Bill Splitting',    desc: 'Group expense splitting' },
                    { key: 'virtual_card', label: 'Virtual Card',      desc: 'Digital debit card' },
                    { key: 'qr_code',      label: 'QR Code',           desc: 'Send / receive via QR' },
                    { key: 'insights',     label: 'Spending Insights', desc: 'Charts and analytics' },
                    { key: 'kyc_required', label: 'KYC Required',      desc: 'Require verification for transfers' },
                  ].map((feat, i, arr) => {
                    const isOn = wlForm?.features?.[feat.key] !== false;
                    const accent = wlForm?.accent_color || '#16A34A';
                    return (
                      <div key={feat.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                        <div>
                          <p style={{ color: c.text, fontSize: '13px', fontWeight: '700', margin: '0 0 2px 0' }}>{feat.label}</p>
                          <p style={{ color: c.textSec, fontSize: '11px', margin: 0 }}>{feat.desc}</p>
                        </div>
                        <button onClick={() => setWlForm(p => ({ ...p, features: { ...(p.features || {}), [feat.key]: !isOn } }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                          <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: isOn ? accent : c.border, position: 'relative', transition: 'all 0.25s', boxShadow: isOn ? `0 0 10px ${accent}50` : 'none' }}>
                            <div style={{ position: 'absolute', top: '3px', left: isOn ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'all 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={exportWlConfig} style={{ flex: 1, padding: '12px', background: c.cardAlt, color: c.text, border: `1px solid ${c.border}`, borderRadius: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Download size={14} /> Export JSON
                </button>
                <button onClick={saveWhitelabel} disabled={wlSaving}
                  style={{ flex: 2, padding: '12px', background: `linear-gradient(135deg,${wlForm?.primary_color||'#1A73E8'},${wlForm?.secondary_color||'#7C3AED'})`, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '800', cursor: wlSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: wlSaving ? 0.7 : 1, boxShadow: `0 4px 16px ${wlForm?.primary_color||'#1A73E8'}40` }}>
                  {wlSaving ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><CheckCircle size={13} /> Save Branding</>}
                </button>
              </div>

            </div>
          )}

      {selectedImage && (

        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.96)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, cursor: 'pointer' }} onClick={() => setSelectedImage(null)}>
          <div style={{ background: c.card, borderRadius: '18px', padding: '18px', maxWidth: isVideoUrl(selectedImage) ? '700px' : '640px', width: '90%', cursor: 'default', border: `1px solid ${c.border}`, boxShadow: '0 32px 80px rgba(0,0,0,.7)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ color: c.text, fontSize: '13px', fontWeight: '700', margin: 0 }}>
                {isVideoUrl(selectedImage) ? 'Liveness Video — Watch to verify identity' : 'Document Preview'}
              </p>
              <button style={{ width: '30px', height: '30px', borderRadius: '8px', background: c.cardAlt, border: `1px solid ${c.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedImage(null)}>
                <X size={13} color={c.text} />
              </button>
            </div>

            {isVideoUrl(selectedImage) ? (
              <div>
                <video
                  src={selectedImage}
                  controls
                  autoPlay
                  controlsList="nodownload"
                  style={{ width: '100%', borderRadius: '10px', maxHeight: '65vh', background: '#000', display: 'block' }}
                />
                <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(220,38,38,0.08)', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626', flexShrink: 0 }} />
                  <p style={{ color: c.textSec, fontSize: '12px', margin: 0 }}>
                    Watch the full video to verify the user performed all liveness challenges: look straight, left, right, up, blink, smile.
                  </p>
                </div>
              </div>
            ) : (
              <img src={selectedImage} style={{ width: '100%', borderRadius: '10px', maxHeight: '65vh', objectFit: 'contain' }} alt="Document" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}