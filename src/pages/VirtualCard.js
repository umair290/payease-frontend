import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { accountService } from '../services/api';
import {
  ArrowLeft, Copy, CheckCircle, Eye, EyeOff,
  Lock, Unlock, RefreshCw, Share2, CreditCard,
  Shield, Wifi, AlertCircle
} from 'lucide-react';

function generateCardNumber(walletNumber) {
  const seed = walletNumber?.replace(/\D/g, '') || '0000000000';
  const n = seed.padEnd(16, '0').slice(0, 16);
  return n.match(/.{1,4}/g).join(' ');
}

function generateCVV(walletNumber) {
  const seed = walletNumber?.replace(/\D/g, '') || '000';
  return seed.slice(-3).padStart(3, '0');
}

function generateExpiry() {
  const now = new Date();
  const yr = (now.getFullYear() + 3).toString().slice(-2);
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  return `${mo}/${yr}`;
}

const CARD_THEMES = [
  { id: 'blue', grad: 'linear-gradient(135deg, #1A73E8 0%, #0052CC 100%)', name: 'Ocean Blue' },
  { id: 'dark', grad: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)', name: 'Midnight' },
  { id: 'green', grad: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)', name: 'Emerald' },
  { id: 'purple', grad: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', name: 'Purple' },
];

export default function VirtualCard() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [copied, setCopied] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(CARD_THEMES[0]);
  const [toast, setToast] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await accountService.getBalance();
      setBalance(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const cardNumber = generateCardNumber(balance?.wallet_number);
  const cvv = generateCVV(balance?.wallet_number);
  const expiry = generateExpiry();
  const cardName = balance?.full_name?.toUpperCase() || 'CARDHOLDER NAME';

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopied(type);
    setToast(`${type} copied!`);
    setTimeout(() => { setCopied(''); setToast(''); }, 2500);
  };

  const handleShare = () => {
    const text = `💳 PayEase Virtual Card\n\nCard Holder: ${cardName}\nExpiry: ${expiry}\n\nPowered by PayEase\npayease.space`;
    if (navigator.share) navigator.share({ title: 'PayEase Virtual Card', text });
    else { navigator.clipboard.writeText(text); setToast('Card details copied!'); setTimeout(() => setToast(''), 2500); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: '36px', height: '36px', border: `3px solid ${colors.border}`, borderTop: '3px solid #1A73E8', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#16A34A', color: '#fff', padding: '10px 20px', borderRadius: '12px', zIndex: 9999, fontSize: '13px', fontWeight: '600', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
          >
            <CheckCircle size={14} color="#fff" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: colors.card, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <motion.div style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.actionBg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} whileTap={{ scale: 0.9 }} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} color={colors.text} />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Virtual Card</h2>
          <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>Demo Card • Not for real payments</p>
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ padding: '20px 16px' }}>

        {/* Demo Notice */}
        <motion.div
          style={{ background: 'rgba(202,138,4,0.08)', border: '1px solid rgba(202,138,4,0.25)', borderRadius: '12px', padding: '10px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <AlertCircle size={16} color="#CA8A04" style={{ flexShrink: 0 }} />
          <p style={{ color: '#CA8A04', fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
            This is a <strong>demo virtual card</strong> for presentation purposes. Card details are generated from your wallet ID.
          </p>
        </motion.div>

        {/* Card — 3D Flip */}
        <div style={{ perspective: '1000px', marginBottom: '20px', cursor: 'pointer' }} onClick={() => !isLocked && setIsFlipped(!isFlipped)}>
          <motion.div
            style={{ position: 'relative', width: '100%', paddingTop: '58%', transformStyle: 'preserve-3d', transition: 'transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
          >
            {/* Front */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: 'hidden', borderRadius: '20px', background: isLocked ? 'linear-gradient(135deg, #374151, #1F2937)' : selectedTheme.grad, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
              {/* Background decoration */}
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

              {/* Top Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <div>
                  <p style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: 0, letterSpacing: '-0.5px' }}>PayEase</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Digital Wallet</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isLocked && <Lock size={14} color="rgba(255,255,255,0.7)" />}
                  <Wifi size={20} color="rgba(255,255,255,0.8)" style={{ transform: 'rotate(90deg)' }} />
                </div>
              </div>

              {/* Chip */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ width: '44px', height: '34px', borderRadius: '6px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', padding: '4px' }}>
                    {[0,1,2,3].map(i => <div key={i} style={{ width: '8px', height: '6px', background: 'rgba(0,0,0,0.2)', borderRadius: '1px' }} />)}
                  </div>
                </div>

                {/* Card Number */}
                <p style={{ color: '#fff', fontSize: '16px', fontWeight: '600', letterSpacing: '3px', margin: '0 0 12px 0', fontFamily: 'monospace' }}>
                  {showDetails ? cardNumber : '•••• •••• •••• ' + cardNumber.slice(-4)}
                </p>

                {/* Bottom Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px 0' }}>Card Holder</p>
                    <p style={{ color: '#fff', fontSize: '12px', fontWeight: '600', margin: 0, letterSpacing: '1px' }}>{cardName}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px 0' }}>Expires</p>
                    <p style={{ color: '#fff', fontSize: '12px', fontWeight: '600', margin: 0 }}>{expiry}</p>
                  </div>
                  {/* Visa-style logo */}
                  <div style={{ display: 'flex', gap: '-4px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FF5F00', opacity: 0.9 }} />
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFB300', opacity: 0.9, marginLeft: '-10px' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Back */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: '20px', background: isLocked ? 'linear-gradient(135deg, #374151, #1F2937)' : selectedTheme.grad, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Magnetic Strip */}
              <div style={{ width: '100%', height: '44px', background: 'rgba(0,0,0,0.6)', marginTop: '24px' }} />

              {/* CVV */}
              <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>CVV</p>
                  <p style={{ color: '#fff', fontSize: '16px', fontWeight: '700', letterSpacing: '4px', fontFamily: 'monospace', margin: 0 }}>
                    {showDetails ? cvv : '•••'}
                  </p>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', textAlign: 'center', lineHeight: '1.5', margin: 0 }}>
                  This is a demo card for PayEase presentation.{'\n'}Not valid for real transactions.
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', marginTop: '12px' }}>payease.space</p>
              </div>
            </div>
          </motion.div>
        </div>

        <p style={{ color: colors.textSecondary, fontSize: '11px', textAlign: 'center', margin: '-8px 0 16px 0' }}>
          {isLocked ? '🔒 Card is locked' : 'Tap card to flip • See front & back'}
        </p>

        {/* Card Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {[
            { icon: showDetails ? <EyeOff size={18} color="#1A73E8" /> : <Eye size={18} color="#1A73E8" />, label: showDetails ? 'Hide' : 'Show', bg: 'rgba(26,115,232,0.1)', action: () => setShowDetails(!showDetails) },
            { icon: isLocked ? <Unlock size={18} color="#16A34A" /> : <Lock size={18} color="#DC2626" />, label: isLocked ? 'Unlock' : 'Lock', bg: isLocked ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', action: () => setIsLocked(!isLocked) },
            { icon: <Copy size={18} color="#7C3AED" />, label: 'Copy', bg: 'rgba(124,58,237,0.1)', action: () => copyToClipboard(cardNumber, 'Card number') },
            { icon: <Share2 size={18} color="#CA8A04" />, label: 'Share', bg: 'rgba(202,138,4,0.1)', action: handleShare },
          ].map((btn, i) => (
            <motion.div
              key={i}
              style={{ background: colors.card, borderRadius: '14px', padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', border: `1px solid ${colors.border}` }}
              whileTap={{ scale: 0.92 }} onClick={btn.action}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: btn.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {btn.icon}
              </div>
              <span style={{ color: colors.textSecondary, fontSize: '10px', fontWeight: '600' }}>{btn.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Card Details */}
        <motion.div
          style={{ background: colors.card, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${colors.border}`, marginBottom: '16px' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '700', margin: 0 }}>Card Details</h3>
            <motion.div
              style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: 'rgba(26,115,232,0.08)', padding: '4px 10px', borderRadius: '8px' }}
              whileTap={{ scale: 0.95 }} onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff size={13} color="#1A73E8" /> : <Eye size={13} color="#1A73E8" />}
              <span style={{ color: '#1A73E8', fontSize: '11px', fontWeight: '600' }}>{showDetails ? 'Hide' : 'Reveal'}</span>
            </motion.div>
          </div>

          {[
            { label: 'Card Number', value: showDetails ? cardNumber : '•••• •••• •••• ' + cardNumber.slice(-4), copy: cardNumber },
            { label: 'Card Holder', value: cardName },
            { label: 'Expiry Date', value: expiry },
            { label: 'CVV', value: showDetails ? cvv : '•••', copy: cvv },
            { label: 'Card Type', value: 'PayEase Virtual Debit' },
            { label: 'Status', value: isLocked ? '🔒 Locked' : '✓ Active', color: isLocked ? '#DC2626' : '#16A34A' },
          ].map((row, i, arr) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
              <span style={{ color: colors.textSecondary, fontSize: '13px' }}>{row.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: row.color || colors.text, fontSize: '13px', fontWeight: '600', fontFamily: row.label === 'Card Number' ? 'monospace' : 'inherit' }}>
                  {row.value}
                </span>
                {row.copy && showDetails && (
                  <motion.div whileTap={{ scale: 0.9 }} onClick={() => copyToClipboard(row.copy, row.label)} style={{ cursor: 'pointer' }}>
                    {copied === row.label
                      ? <CheckCircle size={14} color="#16A34A" />
                      : <Copy size={14} color={colors.textSecondary} />
                    }
                  </motion.div>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Theme Selector */}
        <motion.div
          style={{ background: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${colors.border}` }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '700', margin: '0 0 12px 0' }}>Card Theme</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            {CARD_THEMES.map(theme => (
              <motion.div
                key={theme.id}
                style={{ flex: 1, height: '44px', borderRadius: '12px', background: theme.grad, cursor: 'pointer', border: selectedTheme.id === theme.id ? '3px solid #fff' : '3px solid transparent', boxShadow: selectedTheme.id === theme.id ? `0 0 0 2px #1A73E8` : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                whileTap={{ scale: 0.95 }} onClick={() => setSelectedTheme(theme)}
              >
                {selectedTheme.id === theme.id && <CheckCircle size={14} color="#fff" />}
              </motion.div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px' }}>
            {CARD_THEMES.map(theme => (
              <span key={theme.id} style={{ color: selectedTheme.id === theme.id ? '#1A73E8' : colors.textSecondary, fontSize: '9px', fontWeight: selectedTheme.id === theme.id ? '700' : '400', textAlign: 'center' }}>
                {theme.name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Security Info */}
        <motion.div
          style={{ background: 'rgba(26,115,232,0.06)', border: '1px solid rgba(26,115,232,0.15)', borderRadius: '14px', padding: '14px 16px', marginBottom: '80px', display: 'flex', gap: '12px' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          <Shield size={20} color="#1A73E8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ color: '#1A73E8', fontSize: '13px', fontWeight: '700', margin: '0 0 4px 0' }}>Demo Card Security</p>
            <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
              This virtual card is generated from your wallet ID for demo purposes. You can lock/unlock it, copy details, and change themes. Real payment features coming soon!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}