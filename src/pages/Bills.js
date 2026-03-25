import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { billService, logActivity } from '../services/api';
import {
  ArrowLeft, Zap, Wind, Wifi, Phone,
  ChevronRight, CheckCircle, Lock,
  Printer, Share2, AlertCircle, FileText
} from 'lucide-react';

export default function Bills() {
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();

  const [providers,        setProviders]        = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [step,             setStep]             = useState(1);
  const [form,             setForm]             = useState({ amount: '', reference: '' });
  const [loading,          setLoading]          = useState(false);
  const [success,          setSuccess]          = useState(false);
  const [error,            setError]            = useState('');
  const [focusedField,     setFocusedField]     = useState(null);
  const [pin,              setPin]              = useState('');

  const [txRef]  = useState('BILL' + Date.now().toString().slice(-8));
  const [txDate] = useState(new Date().toLocaleString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }));

  useEffect(() => { loadProviders(); }, []);

  const loadProviders = async () => {
    try {
      const res = await billService.getProviders();
      setProviders(res.data.providers || {});
    } catch (err) { console.error(err); }
  };

  const categories = {
    electricity: { icon: <Zap size={22} color="#fff" />,   grad: 'linear-gradient(135deg,#F59E0B,#D97706)', shadow: 'rgba(245,158,11,0.4)',  bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', label: 'Electricity',   desc: 'Power and energy bills' },
    gas:         { icon: <Wind size={22} color="#fff" />,  grad: 'linear-gradient(135deg,#EA580C,#C2410C)', shadow: 'rgba(234,88,12,0.4)',   bg: 'rgba(234,88,12,0.1)',   color: '#EA580C', label: 'Gas',           desc: 'Natural gas bills' },
    internet:    { icon: <Wifi size={22} color="#fff" />,  grad: 'linear-gradient(135deg,#1A73E8,#0052CC)', shadow: 'rgba(26,115,232,0.4)',  bg: 'rgba(26,115,232,0.1)',  color: '#1A73E8', label: 'Internet',      desc: 'Broadband and DSL' },
    topup:       { icon: <Phone size={22} color="#fff" />, grad: 'linear-gradient(135deg,#16A34A,#15803D)', shadow: 'rgba(22,163,74,0.4)',   bg: 'rgba(22,163,74,0.1)',   color: '#16A34A', label: 'Mobile Top-up', desc: 'Prepaid recharge' },
  };

  const handlePay = async () => {
    if (!form.reference)                              { setError('Reference number is required'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Enter a valid amount'); return; }
    if (pin.length !== 4)                             { setError('Enter your 4-digit PIN'); return; }
    setLoading(true); setError('');
    try {
      await billService.payBill({
        bill_type: selectedCategory,
        provider:  selectedProvider,
        amount:    parseFloat(form.amount),
        reference: form.reference,
        pin,
      });
      logActivity('Bill Payment', `Paid ${selectedCategory} bill via ${selectedProvider} — PKR ${parseFloat(form.amount).toLocaleString()}`);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
    }
    setLoading(false);
  };

  const handlePrint = () => {
    const c = categories[selectedCategory];
    const html = `<html><head><title>PayEase Bill Receipt</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,sans-serif;background:#f0f4ff;display:flex;justify-content:center;padding:40px 20px;}.r{background:#fff;border-radius:20px;width:100%;max-width:400px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.12);}.h{background:linear-gradient(135deg,#1A73E8,#0052CC);padding:32px;text-align:center;}.logo{color:#fff;font-size:22px;font-weight:bold;margin-bottom:12px;}.status{color:#fff;font-size:18px;font-weight:bold;margin-bottom:4px;}.type{color:rgba(255,255,255,0.7);font-size:13px;}.amt{color:#fff;font-size:34px;font-weight:bold;margin-top:10px;}.b{padding:24px;}.row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f4ff;}.row:last-child{border-bottom:none;}.l{color:#888;font-size:13px;}.v{font-weight:600;font-size:13px;color:#1A1A2E;text-align:right;}.f{background:#f8faff;border-top:1px solid #e0e6f0;padding:16px;text-align:center;}.f p{color:#888;font-size:11px;margin-bottom:4px;}@media print{body{background:white;}.r{box-shadow:none;}}</style></head>
    <body><div class="r"><div class="h"><div class="logo">PayEase</div><div class="status">Payment Successful</div><div class="type">${c?.label || selectedCategory} Bill</div><div class="amt">PKR ${parseFloat(form.amount).toLocaleString()}</div></div>
    <div class="b"><div class="row"><span class="l">Provider</span><span class="v">${selectedProvider}</span></div><div class="row"><span class="l">Category</span><span class="v">${c?.label || selectedCategory}</span></div><div class="row"><span class="l">Reference No.</span><span class="v">${form.reference}</span></div><div class="row"><span class="l">Amount Paid</span><span class="v" style="color:#1A73E8">PKR ${parseFloat(form.amount).toLocaleString()}</span></div><div class="row"><span class="l">Transaction ID</span><span class="v">${txRef}</span></div><div class="row"><span class="l">Date</span><span class="v">${txDate}</span></div><div class="row"><span class="l">Status</span><span class="v" style="color:#16A34A">Completed</span></div></div>
    <div class="f"><p>Thank you for using PayEase</p><p style="color:#1A73E8;font-weight:bold">payease.space</p></div></div></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handleShare = () => {
    const text = `PayEase Bill Receipt\n\nProvider: ${selectedProvider}\nAmount: PKR ${parseFloat(form.amount).toLocaleString()}\nReference: ${form.reference}\nTransaction ID: ${txRef}\nDate: ${txDate}\nStatus: Completed\n\npayease.space`;
    if (navigator.share) navigator.share({ title: 'PayEase Bill Receipt', text });
    else navigator.clipboard.writeText(text);
  };

  const cat = categories[selectedCategory];

  // shared vars
  const bg       = isDark ? '#0A0F1E' : '#F0F4FF';
  const card     = isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
  const cardSolid= isDark ? '#0F1629' : '#FFFFFF';
  const border   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const text     = isDark ? '#F0F6FC' : '#0F172A';
  const textSec  = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8';
  const inputBg  = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF';
  const actionBg = isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9';

  // ── SUCCESS ──
  if (success) return (
    <div style={{ minHeight: '100vh', background: bg, maxWidth: '480px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Success Hero */}
      <div style={{ background: cat?.grad || 'linear-gradient(135deg,#1A73E8,#0052CC)', padding: '48px 24px 36px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)' }} />

        <motion.div
          initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '3px solid rgba(255,255,255,0.35)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
        >
          <CheckCircle size={40} color="#fff" />
        </motion.div>
        <motion.h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          Payment Successful!
        </motion.h2>
        <motion.p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', margin: '0 0 20px 0' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          {selectedProvider} {cat?.label} bill paid
        </motion.p>
        <motion.div
          style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '12px 28px', border: '1px solid rgba(255,255,255,0.2)' }}
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
        >
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600' }}>PKR </span>
          <span style={{ color: '#fff', fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>{parseFloat(form.amount).toLocaleString()}</span>
        </motion.div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Receipt */}
        <motion.div
          style={{ background: card, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${border}`, marginBottom: '14px', boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        >
          {/* Provider header */}
          <div style={{ padding: '16px 20px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: cat?.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 6px 16px ${cat?.shadow}` }}>
              {cat?.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: text, fontSize: '15px', fontWeight: '700', margin: '0 0 2px 0' }}>{selectedProvider}</p>
              <p style={{ color: textSec, fontSize: '12px', margin: 0 }}>{cat?.label} Bill Payment</p>
            </div>
            <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '20px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle size={11} color="#16A34A" />
              <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: '700' }}>Paid</span>
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: '4px 20px' }}>
            {[
              { label: 'Reference No.',  value: form.reference },
              { label: 'Amount Paid',    value: `PKR ${parseFloat(form.amount).toLocaleString()}`, color: cat?.color, bold: true },
              { label: 'Transaction ID', value: txRef },
              { label: 'Date and Time',  value: txDate },
              { label: 'Status',         value: 'Completed', color: '#16A34A' },
            ].map((row, i, arr) => (
              <motion.div key={i}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
              >
                <span style={{ color: textSec, fontSize: '12px' }}>{row.label}</span>
                <span style={{ color: row.color || text, fontWeight: row.bold ? '800' : '600', fontSize: row.bold ? '15px' : '13px' }}>{row.value}</span>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', borderTop: `1px solid ${border}` }}>
            <motion.button style={{ flex: 1, padding: '14px', background: 'transparent', color: text, border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRight: `1px solid ${border}` }} whileTap={{ scale: 0.97 }} onClick={handlePrint}>
              <Printer size={14} /> Print
            </motion.button>
            <motion.button style={{ flex: 1, padding: '14px', background: 'transparent', color: '#1A73E8', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} whileTap={{ scale: 0.97 }} onClick={handleShare}>
              <Share2 size={14} /> Share
            </motion.button>
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
          style={{ width: '100%', padding: '14px', background: 'transparent', color: textSec, border: `1.5px solid ${border}`, borderRadius: '14px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setSuccess(false); setStep(1); setForm({ amount: '', reference: '' }); setPin(''); setSelectedCategory(null); setSelectedProvider(null); }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        >
          Pay Another Bill
        </motion.button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: bg, maxWidth: '480px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 16px', background: 'transparent' }}>
        <motion.div
          style={{ width: '40px', height: '40px', borderRadius: '13px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          whileTap={{ scale: 0.88 }}
          onClick={() => step === 1 ? navigate('/dashboard') : step === 2 ? (setStep(1), setSelectedCategory(null)) : setStep(2)}
        >
          <ArrowLeft size={20} color={isDark ? 'rgba(255,255,255,0.7)' : '#475569'} />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: text, fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>Pay Bills</h2>
          <p style={{ color: textSec, fontSize: '11px', margin: '2px 0 0 0', fontWeight: '500' }}>
            {step === 1 ? 'Select category' : step === 2 ? 'Select provider' : 'Enter details'}
          </p>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* ── STEP INDICATOR ── */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ background: card, borderRadius: '16px', padding: '14px 20px', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)' }}>
          {['Category', 'Provider', 'Payment'].map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <motion.div
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: step > i + 1 ? 'linear-gradient(135deg,#16A34A,#15803D)' : step === i + 1 ? (cat?.grad || 'linear-gradient(135deg,#1A73E8,#7C3AED)') : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: step === i + 1 ? `0 4px 12px ${cat?.shadow || 'rgba(26,115,232,0.4)'}` : 'none' }}
                  animate={{ scale: step === i + 1 ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {step > i + 1
                    ? <CheckCircle size={14} color="#fff" />
                    : <span style={{ color: step >= i + 1 ? '#fff' : textSec, fontSize: '12px', fontWeight: '800' }}>{i + 1}</span>
                  }
                </motion.div>
                <span style={{ fontSize: '10px', color: step >= i + 1 ? text : textSec, fontWeight: step === i + 1 ? '700' : '500' }}>{label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: '2px', margin: '0 6px 16px', borderRadius: '1px', background: step > i + 1 ? 'linear-gradient(90deg,#16A34A,#15803D)' : isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0', transition: 'background 0.4s' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Category ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <p style={{ color: textSec, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 12px 4px' }}>
                What would you like to pay?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.keys(providers).map((category, i) => {
                  const c = categories[category] || { icon: <Zap size={22} color="#fff" />, grad: 'linear-gradient(135deg,#64748B,#475569)', shadow: 'rgba(100,116,139,0.3)', bg: 'rgba(100,116,139,0.1)', color: '#64748B', label: category, desc: '' };
                  return (
                    <motion.div key={category}
                      style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: card, borderRadius: '18px', cursor: 'pointer', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)', transition: 'background 0.15s' }}
                      whileHover={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#FAFBFF' }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      onClick={() => { setSelectedCategory(category); setStep(2); }}
                    >
                      <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: c.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 6px 16px ${c.shadow}` }}>
                        {c.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: text, fontSize: '15px', fontWeight: '700', margin: '0 0 3px 0' }}>{c.label}</p>
                        <p style={{ color: textSec, fontSize: '12px', margin: 0 }}>{c.desc} · <span style={{ color: c.color, fontWeight: '600' }}>{providers[category].length} providers</span></p>
                      </div>
                      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ChevronRight size={15} color={textSec} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Provider ── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

              {/* Selected category pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: card, borderRadius: '14px', marginBottom: '14px', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: cat?.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${cat?.shadow}` }}>
                  {cat?.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: text, fontSize: '14px', fontWeight: '700', margin: 0 }}>{cat?.label}</p>
                  <p style={{ color: textSec, fontSize: '11px', margin: 0 }}>Select your service provider</p>
                </div>
                <div style={{ background: cat?.bg, borderRadius: '20px', padding: '4px 10px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}` }}>
                  <span style={{ color: cat?.color, fontSize: '11px', fontWeight: '700' }}>{(providers[selectedCategory] || []).length} options</span>
                </div>
              </div>

              <p style={{ color: textSec, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px 4px' }}>Available Providers</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(providers[selectedCategory] || []).map((provider, i) => (
                  <motion.div key={provider}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: card, borderRadius: '16px', cursor: 'pointer', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)', transition: 'background 0.15s' }}
                    whileHover={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#FAFBFF' }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    onClick={() => { setSelectedProvider(provider); setStep(3); }}
                  >
                    {/* Provider avatar */}
                    <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: cat?.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${cat?.shadow}` }}>
                      <span style={{ color: '#fff', fontSize: '20px', fontWeight: '800' }}>{provider.charAt(0)}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: text, fontSize: '14px', fontWeight: '700', margin: '0 0 2px 0' }}>{provider}</p>
                      <p style={{ color: textSec, fontSize: '11px', margin: 0 }}>{cat?.label} Provider</p>
                    </div>
                    <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: cat?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}` }}>
                      <ChevronRight size={14} color={cat?.color} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Payment ── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

              {/* Provider banner */}
              <motion.div
                style={{ background: cat?.grad, borderRadius: '20px', padding: '20px', marginBottom: '14px', position: 'relative', overflow: 'hidden', boxShadow: `0 12px 40px ${cat?.shadow}` }}
                initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.25)' }}>
                    <span style={{ color: '#fff', fontSize: '22px', fontWeight: '800' }}>{selectedProvider?.charAt(0)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#fff', fontSize: '18px', fontWeight: '800', margin: '0 0 3px 0', letterSpacing: '-0.3px' }}>{selectedProvider}</p>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', margin: 0 }}>{cat?.label} Bill Payment</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '5px 12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>{cat?.label}</span>
                  </div>
                </div>
              </motion.div>

              {/* Form */}
              <motion.div
                style={{ background: card, borderRadius: '20px', padding: '20px', border: `1px solid ${border}`, marginBottom: '14px', boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.05)' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              >
                <h3 style={{ color: text, fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0', letterSpacing: '-0.3px' }}>Payment Details</h3>

                {/* Reference */}
                <div style={{ marginBottom: '14px' }}>
                  <p style={{ color: textSec, fontSize: '11px', fontWeight: '700', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Reference / Account No.</p>
                  <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${focusedField === 'ref' || form.reference ? (cat?.color || '#1A73E8') : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '14px', padding: '0 16px', background: inputBg, transition: 'all 0.2s', boxShadow: focusedField === 'ref' ? `0 0 0 4px ${cat?.bg || 'rgba(26,115,232,0.1)'}` : 'none' }}>
                    <FileText size={17} color={form.reference ? (cat?.color || '#1A73E8') : textSec} style={{ marginRight: '10px', flexShrink: 0 }} />
                    <input
                      style={{ flex: 1, padding: '14px 0', border: 'none', background: 'transparent', color: text, fontSize: '14px', outline: 'none', fontWeight: '500' }}
                      placeholder="e.g. 1234567890" value={form.reference}
                      onChange={(e) => setForm({ ...form, reference: e.target.value })}
                      onFocus={() => setFocusedField('ref')} onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <p style={{ color: textSec, fontSize: '11px', fontWeight: '700', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Amount (PKR)</p>
                  <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${focusedField === 'amt' || form.amount ? (cat?.color || '#1A73E8') : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '18px', padding: '0 20px', background: inputBg, transition: 'all 0.2s', boxShadow: focusedField === 'amt' ? `0 0 0 4px ${cat?.bg || 'rgba(26,115,232,0.1)'}` : 'none' }}>
                    <span style={{ color: textSec, fontSize: '18px', fontWeight: '600', marginRight: '10px', flexShrink: 0 }}>PKR</span>
                    <input
                      style={{ flex: 1, padding: '16px 0', border: 'none', background: 'transparent', color: text, fontSize: '28px', fontWeight: '800', outline: 'none', letterSpacing: '-1px' }}
                      type="number" placeholder="0" value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      onFocus={() => setFocusedField('amt')} onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>
              </motion.div>

              {/* PIN */}
              <motion.div
                style={{ background: card, borderRadius: '20px', padding: '20px', border: `1px solid ${border}`, marginBottom: '14px', boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.05)' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'linear-gradient(135deg,rgba(26,115,232,0.15),rgba(124,58,237,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.15)'}` }}>
                    <Lock size={20} color="#1A73E8" />
                  </div>
                  <div>
                    <p style={{ color: text, fontSize: '14px', fontWeight: '700', margin: 0 }}>Security PIN</p>
                    <p style={{ color: textSec, fontSize: '11px', margin: 0 }}>Enter your 4-digit PIN to confirm</p>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'text', zIndex: 1 }}
                    type="tel" inputMode="numeric" maxLength={4}
                    value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                  />
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
              </motion.div>

              {error && (
                <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '12px', padding: '12px 16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                  <AlertCircle size={15} color="#DC2626" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#DC2626', fontSize: '13px', fontWeight: '500' }}>{error}</span>
                </motion.div>
              )}

              <motion.button
                style={{ width: '100%', padding: '16px', background: form.reference && form.amount && pin.length === 4 ? cat?.grad : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: form.reference && form.amount && pin.length === 4 ? '#fff' : textSec, border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: form.reference && form.amount && pin.length === 4 ? `0 8px 28px ${cat?.shadow}` : 'none', transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '0.2px' }}
                whileTap={{ scale: 0.97 }} onClick={handlePay} disabled={loading}
              >
                {loading
                  ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>Processing...</motion.span>
                  : <><Lock size={16} color={form.reference && form.amount && pin.length === 4 ? '#fff' : textSec} /> Pay PKR {form.amount ? parseFloat(form.amount).toLocaleString() : '0'}</>
                }
              </motion.button>

              <div style={{ height: '40px' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
