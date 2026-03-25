import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { accountService } from '../services/api';
import {
  ArrowLeft, Copy, CheckCircle, Eye, EyeOff,
  Lock, Unlock, Share2, Shield, Wifi,
  AlertCircle, Sparkles, CreditCard
} from 'lucide-react';

function generateCardNumber(walletNumber) {
  const seed = walletNumber?.replace(/\D/g, '') || '0000000000';
  return seed.padEnd(16,'0').slice(0,16).match(/.{1,4}/g).join(' ');
}
function generateCVV(walletNumber) {
  const seed = walletNumber?.replace(/\D/g, '') || '000';
  return seed.slice(-3).padStart(3,'0');
}
function generateExpiry() {
  const now = new Date();
  return `${String(now.getMonth()+1).padStart(2,'0')}/${(now.getFullYear()+3).toString().slice(-2)}`;
}

const THEMES = [
  { id: 'ocean',    name: 'Ocean',    grad: 'linear-gradient(135deg,#1A1FEF 0%,#1A73E8 50%,#0EA5E9 100%)',  shadow: 'rgba(26,115,232,0.5)' },
  { id: 'midnight', name: 'Midnight', grad: 'linear-gradient(135deg,#0F0C29 0%,#302B63 50%,#24243E 100%)',  shadow: 'rgba(48,43,99,0.5)' },
  { id: 'emerald',  name: 'Emerald',  grad: 'linear-gradient(135deg,#134E5E 0%,#16A34A 50%,#15803D 100%)',  shadow: 'rgba(22,163,74,0.5)' },
  { id: 'aurora',   name: 'Aurora',   grad: 'linear-gradient(135deg,#7C3AED 0%,#EC4899 50%,#F59E0B 100%)',  shadow: 'rgba(124,58,237,0.5)' },
];

export default function VirtualCard() {
  const { isDark } = useTheme();
  const navigate   = useNavigate();

  const [balance,      setBalance]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [isFlipped,    setIsFlipped]    = useState(false);
  const [showDetails,  setShowDetails]  = useState(false);
  const [isLocked,     setIsLocked]     = useState(false);
  const [copied,       setCopied]       = useState('');
  const [theme,        setTheme]        = useState(THEMES[0]);
  const [toast,        setToast]        = useState('');

  const bg      = isDark ? '#0A0F1E' : '#F0F4FF';
  const card    = isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
  const border  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const text    = isDark ? '#F0F6FC' : '#0F172A';
  const textSec = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF';

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await accountService.getBalance();
      setBalance(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const cardNumber = generateCardNumber(balance?.wallet_number);
  const cvv        = generateCVV(balance?.wallet_number);
  const expiry     = generateExpiry();
  const cardName   = balance?.full_name?.toUpperCase() || 'CARDHOLDER';

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const copyTo = (val, label) => {
    navigator.clipboard.writeText(val.replace(/\s/g,''));
    setCopied(label);
    showToast(`${label} copied!`);
    setTimeout(() => setCopied(''), 2500);
  };

  const handleShare = () => {
    const txt = `PayEase Virtual Card\n\nCard Holder: ${cardName}\nExpiry: ${expiry}\n\npayease.space`;
    if (navigator.share) navigator.share({ title: 'PayEase Virtual Card', text: txt });
    else { navigator.clipboard.writeText(txt); showToast('Card info copied!'); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <motion.div
        style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(26,115,232,0.4)' }}
        animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
      >
        <CreditCard size={28} color="#fff" />
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

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', padding: '12px 20px', borderRadius: '14px', zIndex: 9999, fontSize: '13px', fontWeight: '600', boxShadow: '0 8px 32px rgba(22,163,74,0.4)', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
            initial={{ opacity: 0, y: -40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <CheckCircle size={14} color="#fff" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO HEADER ── */}
      <div style={{ background: theme.grad, padding: '48px 20px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)' }} />

        {/* Back */}
        <motion.div
          style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '20px', position: 'relative', zIndex: 1 }}
          whileTap={{ scale: 0.88 }} onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={18} color="#fff" />
        </motion.div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <CreditCard size={18} color="#fff" />
            </div>
            <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>Virtual Card</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: 0, fontWeight: '500' }}>
            Demo card · {isLocked ? '🔒 Locked' : '✓ Active'}
          </p>
        </div>
      </div>

      {/* ── CARD — overlapping hero ── */}
      <div style={{ padding: '0 16px', marginTop: '-60px', position: 'relative', zIndex: 2, marginBottom: '16px' }}>
        <div style={{ perspective: '1200px', cursor: isLocked ? 'default' : 'pointer' }} onClick={() => !isLocked && setIsFlipped(!isFlipped)}>
          <motion.div
            style={{ position: 'relative', width: '100%', paddingTop: '60%', transformStyle: 'preserve-3d' }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.75, type: 'spring', stiffness: 80, damping: 15 }}
          >

            {/* ── FRONT ── */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: '24px', background: isLocked ? 'linear-gradient(135deg,#374151,#1F2937)' : theme.grad, boxShadow: `0 24px 60px ${isLocked ? 'rgba(0,0,0,0.4)' : theme.shadow}, 0 4px 16px rgba(0,0,0,0.2)`, padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>

              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />

              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div>
                  <p style={{ color: '#fff', fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>PayEase</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', margin: 0, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>Digital Wallet</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isLocked && (
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} color="#fff" />
                      <span style={{ color: '#fff', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Locked</span>
                    </div>
                  )}
                  <Wifi size={20} color="rgba(255,255,255,0.7)" style={{ transform: 'rotate(90deg)' }} />
                </div>
              </div>

              {/* Chip + number */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Chip */}
                <div style={{ width: '46px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg,#FFD700,#FFA500)', border: '1px solid rgba(255,255,255,0.3)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', padding: '6px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                  {[0,1,2,3].map(i => <div key={i} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '2px' }} />)}
                </div>

                {/* Card number */}
                <p style={{ color: '#fff', fontSize: '17px', fontWeight: '600', letterSpacing: '3px', margin: '0 0 14px 0', fontFamily: 'monospace', textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
                  {showDetails ? cardNumber : '•••• •••• •••• ' + cardNumber.slice(-4)}
                </p>

                {/* Bottom row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 3px 0', fontWeight: '600' }}>Card Holder</p>
                    <p style={{ color: '#fff', fontSize: '12px', fontWeight: '700', margin: 0, letterSpacing: '0.5px' }}>{cardName}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 3px 0', fontWeight: '600' }}>Expires</p>
                    <p style={{ color: '#fff', fontSize: '12px', fontWeight: '700', margin: 0 }}>{expiry}</p>
                  </div>
                  {/* Card brand circles */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,100,0,0.8)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} />
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,185,0,0.8)', marginLeft: '-12px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── BACK ── */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: '24px', background: isLocked ? 'linear-gradient(135deg,#374151,#1F2937)' : theme.grad, boxShadow: `0 24px 60px ${isLocked ? 'rgba(0,0,0,0.4)' : theme.shadow}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Magnetic strip */}
              <div style={{ width: '100%', height: '46px', background: 'rgba(0,0,0,0.55)', marginTop: '28px' }} />

              <div style={{ padding: '16px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* Signature strip */}
                <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 4px 0', fontWeight: '700' }}>Security Code</p>
                    <p style={{ color: '#fff', fontSize: '20px', fontWeight: '800', letterSpacing: '6px', fontFamily: 'monospace', margin: 0 }}>
                      {showDetails ? cvv : '•••'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0', fontWeight: '600' }}>CVV</p>
                    <div style={{ width: '40px', height: '24px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px' }} />
                  </div>
                </div>

                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textAlign: 'center', lineHeight: '1.6', margin: '0 0 10px 0' }}>
                  Demo card for PayEase presentation only.
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', fontWeight: '800', textAlign: 'center', letterSpacing: '-0.3px', margin: 0 }}>
                  payease.space
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Flip hint */}
        <p style={{ color: textSec, fontSize: '11px', textAlign: 'center', margin: '12px 0 0 0', fontWeight: '500' }}>
          {isLocked ? '🔒 Unlock card to flip' : isFlipped ? 'Tap to see front' : 'Tap card to see back'}
        </p>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* Demo notice */}
        <motion.div
          style={{ background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)', border: `1px solid ${isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.15)'}`, borderRadius: '14px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertCircle size={16} color="#F59E0B" />
          </div>
          <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748B', fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
            <strong style={{ color: '#F59E0B' }}>Demo card</strong> generated from your wallet ID. Not valid for real transactions.
          </p>
        </motion.div>

        {/* ── ACTION BUTTONS ── */}
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          {[
            { icon: showDetails ? <EyeOff size={18} color="#fff" /> : <Eye size={18} color="#fff" />, label: showDetails ? 'Hide' : 'Show', grad: 'linear-gradient(135deg,#1A73E8,#0052CC)', shadow: 'rgba(26,115,232,0.4)', action: () => setShowDetails(!showDetails) },
            { icon: isLocked ? <Unlock size={18} color="#fff" /> : <Lock size={18} color="#fff" />, label: isLocked ? 'Unlock' : 'Lock', grad: isLocked ? 'linear-gradient(135deg,#16A34A,#15803D)' : 'linear-gradient(135deg,#DC2626,#B91C1C)', shadow: isLocked ? 'rgba(22,163,74,0.4)' : 'rgba(220,38,38,0.4)', action: () => setIsLocked(!isLocked) },
            { icon: <Copy size={18} color="#fff" />, label: 'Copy', grad: 'linear-gradient(135deg,#7C3AED,#5B21B6)', shadow: 'rgba(124,58,237,0.4)', action: () => copyTo(cardNumber, 'Card number') },
            { icon: <Share2 size={18} color="#fff" />, label: 'Share', grad: 'linear-gradient(135deg,#CA8A04,#92400E)', shadow: 'rgba(202,138,4,0.4)', action: handleShare },
          ].map((btn, i) => (
            <motion.div key={i}
              style={{ background: card, borderRadius: '16px', padding: '14px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', cursor: 'pointer', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)' }}
              whileTap={{ scale: 0.9 }} onClick={btn.action}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: btn.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${btn.shadow}` }}>
                {btn.icon}
              </div>
              <span style={{ color: textSec, fontSize: '10px', fontWeight: '700', letterSpacing: '0.2px' }}>{btn.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── CARD DETAILS ── */}
        <motion.div
          style={{ background: card, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${border}`, marginBottom: '14px', boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        >
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={13} color="#1A73E8" />
              </div>
              <h3 style={{ color: text, fontSize: '14px', fontWeight: '800', margin: 0 }}>Card Details</h3>
            </div>
            <motion.div
              style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: isDark ? 'rgba(26,115,232,0.1)' : 'rgba(26,115,232,0.07)', padding: '5px 10px', borderRadius: '20px', border: `1px solid ${isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.12)'}` }}
              whileTap={{ scale: 0.95 }} onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff size={12} color="#1A73E8" /> : <Eye size={12} color="#1A73E8" />}
              <span style={{ color: '#1A73E8', fontSize: '11px', fontWeight: '700' }}>{showDetails ? 'Hide' : 'Reveal'}</span>
            </motion.div>
          </div>

          {[
            { label: 'Card Number', value: showDetails ? cardNumber : '•••• •••• •••• ' + cardNumber.slice(-4), copy: cardNumber, mono: true },
            { label: 'Card Holder', value: cardName },
            { label: 'Expiry Date', value: expiry },
            { label: 'CVV',         value: showDetails ? cvv : '•••', copy: cvv },
            { label: 'Card Type',   value: 'PayEase Virtual Debit' },
            { label: 'Status',      value: isLocked ? 'Locked' : 'Active', color: isLocked ? '#DC2626' : '#16A34A' },
          ].map((row, i, arr) => (
            <motion.div key={i}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.04 }}
            >
              <span style={{ color: textSec, fontSize: '12px', fontWeight: '600' }}>{row.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: row.color || text, fontSize: '13px', fontWeight: '700', fontFamily: row.mono ? 'monospace' : 'inherit', letterSpacing: row.mono ? '1px' : 'normal' }}>
                  {row.value}
                </span>
                {row.copy && showDetails && (
                  <motion.div
                    style={{ width: '26px', height: '26px', borderRadius: '8px', background: copied === row.label ? 'rgba(22,163,74,0.1)' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    whileTap={{ scale: 0.9 }} onClick={() => copyTo(row.copy, row.label)}
                  >
                    {copied === row.label
                      ? <CheckCircle size={12} color="#16A34A" />
                      : <Copy size={12} color={textSec} />
                    }
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── THEME SELECTOR ── */}
        <motion.div
          style={{ background: card, borderRadius: '20px', padding: '18px', marginBottom: '14px', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={13} color="#7C3AED" />
            </div>
            <h3 style={{ color: text, fontSize: '14px', fontWeight: '800', margin: 0 }}>Card Theme</h3>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {THEMES.map(t => (
              <motion.div key={t.id}
                style={{ flex: 1, height: '52px', borderRadius: '14px', background: t.grad, cursor: 'pointer', border: theme.id === t.id ? '3px solid #fff' : '3px solid transparent', boxShadow: theme.id === t.id ? `0 0 0 2px ${t.shadow}, 0 8px 20px ${t.shadow}` : `0 4px 12px ${t.shadow}`, transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
                whileTap={{ scale: 0.93 }} onClick={() => { setTheme(t); setIsFlipped(false); }}
              >
                {theme.id === t.id && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <CheckCircle size={16} color="#fff" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            {THEMES.map(t => (
              <p key={t.id} style={{ flex: 1, color: theme.id === t.id ? '#1A73E8' : textSec, fontSize: '10px', fontWeight: theme.id === t.id ? '800' : '500', textAlign: 'center', margin: 0 }}>
                {t.name}
              </p>
            ))}
          </div>
        </motion.div>

        {/* ── SECURITY INFO ── */}
        <motion.div
          style={{ background: isDark ? 'rgba(26,115,232,0.06)' : 'rgba(26,115,232,0.04)', border: `1px solid ${isDark ? 'rgba(26,115,232,0.15)' : 'rgba(26,115,232,0.1)'}`, borderRadius: '16px', padding: '16px', marginBottom: '40px', display: 'flex', gap: '12px' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        >
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={18} color="#1A73E8" />
          </div>
          <div>
            <p style={{ color: '#1A73E8', fontSize: '13px', fontWeight: '700', margin: '0 0 4px 0' }}>Demo Card Security</p>
            <p style={{ color: textSec, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
              This virtual card is generated from your wallet ID for demonstration purposes. You can lock, unlock, copy details, and switch themes. Real payment features are on the way!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
