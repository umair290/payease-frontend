import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { accountService } from '../services/api';
import {
  ArrowLeft, Search, CheckCircle, Shield,
  ArrowRight, Send, Lock, Phone,
  CreditCard, FileText, Printer, Share2,
  Download, X, ArrowUpRight
} from 'lucide-react';

export default function SendMoney() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [searchMode, setSearchMode] = useState('wallet');
  const [walletNumber, setWalletNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [senderInfo, setSenderInfo] = useState(null);
  const [txRef] = useState('TXN' + Date.now().toString().slice(-8));
  const [txDate] = useState(new Date().toLocaleString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const walletFromQR = searchParams.get('wallet');
    if (walletFromQR) {
      setWalletNumber(walletFromQR);
      setSearchMode('wallet');
      lookupWalletByNumber(walletFromQR);
    }
  }, []);

  const lookupWalletByNumber = async (wNumber) => {
    setLoading(true); setError('');
    try {
      const res = await accountService.lookupWallet({ wallet_number: wNumber });
      setRecipient(res.data);
      setWalletNumber(res.data.wallet_number);
      const balRes = await accountService.getBalance();
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
      const res = await accountService.lookupByPhone({ phone: phoneNumber });
      setRecipient(res.data);
      setWalletNumber(res.data.wallet_number);
      const balRes = await accountService.getBalance();
      setSenderInfo(balRes.data);
      setStep(2);
    } catch (err) { setError(err.response?.data?.error || 'No account found with this phone number'); }
    setLoading(false);
  };

  const handleConfirm = () => {
    if (!amount || parseFloat(amount) <= 0) { setError('Please enter a valid amount'); return; }
    setError(''); setStep(3);
  };

  const handleSend = async () => {
    if (!pin || pin.length !== 4) { setError('Please enter your 4-digit PIN'); return; }
    setLoading(true); setError('');
    try {
      await accountService.send({
        to_wallet: walletNumber,
        amount: parseFloat(amount),
        pin: pin,
        description: description || `Transfer to ${recipient.full_name}`,
      });
      setShowPinModal(false);
      setSuccess(true);
    } catch (err) { setError(err.response?.data?.error || 'Transfer failed'); }
    setLoading(false);
  };

  const resetAll = () => {
    setSuccess(false); setStep(1); setWalletNumber(''); setPhoneNumber('');
    setAmount(''); setDescription(''); setPin(''); setRecipient(null); setError('');
  };

  const handlePrint = () => {
    const html = `
      <html><head><title>PayEase Receipt</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f0f4ff; display: flex; justify-content: center; padding: 40px 20px; }
        .receipt { background: #fff; border-radius: 20px; width: 100%; max-width: 400px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
        .header { background: linear-gradient(135deg, #1A73E8, #0052CC); padding: 32px; text-align: center; }
        .logo { color: #fff; font-size: 24px; font-weight: bold; margin-bottom: 16px; }
        .check { width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 28px; }
        .status { color: #fff; font-size: 18px; font-weight: bold; margin-bottom: 4px; }
        .type { color: rgba(255,255,255,0.7); font-size: 13px; }
        .amount { color: #fff; font-size: 36px; font-weight: bold; margin-top: 12px; }
        .body { padding: 24px; }
        .row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f4ff; }
        .row:last-child { border-bottom: none; }
        .label { color: #888; font-size: 13px; }
        .value { font-weight: 600; font-size: 13px; color: #1A1A2E; text-align: right; max-width: 60%; }
        .footer { background: #f8faff; border-top: 1px solid #e0e6f0; padding: 16px; text-align: center; }
        .footer p { color: #888; font-size: 11px; margin-bottom: 4px; }
        .watermark { color: #1A73E8; font-weight: bold; font-size: 14px; }
        @media print { body { background: white; } .receipt { box-shadow: none; } }
      </style></head>
      <body><div class="receipt">
        <div class="header">
          <div class="logo">PayEase</div>
          <div class="check">✓</div>
          <div class="status">Transfer Successful!</div>
          <div class="type">Money Transfer</div>
          <div class="amount">PKR ${parseFloat(amount).toLocaleString()}</div>
        </div>
        <div class="body">
          <div class="row"><span class="label">To</span><span class="value">${recipient?.full_name}</span></div>
          <div class="row"><span class="label">Phone</span><span class="value">${recipient?.phone}</span></div>
          <div class="row"><span class="label">Wallet ID</span><span class="value">${walletNumber}</span></div>
          <div class="row"><span class="label">Amount</span><span class="value" style="color:#1A73E8;font-size:15px">PKR ${parseFloat(amount).toLocaleString()}</span></div>
          ${description ? `<div class="row"><span class="label">Note</span><span class="value">${description}</span></div>` : ''}
          <div class="row"><span class="label">Reference No.</span><span class="value">${txRef}</span></div>
          <div class="row"><span class="label">Date & Time</span><span class="value">${txDate}</span></div>
          <div class="row"><span class="label">Status</span><span class="value" style="color:#00C853">✓ Completed</span></div>
        </div>
        <div class="footer">
          <p>Thank you for using PayEase</p>
          <p>Keep this receipt for your records</p>
          <div class="watermark">payease-frontend.vercel.app</div>
        </div>
      </div></body></html>
    `;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handleShare = () => {
    const text = `✅ PayEase Transfer Receipt\n\nAmount: PKR ${parseFloat(amount).toLocaleString()}\nTo: ${recipient?.full_name}\nPhone: ${recipient?.phone}\nRef: ${txRef}\nDate: ${txDate}\nStatus: Completed ✓\n\n💳 Powered by PayEase\npayease-frontend.vercel.app`;
    if (navigator.share) {
      navigator.share({ title: 'PayEase Receipt', text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  // ─── SUCCESS SCREEN ───
  if (success) return (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto' }}>

      {/* Confetti-like header */}
      <div style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', padding: '40px 24px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '3px solid rgba(255,255,255,0.4)' }}
        >
          <CheckCircle size={40} color="#fff" />
        </motion.div>

        <motion.h2
          style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px 0' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          Transfer Successful! 🎉
        </motion.h2>
        <motion.p
          style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: '0 0 16px 0' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          Your payment has been processed
        </motion.p>
        <motion.div
          style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '8px 20px' }}
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
        >
          <span style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>
            PKR {parseFloat(amount).toLocaleString()}
          </span>
        </motion.div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Receipt Card */}
        <motion.div
          style={{ background: colors.card, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: `1px solid ${colors.border}`, marginBottom: '16px' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        >
          {/* Recipient Row */}
          <div style={{ padding: '16px 20px', background: colors.actionBg, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: 'bold', flexShrink: 0 }}>
              {recipient?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: colors.text, fontSize: '15px', fontWeight: 'bold', margin: '0 0 2px 0' }}>{recipient?.full_name}</p>
              <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>{recipient?.phone}</p>
            </div>
            <div style={{ background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.3)', borderRadius: '20px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={12} color="#00C853" />
              <span style={{ color: '#00C853', fontSize: '11px', fontWeight: '700' }}>Completed</span>
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: '4px 20px' }}>
            {[
              { label: 'Wallet ID', value: walletNumber },
              { label: 'Amount', value: `PKR ${parseFloat(amount).toLocaleString()}`, color: '#1A73E8', bold: true },
              description && { label: 'Note', value: description },
              { label: 'Reference No.', value: txRef },
              { label: 'Date & Time', value: txDate },
            ].filter(Boolean).map((row, i, arr) => (
              <motion.div
                key={i}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none' }}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.06 }}
              >
                <span style={{ color: colors.textSecondary, fontSize: '13px' }}>{row.label}</span>
                <span style={{ color: row.color || colors.text, fontWeight: row.bold ? '700' : '600', fontSize: row.bold ? '16px' : '13px', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>
                  {row.value}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Receipt Actions */}
          <div style={{ display: 'flex', gap: '1px', borderTop: `1px solid ${colors.border}` }}>
            <motion.button
              style={{ flex: 1, padding: '14px', background: colors.actionBg, color: colors.text, border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRight: `1px solid ${colors.border}` }}
              whileTap={{ scale: 0.97 }} onClick={handlePrint}
            >
              <Printer size={15} color={colors.text} /> Print Receipt
            </motion.button>
            <motion.button
              style={{ flex: 1, padding: '14px', background: colors.actionBg, color: '#1A73E8', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              whileTap={{ scale: 0.97 }} onClick={handleShare}
            >
              <Share2 size={15} color="#1A73E8" /> Share
            </motion.button>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.button
          style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,115,232,0.3)', marginBottom: '10px' }}
          whileTap={{ scale: 0.97 }} onClick={() => navigate('/dashboard')}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        >
          Back to Dashboard
        </motion.button>

        <motion.button
          style={{ width: '100%', padding: '14px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '14px', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          whileTap={{ scale: 0.97 }} onClick={resetAll}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        >
          <ArrowUpRight size={16} color={colors.textSecondary} /> Send Another Payment
        </motion.button>
      </div>
    </div>
  );

  // ─── MAIN FLOW ────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: colors.card, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <motion.div
          style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${colors.border}` }}
          whileTap={{ scale: 0.9 }}
          onClick={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)}
        >
          <ArrowLeft size={22} color={colors.text} />
        </motion.div>
        <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Send Money</h2>
        <div style={{ width: 36 }} />
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 32px', background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
        {['Recipient', 'Amount', 'Confirm'].map((label, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <motion.div
                style={{ width: '30px', height: '30px', borderRadius: '50%', background: step > i + 1 ? '#00C853' : step === i + 1 ? '#1A73E8' : colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: step >= i + 1 ? 'none' : `2px solid ${colors.border}` }}
                animate={{ scale: step === i + 1 ? 1.1 : 1 }}
              >
                {step > i + 1
                  ? <CheckCircle size={14} color="#fff" />
                  : <span style={{ color: step >= i + 1 ? '#fff' : colors.textSecondary, fontSize: '12px', fontWeight: '700' }}>{i + 1}</span>
                }
              </motion.div>
              <span style={{ fontSize: '10px', color: step >= i + 1 ? colors.text : colors.textSecondary, fontWeight: step === i + 1 ? '600' : '400' }}>
                {label}
              </span>
            </div>
            {i < 2 && (
              <div style={{ flex: 1, height: '2px', margin: '0 6px 14px', background: step > i + 1 ? '#00C853' : colors.border, transition: 'background 0.3s' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div style={{ padding: '16px' }}>
        <AnimatePresence mode="wait">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div style={{ background: colors.card, borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${colors.border}` }}>
                <div style={{ width: '68px', height: '68px', borderRadius: '20px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Search size={30} color="#1A73E8" />
                </div>
                <h3 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', textAlign: 'center' }}>Find Recipient</h3>
                <p style={{ color: colors.textSecondary, fontSize: '13px', textAlign: 'center', margin: '0 0 24px 0', lineHeight: '1.6' }}>
                  Search by wallet number or registered phone number
                </p>

                <div style={{ display: 'flex', background: colors.actionBg, borderRadius: '12px', padding: '4px', marginBottom: '20px', border: `1px solid ${colors.border}` }}>
                  {[{ id: 'wallet', label: 'Wallet ID', icon: <CreditCard size={14} /> }, { id: 'phone', label: 'Phone Number', icon: <Phone size={14} /> }].map((tab) => (
                    <motion.button
                      key={tab.id}
                      style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '10px', cursor: 'pointer', background: searchMode === tab.id ? '#1A73E8' : 'transparent', color: searchMode === tab.id ? '#fff' : colors.textSecondary, fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setSearchMode(tab.id); setError(''); setWalletNumber(''); setPhoneNumber(''); }}
                    >
                      {tab.icon} {tab.label}
                    </motion.button>
                  ))}
                </div>

                {searchMode === 'wallet' && (
                  <motion.div style={{ marginBottom: '16px' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', margin: '0 0 8px 0' }}>Wallet Number</p>
                    <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${walletNumber ? '#1A73E8' : colors.border}`, borderRadius: '12px', padding: '0 16px', background: colors.inputBg, transition: 'border-color 0.2s', boxShadow: walletNumber ? '0 0 0 3px rgba(26,115,232,0.08)' : 'none' }}>
                      <CreditCard size={18} color={walletNumber ? '#1A73E8' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '10px' }} />
                      <input
                        style={{ flex: 1, padding: '14px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none', minWidth: 0 }}
                        placeholder="e.g. PK1234567890"
                        value={walletNumber} onChange={(e) => setWalletNumber(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && lookupWallet()}
                      />
                    </div>
                  </motion.div>
                )}

                {searchMode === 'phone' && (
                  <motion.div style={{ marginBottom: '16px' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', margin: '0 0 8px 0' }}>Phone Number</p>
                    <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${phoneNumber ? '#1A73E8' : colors.border}`, borderRadius: '12px', padding: '0 16px', background: colors.inputBg, transition: 'border-color 0.2s', boxShadow: phoneNumber ? '0 0 0 3px rgba(26,115,232,0.08)' : 'none' }}>
                      <Phone size={18} color={phoneNumber ? '#1A73E8' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '10px' }} />
                      <input
                        style={{ flex: 1, padding: '14px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none', minWidth: 0 }}
                        placeholder="03XXXXXXXXX"
                        value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && lookupByPhone()}
                      />
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div style={{ color: '#FF4444', fontSize: '13px', textAlign: 'center', margin: '0 0 12px 0', padding: '12px', background: 'rgba(255,68,68,0.08)', borderRadius: '10px', border: '1px solid rgba(255,68,68,0.2)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                  </motion.div>
                )}

                <motion.button
                  style={{ width: '100%', padding: '15px', background: (searchMode === 'wallet' ? walletNumber : phoneNumber) ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : colors.actionBg, color: (searchMode === 'wallet' ? walletNumber : phoneNumber) ? '#fff' : colors.textSecondary, border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: (searchMode === 'wallet' ? walletNumber : phoneNumber) ? '0 6px 20px rgba(26,115,232,0.3)' : 'none' }}
                  whileTap={{ scale: 0.97 }} onClick={searchMode === 'wallet' ? lookupWallet : lookupByPhone} disabled={loading}
                >
                  {loading ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>Searching...</motion.span> : <><Search size={16} /> Find Recipient</>}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && recipient && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <motion.div style={{ background: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '14px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', fontWeight: 'bold', flexShrink: 0 }}>
                  {recipient.full_name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', margin: '0 0 3px 0' }}>{recipient.full_name}</p>
                  <p style={{ color: colors.textSecondary, fontSize: '12px', margin: '0 0 2px 0' }}>{recipient.phone}</p>
                  <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0, fontFamily: 'monospace' }}>{recipient.wallet_number}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  {recipient.kyc_verified ? <CheckCircle size={18} color="#00C853" /> : <Shield size={18} color="#FFB300" />}
                  <span style={{ fontSize: '10px', fontWeight: '600', color: recipient.kyc_verified ? '#00C853' : '#FFB300' }}>
                    {recipient.kyc_verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </motion.div>

              <div style={{ background: colors.card, borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${colors.border}` }}>
                <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: '0 0 20px 0' }}>Enter Amount</h3>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', margin: '0 0 8px 0' }}>Amount (PKR)</p>
                  <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${amount ? '#1A73E8' : colors.border}`, borderRadius: '12px', padding: '0 16px', background: colors.inputBg, transition: 'border-color 0.2s', boxShadow: amount ? '0 0 0 3px rgba(26,115,232,0.08)' : 'none' }}>
                    <span style={{ color: colors.textSecondary, fontSize: '16px', fontWeight: '600', marginRight: '8px', flexShrink: 0 }}>PKR</span>
                    <input
                      style={{ flex: 1, padding: '16px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '24px', fontWeight: 'bold', outline: 'none', minWidth: 0 }}
                      type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', margin: '0 0 8px 0' }}>Description <span style={{ fontWeight: '400' }}>(optional)</span></p>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${colors.border}`, borderRadius: '12px', padding: '0 16px', background: colors.inputBg }}>
                    <FileText size={16} color={colors.textSecondary} style={{ flexShrink: 0, marginRight: '10px' }} />
                    <input
                      style={{ flex: 1, padding: '13px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none', minWidth: 0 }}
                      placeholder="e.g. Rent, Groceries..." value={description} onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                {error && (
                  <motion.div style={{ color: '#FF4444', fontSize: '13px', margin: '0 0 12px 0', padding: '12px', background: 'rgba(255,68,68,0.08)', borderRadius: '10px', border: '1px solid rgba(255,68,68,0.2)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                  </motion.div>
                )}
                <motion.button
                  style={{ width: '100%', padding: '15px', background: amount ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : colors.actionBg, color: amount ? '#fff' : colors.textSecondary, border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: amount ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: amount ? '0 6px 20px rgba(26,115,232,0.3)' : 'none' }}
                  whileTap={amount ? { scale: 0.97 } : {}} onClick={handleConfirm}
                >
                  Continue <ArrowRight size={16} color={amount ? '#fff' : colors.textSecondary} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div style={{ background: colors.card, borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${colors.border}` }}>
                <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: '0 0 6px 0' }}>Review Transfer</h3>
                <p style={{ color: colors.textSecondary, fontSize: '13px', margin: '0 0 24px 0' }}>Please review the details before confirming</p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: colors.actionBg, borderRadius: '16px', marginBottom: '20px', border: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(26,115,232,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A73E8', fontSize: '20px', fontWeight: 'bold' }}>
                      {senderInfo?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: 0 }}>{senderInfo?.full_name?.split(' ')[0]}</p>
                    <span style={{ background: 'rgba(26,115,232,0.1)', color: '#1A73E8', fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '6px' }}>You</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                    <div style={{ background: '#1A73E8', borderRadius: '10px', padding: '6px 12px', boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}>
                      <p style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>PKR {parseFloat(amount).toLocaleString()}</p>
                    </div>
                    <ArrowRight size={20} color="#1A73E8" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(0,200,83,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C853', fontSize: '20px', fontWeight: 'bold' }}>
                      {recipient?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: 0 }}>{recipient?.full_name?.split(' ')[0]}</p>
                    <span style={{ background: 'rgba(0,200,83,0.1)', color: '#00C853', fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '6px' }}>Recipient</span>
                  </div>
                </div>

                <div style={{ background: colors.actionBg, borderRadius: '12px', padding: '4px 16px', marginBottom: '20px', border: `1px solid ${colors.border}` }}>
                  {[
                    { label: 'Full Name', value: recipient?.full_name },
                    { label: 'Phone', value: recipient?.phone },
                    { label: 'Wallet ID', value: recipient?.wallet_number },
                    { label: 'Amount', value: `PKR ${parseFloat(amount).toLocaleString()}`, highlight: true },
                    description && { label: 'Note', value: description },
                  ].filter(Boolean).map((row, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                      <span style={{ color: colors.textSecondary, fontSize: '13px' }}>{row.label}</span>
                      <span style={{ color: row.highlight ? '#1A73E8' : colors.text, fontWeight: row.highlight ? '700' : '600', fontSize: row.highlight ? '16px' : '13px' }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <motion.button
                  style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,115,232,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  whileTap={{ scale: 0.97 }} onClick={() => { setError(''); setShowPinModal(true); }}
                >
                  <Lock size={16} color="#fff" /> Confirm & Enter PIN
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PIN MODAL ── */}
      <AnimatePresence>
        {showPinModal && (
          <motion.div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setShowPinModal(false)} />
            <motion.div
              style={{ background: colors.card, borderRadius: '24px 24px 0 0', padding: '24px 24px 40px', width: '100%', maxWidth: '480px', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}
              initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div style={{ width: '40px', height: '4px', background: colors.border, borderRadius: '2px', margin: '0 auto 24px' }} />

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <motion.div
                  style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                >
                  <Lock size={28} color="#1A73E8" />
                </motion.div>
                <h3 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0' }}>Enter PIN</h3>
                <p style={{ color: colors.textSecondary, fontSize: '13px', margin: 0 }}>Enter your 4-digit security PIN to confirm</p>
              </div>

              {/* Amount Summary */}
              <div style={{ background: colors.actionBg, borderRadius: '14px', padding: '16px', textAlign: 'center', marginBottom: '20px', border: `1px solid ${colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                    {recipient?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ color: colors.text, fontWeight: '600', fontSize: '14px', margin: 0 }}>{recipient?.full_name}</p>
                </div>
                <p style={{ color: '#1A73E8', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
                  PKR {parseFloat(amount).toLocaleString()}
                </p>
              </div>

              {/* ── PIN BOXES — clearly visible ── */}
              <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: '0 0 10px 0', textAlign: 'center' }}>Enter 4-Digit PIN</p>
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <input
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'text', zIndex: 1 }}
                  type="tel" inputMode="numeric" maxLength={4}
                  value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                  autoFocus
                />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', padding: '16px', border: `2px solid ${pin.length === 4 ? '#1A73E8' : '#CBD5E0'}`, borderRadius: '16px', background: '#EEF2FF', transition: 'all 0.2s', boxShadow: pin.length === 4 ? '0 0 0 3px rgba(26,115,232,0.1)' : 'none' }}>
                  {[0, 1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      style={{ width: '52px', height: '52px', borderRadius: '14px', border: `2px solid ${i < pin.length ? '#1A73E8' : '#94A3B8'}`, background: i < pin.length ? 'rgba(26,115,232,0.12)' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', boxShadow: i < pin.length ? '0 4px 12px rgba(26,115,232,0.2)' : 'inset 0 2px 4px rgba(0,0,0,0.08)' }}
                      animate={{ scale: i === pin.length - 1 ? [1, 1.15, 1] : 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.div
                        style={{ width: '14px', height: '14px', borderRadius: '50%', background: i < pin.length ? '#1A73E8' : 'transparent' }}
                        animate={{ scale: i < pin.length ? 1 : 0.3 }}
                        transition={{ duration: 0.15 }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {error && (
                <motion.div style={{ color: '#FF4444', fontSize: '13px', margin: '8px 0 12px', padding: '10px', background: 'rgba(255,68,68,0.08)', borderRadius: '10px', border: '1px solid rgba(255,68,68,0.2)', textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {error}
                </motion.div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <motion.button
                  style={{ flex: 1, padding: '14px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}
                  whileTap={{ scale: 0.97 }} onClick={() => { setShowPinModal(false); setPin(''); setError(''); }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  style={{ flex: 2, padding: '14px', background: pin.length === 4 && !loading ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : '#E2E8F0', color: pin.length === 4 && !loading ? '#fff' : '#94A3B8', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: pin.length === 4 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: pin.length === 4 ? '0 6px 20px rgba(26,115,232,0.3)' : 'none', transition: 'all 0.2s' }}
                  whileTap={pin.length === 4 ? { scale: 0.97 } : {}} onClick={handleSend} disabled={loading || pin.length !== 4}
                >
                  {loading
                    ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>Processing...</motion.span>
                    : <><Send size={16} color={pin.length === 4 ? '#fff' : '#94A3B8'} /> Send Money</>
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
