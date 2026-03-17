import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { accountService, logActivity } from '../services/api';
import {
  ArrowLeft, Search, CheckCircle, Shield,
  ArrowRight, Send, Lock, Phone,
  CreditCard, FileText, Printer, Share2,
  X, ArrowUpRight, User, Wallet,
  AlertCircle, ChevronRight, Star, Trash2,
  Users, Zap
} from 'lucide-react';

export default function SendMoney() {
  const { isDark, colors } = useTheme();
  const navigate           = useNavigate();
  const [searchParams]     = useSearchParams();

  const [step,         setStep]         = useState(1);
  const [searchMode,   setSearchMode]   = useState('wallet');
  const [walletNumber, setWalletNumber] = useState('');
  const [phoneNumber,  setPhoneNumber]  = useState('');
  const [recipient,    setRecipient]    = useState(null);
  const [amount,       setAmount]       = useState('');
  const [description,  setDescription]  = useState('');
  const [pin,          setPin]          = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState(false);
  const [senderInfo,   setSenderInfo]   = useState(null);

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [savePrompt,    setSavePrompt]    = useState(false);
  const [showAllBenef,  setShowAllBenef]  = useState(false);
  const [toastMsg,      setToastMsg]      = useState('');

  const [txRef]  = useState('TXN' + Date.now().toString().slice(-8));
  const [txDate] = useState(new Date().toLocaleString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }));

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('payease_beneficiaries') || '[]');
    setBeneficiaries(saved);
  }, []);

  useEffect(() => {
    const walletFromQR = searchParams.get('wallet');
    if (walletFromQR) {
      setWalletNumber(walletFromQR);
      setSearchMode('wallet');
      lookupWalletByNumber(walletFromQR);
    }
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const saveBeneficiary = () => {
    const existing = JSON.parse(localStorage.getItem('payease_beneficiaries') || '[]');
    const alreadySaved = existing.find(b => b.wallet_number === recipient.wallet_number);
    if (alreadySaved) { setSavePrompt(false); showToast('Already in your contacts'); return; }
    const newBen = {
      id: Date.now(), full_name: recipient.full_name, phone: recipient.phone,
      wallet_number: recipient.wallet_number, kyc_verified: recipient.kyc_verified,
      saved_at: new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    const updated = [newBen, ...existing].slice(0, 10);
    localStorage.setItem('payease_beneficiaries', JSON.stringify(updated));
    setBeneficiaries(updated);
    setSavePrompt(false);
    showToast('Saved to your contacts!');
  };

  const deleteBeneficiary = (id, e) => {
    e.stopPropagation();
    const updated = beneficiaries.filter(b => b.id !== id);
    localStorage.setItem('payease_beneficiaries', JSON.stringify(updated));
    setBeneficiaries(updated);
    showToast('Contact removed');
  };

  const lookupWalletByNumber = async (wNumber) => {
    setLoading(true); setError('');
    try {
      const res    = await accountService.lookupWallet({ wallet_number: wNumber });
      const balRes = await accountService.getBalance();
      setRecipient(res.data);
      setWalletNumber(res.data.wallet_number);
      setSenderInfo(balRes.data);
      setStep(2);
    } catch (err) { setError(err.response?.data?.error || 'Wallet not found'); }
    setLoading(false);
  };

  const lookupWallet = async () => {
    if (!walletNumber.trim()) { setError('Please enter a wallet number'); return; }
    await lookupWalletByNumber(walletNumber);
  };

  const lookupByPhone = async () => {
    if (!phoneNumber.trim()) { setError('Please enter a phone number'); return; }
    setLoading(true); setError('');
    try {
      const res    = await accountService.lookupByPhone({ phone: phoneNumber });
      const balRes = await accountService.getBalance();
      setRecipient(res.data);
      setWalletNumber(res.data.wallet_number);
      setSenderInfo(balRes.data);
      setStep(2);
    } catch (err) { setError(err.response?.data?.error || 'No account found with this phone number'); }
    setLoading(false);
  };

  const handleConfirm = () => {
    if (!amount || parseFloat(amount) <= 0) { setError('Please enter a valid amount'); return; }
    if (parseFloat(amount) > 50000)         { setError('Maximum transfer limit is PKR 50,000'); return; }
    setError(''); setStep(3);
  };

  const handleSend = async () => {
    if (!pin || pin.length !== 4) { setError('Please enter your 4-digit PIN'); return; }
    setLoading(true); setError('');
    try {
      await accountService.send({
        to_wallet:   walletNumber,
        amount:      parseFloat(amount),
        pin,
        description: description || `Transfer to ${recipient.full_name}`,
      });
      logActivity('Money Sent', `Sent PKR ${parseFloat(amount).toLocaleString()} to ${recipient.full_name} (${walletNumber})`);
      setShowPinModal(false);
      setSuccess(true);
      const existing = JSON.parse(localStorage.getItem('payease_beneficiaries') || '[]');
      if (!existing.find(b => b.wallet_number === walletNumber)) {
        setTimeout(() => setSavePrompt(true), 600);
      }
    } catch (err) { setError(err.response?.data?.error || 'Transfer failed'); }
    setLoading(false);
  };

  const resetAll = () => {
    setSuccess(false); setStep(1); setWalletNumber(''); setPhoneNumber('');
    setAmount(''); setDescription(''); setPin(''); setRecipient(null);
    setError(''); setSavePrompt(false);
  };

  const handlePrint = () => {
    const html = `<html><head><title>PayEase Receipt</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,sans-serif;background:#f0f4ff;display:flex;justify-content:center;padding:40px 20px;}.r{background:#fff;border-radius:20px;width:100%;max-width:400px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.12);}.h{background:linear-gradient(135deg,#1A73E8,#0052CC);padding:32px;text-align:center;}.logo{color:#fff;font-size:24px;font-weight:bold;margin-bottom:16px;}.status{color:#fff;font-size:18px;font-weight:bold;}.amt{color:#fff;font-size:36px;font-weight:bold;margin-top:12px;}.b{padding:24px;}.row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f4ff;}.row:last-child{border-bottom:none;}.l{color:#888;font-size:13px;}.v{font-weight:600;font-size:13px;color:#1A1A2E;}.f{background:#f8faff;border-top:1px solid #e0e6f0;padding:16px;text-align:center;}.f p{color:#888;font-size:11px;margin-bottom:4px;}@media print{body{background:white;}.r{box-shadow:none;}}</style></head>
    <body><div class="r"><div class="h"><div class="logo">PayEase</div><div class="status">Transfer Successful</div><div class="amt">PKR ${parseFloat(amount).toLocaleString()}</div></div>
    <div class="b"><div class="row"><span class="l">To</span><span class="v">${recipient?.full_name}</span></div><div class="row"><span class="l">Phone</span><span class="v">${recipient?.phone}</span></div><div class="row"><span class="l">Wallet ID</span><span class="v">${walletNumber}</span></div><div class="row"><span class="l">Amount</span><span class="v" style="color:#1A73E8">PKR ${parseFloat(amount).toLocaleString()}</span></div>${description ? `<div class="row"><span class="l">Note</span><span class="v">${description}</span></div>` : ''}<div class="row"><span class="l">Reference</span><span class="v">${txRef}</span></div><div class="row"><span class="l">Date</span><span class="v">${txDate}</span></div><div class="row"><span class="l">Status</span><span class="v" style="color:#16A34A">Completed</span></div></div>
    <div class="f"><p>Thank you for using PayEase</p><p style="color:#1A73E8;font-weight:bold">payease.space</p></div></div></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handleShare = () => {
    const text = `PayEase Transfer\n\nAmount: PKR ${parseFloat(amount).toLocaleString()}\nTo: ${recipient?.full_name}\nRef: ${txRef}\nDate: ${txDate}\nStatus: Completed\n\npayease.space`;
    if (navigator.share) navigator.share({ title: 'PayEase Receipt', text });
    else navigator.clipboard.writeText(text);
  };

  const displayedBenef = showAllBenef ? beneficiaries : beneficiaries.slice(0, 3);

  const bg      = isDark ? '#0A0F1E' : '#F0F4FF';
  const card    = isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
  const cardSolid = isDark ? '#0F1629' : '#FFFFFF';
  const border  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const text    = isDark ? '#F0F6FC' : '#0F172A';
  const textSec = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF';
  const actionBg= isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9';

  // ── SUCCESS SCREEN ──
  if (success) return (
    <div style={{ minHeight: '100vh', background: bg, maxWidth: '480px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      <AnimatePresence>
        {toastMsg && (
          <motion.div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', padding: '12px 20px', borderRadius: '14px', zIndex: 9999, fontSize: '13px', fontWeight: '600', boxShadow: '0 8px 32px rgba(22,163,74,0.4)', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
            initial={{ opacity: 0, y: -40, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -40, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
            <CheckCircle size={14} color="#fff" /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1A1FEF 0%,#1A73E8 50%,#0EA5E9 100%)', padding: '48px 24px 36px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)' }} />

        <motion.div
          initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '3px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
        >
          <CheckCircle size={40} color="#fff" />
        </motion.div>

        <motion.h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          Transfer Successful!
        </motion.h2>
        <motion.p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', margin: '0 0 20px 0' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          Payment processed successfully
        </motion.p>
        <motion.div
          style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '12px 28px', border: '1px solid rgba(255,255,255,0.2)' }}
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
        >
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600' }}>PKR </span>
          <span style={{ color: '#fff', fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>{parseFloat(amount).toLocaleString()}</span>
        </motion.div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Receipt card */}
        <motion.div
          style={{ background: card, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${border}`, marginBottom: '14px', boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        >
          {/* Recipient header */}
          <div style={{ padding: '16px 20px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: '800', flexShrink: 0 }}>
              {recipient?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: text, fontSize: '15px', fontWeight: '700', margin: '0 0 2px 0' }}>{recipient?.full_name}</p>
              <p style={{ color: textSec, fontSize: '12px', margin: 0 }}>{recipient?.phone}</p>
            </div>
            <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '20px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle size={11} color="#16A34A" />
              <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: '700' }}>Completed</span>
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: '4px 20px' }}>
            {[
              { label: 'Wallet ID', value: walletNumber },
              { label: 'Amount',    value: `PKR ${parseFloat(amount).toLocaleString()}`, color: '#1A73E8', bold: true },
              description && { label: 'Note', value: description },
              { label: 'Reference', value: txRef },
              { label: 'Date',      value: txDate },
            ].filter(Boolean).map((row, i, arr) => (
              <motion.div key={i}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
              >
                <span style={{ color: textSec, fontSize: '12px' }}>{row.label}</span>
                <span style={{ color: row.color || text, fontWeight: row.bold ? '800' : '600', fontSize: row.bold ? '16px' : '13px' }}>{row.value}</span>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', borderTop: `1px solid ${border}` }}>
            {[
              { label: 'Print',  icon: <Printer size={14} />,  color: text,     action: handlePrint,  border: true },
              { label: 'Share',  icon: <Share2 size={14} />,   color: '#1A73E8', action: handleShare, border: false },
            ].map((btn, i) => (
              <motion.button key={i}
                style={{ flex: 1, padding: '14px', background: 'transparent', color: btn.color, border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRight: btn.border ? `1px solid ${border}` : 'none' }}
                whileTap={{ scale: 0.97 }} onClick={btn.action}
              >
                {btn.icon} {btn.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.button
          style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 8px 24px rgba(26,115,232,0.35)', letterSpacing: '0.2px' }}
          whileTap={{ scale: 0.97 }} onClick={() => navigate('/dashboard')}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        >
          Back to Dashboard
        </motion.button>
        <motion.button
          style={{ width: '100%', padding: '14px', background: 'transparent', color: textSec, border: `1.5px solid ${border}`, borderRadius: '14px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600' }}
          whileTap={{ scale: 0.97 }} onClick={resetAll}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        >
          <Send size={15} color={textSec} /> Send Another Payment
        </motion.button>
      </div>

      {/* Save beneficiary prompt */}
      <AnimatePresence>
        {savePrompt && (
          <motion.div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              style={{ background: cardSolid, borderRadius: '28px 28px 0 0', padding: '24px 24px 44px', width: '100%', maxWidth: '480px', boxSizing: 'border-box', boxShadow: '0 -8px 40px rgba(0,0,0,0.3)' }}
              initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div style={{ width: '40px', height: '4px', background: isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0', borderRadius: '2px', margin: '0 auto 20px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', fontWeight: '800', flexShrink: 0, boxShadow: '0 6px 20px rgba(26,115,232,0.35)' }}>
                  {recipient?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ color: text, fontSize: '16px', fontWeight: '800', margin: '0 0 3px 0' }}>Save as Contact?</p>
                  <p style={{ color: textSec, fontSize: '12px', margin: 0 }}>Quickly send to <strong style={{ color: text }}>{recipient?.full_name}</strong> next time</p>
                </div>
              </div>
              <div style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px', border: `1px solid ${border}` }}>
                {[{ label: 'Name', value: recipient?.full_name }, { label: 'Phone', value: recipient?.phone }, { label: 'Wallet', value: recipient?.wallet_number }].map((row, i, arr) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}>
                    <span style={{ color: textSec, fontSize: '12px' }}>{row.label}</span>
                    <span style={{ color: text, fontSize: '12px', fontWeight: '700', fontFamily: row.label === 'Wallet' ? 'monospace' : 'inherit' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.button style={{ flex: 1, padding: '14px', background: 'transparent', color: textSec, border: `1.5px solid ${border}`, borderRadius: '14px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }} whileTap={{ scale: 0.97 }} onClick={() => setSavePrompt(false)}>Not Now</motion.button>
                <motion.button style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,115,232,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} whileTap={{ scale: 0.97 }} onClick={saveBeneficiary}>
                  <Star size={15} color="#fff" /> Save Contact
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ── MAIN FLOW ──
  return (
    <div style={{ minHeight: '100vh', background: bg, maxWidth: '480px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      <AnimatePresence>
        {toastMsg && (
          <motion.div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', padding: '12px 20px', borderRadius: '14px', zIndex: 9999, fontSize: '13px', fontWeight: '600', boxShadow: '0 8px 32px rgba(22,163,74,0.4)', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
            initial={{ opacity: 0, y: -40, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -40, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
            <CheckCircle size={14} color="#fff" /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 16px', background: 'transparent' }}>
        <motion.div
          style={{ width: '40px', height: '40px', borderRadius: '13px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          whileTap={{ scale: 0.88 }}
          onClick={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)}
        >
          <ArrowLeft size={20} color={isDark ? 'rgba(255,255,255,0.7)' : '#475569'} />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: text, fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>Send Money</h2>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* ── STEP INDICATOR ── */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderRadius: '16px', padding: '14px 20px', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)' }}>
          {['Recipient', 'Amount', 'Confirm'].map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <motion.div
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: step > i + 1 ? 'linear-gradient(135deg,#16A34A,#15803D)' : step === i + 1 ? 'linear-gradient(135deg,#1A73E8,#7C3AED)' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: step === i + 1 ? '0 4px 12px rgba(26,115,232,0.4)' : 'none' }}
                  animate={{ scale: step === i + 1 ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {step > i + 1
                    ? <CheckCircle size={14} color="#fff" />
                    : <span style={{ color: step >= i + 1 ? '#fff' : textSec, fontSize: '12px', fontWeight: '800' }}>{i + 1}</span>
                  }
                </motion.div>
                <span style={{ fontSize: '10px', color: step >= i + 1 ? text : textSec, fontWeight: step === i + 1 ? '700' : '500', letterSpacing: '0.2px' }}>{label}</span>
              </div>
              {i < 2 && (
                <div style={{ flex: 1, height: '2px', margin: '0 6px 16px', borderRadius: '1px', background: step > i + 1 ? 'linear-gradient(90deg,#16A34A,#15803D)' : isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0', transition: 'background 0.4s' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <AnimatePresence mode="wait">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

              {/* Saved Contacts */}
              {beneficiaries.length > 0 && (
                <motion.div
                  style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderRadius: '20px', padding: '16px', marginBottom: '14px', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.05)' }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(26,115,232,0.3)' }}>
                        <Users size={14} color="#fff" />
                      </div>
                      <p style={{ color: text, fontSize: '13px', fontWeight: '700', margin: 0 }}>Saved Contacts</p>
                      <span style={{ background: 'rgba(26,115,232,0.1)', color: '#1A73E8', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(26,115,232,0.15)' }}>
                        {beneficiaries.length}
                      </span>
                    </div>
                    {beneficiaries.length > 3 && (
                      <motion.span style={{ color: '#1A73E8', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }} whileTap={{ scale: 0.95 }} onClick={() => setShowAllBenef(!showAllBenef)}>
                        {showAllBenef ? 'Show less' : `+${beneficiaries.length - 3} more`}
                      </motion.span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {displayedBenef.map((ben, i) => (
                      <motion.div key={ben.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFF', borderRadius: '14px', border: `1px solid ${border}`, cursor: 'pointer', transition: 'background 0.15s' }}
                        whileHover={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#EFF6FF' }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        onClick={() => { setWalletNumber(ben.wallet_number); lookupWalletByNumber(ben.wallet_number); }}
                      >
                        <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '17px', fontWeight: '800', flexShrink: 0, boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}>
                          {ben.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: text, fontSize: '13px', fontWeight: '700', margin: '0 0 2px 0' }}>{ben.full_name}</p>
                          <p style={{ color: textSec, fontSize: '11px', margin: 0 }}>
                            {ben.phone} · <span style={{ fontFamily: 'monospace' }}>{ben.wallet_number?.slice(0, 8)}...</span>
                          </p>
                        </div>
                        {ben.kyc_verified && (
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CheckCircle size={13} color="#16A34A" />
                          </div>
                        )}
                        <motion.div
                          style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(220,38,38,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(220,38,38,0.1)' }}
                          whileTap={{ scale: 0.88 }}
                          onClick={(e) => deleteBeneficiary(ben.id, e)}
                        >
                          <Trash2 size={13} color="#DC2626" />
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Search card */}
              <motion.div
                style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderRadius: '20px', padding: '20px', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.05)' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: beneficiaries.length > 0 ? 0.1 : 0 }}
              >
                {beneficiaries.length === 0 && (
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg,rgba(26,115,232,0.15),rgba(124,58,237,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: `1px solid ${isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.15)'}` }}>
                      <Search size={26} color="#1A73E8" />
                    </div>
                    <h3 style={{ color: text, fontSize: '19px', fontWeight: '800', margin: '0 0 5px 0', letterSpacing: '-0.3px' }}>Find Recipient</h3>
                    <p style={{ color: textSec, fontSize: '13px', margin: 0, lineHeight: '1.6' }}>Search by wallet ID or phone number</p>
                  </div>
                )}

                {beneficiaries.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }} />
                    <span style={{ color: textSec, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Or search new</span>
                    <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }} />
                  </div>
                )}

                {/* Tab toggle */}
                <div style={{ display: 'flex', background: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9', borderRadius: '14px', padding: '4px', marginBottom: '16px', border: `1px solid ${border}` }}>
                  {[{ id: 'wallet', label: 'Wallet ID', icon: <CreditCard size={14} /> }, { id: 'phone', label: 'Phone', icon: <Phone size={14} /> }].map((tab) => (
                    <motion.button key={tab.id}
                      style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '11px', cursor: 'pointer', background: searchMode === tab.id ? 'linear-gradient(135deg,#1A73E8,#7C3AED)' : 'transparent', color: searchMode === tab.id ? '#fff' : textSec, fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: searchMode === tab.id ? '0 4px 12px rgba(26,115,232,0.35)' : 'none' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setSearchMode(tab.id); setError(''); setWalletNumber(''); setPhoneNumber(''); }}
                    >
                      {tab.icon} {tab.label}
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {searchMode === 'wallet' && (
                    <motion.div key="wallet" style={{ marginBottom: '14px' }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                      <p style={{ color: textSec, fontSize: '11px', fontWeight: '700', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Wallet Number</p>
                      <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${walletNumber ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '14px', padding: '0 16px', background: inputBg, transition: 'all 0.2s', boxShadow: walletNumber ? '0 0 0 4px rgba(26,115,232,0.1)' : 'none' }}>
                        <CreditCard size={18} color={walletNumber ? '#1A73E8' : textSec} style={{ flexShrink: 0, marginRight: '10px' }} />
                        <input style={{ flex: 1, padding: '14px 0', border: 'none', background: 'transparent', color: text, fontSize: '14px', outline: 'none', fontWeight: '500' }} placeholder="e.g. PK1234567890" value={walletNumber} onChange={(e) => setWalletNumber(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && lookupWallet()} />
                      </div>
                    </motion.div>
                  )}
                  {searchMode === 'phone' && (
                    <motion.div key="phone" style={{ marginBottom: '14px' }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                      <p style={{ color: textSec, fontSize: '11px', fontWeight: '700', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Phone Number</p>
                      <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${phoneNumber ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '14px', padding: '0 16px', background: inputBg, transition: 'all 0.2s', boxShadow: phoneNumber ? '0 0 0 4px rgba(26,115,232,0.1)' : 'none' }}>
                        <Phone size={18} color={phoneNumber ? '#1A73E8' : textSec} style={{ flexShrink: 0, marginRight: '10px' }} />
                        <input style={{ flex: 1, padding: '14px 0', border: 'none', background: 'transparent', color: text, fontSize: '14px', outline: 'none', fontWeight: '500' }} placeholder="03XXXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && lookupByPhone()} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '12px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                    <AlertCircle size={14} color="#DC2626" style={{ flexShrink: 0 }} />
                    <span style={{ color: '#DC2626', fontSize: '13px', fontWeight: '500' }}>{error}</span>
                  </motion.div>
                )}

                <motion.button
                  style={{ width: '100%', padding: '16px', background: (searchMode === 'wallet' ? walletNumber : phoneNumber) ? 'linear-gradient(135deg,#1A73E8,#7C3AED)' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: (searchMode === 'wallet' ? walletNumber : phoneNumber) ? '#fff' : textSec, border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: (searchMode === 'wallet' ? walletNumber : phoneNumber) ? '0 8px 24px rgba(26,115,232,0.35)' : 'none', transition: 'all 0.2s', letterSpacing: '0.2px' }}
                  whileTap={{ scale: 0.97 }} onClick={searchMode === 'wallet' ? lookupWallet : lookupByPhone} disabled={loading}
                >
                  {loading
                    ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>Searching...</motion.span>
                    : <><Search size={16} /> Find Recipient</>
                  }
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && recipient && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

              {/* Recipient card */}
              <motion.div
                style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderRadius: '18px', padding: '16px', marginBottom: '14px', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '14px', boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.05)' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', fontWeight: '800', flexShrink: 0, boxShadow: '0 6px 20px rgba(26,115,232,0.35)' }}>
                  {recipient.full_name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: text, fontSize: '16px', fontWeight: '800', margin: '0 0 3px 0' }}>{recipient.full_name}</p>
                  <p style={{ color: textSec, fontSize: '12px', margin: '0 0 2px 0' }}>{recipient.phone}</p>
                  <p style={{ color: textSec, fontSize: '11px', margin: 0, fontFamily: 'monospace' }}>{recipient.wallet_number}</p>
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  {recipient.kyc_verified
                    ? <><div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3px' }}><CheckCircle size={16} color="#16A34A" /></div><p style={{ color: '#16A34A', fontSize: '10px', fontWeight: '700', margin: 0 }}>Verified</p></>
                    : <><div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(202,138,4,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3px' }}><Shield size={16} color="#CA8A04" /></div><p style={{ color: '#CA8A04', fontSize: '10px', fontWeight: '700', margin: 0 }}>Pending</p></>
                  }
                </div>
              </motion.div>

              {/* Amount card */}
              <motion.div
                style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderRadius: '20px', padding: '20px', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.05)' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              >
                <h3 style={{ color: text, fontSize: '17px', fontWeight: '800', margin: '0 0 16px 0', letterSpacing: '-0.3px' }}>Enter Amount</h3>

                {/* Big amount input */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${amount ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '18px', padding: '0 20px', background: inputBg, transition: 'all 0.2s', boxShadow: amount ? '0 0 0 4px rgba(26,115,232,0.1)' : 'none' }}>
                    <span style={{ color: textSec, fontSize: '20px', fontWeight: '600', marginRight: '10px', flexShrink: 0 }}>PKR</span>
                    <input style={{ flex: 1, padding: '18px 0', border: 'none', background: 'transparent', color: text, fontSize: '32px', fontWeight: '800', outline: 'none', letterSpacing: '-1px' }} type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                  <p style={{ color: textSec, fontSize: '11px', margin: '6px 0 0 4px', fontWeight: '500' }}>Max transfer: PKR 50,000 per transaction</p>
                </div>

                {/* Quick amounts */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {[500, 1000, 5000, 10000].map(amt => (
                    <motion.button key={amt}
                      style={{ flex: 1, padding: '10px 4px', background: amount == amt ? 'linear-gradient(135deg,#1A73E8,#7C3AED)' : isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', color: amount == amt ? '#fff' : textSec, border: `1px solid ${amount == amt ? 'transparent' : border}`, borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: amount == amt ? '0 4px 12px rgba(26,115,232,0.35)' : 'none' }}
                      whileTap={{ scale: 0.93 }} onClick={() => setAmount(String(amt))}
                    >
                      {amt >= 1000 ? `${amt/1000}K` : amt}
                    </motion.button>
                  ))}
                </div>

                {/* Note */}
                <div style={{ marginBottom: '18px' }}>
                  <p style={{ color: textSec, fontSize: '11px', fontWeight: '700', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Note <span style={{ fontWeight: '500', textTransform: 'none' }}>(optional)</span></p>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '14px', padding: '0 16px', background: inputBg }}>
                    <FileText size={16} color={textSec} style={{ flexShrink: 0, marginRight: '10px' }} />
                    <input style={{ flex: 1, padding: '13px 0', border: 'none', background: 'transparent', color: text, fontSize: '14px', outline: 'none' }} placeholder="e.g. Rent, Groceries..." value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                </div>

                {error && (
                  <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <AlertCircle size={14} color="#DC2626" style={{ flexShrink: 0 }} />
                    <span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span>
                  </motion.div>
                )}

                <motion.button
                  style={{ width: '100%', padding: '16px', background: amount ? 'linear-gradient(135deg,#1A73E8,#7C3AED)' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: amount ? '#fff' : textSec, border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '800', cursor: amount ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: amount ? '0 8px 24px rgba(26,115,232,0.35)' : 'none', transition: 'all 0.2s', letterSpacing: '0.2px' }}
                  whileTap={amount ? { scale: 0.97 } : {}} onClick={handleConfirm}
                >
                  Continue <ArrowRight size={16} color={amount ? '#fff' : textSec} />
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

              {/* Transfer visual */}
              <motion.div
                style={{ background: 'linear-gradient(135deg,#1A1FEF 0%,#1A73E8 50%,#7C3AED 100%)', borderRadius: '22px', padding: '24px', marginBottom: '14px', position: 'relative', overflow: 'hidden', boxShadow: '0 16px 48px rgba(26,115,232,0.4)' }}
                initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)' }} />

                <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '700', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>You are sending</p>
                  <h2 style={{ color: '#fff', fontSize: '38px', fontWeight: '800', margin: 0, letterSpacing: '-1.5px', lineHeight: 1 }}>
                    PKR {parseFloat(amount).toLocaleString()}
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
                  {[
                    { name: senderInfo?.full_name, label: 'You' },
                    null,
                    { name: recipient?.full_name, label: 'Recipient' },
                  ].map((item, i) => item ? (
                    <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '14px 12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: '#fff', fontSize: '18px', fontWeight: '800' }}>
                        {item.name?.charAt(0).toUpperCase()}
                      </div>
                      <p style={{ color: '#fff', fontSize: '13px', fontWeight: '700', margin: '0 0 2px 0' }}>{item.name?.split(' ')[0]}</p>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', margin: 0, fontWeight: '600' }}>{item.label}</p>
                    </div>
                  ) : (
                    <div key={i} style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)' }}>
                      <ArrowRight size={18} color="#fff" />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Details card */}
              <motion.div
                style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderRadius: '18px', border: `1px solid ${border}`, overflow: 'hidden', marginBottom: '14px', boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.05)' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              >
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '7px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={12} color="#1A73E8" />
                  </div>
                  <p style={{ color: text, fontSize: '12px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Transaction Details</p>
                </div>
                {[
                  { label: 'Full Name', value: recipient?.full_name,     icon: <User size={13} color="#1A73E8" />,    iconBg: 'rgba(26,115,232,0.1)' },
                  { label: 'Phone',     value: recipient?.phone,         icon: <Phone size={13} color="#16A34A" />,   iconBg: 'rgba(22,163,74,0.1)' },
                  { label: 'Wallet ID', value: recipient?.wallet_number, icon: <Wallet size={13} color="#7C3AED" />,  iconBg: 'rgba(124,58,237,0.1)' },
                  { label: 'Amount',    value: `PKR ${parseFloat(amount).toLocaleString()}`, icon: <Zap size={13} color="#EA580C" />, iconBg: 'rgba(234,88,12,0.1)', highlight: true },
                  description && { label: 'Note', value: description, icon: <FileText size={13} color="#94A3B8" />, iconBg: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
                ].filter(Boolean).map((row, i, arr) => (
                  <motion.div key={i}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
                  >
                    <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: row.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{row.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px 0' }}>{row.label}</p>
                      <p style={{ color: row.highlight ? '#1A73E8' : text, fontSize: row.highlight ? '16px' : '13px', fontWeight: row.highlight ? '800' : '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Security notice */}
              <motion.div
                style={{ background: isDark ? 'rgba(26,115,232,0.08)' : 'rgba(26,115,232,0.05)', border: `1px solid ${isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.12)'}`, borderRadius: '14px', padding: '12px 16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              >
                <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield size={15} color="#1A73E8" />
                </div>
                <p style={{ color: textSec, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
                  PIN required to authorize. <strong style={{ color: text }}>This cannot be reversed</strong> once confirmed.
                </p>
              </motion.div>

              <motion.button
                style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 28px rgba(26,115,232,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '0.2px' }}
                whileTap={{ scale: 0.97 }} onClick={() => { setError(''); setShowPinModal(true); }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              >
                <Lock size={16} color="#fff" /> Confirm & Enter PIN
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ height: '40px' }} />

      {/* ── PIN MODAL ── */}
      <AnimatePresence>
        {showPinModal && (
          <motion.div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setShowPinModal(false)} />
            <motion.div
              style={{ background: cardSolid, borderRadius: '28px 28px 0 0', padding: '24px 24px 44px', width: '100%', maxWidth: '480px', boxSizing: 'border-box', position: 'relative', zIndex: 1, boxShadow: '0 -8px 40px rgba(0,0,0,0.3)' }}
              initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div style={{ width: '40px', height: '4px', background: isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0', borderRadius: '2px', margin: '0 auto 24px' }} />

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg,rgba(26,115,232,0.15),rgba(124,58,237,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: `1px solid ${isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.15)'}` }}>
                  <Lock size={28} color="#1A73E8" />
                </div>
                <h3 style={{ color: text, fontSize: '19px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>Enter PIN</h3>
                <p style={{ color: textSec, fontSize: '13px', margin: 0 }}>4-digit security PIN to confirm transfer</p>
              </div>

              {/* Transfer summary */}
              <div style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', borderRadius: '16px', padding: '14px 16px', marginBottom: '20px', border: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '15px', boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}>
                    {recipient?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ color: text, fontSize: '13px', fontWeight: '700', margin: 0 }}>{recipient?.full_name}</p>
                    <p style={{ color: textSec, fontSize: '11px', margin: 0 }}>{recipient?.phone}</p>
                  </div>
                </div>
                <p style={{ color: '#1A73E8', fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                  PKR {parseFloat(amount).toLocaleString()}
                </p>
              </div>

              {/* PIN boxes */}
              <p style={{ color: textSec, fontSize: '11px', fontWeight: '700', margin: '0 0 10px 0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Your 4-Digit PIN</p>
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <input style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'text', zIndex: 1 }} type="tel" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }} autoFocus />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', padding: '16px', border: `2px solid ${pin.length === 4 ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '18px', background: inputBg, transition: 'all 0.2s', boxShadow: pin.length === 4 ? '0 0 0 4px rgba(26,115,232,0.1)' : 'none' }}>
                  {[0,1,2,3].map(i => (
                    <motion.div key={i}
                      style={{ width: '54px', height: '54px', borderRadius: '16px', border: `2px solid ${i < pin.length ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'}`, background: i < pin.length ? 'rgba(26,115,232,0.1)' : isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', boxShadow: i < pin.length ? '0 4px 14px rgba(26,115,232,0.2)' : 'none' }}
                      animate={{ scale: i === pin.length - 1 ? [1, 1.12, 1] : 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.div
                        style={{ width: '14px', height: '14px', borderRadius: '50%', background: i < pin.length ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.15)' : '#CBD5E1' }}
                        animate={{ scale: i < pin.length ? 1 : 0.4, opacity: i < pin.length ? 1 : 0.5 }}
                        transition={{ duration: 0.15 }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {error && (
                <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '12px', padding: '10px 14px', margin: '8px 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <AlertCircle size={13} color="#DC2626" />
                  <span style={{ color: '#DC2626', fontSize: '12px', fontWeight: '500' }}>{error}</span>
                </motion.div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <motion.button style={{ flex: 1, padding: '15px', background: 'transparent', color: textSec, border: `1.5px solid ${border}`, borderRadius: '14px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }} whileTap={{ scale: 0.97 }} onClick={() => { setShowPinModal(false); setPin(''); setError(''); }}>Cancel</motion.button>
                <motion.button
                  style={{ flex: 2, padding: '15px', background: pin.length === 4 && !loading ? 'linear-gradient(135deg,#1A73E8,#7C3AED)' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: pin.length === 4 && !loading ? '#fff' : textSec, border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '800', cursor: pin.length === 4 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: pin.length === 4 ? '0 8px 24px rgba(26,115,232,0.35)' : 'none', transition: 'all 0.2s', letterSpacing: '0.2px' }}
                  whileTap={pin.length === 4 ? { scale: 0.97 } : {}} onClick={handleSend} disabled={loading || pin.length !== 4}
                >
                  {loading
                    ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>Processing...</motion.span>
                    : <><Send size={16} color={pin.length === 4 ? '#fff' : textSec} /> Send Money</>
                  }
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
