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
  Download, Share2, Printer, X
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
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [balanceCount, setBalanceCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (balance?.balance) {
      let start = 0;
      const end = balance.balance;
      const duration = 1000;
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
      const balRes = await accountService.getBalance();
      setBalance(balRes.data);
      const txRes = await accountService.getTransactions();
      setTransactions(txRes.data.transactions || []);
      try {
        const notifRes = await notificationService.getAll();
        setUnreadCount(notifRes.data.unread_count || 0);
      } catch (e) {}
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date)) return '';
      const now = new Date();
      const diff = Math.floor((now - date) / 60000);
      if (diff < 1) return 'Just now';
      if (diff < 60) return `${diff}min ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)}hr ago`;
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
      // Show receipt
      setReceiptData({
        type: 'Deposit',
        amount: parseFloat(depositAmount),
        to: balance?.wallet_number,
        toName: balance?.full_name,
        from: 'External',
        date: new Date().toLocaleString('en-PK'),
        ref: 'DEP' + Date.now().toString().slice(-8),
        status: 'Successful'
      });
      setShowReceipt(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed');
      setTimeout(() => setError(''), 3000);
    }
    setActionLoading(false);
  };

  const handlePrintReceipt = () => {
    if (!receiptData) return;
    const receiptHtml = `
      <html>
      <head>
        <title>PayEase Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 400px; margin: 40px auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #1A73E8; }
          .status { background: #e8f5e9; color: #00C853; padding: 10px; border-radius: 10px; text-align: center; font-weight: bold; margin: 20px 0; }
          .amount { font-size: 36px; font-weight: bold; text-align: center; color: #1A1A2E; margin: 20px 0; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .label { color: #888; font-size: 13px; }
          .value { font-weight: 600; font-size: 13px; }
          .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">PayEase</div>
          <p style="color:#888;font-size:13px;">Digital Wallet Receipt</p>
        </div>
        <div class="status">✓ ${receiptData.status}</div>
        <div class="amount">PKR ${receiptData.amount?.toLocaleString()}</div>
        <div class="row"><span class="label">Transaction Type</span><span class="value">${receiptData.type}</span></div>
        <div class="row"><span class="label">To</span><span class="value">${receiptData.toName || receiptData.to}</span></div>
        <div class="row"><span class="label">Reference</span><span class="value">${receiptData.ref}</span></div>
        <div class="row"><span class="label">Date & Time</span><span class="value">${receiptData.date}</span></div>
        <div class="footer">Thank you for using PayEase<br/>Keep this receipt for your records</div>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win.document.write(receiptHtml);
    win.document.close();
    win.print();
  };

  const handleShareReceipt = () => {
    if (!receiptData) return;
    const text = `PayEase Receipt\n\n✓ ${receiptData.status}\nAmount: PKR ${receiptData.amount?.toLocaleString()}\nType: ${receiptData.type}\nTo: ${receiptData.toName || receiptData.to}\nRef: ${receiptData.ref}\nDate: ${receiptData.date}\n\nPowered by PayEase`;
    if (navigator.share) {
      navigator.share({ title: 'PayEase Receipt', text });
    } else {
      navigator.clipboard.writeText(text);
      setSuccess('Receipt copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: '40px', height: '40px', border: '3px solid #E0E6F0', borderTop: '3px solid #1A73E8', borderRadius: '50%' }}
      />
    </div>
  );

  const quickActions = [
    { icon: <ArrowUpRight size={22} color="#1A73E8" />, label: 'Send', bg: 'rgba(26,115,232,0.1)', action: () => navigate('/send') },
    { icon: <ArrowDownLeft size={22} color="#00C853" />, label: 'Deposit', bg: 'rgba(0,200,83,0.1)', action: () => setShowDeposit(true) },
    { icon: <FileText size={22} color="#FF6B35" />, label: 'Pay Bills', bg: 'rgba(255,107,53,0.1)', action: () => navigate('/bills') },
    { icon: <Clock size={22} color="#9C27B0" />, label: 'History', bg: 'rgba(156,39,176,0.1)', action: () => navigate('/history') },
  ];

  const navTabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'send', icon: Send, label: 'Send' },
    { id: 'scan', icon: QrCode, label: 'Scan' },
    { id: 'history', icon: Clock, label: 'History' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto', position: 'relative' }}>

      {/* Toast */}
      <AnimatePresence>
        {success && (
          <motion.div style={styles.toastSuccess}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}>
            ✓ {success}
          </motion.div>
        )}
        {error && (
          <motion.div style={styles.toastError}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}>
            ⚠ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 16px', background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
        <div>
          <p style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            Hi, {balance?.full_name?.split(' ')[0]} 👋
          </p>
          <p style={{ color: colors.textSecondary, fontSize: '13px', margin: '2px 0 0 0' }}>Welcome back!</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.div
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${colors.border}` }}
            whileTap={{ scale: 0.9 }} onClick={toggleTheme}
          >
            {isDark ? <Sun size={18} color="#FFB300" /> : <Moon size={18} color="#1A73E8" />}
          </motion.div>

          {/* Bell with unread badge */}
          <motion.div
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${colors.border}`, position: 'relative' }}
            whileTap={{ scale: 0.9 }} onClick={() => navigate('/notifications')}
          >
            <Bell size={18} color={colors.text} />
            {unreadCount > 0 && (
              <motion.div
                style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', background: '#FF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${colors.card}` }}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
              >
                <span style={{ color: '#fff', fontSize: '9px', fontWeight: 'bold' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}
            whileTap={{ scale: 0.9 }} onClick={() => navigate('/profile')}
          >
            <span style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
              {balance?.full_name?.charAt(0).toUpperCase()}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Balance Card */}
      <motion.div
        style={{ margin: '16px', background: 'linear-gradient(135deg, #1A73E8 0%, #0052CC 100%)', borderRadius: '20px', padding: '20px', boxShadow: '0 12px 40px rgba(26,115,232,0.35)', cursor: 'pointer' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        whileTap={{ scale: 0.98 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', position: 'relative', width: '44px', height: '28px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FF5F00', opacity: 0.95, position: 'absolute', left: 0 }} />
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFB300', opacity: 0.95, position: 'absolute', left: '16px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0, fontWeight: '500' }}>Current Balance</p>
            <motion.div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setHideBalance(!hideBalance)} whileTap={{ scale: 0.9 }}>
              {hideBalance ? <Eye size={16} color="rgba(255,255,255,0.8)" /> : <EyeOff size={16} color="rgba(255,255,255,0.8)" />}
            </motion.div>
          </div>
        </div>
        <motion.h2
          style={{ color: '#fff', fontSize: '30px', fontWeight: 'bold', margin: '0 0 20px 0', letterSpacing: '0.5px' }}
          animate={{ opacity: hideBalance ? 0.3 : 1 }}
        >
          {hideBalance ? 'PKR ••••••' : `PKR ${balanceCount.toLocaleString()}`}
        </motion.h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0, fontWeight: '500' }}>{balance?.full_name}</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0, fontFamily: 'monospace', letterSpacing: '2px' }}>
            {balance?.wallet_number?.slice(0, 4)}••••••
          </p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        style={{ display: 'flex', justifyContent: 'space-around', padding: '16px', background: colors.card, margin: '0 16px 16px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${colors.border}` }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      >
        {quickActions.map((item, i) => (
          <motion.div
            key={i}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '8px' }}
            whileTap={{ scale: 0.88 }} onClick={item.action}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.icon}
            </div>
            <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, fontWeight: '500' }}>{item.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Transactions */}
      <motion.div
        style={{ background: colors.card, margin: '0 16px 16px', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${colors.border}` }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Latest Transactions</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }} onClick={() => navigate('/history')}>
            <span style={{ color: '#1A73E8', fontSize: '13px', fontWeight: '500' }}>See All</span>
            <ChevronRight size={14} color="#1A73E8" />
          </div>
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={28} color={colors.textSecondary} />
            </div>
            <p style={{ color: colors.text, margin: 0, fontWeight: '600', fontSize: '15px' }}>No transactions yet</p>
            <p style={{ color: colors.textSecondary, fontSize: '13px', margin: 0 }}>Start by depositing money!</p>
            <motion.button
              style={{ marginTop: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              whileTap={{ scale: 0.97 }} onClick={() => setShowDeposit(true)}
            >
              Deposit Now
            </motion.button>
          </div>
        ) : (
          transactions.slice(0, 6).map((tx, i) => (
            <motion.div
              key={i}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < transactions.slice(0, 6).length - 1 ? `1px solid ${colors.border}` : 'none', cursor: 'pointer' }}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
              whileTap={{ scale: 0.98 }}
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
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: tx.direction === 'credit' ? 'rgba(0,200,83,0.1)' : 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {tx.direction === 'credit' ? <ArrowDownLeft size={20} color="#00C853" /> : <ArrowUpRight size={20} color="#1A73E8" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: colors.text, fontSize: '14px', fontWeight: '500', margin: '0 0 3px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tx.description || 'Transaction'}
                </p>
                <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>{formatDate(tx.created_at)}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 2px 0', color: tx.direction === 'credit' ? '#00C853' : '#1A73E8' }}>
                  {tx.direction === 'credit' ? '+' : '-'} PKR {tx.amount?.toLocaleString()}
                </p>
                <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', background: tx.status === 'completed' ? 'rgba(0,200,83,0.1)' : 'rgba(255,179,0,0.1)', color: tx.status === 'completed' ? '#00C853' : '#FFB300' }}>
                  {tx.status}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      <div style={{ height: '90px' }} />

      {/* Bottom Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: colors.navBg, display: 'flex', justifyContent: 'space-around', padding: '10px 0 16px', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', zIndex: 100, boxSizing: 'border-box', borderTop: `1px solid ${colors.border}` }}>
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.div
              key={tab.id}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '4px', position: 'relative', padding: '0 12px' }}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'send') navigate('/send');
                if (tab.id === 'scan') navigate('/qr');
                if (tab.id === 'history') navigate('/history');
                if (tab.id === 'profile') navigate('/profile');
              }}
              whileTap={{ scale: 0.85 }}
            >
              {isActive && (
                <motion.div
                  style={{ position: 'absolute', top: '-10px', width: '20px', height: '3px', borderRadius: '0 0 4px 4px', background: '#1A73E8' }}
                  layoutId="navIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={22} color={isActive ? '#1A73E8' : colors.textSecondary} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{ fontSize: '10px', color: isActive ? '#1A73E8' : colors.textSecondary, fontWeight: isActive ? '600' : '400' }}>
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
            onClick={() => setShowDeposit(false)}
          >
            <motion.div
              style={{ background: colors.card, borderRadius: '24px 24px 0 0', padding: '24px 24px 40px', width: '100%', maxWidth: '480px', boxSizing: 'border-box' }}
              initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ width: '40px', height: '4px', background: colors.border, borderRadius: '2px', margin: '0 auto 20px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(0,200,83,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ArrowDownLeft size={24} color="#00C853" />
                </div>
                <div>
                  <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: '0 0 2px 0' }}>Deposit Money</h3>
                  <p style={{ color: colors.textSecondary, fontSize: '13px', margin: 0 }}>Add funds to your wallet</p>
                </div>
              </div>
              <p style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', margin: '0 0 6px 0' }}>Amount (PKR)</p>
              <input
                style={{ width: '100%', padding: '13px 16px', border: `1.5px solid ${colors.border}`, borderRadius: '12px', background: colors.inputBg, color: colors.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }}
                type="number" placeholder="Enter amount"
                value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
              />
              <motion.button
                style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 6px 20px rgba(26,115,232,0.3)' }}
                whileTap={{ scale: 0.97 }} onClick={handleDeposit} disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Deposit Now'}
              </motion.button>
              <motion.button
                style={{ width: '100%', padding: '14px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '15px', cursor: 'pointer', boxSizing: 'border-box' }}
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
              {/* Close button */}
              <motion.div
                style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
                whileTap={{ scale: 0.9 }} onClick={() => setShowReceipt(false)}
              >
                <X size={16} color="#fff" />
              </motion.div>

              {/* Receipt Header */}
              <div style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', padding: '28px 24px', textAlign: 'center' }}>
                <motion.div
                  style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  <CheckCircle size={32} color="#fff" />
                </motion.div>
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                  {receiptData.status}!
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '0 0 12px 0' }}>{receiptData.type}</p>
                <motion.p
                  style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold', margin: 0 }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                >
                  PKR {receiptData.amount?.toLocaleString()}
                </motion.p>
              </div>

              {/* Receipt Details */}
              <div style={{ padding: '20px' }}>
                {[
                  { label: 'Transaction Type', value: receiptData.type },
                  { label: receiptData.direction === 'credit' ? 'From' : 'To', value: receiptData.toName || receiptData.to || '-' },
                  { label: 'Reference No.', value: receiptData.ref },
                  { label: 'Date & Time', value: receiptData.date },
                  { label: 'Status', value: receiptData.status },
                ].map((row, i) => (
                  <motion.div
                    key={i}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 4 ? `1px solid ${colors.border}` : 'none' }}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                  >
                    <span style={{ color: colors.textSecondary, fontSize: '13px' }}>{row.label}</span>
                    <span style={{ color: row.label === 'Status' ? '#00C853' : colors.text, fontSize: '13px', fontWeight: '600', maxWidth: '60%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.value}
                    </span>
                  </motion.div>
                ))}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <motion.button
                    style={{ flex: 1, padding: '13px', background: colors.actionBg, color: colors.text, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    whileTap={{ scale: 0.97 }} onClick={handlePrintReceipt}
                  >
                    <Printer size={15} color={colors.text} /> Print
                  </motion.button>
                  <motion.button
                    style={{ flex: 1, padding: '13px', background: 'rgba(26,115,232,0.08)', color: '#1A73E8', border: '1.5px solid rgba(26,115,232,0.2)', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    whileTap={{ scale: 0.97 }} onClick={handleShareReceipt}
                  >
                    <Share2 size={15} color="#1A73E8" /> Share
                  </motion.button>
                  <motion.button
                    style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}
                    whileTap={{ scale: 0.97 }} onClick={() => setShowReceipt(false)}
                  >
                    <Download size={15} color="#fff" /> Done
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  toastSuccess: {
    position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
    background: '#00C853', color: '#fff', padding: '12px 24px', borderRadius: '12px',
    zIndex: 9999, fontSize: '14px', fontWeight: 'bold',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)', whiteSpace: 'nowrap',
  },
  toastError: {
    position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
    background: '#FF4444', color: '#fff', padding: '12px 24px', borderRadius: '12px',
    zIndex: 9999, fontSize: '14px', fontWeight: 'bold',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)', whiteSpace: 'nowrap',
  },
};
