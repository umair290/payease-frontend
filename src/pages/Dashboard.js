import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { accountService, notificationService } from '../services/api';
import {
  Home, Send, QrCode, Clock, User, Eye, EyeOff,
  ArrowUpRight, ArrowDownLeft, ChevronRight,
  Sun, Moon, Bell, FileText, CheckCircle,
  Download, Share2, Printer, X, Wallet,
  TrendingUp, Plus
} from 'lucide-react';

export default function Dashboard() {
  const { logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: '' });
  const [balanceCount, setBalanceCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (balance?.balance) {
      let start = 0;
      const end = balance.balance;
      const duration = 1200;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) { setBalanceCount(end); clearInterval(timer); }
        else setBalanceCount(Math.floor(start));
      }, 16);
      return () => clearInterval(timer);
    }
  }, [balance]);

  const loadData = async () => {
    try {
      const [balRes, txRes] = await Promise.all([
        accountService.getBalance(),
        accountService.getTransactions(),
      ]);
      setBalance(balRes.data);
      setTransactions(txRes.data.transactions || []);
      try {
        const notifRes = await notificationService.getAll();
        setUnreadCount(notifRes.data.unread_count || 0);
      } catch (e) {}
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr.replace ? dateStr.replace(' ', 'T') : dateStr);
      if (isNaN(date)) return '';
      const now = new Date();
      const diff = Math.floor((now - date) / 60000);
      if (diff < 1) return 'Just now';
      if (diff < 60) return `${diff}m ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
      return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
    } catch { return ''; }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    setActionLoading(true);
    try {
      await accountService.deposit({ amount: parseFloat(depositAmount) });
      setShowDeposit(false);
      setDepositAmount('');
      await loadData();
      setReceiptData({
        type: 'Deposit',
        amount: parseFloat(depositAmount),
        to: balance?.wallet_number,
        toName: balance?.full_name,
        date: new Date().toLocaleString('en-PK'),
        ref: 'DEP' + Date.now().toString().slice(-8),
        status: 'Successful'
      });
      setShowReceipt(true);
    } catch (err) {
      showToast(err.response?.data?.error || 'Deposit failed', 'error');
    }
    setActionLoading(false);
  };

  const handlePrintReceipt = () => {
    if (!receiptData) return;
    const html = `<html><head><title>PayEase Receipt</title>
    <style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family:-apple-system,sans-serif; background:#f0f4ff; display:flex; justify-content:center; padding:40px 20px; } .r { background:#fff; border-radius:20px; width:100%; max-width:400px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.12); } .h { background:linear-gradient(135deg,#1A73E8,#0052CC); padding:28px; text-align:center; } .logo { color:#fff; font-size:22px; font-weight:bold; margin-bottom:12px; } .check { color:#fff; font-size:32px; margin-bottom:8px; } .status { color:#fff; font-size:17px; font-weight:bold; } .amt { color:#fff; font-size:32px; font-weight:bold; margin-top:10px; } .b { padding:20px; } .row { display:flex; justify-content:space-between; padding:11px 0; border-bottom:1px solid #f0f4ff; } .row:last-child { border-bottom:none; } .l { color:#888; font-size:13px; } .v { font-weight:600; font-size:13px; color:#1A1A2E; } .f { background:#f8faff; border-top:1px solid #e0e6f0; padding:14px; text-align:center; } .f p { color:#888; font-size:11px; margin-bottom:3px; } @media print { body { background:white; } .r { box-shadow:none; } }</style></head>
    <body><div class="r"><div class="h"><div class="logo">PayEase</div><div class="check">✓</div><div class="status">${receiptData.status}</div><div class="amt">PKR ${receiptData.amount?.toLocaleString()}</div></div>
    <div class="b"><div class="row"><span class="l">Type</span><span class="v">${receiptData.type}</span></div><div class="row"><span class="l">To</span><span class="v">${receiptData.toName || receiptData.to}</span></div><div class="row"><span class="l">Reference</span><span class="v">${receiptData.ref}</span></div><div class="row"><span class="l">Date</span><span class="v">${receiptData.date}</span></div><div class="row"><span class="l">Status</span><span class="v" style="color:#00C853">✓ ${receiptData.status}</span></div></div>
    <div class="f"><p>Thank you for using PayEase</p><p style="color:#1A73E8;font-weight:bold">payease-frontend.vercel.app</p></div></div></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handleShareReceipt = () => {
    const text = `✅ PayEase Receipt\n\nType: ${receiptData?.type}\nAmount: PKR ${receiptData?.amount?.toLocaleString()}\nRef: ${receiptData?.ref}\nDate: ${receiptData?.date}\nStatus: ${receiptData?.status}\n\npayease-frontend.vercel.app`;
    if (navigator.share) navigator.share({ title: 'PayEase Receipt', text });
    else { navigator.clipboard.writeText(text); showToast('Receipt copied!'); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: '36px', height: '36px', border: `3px solid ${colors.border}`, borderTop: '3px solid #1A73E8', borderRadius: '50%' }} />
    </div>
  );

  const quickActions = [
    { icon: <Send size={20} color="#1A73E8" />, label: 'Send', bg: 'rgba(26,115,232,0.1)', action: () => navigate('/send') },
    { icon: <Plus size={20} color="#16A34A" />, label: 'Deposit', bg: 'rgba(22,163,74,0.1)', action: () => setShowDeposit(true) },
    { icon: <FileText size={20} color="#EA580C" />, label: 'Bills', bg: 'rgba(234,88,12,0.1)', action: () => navigate('/bills') },
    { icon: <QrCode size={20} color="#7C3AED" />, label: 'QR', bg: 'rgba(124,58,237,0.1)', action: () => navigate('/qr') },
  ];

  const navTabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'send', icon: Send, label: 'Send' },
    { id: 'scan', icon: QrCode, label: 'Scan' },
    { id: 'history', icon: Clock, label: 'History' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const totalIn = transactions.filter(t => t.direction === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.direction === 'debit').reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto', position: 'relative' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast.msg && (
          <motion.div
            style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? '#DC2626' : '#16A34A', color: '#fff', padding: '12px 20px', borderRadius: '12px', zIndex: 9999, fontSize: '14px', fontWeight: '600', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <CheckCircle size={15} color="#fff" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
        <div>
          <p style={{ color: colors.textSecondary, fontSize: '12px', margin: '0 0 2px 0', fontWeight: '500' }}>Good day,</p>
          <p style={{ color: colors.text, fontSize: '17px', fontWeight: '700', margin: 0 }}>
            {balance?.full_name?.split(' ')[0]} 👋
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.div
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.actionBg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            whileTap={{ scale: 0.9 }} onClick={toggleTheme}
          >
            {isDark ? <Sun size={17} color="#CA8A04" /> : <Moon size={17} color="#1A73E8" />}
          </motion.div>

          {/* Bell with badge */}
          <motion.div
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.actionBg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
            whileTap={{ scale: 0.9 }} onClick={() => navigate('/notifications')}
          >
            <Bell size={17} color={colors.text} />
            {unreadCount > 0 && (
              <motion.div
                style={{ position: 'absolute', top: '-3px', right: '-3px', width: '16px', height: '16px', borderRadius: '50%', background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${colors.card}` }}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
              >
                <span style={{ color: '#fff', fontSize: '8px', fontWeight: 'bold' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}
            whileTap={{ scale: 0.9 }} onClick={() => navigate('/profile')}
          >
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
              {balance?.full_name?.charAt(0).toUpperCase()}
            </span>
          </motion.div>
        </div>
      </div>

      {/* ── BALANCE CARD ── */}
      <div style={{ padding: '16px 16px 0' }}>
        <motion.div
          style={{ background: 'linear-gradient(135deg, #1A73E8 0%, #0052CC 100%)', borderRadius: '20px', padding: '24px', boxShadow: '0 12px 40px rgba(26,115,232,0.3)', position: 'relative', overflow: 'hidden' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', left: '30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', margin: '0 0 6px 0', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Balance</p>
              <motion.h2
                style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold', margin: 0, letterSpacing: '-0.5px' }}
                animate={{ opacity: hideBalance ? 0.3 : 1 }}
              >
                {hideBalance ? 'PKR ••••••' : `PKR ${balanceCount.toLocaleString()}`}
              </motion.h2>
            </div>
            <motion.div
              style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', zIndex: 2 }}
              whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setHideBalance(!hideBalance); }}
            >
              {hideBalance ? <Eye size={16} color="rgba(255,255,255,0.8)" /> : <EyeOff size={16} color="rgba(255,255,255,0.8)" />}
            </motion.div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                <ArrowDownLeft size={12} color="rgba(255,255,255,0.7)" />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Money In</span>
              </div>
              <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', margin: 0 }}>
                PKR {totalIn.toLocaleString()}
              </p>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                <ArrowUpRight size={12} color="rgba(255,255,255,0.7)" />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Money Out</span>
              </div>
              <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', margin: 0 }}>
                PKR {totalOut.toLocaleString()}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '10px', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wallet ID</p>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '600', margin: 0, fontFamily: 'monospace', letterSpacing: '1px' }}>
                {balance?.wallet_number?.slice(0, 6)}••••••
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#FF5F00', opacity: 0.9 }} />
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#FFB300', opacity: 0.9, marginLeft: '-10px' }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <motion.div
        style={{ margin: '14px 16px', background: colors.card, borderRadius: '16px', padding: '16px 8px', border: `1px solid ${colors.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {quickActions.map((item, i) => (
            <motion.div
              key={i}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}
              whileTap={{ scale: 0.88 }} onClick={item.action}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0, fontWeight: '600' }}>{item.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── RECENT TRANSACTIONS ── */}
      <motion.div
        style={{ margin: '0 16px 16px', background: colors.card, borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      >
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 12px' }}>
          <h3 style={{ color: colors.text, fontSize: '15px', fontWeight: '700', margin: 0 }}>Recent Activity</h3>
          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', background: colors.actionBg, padding: '5px 10px', borderRadius: '8px', border: `1px solid ${colors.border}` }}
            whileTap={{ scale: 0.95 }} onClick={() => navigate('/history')}
          >
            <span style={{ color: '#1A73E8', fontSize: '12px', fontWeight: '600' }}>See all</span>
            <ChevronRight size={13} color="#1A73E8" />
          </motion.div>
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 20px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Wallet size={24} color={colors.textSecondary} />
            </div>
            <p style={{ color: colors.text, margin: '0 0 4px 0', fontWeight: '600', fontSize: '14px' }}>No transactions yet</p>
            <p style={{ color: colors.textSecondary, fontSize: '12px', margin: '0 0 16px 0' }}>Start by depositing money</p>
            <motion.button
              style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              whileTap={{ scale: 0.97 }} onClick={() => setShowDeposit(true)}
            >
              Deposit Now
            </motion.button>
          </div>
        ) : (
          <div>
            {transactions.slice(0, 5).map((tx, i) => (
              <motion.div
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderTop: `1px solid ${colors.border}`, cursor: 'pointer' }}
                whileTap={{ scale: 0.99 }}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                onClick={() => {
                  setReceiptData({
                    type: tx.type === 'transfer' ? (tx.direction === 'credit' ? 'Money Received' : 'Money Sent') : tx.type,
                    amount: tx.amount,
                    to: tx.to_wallet,
                    from: tx.from_wallet,
                    toName: tx.description,
                    date: new Date(tx.created_at).toLocaleString('en-PK'),
                    ref: 'TXN' + (tx.id || Date.now().toString().slice(-8)),
                    status: tx.status === 'completed' ? 'Successful' : tx.status,
                    direction: tx.direction
                  });
                  setShowReceipt(true);
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: tx.direction === 'credit' ? 'rgba(22,163,74,0.1)' : 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {tx.direction === 'credit'
                    ? <ArrowDownLeft size={18} color="#16A34A" />
                    : <ArrowUpRight size={18} color="#1A73E8" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.description || 'Transaction'}
                  </p>
                  <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>{formatDate(tx.created_at)}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 2px 0', color: tx.direction === 'credit' ? '#16A34A' : '#1A73E8' }}>
                    {tx.direction === 'credit' ? '+' : '-'} PKR {tx.amount?.toLocaleString()}
                  </p>
                  <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: '600', background: 'rgba(22,163,74,0.08)', padding: '1px 6px', borderRadius: '4px' }}>
                    {tx.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <div style={{ height: '80px' }} />

      {/* ── BOTTOM NAV ── */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: colors.navBg, borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-around', padding: '8px 0 16px', zIndex: 100, boxSizing: 'border-box' }}>
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.div
              key={tab.id}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer', padding: '4px 16px', position: 'relative' }}
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'send') navigate('/send');
                if (tab.id === 'scan') navigate('/qr');
                if (tab.id === 'history') navigate('/history');
                if (tab.id === 'profile') navigate('/profile');
              }}
            >
              {isActive && (
                <motion.div
                  style={{ position: 'absolute', top: '-8px', width: '20px', height: '3px', borderRadius: '0 0 3px 3px', background: '#1A73E8' }}
                  layoutId="tab-indicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={21} color={isActive ? '#1A73E8' : colors.textSecondary} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{ fontSize: '10px', color: isActive ? '#1A73E8' : colors.textSecondary, fontWeight: isActive ? '700' : '400' }}>
                {tab.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* ── DEPOSIT MODAL ── */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setShowDeposit(false)} />
            <motion.div
              style={{ background: colors.card, borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: '480px', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}
              initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div style={{ width: '36px', height: '4px', background: colors.border, borderRadius: '2px', margin: '0 auto 20px' }} />

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Plus size={24} color="#16A34A" />
                </div>
                <div>
                  <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: '0 0 2px 0' }}>Add Money</h3>
                  <p style={{ color: colors.textSecondary, fontSize: '13px', margin: 0 }}>Deposit funds to your wallet</p>
                </div>
              </div>

              {/* Amount Input */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: colors.textSecondary, fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount (PKR)</p>
                <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${depositAmount ? '#1A73E8' : colors.border}`, borderRadius: '14px', padding: '0 16px', background: colors.inputBg, transition: 'all 0.2s', boxShadow: depositAmount ? '0 0 0 3px rgba(26,115,232,0.08)' : 'none' }}>
                  <span style={{ color: colors.textSecondary, fontSize: '18px', fontWeight: '600', marginRight: '8px' }}>PKR</span>
                  <input
                    style={{ flex: 1, padding: '16px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '26px', fontWeight: 'bold', outline: 'none' }}
                    type="number" placeholder="0" value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick amounts */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {[500, 1000, 5000, 10000].map(amt => (
                  <motion.button
                    key={amt}
                    style={{ flex: 1, padding: '8px 4px', background: depositAmount == amt ? '#1A73E8' : colors.actionBg, color: depositAmount == amt ? '#fff' : colors.textSecondary, border: `1px solid ${depositAmount == amt ? '#1A73E8' : colors.border}`, borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDepositAmount(String(amt))}
                  >
                    {amt >= 1000 ? `${amt/1000}K` : amt}
                  </motion.button>
                ))}
              </div>

              <motion.button
                style={{ width: '100%', padding: '15px', background: depositAmount ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : '#E5E7EB', color: depositAmount ? '#fff' : '#9CA3AF', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: depositAmount ? 'pointer' : 'not-allowed', marginBottom: '10px', boxShadow: depositAmount ? '0 6px 20px rgba(26,115,232,0.3)' : 'none', transition: 'all 0.2s' }}
                whileTap={depositAmount ? { scale: 0.97 } : {}}
                onClick={handleDeposit} disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : `Deposit PKR ${depositAmount ? parseFloat(depositAmount).toLocaleString() : '0'}`}
              </motion.button>
              <motion.button
                style={{ width: '100%', padding: '13px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}
                whileTap={{ scale: 0.97 }} onClick={() => setShowDeposit(false)}
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RECEIPT MODAL ── */}
      <AnimatePresence>
        {showReceipt && receiptData && (
          <motion.div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px', boxSizing: 'border-box' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setShowReceipt(false)} />
            <motion.div
              style={{ background: colors.card, borderRadius: '24px', width: '100%', maxWidth: '360px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.3)', position: 'relative', zIndex: 1 }}
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              {/* Close */}
              <motion.div
                style={{ position: 'absolute', top: '14px', right: '14px', width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
                whileTap={{ scale: 0.9 }} onClick={() => setShowReceipt(false)}
              >
                <X size={14} color="#fff" />
              </motion.div>

              {/* Receipt Header */}
              <div style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', padding: '24px', textAlign: 'center' }}>
                <motion.div
                  style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', border: '2px solid rgba(255,255,255,0.3)' }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                >
                  <CheckCircle size={28} color="#fff" />
                </motion.div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '0 0 4px 0' }}>{receiptData.type}</p>
                <motion.p
                  style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', margin: '0 0 6px 0' }}
                  initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                >
                  PKR {receiptData.amount?.toLocaleString()}
                </motion.p>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '10px' }}>
                  ✓ {receiptData.status}
                </span>
              </div>

              {/* Details */}
              <div style={{ padding: '16px 20px' }}>
                {[
                  { label: 'Type', value: receiptData.type },
                  { label: receiptData.direction === 'credit' ? 'From' : 'To', value: receiptData.toName || receiptData.to || '-' },
                  { label: 'Reference', value: receiptData.ref },
                  { label: 'Date', value: receiptData.date },
                  { label: 'Status', value: receiptData.status, color: '#16A34A' },
                ].map((row, i, arr) => (
                  <motion.div
                    key={i}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none' }}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <span style={{ color: colors.textSecondary, fontSize: '12px' }}>{row.label}</span>
                    <span style={{ color: row.color || colors.text, fontSize: '12px', fontWeight: '600', maxWidth: '55%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.value}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1px', borderTop: `1px solid ${colors.border}` }}>
                <motion.button
                  style={{ flex: 1, padding: '13px', background: colors.actionBg, color: colors.text, border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', borderRight: `1px solid ${colors.border}` }}
                  whileTap={{ scale: 0.97 }} onClick={handlePrintReceipt}
                >
                  <Printer size={14} color={colors.text} /> Print
                </motion.button>
                <motion.button
                  style={{ flex: 1, padding: '13px', background: colors.actionBg, color: '#1A73E8', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', borderRight: `1px solid ${colors.border}` }}
                  whileTap={{ scale: 0.97 }} onClick={handleShareReceipt}
                >
                  <Share2 size={14} color="#1A73E8" /> Share
                </motion.button>
                <motion.button
                  style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                  whileTap={{ scale: 0.97 }} onClick={() => setShowReceipt(false)}
                >
                  <Download size={14} color="#fff" /> Done
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
