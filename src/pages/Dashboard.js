import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { accountService, notificationService } from '../services/api';
import {
  Home, Send, QrCode, Clock, User, Eye, EyeOff,
  ArrowUpRight, ArrowDownLeft, ChevronRight,
  Sun, Moon, Bell, FileText, CheckCircle,
  Share2, Printer, X, Wallet,
  Plus, BarChart2, CreditCard as CardIco,
  Zap, Shield, Sparkles, RefreshCw,
  TrendingUp, TrendingDown, Activity
} from 'lucide-react';

function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start     = prev.current;
    const end       = value;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(start + (end - start) * ease));
      if (progress < 1) requestAnimationFrame(tick);
      else { setDisplay(end); prev.current = end; }
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
}

export default function Dashboard() {
  const { logout, avatarUrl, onboardingDone, completeOnboarding, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [balance,        setBalance]        = useState(null);
  const [transactions,   setTransactions]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [hideBalance,    setHideBalance]    = useState(false);
  const [activeTab,      setActiveTab]      = useState('home');
  const [showDeposit,    setShowDeposit]    = useState(false);
  const [depositAmount,  setDepositAmount]  = useState('');
  const [actionLoading,  setActionLoading]  = useState(false);
  const [toast,          setToast]          = useState({ msg: '', type: '' });
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [showReceipt,    setShowReceipt]    = useState(false);
  const [receiptData,    setReceiptData]    = useState(null);
  const [greeting,       setGreeting]       = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12)      setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else             setGreeting('Good evening');
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && onboardingDone === false) {
      setShowOnboarding(true);
    }
  }, [loading, onboardingDone]);

  const loadData = async () => {
    try {
      const [balRes, txRes] = await Promise.all([
        accountService.getBalance(),
        accountService.getTransactions(1, 5),
      ]);
      setBalance(balRes.data);
      const txData = txRes.data;
      setTransactions(Array.isArray(txData) ? txData : (txData.transactions || []));
      try {
        const notifRes = await notificationService.getAll();
        setUnreadCount(notifRes.data.unread_count || 0);
      } catch (e) {}
    } catch (err) {
      console.error('loadData error:', err);
    }
    setLoading(false);
  };

  const handleCompleteOnboarding = async () => {
    setShowOnboarding(false);
    await completeOnboarding();
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(String(dateStr).replace(' ', 'T'));
      if (isNaN(date)) return '';
      const now  = new Date();
      const diff = Math.floor((now - date) / 60000);
      if (diff < 1)    return 'Just now';
      if (diff < 60)   return `${diff}m ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
      return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
    } catch { return ''; }
  };

  // ── DEPOSIT ──
  const handleDeposit = async () => {
    const amt = parseFloat(depositAmount);
    if (!depositAmount || isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    if (amt > 500000) {
      showToast('Maximum deposit is PKR 500,000', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await accountService.deposit({ amount: amt });
      setShowDeposit(false);
      setDepositAmount('');
      await loadData();
      setReceiptData({
        type:   'Deposit',
        amount: amt,
        to:     balance?.wallet_number,
        toName: balance?.full_name,
        date:   new Date().toLocaleString('en-PK'),
        ref:    'DEP' + Date.now().toString().slice(-8),
        status: 'Successful'
      });
      setShowReceipt(true);
      showToast('Deposit successful!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Deposit failed', 'error');
    }
    setActionLoading(false);
  };

  const handlePrintReceipt = () => {
    if (!receiptData) return;
    const html = `<html><head><title>PayEase Receipt</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,sans-serif;background:#f0f4ff;display:flex;justify-content:center;padding:40px 20px;}.r{background:#fff;border-radius:20px;width:100%;max-width:400px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.12);}.h{background:linear-gradient(135deg,#1A73E8,#0052CC);padding:28px;text-align:center;}.logo{color:#fff;font-size:22px;font-weight:bold;margin-bottom:12px;}.status{color:#fff;font-size:17px;font-weight:bold;}.amt{color:#fff;font-size:32px;font-weight:bold;margin-top:10px;}.b{padding:20px;}.row{display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid #f0f4ff;}.row:last-child{border-bottom:none;}.l{color:#888;font-size:13px;}.v{font-weight:600;font-size:13px;color:#1A1A2E;}.f{background:#f8faff;border-top:1px solid #e0e6f0;padding:14px;text-align:center;}.f p{color:#888;font-size:11px;margin-bottom:3px;}@media print{body{background:white;}.r{box-shadow:none;}}</style></head><body><div class="r"><div class="h"><div class="logo">PayEase</div><div class="status">${receiptData.status}</div><div class="amt">PKR ${Number(receiptData.amount).toLocaleString()}</div></div><div class="b"><div class="row"><span class="l">Type</span><span class="v">${receiptData.type}</span></div><div class="row"><span class="l">To</span><span class="v">${receiptData.toName || receiptData.to}</span></div><div class="row"><span class="l">Reference</span><span class="v">${receiptData.ref}</span></div><div class="row"><span class="l">Date</span><span class="v">${receiptData.date}</span></div><div class="row"><span class="l">Status</span><span class="v" style="color:#00C853">&#10003; ${receiptData.status}</span></div></div><div class="f"><p>Thank you for using PayEase</p><p style="color:#1A73E8;font-weight:bold">payease.space</p></div></div></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handleShareReceipt = () => {
    const text = `PayEase Receipt\n\nType: ${receiptData?.type}\nAmount: PKR ${Number(receiptData?.amount).toLocaleString()}\nRef: ${receiptData?.ref}\nDate: ${receiptData?.date}\nStatus: ${receiptData?.status}\n\npayease.space`;
    if (navigator.share) navigator.share({ title: 'PayEase Receipt', text });
    else { navigator.clipboard.writeText(text); showToast('Receipt copied!'); }
  };

  const quickActions = [
    { icon: <Send size={20} color="#fff" />,      label: 'Send',     grad: 'linear-gradient(135deg,#1A73E8,#0052CC)', shadow: 'rgba(26,115,232,0.4)',  action: () => navigate('/send') },
    { icon: <Plus size={20} color="#fff" />,      label: 'Deposit',  grad: 'linear-gradient(135deg,#16A34A,#15803D)', shadow: 'rgba(22,163,74,0.4)',   action: () => setShowDeposit(true) },
    { icon: <FileText size={20} color="#fff" />,  label: 'Bills',    grad: 'linear-gradient(135deg,#EA580C,#C2410C)', shadow: 'rgba(234,88,12,0.4)',   action: () => navigate('/bills') },
    { icon: <BarChart2 size={20} color="#fff" />, label: 'Insights', grad: 'linear-gradient(135deg,#0891B2,#0E7490)', shadow: 'rgba(8,145,178,0.4)',   action: () => navigate('/insights') },
    { icon: <CardIco size={20} color="#fff" />,   label: 'Card',     grad: 'linear-gradient(135deg,#CA8A04,#A16207)', shadow: 'rgba(202,138,4,0.4)',   action: () => navigate('/virtual-card') },
    { icon: <Clock size={20} color="#fff" />,     label: 'History',  grad: 'linear-gradient(135deg,#7C3AED,#5B21B6)', shadow: 'rgba(124,58,237,0.4)',  action: () => navigate('/history') },
  ];

  const navTabs = [
    { id: 'home',    icon: Home,   label: 'Home' },
    { id: 'send',    icon: Send,   label: 'Send' },
    { id: 'scan',    icon: QrCode, label: 'Scan' },
    { id: 'history', icon: Clock,  label: 'History' },
    { id: 'profile', icon: User,   label: 'Profile' },
  ];

  const totalIn  = transactions.filter(t => t.direction === 'credit').reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalOut = transactions.filter(t => t.direction === 'debit').reduce((s, t)  => s + Number(t.amount || 0), 0);

  const getTxLabel = (tx) => {
    if (tx.type === 'deposit')     return 'Deposit';
    if (tx.type === 'transfer')    return tx.direction === 'credit' ? 'Received' : 'Sent';
    if (tx.type === 'electricity') return 'Electricity';
    if (tx.type === 'gas')         return 'Gas Bill';
    if (tx.type === 'internet')    return 'Internet';
    if (tx.type === 'topup')       return 'Top-up';
    return tx.description || 'Transaction';
  };

  const getTxIcon = (tx) => {
    if (tx.type === 'deposit')     return { icon: <ArrowDownLeft size={16} color="#16A34A" />, bg: 'rgba(22,163,74,0.12)',  border: 'rgba(22,163,74,0.2)' };
    if (tx.direction === 'credit') return { icon: <ArrowDownLeft size={16} color="#16A34A" />, bg: 'rgba(22,163,74,0.12)',  border: 'rgba(22,163,74,0.2)' };
    if (tx.direction === 'debit')  return { icon: <ArrowUpRight  size={16} color="#1A73E8" />, bg: 'rgba(26,115,232,0.12)', border: 'rgba(26,115,232,0.2)' };
    return                                { icon: <Zap           size={16} color="#EA580C" />, bg: 'rgba(234,88,12,0.12)',  border: 'rgba(234,88,12,0.2)' };
  };

  const bg        = isDark ? '#0A0F1E' : '#F0F4FF';
  const card      = isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
  const cardSolid = isDark ? '#0F1629' : '#FFFFFF';
  const border    = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const text      = isDark ? '#F0F6FC' : '#0F172A';
  const textSec   = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8';
  const skelBase  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const skelShine = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';

  const displayName = (balance?.full_name || user?.full_name || '')?.split(' ')[0] || 'Welcome';

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, maxWidth: '480px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ width: '80px', height: '11px', borderRadius: '6px', background: `linear-gradient(90deg,${skelBase} 25%,${skelShine} 50%,${skelBase} 75%)`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          <div style={{ width: '120px', height: '22px', borderRadius: '8px', background: `linear-gradient(90deg,${skelBase} 25%,${skelShine} 50%,${skelBase} 75%)`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[38,38,40].map((w,i) => <div key={i} style={{ width:`${w}px`, height:`${w}px`, borderRadius:'12px', background:`linear-gradient(90deg,${skelBase} 25%,${skelShine} 50%,${skelBase} 75%)`, backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />)}
        </div>
      </div>
      <div style={{ padding: '0 16px 4px' }}>
        <div style={{ borderRadius: '24px', background: `linear-gradient(90deg,${skelBase} 25%,${skelShine} 50%,${skelBase} 75%)`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', height: '200px' }} />
      </div>
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '8px' }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'7px' }}>
              <div style={{ width:'48px', height:'48px', borderRadius:'16px', background:`linear-gradient(90deg,${skelBase} 25%,${skelShine} 50%,${skelBase} 75%)`, backgroundSize:'200% 100%', animation:`shimmer 1.5s ${i*0.1}s infinite` }} />
              <div style={{ width:'32px', height:'9px', borderRadius:'4px', background:`linear-gradient(90deg,${skelBase} 25%,${skelShine} 50%,${skelBase} 75%)`, backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ margin: '16px 16px 0', borderRadius: '20px', background: card, border: `1px solid ${border}`, overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px 12px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '120px', height: '15px', borderRadius: '6px', background: `linear-gradient(90deg,${skelBase} 25%,${skelShine} 50%,${skelBase} 75%)`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          <div style={{ width: '60px',  height: '15px', borderRadius: '6px', background: `linear-gradient(90deg,${skelBase} 25%,${skelShine} 50%,${skelBase} 75%)`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        </div>
        {[...Array(4)].map((_,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'13px 18px', borderTop:`1px solid ${border}` }}>
            <div style={{ width:'42px', height:'42px', borderRadius:'14px', flexShrink:0, background:`linear-gradient(90deg,${skelBase} 25%,${skelShine} 50%,${skelBase} 75%)`, backgroundSize:'200% 100%', animation:`shimmer 1.5s ${i*0.1}s infinite` }} />
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'6px' }}>
              <div style={{ width:'60%', height:'13px', borderRadius:'6px', background:`linear-gradient(90deg,${skelBase} 25%,${skelShine} 50%,${skelBase} 75%)`, backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />
              <div style={{ width:'40%', height:'10px', borderRadius:'4px', background:`linear-gradient(90deg,${skelBase} 25%,${skelShine} 50%,${skelBase} 75%)`, backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />
            </div>
            <div style={{ width:'70px', height:'14px', borderRadius:'6px', background:`linear-gradient(90deg,${skelBase} 25%,${skelShine} 50%,${skelBase} 75%)`, backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: bg, maxWidth: '480px', margin: '0 auto', position: 'relative', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

      {/* ── ONBOARDING OVERLAY ── */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:3000, backdropFilter:'blur(8px)' }} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <motion.div style={{ background:cardSolid, borderRadius:'28px 28px 0 0', width:'100%', maxWidth:'480px', padding:'32px 24px 48px', boxSizing:'border-box', boxShadow:'0 -8px 40px rgba(0,0,0,0.4)' }} initial={{ y:500 }} animate={{ y:0 }} exit={{ y:500 }} transition={{ type:'spring', damping:28, stiffness:260 }}>
              <div style={{ textAlign:'center', marginBottom:'28px' }}>
                <motion.div style={{ width:'72px', height:'72px', borderRadius:'22px', background:'linear-gradient(135deg,#1A73E8,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 12px 36px rgba(26,115,232,0.4)' }} animate={{ scale:[1,1.05,1] }} transition={{ duration:2, repeat:Infinity }}>
                  <Sparkles size={32} color="#fff" />
                </motion.div>
                <h2 style={{ color:text, fontSize:'24px', fontWeight:'800', margin:'0 0 8px 0' }}>Welcome to PayEase</h2>
                <p style={{ color:textSec, fontSize:'14px', margin:0, lineHeight:1.6 }}>Your digital wallet is ready.</p>
              </div>
              {[
                { icon:<Send size={20} color="#1A73E8" />,   bg:'rgba(26,115,232,0.1)', title:'Send & Receive Money', desc:'Transfer instantly to any PayEase wallet' },
                { icon:<Zap size={20} color="#EA580C" />,    bg:'rgba(234,88,12,0.1)',  title:'Pay Bills',           desc:'Electricity, gas, internet and more' },
                { icon:<Shield size={20} color="#16A34A" />, bg:'rgba(22,163,74,0.1)',  title:'Bank-Grade Security', desc:'Your money is protected at every step' },
              ].map((item,i) => (
                <motion.div key={i} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 0', borderBottom:i<2?`1px solid ${border}`:'none' }} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.15+i*0.1 }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'14px', background:item.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{item.icon}</div>
                  <div><p style={{ color:text, fontSize:'14px', fontWeight:'700', margin:'0 0 2px 0' }}>{item.title}</p><p style={{ color:textSec, fontSize:'12px', margin:0 }}>{item.desc}</p></div>
                </motion.div>
              ))}
              <motion.button style={{ width:'100%', marginTop:'24px', padding:'17px', background:'linear-gradient(135deg,#1A73E8,#7C3AED)', color:'#fff', border:'none', borderRadius:'16px', fontSize:'16px', fontWeight:'800', cursor:'pointer', boxShadow:'0 8px 28px rgba(26,115,232,0.4)', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }} whileTap={{ scale:0.97 }} onClick={handleCompleteOnboarding}>
                <CheckCircle size={18} color="#fff" /> Get Started
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast.msg && (
          <motion.div style={{ position:'fixed', top:'24px', left:'50%', transform:'translateX(-50%)', background:toast.type==='error'?'linear-gradient(135deg,#DC2626,#B91C1C)':'linear-gradient(135deg,#16A34A,#15803D)', color:'#fff', padding:'12px 20px', borderRadius:'14px', zIndex:9999, fontSize:'13px', fontWeight:'600', boxShadow:`0 8px 32px ${toast.type==='error'?'rgba(220,38,38,0.4)':'rgba(22,163,74,0.4)'}`, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'8px' }}
            initial={{ opacity:0, y:-50, scale:0.85 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-50, scale:0.85 }} transition={{ type:'spring', stiffness:400, damping:30 }}>
            <CheckCircle size={14} color="#fff" /> {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <motion.div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 20px 16px' }} initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}>
        <div>
          <p style={{ color:textSec, fontSize:'12px', margin:'0 0 3px 0', fontWeight:'500' }}>{greeting}</p>
          <p style={{ color:text, fontSize:'22px', fontWeight:'800', margin:0, letterSpacing:'-0.5px' }}>{displayName}</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <motion.div style={{ width:'38px', height:'38px', borderRadius:'12px', background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)', border:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }} whileTap={{ scale:0.88 }} onClick={toggleTheme}>
            {isDark ? <Sun size={16} color="#FCD34D" /> : <Moon size={16} color="#6366F1" />}
          </motion.div>
          <motion.div style={{ width:'38px', height:'38px', borderRadius:'12px', background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)', border:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative' }} whileTap={{ scale:0.88 }} onClick={() => navigate('/notifications')}>
            <Bell size={16} color={isDark?'rgba(255,255,255,0.65)':'#475569'} />
            {unreadCount > 0 && <div style={{ position:'absolute', top:'7px', right:'7px', width:'10px', height:'10px', borderRadius:'50%', background:'#EF4444', border:`2px solid ${bg}` }} />}
          </motion.div>
          <motion.div style={{ width:'40px', height:'40px', borderRadius:'13px', background:'linear-gradient(135deg,#1A73E8,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 4px 16px rgba(26,115,232,0.35)', overflow:'hidden' }} whileTap={{ scale:0.88 }} onClick={() => navigate('/profile')}>
            {avatarUrl ? <img src={avatarUrl} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ color:'#fff', fontSize:'15px', fontWeight:'800' }}>{displayName.charAt(0).toUpperCase()}</span>}
          </motion.div>
        </div>
      </motion.div>

      {/* ── BALANCE CARD ── */}
      <div style={{ padding:'0 16px 4px' }}>
        <motion.div style={{ borderRadius:'24px', overflow:'hidden', position:'relative', background:'linear-gradient(135deg,#1A1FEF 0%,#1A73E8 45%,#0EA5E9 100%)', boxShadow:'0 20px 60px rgba(26,115,232,0.45)' }} initial={{ opacity:0, y:30, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ delay:0.1, type:'spring', stiffness:200, damping:20 }}>
          <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'160px', height:'160px', borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-50px', left:'-20px', width:'180px', height:'180px', borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)' }} />
          <div style={{ padding:'24px 24px 20px', position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#4ADE80', boxShadow:'0 0 8px rgba(74,222,128,0.8)' }} />
                <span style={{ color:'rgba(255,255,255,0.65)', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'1px' }}>Total Balance</span>
              </div>
              <motion.div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'rgba(255,255,255,0.12)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'1px solid rgba(255,255,255,0.15)' }} whileTap={{ scale:0.88 }} onClick={() => setHideBalance(!hideBalance)}>
                {hideBalance ? <Eye size={14} color="rgba(255,255,255,0.8)" /> : <EyeOff size={14} color="rgba(255,255,255,0.8)" />}
              </motion.div>
            </div>
            <motion.div style={{ marginBottom:'20px' }} animate={{ filter:hideBalance?'blur(10px)':'blur(0px)' }} transition={{ duration:0.3 }}>
              <h1 style={{ color:'#fff', fontSize:'38px', fontWeight:'800', margin:'0 0 4px 0', letterSpacing:'-1.5px', lineHeight:1 }}>
                {hideBalance ? 'PKR ••••••' : <><span style={{ fontSize:'20px', fontWeight:'600', opacity:0.75 }}>PKR </span><AnimatedNumber value={Math.floor(Number(balance?.balance) || 0)} /></>}
              </h1>
              <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'11px', margin:0, fontFamily:'monospace', letterSpacing:'1px' }}>
                {balance?.wallet_number?.slice(0,4)} •••• {balance?.wallet_number?.slice(-4)}
              </p>
            </motion.div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
              <div style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(8px)', borderRadius:'14px', padding:'12px', border:'1px solid rgba(255,255,255,0.12)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
                  <div style={{ width:'20px', height:'20px', borderRadius:'6px', background:'rgba(74,222,128,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}><TrendingUp size={11} color="#4ADE80" /></div>
                  <span style={{ color:'rgba(255,255,255,0.55)', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px' }}>Money In</span>
                </div>
                <p style={{ color:'#fff', fontSize:'14px', fontWeight:'700', margin:0 }}>PKR {totalIn.toLocaleString()}</p>
              </div>
              <div style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(8px)', borderRadius:'14px', padding:'12px', border:'1px solid rgba(255,255,255,0.12)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
                  <div style={{ width:'20px', height:'20px', borderRadius:'6px', background:'rgba(251,191,36,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}><TrendingDown size={11} color="#FBBF24" /></div>
                  <span style={{ color:'rgba(255,255,255,0.55)', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px' }}>Money Out</span>
                </div>
                <p style={{ color:'#fff', fontSize:'14px', fontWeight:'700', margin:0 }}>PKR {totalOut.toLocaleString()}</p>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <Shield size={12} color="rgba(255,255,255,0.5)" />
                <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'10px', fontWeight:'500' }}>{balance?.kyc_verified ? 'Identity Verified' : 'Verify Identity'}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center' }}>
                <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'rgba(252,196,4,0.7)', boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }} />
                <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'rgba(255,50,50,0.7)', marginLeft:'-12px', boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <motion.div style={{ padding:'16px 16px 0' }} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'8px' }}>
          {quickActions.map((item,i) => (
            <motion.div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'7px', cursor:'pointer' }} whileTap={{ scale:0.82 }} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2+i*0.04, type:'spring', stiffness:300 }} onClick={item.action}>
              <div style={{ width:'48px', height:'48px', borderRadius:'16px', background:item.grad, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 6px 16px ${item.shadow}` }}>{item.icon}</div>
              <p style={{ color:textSec, fontSize:'9.5px', margin:0, fontWeight:'600', textAlign:'center', letterSpacing:'0.2px' }}>{item.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── KYC BANNER — only for unverified users ── */}
      {balance !== null && balance?.kyc_verified === false && (
        <motion.div style={{ margin:'16px 16px 0', borderRadius:'18px', overflow:'hidden', background:isDark?'linear-gradient(135deg,#1E1B4B,#312E81)':'linear-gradient(135deg,#EEF2FF,#E0E7FF)', border:`1px solid ${isDark?'rgba(99,102,241,0.3)':'rgba(99,102,241,0.2)'}`, padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}
          initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.35 }} whileTap={{ scale:0.98 }} onClick={() => navigate('/kyc')}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <motion.div style={{ width:'38px', height:'38px', borderRadius:'12px', background:'linear-gradient(135deg,#6366F1,#4F46E5)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(99,102,241,0.4)', flexShrink:0 }} animate={{ rotate:[0,5,-5,0] }} transition={{ duration:3, repeat:Infinity }}>
              <Shield size={18} color="#fff" />
            </motion.div>
            <div>
              <p style={{ color:isDark?'#C7D2FE':'#4338CA', fontSize:'12px', fontWeight:'700', margin:'0 0 2px 0' }}>Complete KYC Verification</p>
              <p style={{ color:isDark?'rgba(199,210,254,0.6)':'#6366F1', fontSize:'10px', margin:0 }}>Unlock all features and higher limits</p>
            </div>
          </div>
          <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:isDark?'rgba(99,102,241,0.2)':'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <ChevronRight size={14} color={isDark?'#818CF8':'#4F46E5'} />
          </div>
        </motion.div>
      )}

      {/* ── RECENT TRANSACTIONS ── */}
      <motion.div style={{ margin:'16px 16px 0', borderRadius:'20px', overflow:'hidden', background:card, border:`1px solid ${border}`, boxShadow:isDark?'none':'0 4px 24px rgba(0,0,0,0.06)' }} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 18px 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:isDark?'rgba(26,115,232,0.15)':'rgba(26,115,232,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}><Activity size={14} color="#1A73E8" /></div>
            <h3 style={{ color:text, fontSize:'15px', fontWeight:'700', margin:0 }}>Recent Activity</h3>
          </div>
          <motion.div style={{ display:'flex', alignItems:'center', gap:'4px', cursor:'pointer', padding:'5px 10px', borderRadius:'10px', background:isDark?'rgba(26,115,232,0.12)':'rgba(26,115,232,0.06)', border:`1px solid ${isDark?'rgba(26,115,232,0.2)':'rgba(26,115,232,0.12)'}` }} whileTap={{ scale:0.95 }} onClick={() => navigate('/history')}>
            <span style={{ color:'#1A73E8', fontSize:'11px', fontWeight:'700' }}>See all</span>
            <ChevronRight size={12} color="#1A73E8" />
          </motion.div>
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 20px' }}>
            <motion.div style={{ width:'64px', height:'64px', borderRadius:'20px', background:isDark?'rgba(255,255,255,0.04)':'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }} animate={{ y:[0,-6,0] }} transition={{ duration:3, repeat:Infinity }}>
              <Wallet size={28} color={isDark?'rgba(255,255,255,0.25)':'#CBD5E1'} />
            </motion.div>
            <p style={{ color:text, margin:'0 0 4px 0', fontWeight:'700', fontSize:'15px' }}>No transactions yet</p>
            <p style={{ color:textSec, fontSize:'12px', margin:'0 0 18px 0' }}>Add money to get started</p>
            <motion.button style={{ padding:'11px 24px', background:'linear-gradient(135deg,#1A73E8,#0052CC)', color:'#fff', border:'none', borderRadius:'12px', fontSize:'13px', fontWeight:'700', cursor:'pointer', boxShadow:'0 4px 16px rgba(26,115,232,0.35)', display:'inline-flex', alignItems:'center', gap:'7px' }} whileTap={{ scale:0.96 }} onClick={() => setShowDeposit(true)}>
              <Plus size={14} color="#fff" /> Add Money
            </motion.button>
          </div>
        ) : (
          <div>
            {transactions.slice(0,5).map((tx,i) => {
              const { icon, bg:txBg, border:txBorder } = getTxIcon(tx);
              const dateField = tx.created_at || tx.date;
              return (
                <motion.div key={tx.id||i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'13px 18px', borderTop:`1px solid ${border}`, cursor:'pointer' }} whileHover={{ background:isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.01)' }} whileTap={{ scale:0.99 }} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.4+i*0.05 }}
                  onClick={() => { setReceiptData({ type:getTxLabel(tx), amount:tx.amount, to:tx.to_wallet, from:tx.from_wallet, toName:tx.description, date:dateField?new Date(String(dateField).replace(' ','T')).toLocaleString('en-PK'):'N/A', ref:'TXN'+(tx.id||Date.now().toString().slice(-8)), status:tx.status==='completed'?'Successful':tx.status, direction:tx.direction }); setShowReceipt(true); }}
                >
                  <div style={{ width:'42px', height:'42px', borderRadius:'14px', background:txBg, border:`1px solid ${txBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:text, fontSize:'13px', fontWeight:'600', margin:'0 0 3px 0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{getTxLabel(tx)}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                      <span style={{ color:textSec, fontSize:'10px' }}>{formatDate(dateField)}</span>
                      <span style={{ width:'3px', height:'3px', borderRadius:'50%', background:textSec }} />
                      <span style={{ color:tx.status==='completed'?'#16A34A':'#CA8A04', fontSize:'10px', fontWeight:'600' }}>{tx.status==='completed'?'Completed':tx.status}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <p style={{ fontSize:'14px', fontWeight:'700', margin:'0 0 3px 0', color:tx.direction==='credit'?'#16A34A':text }}>{tx.direction==='credit'?'+':'-'} PKR {Number(tx.amount).toLocaleString()}</p>
                    <ChevronRight size={12} color={textSec} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      <div style={{ height:'100px' }} />

      {/* ── BOTTOM NAV ── */}
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:'480px', zIndex:100, padding:'0 16px 24px', boxSizing:'border-box', pointerEvents:'none' }}>
        <div style={{ background:isDark?'rgba(15,20,40,0.88)':'rgba(255,255,255,0.92)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', borderRadius:'24px', border:`1px solid ${border}`, boxShadow:isDark?'0 8px 32px rgba(0,0,0,0.5)':'0 8px 32px rgba(0,0,0,0.12)', display:'flex', justifyContent:'space-around', padding:'10px 8px', pointerEvents:'all' }}>
          {navTabs.map((tab) => {
            const Icon=tab.icon, isActive=activeTab===tab.id, isScan=tab.id==='scan';
            return (
              <motion.div key={tab.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', cursor:'pointer', padding:'4px 12px', position:'relative', flex:1 }} whileTap={{ scale:0.82 }}
                onClick={() => { setActiveTab(tab.id); if(tab.id==='send') navigate('/send'); if(tab.id==='scan') navigate('/qr'); if(tab.id==='history') navigate('/history'); if(tab.id==='profile') navigate('/profile'); }}>
                {isScan ? (
                  <>
                    <div style={{ width:'46px', height:'46px', borderRadius:'16px', background:'linear-gradient(135deg,#1A73E8,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(26,115,232,0.45)', marginTop:'-18px' }}><QrCode size={20} color="#fff" /></div>
                    <span style={{ fontSize:'9px', color:textSec, fontWeight:'500', marginTop:'2px' }}>Scan</span>
                  </>
                ) : (
                  <>
                    <AnimatePresence>{isActive && <motion.div style={{ position:'absolute', top:'4px', width:'34px', height:'34px', borderRadius:'12px', background:'rgba(26,115,232,0.12)' }} initial={{ opacity:0, scale:0.6 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.6 }} transition={{ type:'spring', stiffness:400, damping:25 }} />}</AnimatePresence>
                    <div style={{ position:'relative', zIndex:1, width:'34px', height:'34px', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon size={19} color={isActive?'#1A73E8':textSec} strokeWidth={isActive?2.5:1.8} /></div>
                    <span style={{ fontSize:'9px', color:isActive?'#1A73E8':textSec, fontWeight:isActive?'700':'500', letterSpacing:'0.2px' }}>{tab.label}</span>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── DEPOSIT MODAL ── */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0 }} onClick={() => { setShowDeposit(false); setDepositAmount(''); }} />
            <motion.div style={{ background:cardSolid, borderRadius:'28px 28px 0 0', padding:'24px 20px 44px', width:'100%', maxWidth:'480px', boxSizing:'border-box', position:'relative', zIndex:1, boxShadow:'0 -8px 40px rgba(0,0,0,0.3)' }} initial={{ y:500 }} animate={{ y:0 }} exit={{ y:500 }} transition={{ type:'spring', damping:28, stiffness:280 }}>
              <div style={{ width:'40px', height:'4px', background:isDark?'rgba(255,255,255,0.12)':'#E2E8F0', borderRadius:'2px', margin:'0 auto 24px' }} />
              <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'24px' }}>
                <div style={{ width:'52px', height:'52px', borderRadius:'16px', background:'linear-gradient(135deg,#16A34A,#15803D)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 6px 20px rgba(22,163,74,0.35)' }}><Plus size={24} color="#fff" /></div>
                <div><h3 style={{ color:text, fontSize:'20px', fontWeight:'800', margin:'0 0 3px 0' }}>Add Money</h3><p style={{ color:textSec, fontSize:'13px', margin:0 }}>Deposit funds to your wallet</p></div>
              </div>

              {/* ── Amount input ── */}
              <div style={{ marginBottom:'14px' }}>
                <div style={{ display:'flex', alignItems:'center', border:`2px solid ${depositAmount?'#1A73E8':border}`, borderRadius:'18px', padding:'0 20px', background:isDark?'rgba(255,255,255,0.04)':'#F8FAFF', transition:'all 0.2s', boxShadow:depositAmount?'0 0 0 4px rgba(26,115,232,0.1)':'none' }}>
                  <span style={{ color:textSec, fontSize:'20px', fontWeight:'600', marginRight:'10px', flexShrink:0 }}>PKR</span>
                  <input
                    style={{ flex:1, padding:'18px 0', border:'none', background:'transparent', color:text, fontSize:'30px', fontWeight:'800', outline:'none', letterSpacing:'-1px', width:'100%' }}
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDeposit()}
                    autoFocus
                    min="1"
                    max="500000"
                  />
                </div>
                {depositAmount && parseFloat(depositAmount) > 0 && (
                  <p style={{ color:textSec, fontSize:'11px', margin:'6px 0 0 4px' }}>
                    Depositing PKR {parseFloat(depositAmount).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Quick amounts */}
              <div style={{ display:'flex', gap:'8px', marginBottom:'24px' }}>
                {[500, 1000, 5000, 10000].map(amt => (
                  <motion.button key={amt}
                    style={{ flex:1, padding:'10px 4px', background:Number(depositAmount)===amt?'linear-gradient(135deg,#1A73E8,#0052CC)':isDark?'rgba(255,255,255,0.05)':'#F1F5F9', color:Number(depositAmount)===amt?'#fff':textSec, border:`1px solid ${Number(depositAmount)===amt?'transparent':border}`, borderRadius:'12px', fontSize:'12px', fontWeight:'700', cursor:'pointer', transition:'all 0.2s', boxShadow:Number(depositAmount)===amt?'0 4px 12px rgba(26,115,232,0.35)':'none' }}
                    whileTap={{ scale:0.93 }}
                    onClick={() => setDepositAmount(String(amt))}
                  >
                    {amt >= 1000 ? `${amt/1000}K` : amt}
                  </motion.button>
                ))}
              </div>

              {/* Deposit button */}
              <motion.button
                style={{ width:'100%', padding:'17px', background:depositAmount&&parseFloat(depositAmount)>0?'linear-gradient(135deg,#16A34A,#15803D)':isDark?'rgba(255,255,255,0.06)':'#F1F5F9', color:depositAmount&&parseFloat(depositAmount)>0?'#fff':textSec, border:'none', borderRadius:'16px', fontSize:'15px', fontWeight:'800', cursor:depositAmount&&parseFloat(depositAmount)>0&&!actionLoading?'pointer':'not-allowed', marginBottom:'10px', boxShadow:depositAmount&&parseFloat(depositAmount)>0?'0 8px 24px rgba(22,163,74,0.35)':'none', transition:'all 0.25s', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}
                whileTap={depositAmount&&parseFloat(depositAmount)>0?{ scale:0.97 }:{}}
                onClick={handleDeposit}
                disabled={actionLoading || !depositAmount || parseFloat(depositAmount) <= 0}
              >
                {actionLoading
                  ? <><RefreshCw size={16} color="#fff" style={{ animation:'spin 1s linear infinite' }} /> Processing...</>
                  : <><Plus size={16} color={depositAmount&&parseFloat(depositAmount)>0?'#fff':textSec} /> Deposit {depositAmount&&parseFloat(depositAmount)>0?`PKR ${parseFloat(depositAmount).toLocaleString()}`:'Amount'}</>
                }
              </motion.button>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

              <motion.button style={{ width:'100%', padding:'14px', background:'transparent', color:textSec, border:`1.5px solid ${border}`, borderRadius:'14px', fontSize:'14px', cursor:'pointer', fontWeight:'600', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }} whileTap={{ scale:0.97 }} onClick={() => { setShowDeposit(false); setDepositAmount(''); }}>
                <X size={14} color={textSec} /> Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RECEIPT MODAL ── */}
      <AnimatePresence>
        {showReceipt && receiptData && (
          <motion.div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:'20px', boxSizing:'border-box', backdropFilter:'blur(8px)' }} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0 }} onClick={() => setShowReceipt(false)} />
            <motion.div style={{ background:cardSolid, borderRadius:'28px', width:'100%', maxWidth:'360px', overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.4)', position:'relative', zIndex:1 }} initial={{ scale:0.8, opacity:0, y:40 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.8, opacity:0, y:40 }} transition={{ type:'spring', stiffness:350, damping:28 }}>
              <motion.div style={{ position:'absolute', top:'16px', right:'16px', width:'30px', height:'30px', borderRadius:'10px', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:2 }} whileTap={{ scale:0.9 }} onClick={() => setShowReceipt(false)}>
                <X size={14} color="#fff" />
              </motion.div>
              <div style={{ background:'linear-gradient(135deg,#1A73E8,#7C3AED)', padding:'28px 24px', textAlign:'center' }}>
                <motion.div style={{ width:'60px', height:'60px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', border:'2px solid rgba(255,255,255,0.3)' }} initial={{ scale:0, rotate:-180 }} animate={{ scale:1, rotate:0 }} transition={{ type:'spring', stiffness:200, delay:0.1 }}>
                  <CheckCircle size={30} color="#fff" />
                </motion.div>
                <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'11px', margin:'0 0 4px 0', textTransform:'uppercase', letterSpacing:'1px', fontWeight:'600' }}>{receiptData.type}</p>
                <motion.p style={{ color:'#fff', fontSize:'30px', fontWeight:'800', margin:'0 0 8px 0', letterSpacing:'-1px' }} initial={{ opacity:0, scale:0.5 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.2 }}>
                  PKR {Number(receiptData.amount).toLocaleString()}
                </motion.p>
                <span style={{ background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:'11px', fontWeight:'700', padding:'4px 12px', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.2)' }}>&#10003; {receiptData.status}</span>
              </div>
              <div style={{ padding:'16px 20px' }}>
                {[
                  { label:'Type',      value:receiptData.type },
                  { label:receiptData.direction==='credit'?'From':'To', value:receiptData.toName||receiptData.to||'-' },
                  { label:'Reference', value:receiptData.ref },
                  { label:'Date',      value:receiptData.date },
                  { label:'Status',    value:receiptData.status, color:'#16A34A' },
                ].map((row,i,arr) => (
                  <motion.div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:i<arr.length-1?`1px solid ${border}`:'none' }} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1+i*0.05 }}>
                    <span style={{ color:textSec, fontSize:'12px' }}>{row.label}</span>
                    <span style={{ color:row.color||text, fontSize:'12px', fontWeight:'700', maxWidth:'55%', textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{row.value}</span>
                  </motion.div>
                ))}
              </div>
              <div style={{ display:'flex', borderTop:`1px solid ${border}` }}>
                <motion.button style={{ flex:1, padding:'14px', background:'transparent', color:textSec, border:'none', fontSize:'12px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', borderRight:`1px solid ${border}` }} whileTap={{ scale:0.97 }} onClick={handlePrintReceipt}><Printer size={14} /> Print</motion.button>
                <motion.button style={{ flex:1, padding:'14px', background:'transparent', color:'#1A73E8', border:'none', fontSize:'12px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', borderRight:`1px solid ${border}` }} whileTap={{ scale:0.97 }} onClick={handleShareReceipt}><Share2 size={14} /> Share</motion.button>
                <motion.button style={{ flex:1, padding:'14px', background:'linear-gradient(135deg,#1A73E8,#7C3AED)', color:'#fff', border:'none', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }} whileTap={{ scale:0.97 }} onClick={() => setShowReceipt(false)}><CheckCircle size={14} /> Done</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}