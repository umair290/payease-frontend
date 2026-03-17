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
  const { colors } = useTheme();
  const navigate   = useNavigate();

  const [providers,         setProviders]         = useState({});
  const [selectedCategory,  setSelectedCategory]  = useState(null);
  const [selectedProvider,  setSelectedProvider]  = useState(null);
  const [step,              setStep]              = useState(1);
  const [form,              setForm]              = useState({ amount: '', reference: '', pin: '' });
  const [loading,           setLoading]           = useState(false);
  const [success,           setSuccess]           = useState(false);
  const [error,             setError]             = useState('');
  const [focusedField,      setFocusedField]      = useState(null);
  const [pin,               setPin]               = useState('');

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
    electricity: { icon: <Zap size={22} color="#FFB300" />,  bg: 'rgba(255,179,0,0.1)',    color: '#FFB300', label: 'Electricity',   desc: 'Power and energy bills' },
    gas:         { icon: <Wind size={22} color="#FF6B35" />, bg: 'rgba(255,107,53,0.1)',   color: '#FF6B35', label: 'Gas',           desc: 'Natural gas bills' },
    internet:    { icon: <Wifi size={22} color="#1A73E8" />, bg: 'rgba(26,115,232,0.1)',   color: '#1A73E8', label: 'Internet',      desc: 'Broadband and DSL' },
    topup:       { icon: <Phone size={22} color="#16A34A" />,bg: 'rgba(22,163,74,0.1)',    color: '#16A34A', label: 'Mobile Top-up', desc: 'Prepaid recharge' },
  };

  const handlePay = async () => {
    if (!form.reference)                         { setError('Reference number is required'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Enter a valid amount'); return; }
    if (pin.length !== 4)                        { setError('Enter your 4-digit PIN'); return; }
    setLoading(true); setError('');
    try {
      await billService.payBill({
        bill_type: selectedCategory,
        provider:  selectedProvider,
        amount:    parseFloat(form.amount),
        reference: form.reference,
        pin:       pin,
      });
      logActivity('Bill Payment', `Paid ${selectedCategory} bill via ${selectedProvider} — PKR ${parseFloat(form.amount).toLocaleString()}`);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
    }
    setLoading(false);
  };

  const handlePrint = () => {
    const cat  = categories[selectedCategory];
    const html = `<html><head><title>PayEase Bill Receipt</title>
    <style>* { margin:0;padding:0;box-sizing:border-box; } body { font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f0f4ff;display:flex;justify-content:center;padding:40px 20px; } .receipt { background:#fff;border-radius:20px;width:100%;max-width:400px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.12); } .header { background:linear-gradient(135deg,#1A73E8,#0052CC);padding:32px;text-align:center; } .logo { color:#fff;font-size:22px;font-weight:bold;margin-bottom:16px; } .check { width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:28px; } .status { color:#fff;font-size:18px;font-weight:bold;margin-bottom:4px; } .type { color:rgba(255,255,255,0.7);font-size:13px; } .amount { color:#fff;font-size:34px;font-weight:bold;margin-top:12px; } .body { padding:24px; } .row { display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f4ff; } .row:last-child { border-bottom:none; } .label { color:#888;font-size:13px; } .value { font-weight:600;font-size:13px;color:#1A1A2E;text-align:right; } .footer { background:#f8faff;border-top:1px solid #e0e6f0;padding:16px;text-align:center; } .footer p { color:#888;font-size:11px;margin-bottom:4px; } @media print { body { background:white; } .receipt { box-shadow:none; } }</style></head>
    <body><div class="receipt"><div class="header"><div class="logo">PayEase</div><div class="check">&#10003;</div><div class="status">Payment Successful</div><div class="type">${cat?.label || selectedCategory} Bill</div><div class="amount">PKR ${parseFloat(form.amount).toLocaleString()}</div></div>
    <div class="body"><div class="row"><span class="label">Provider</span><span class="value">${selectedProvider}</span></div><div class="row"><span class="label">Category</span><span class="value">${cat?.label || selectedCategory}</span></div><div class="row"><span class="label">Reference No.</span><span class="value">${form.reference}</span></div><div class="row"><span class="label">Amount Paid</span><span class="value" style="color:#1A73E8;font-size:15px">PKR ${parseFloat(form.amount).toLocaleString()}</span></div><div class="row"><span class="label">Transaction ID</span><span class="value">${txRef}</span></div><div class="row"><span class="label">Date and Time</span><span class="value">${txDate}</span></div><div class="row"><span class="label">Status</span><span class="value" style="color:#16A34A">Completed</span></div></div>
    <div class="footer"><p>Thank you for using PayEase</p><p>Keep this receipt for your records</p><p style="color:#1A73E8;font-weight:bold">payease.space</p></div></div></body></html>`;
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

  // ── SUCCESS ──
  if (success) return (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', padding: '40px 24px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <motion.div
          initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '3px solid rgba(255,255,255,0.4)' }}
        >
          <CheckCircle size={40} color="#fff" />
        </motion.div>
        <motion.h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px 0' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          Payment Successful
        </motion.h2>
        <motion.p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: '0 0 16px 0' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          {selectedProvider} bill paid
        </motion.p>
        <motion.div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '8px 24px' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}>
          <span style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>PKR {parseFloat(form.amount).toLocaleString()}</span>
        </motion.div>
      </div>

      <div style={{ padding: '16px' }}>
        <motion.div style={{ background: colors.card, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${colors.border}`, marginBottom: '14px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={{ padding: '16px 20px', background: colors.actionBg, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: cat?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{cat?.icon}</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: colors.text, fontSize: '15px', fontWeight: 'bold', margin: '0 0 2px 0' }}>{selectedProvider}</p>
              <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>{cat?.label} Bill Payment</p>
            </div>
            <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: '20px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={12} color="#16A34A" />
              <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: '700' }}>Paid</span>
            </div>
          </div>
          <div style={{ padding: '4px 20px' }}>
            {[
              { label: 'Reference No.',  value: form.reference },
              { label: 'Amount Paid',    value: `PKR ${parseFloat(form.amount).toLocaleString()}`, color: '#1A73E8', bold: true },
              { label: 'Transaction ID', value: txRef },
              { label: 'Date and Time',  value: txDate },
              { label: 'Status',         value: 'Completed', color: '#16A34A' },
            ].map((row, i, arr) => (
              <motion.div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none' }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}>
                <span style={{ color: colors.textSecondary, fontSize: '13px' }}>{row.label}</span>
                <span style={{ color: row.color || colors.text, fontWeight: row.bold ? '700' : '600', fontSize: row.bold ? '15px' : '13px' }}>{row.value}</span>
              </motion.div>
            ))}
          </div>
          <div style={{ display: 'flex', borderTop: `1px solid ${colors.border}` }}>
            <motion.button style={{ flex: 1, padding: '14px', background: colors.actionBg, color: colors.text, border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRight: `1px solid ${colors.border}` }} whileTap={{ scale: 0.97 }} onClick={handlePrint}>
              <Printer size={15} color={colors.text} /> Print Receipt
            </motion.button>
            <motion.button style={{ flex: 1, padding: '14px', background: colors.actionBg, color: '#1A73E8', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} whileTap={{ scale: 0.97 }} onClick={handleShare}>
              <Share2 size={15} color="#1A73E8" /> Share
            </motion.button>
          </div>
        </motion.div>

        <motion.button style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 6px 20px rgba(26,115,232,0.3)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/dashboard')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          Back to Dashboard
        </motion.button>
        <motion.button style={{ width: '100%', padding: '14px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '14px', fontSize: '14px', cursor: 'pointer' }} whileTap={{ scale: 0.97 }}
          onClick={() => { setSuccess(false); setStep(1); setForm({ amount: '', reference: '', pin: '' }); setPin(''); setSelectedCategory(null); setSelectedProvider(null); }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          Pay Another Bill
        </motion.button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: colors.card, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <motion.div style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${colors.border}` }} whileTap={{ scale: 0.9 }}
          onClick={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)}>
          <ArrowLeft size={22} color={colors.text} />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Pay Bills</h2>
          <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>
            {step === 1 ? 'Select category' : step === 2 ? 'Select provider' : 'Enter details'}
          </p>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Step Progress */}
      <div style={{ display: 'flex', padding: '14px 20px', gap: '6px', background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
        {['Category', 'Provider', 'Payment'].map((label, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: step > i + 1 ? '#16A34A' : step === i + 1 ? '#1A73E8' : colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {step > i + 1 ? <CheckCircle size={12} color="#fff" /> : <span style={{ color: step >= i + 1 ? '#fff' : colors.textSecondary, fontSize: '10px', fontWeight: '700' }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: '11px', fontWeight: step === i + 1 ? '600' : '400', color: step >= i + 1 ? colors.text : colors.textSecondary }}>{label}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: '1.5px', background: step > i + 1 ? '#16A34A' : colors.border, alignSelf: 'center', transition: 'background 0.3s' }} />}
          </React.Fragment>
        ))}
      </div>

      <div style={{ padding: '16px' }}>
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Category ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p style={{ color: colors.textSecondary, fontSize: '13px', margin: '0 0 16px 4px', fontWeight: '500' }}>
                What type of bill would you like to pay?
              </p>
              {Object.keys(providers).map((category, i) => {
                const c = categories[category] || { icon: <Zap size={22} color="#888" />, bg: 'rgba(136,136,136,0.1)', color: '#888', label: category, desc: '' };
                return (
                  <motion.div
                    key={category}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: colors.card, borderRadius: '16px', marginBottom: '10px', cursor: 'pointer', border: `1px solid ${colors.border}` }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    onClick={() => { setSelectedCategory(category); setStep(2); }}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.icon}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: colors.text, fontSize: '15px', fontWeight: '600', margin: '0 0 3px 0' }}>{c.label}</p>
                      <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>{c.desc} · {providers[category].length} providers</p>
                    </div>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronRight size={16} color={colors.textSecondary} />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ── STEP 2: Provider ── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: colors.card, borderRadius: '14px', marginBottom: '16px', border: `1px solid ${colors.border}` }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: cat?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cat?.icon}</div>
                <div>
                  <p style={{ color: colors.text, fontSize: '14px', fontWeight: '600', margin: 0 }}>{cat?.label}</p>
                  <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>Select your provider</p>
                </div>
              </div>
              {(providers[selectedCategory] || []).map((provider, i) => (
                <motion.div
                  key={provider}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: colors.card, borderRadius: '16px', marginBottom: '10px', cursor: 'pointer', border: `1px solid ${colors.border}` }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  onClick={() => { setSelectedProvider(provider); setStep(3); }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: cat?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: cat?.color, fontSize: '20px', fontWeight: 'bold' }}>{provider.charAt(0)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: colors.text, fontSize: '15px', fontWeight: '600', margin: '0 0 3px 0' }}>{provider}</p>
                    <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>{cat?.label} Provider</p>
                  </div>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={16} color={colors.textSecondary} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── STEP 3: Payment ── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Provider Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: colors.card, borderRadius: '16px', marginBottom: '16px', border: `1px solid ${colors.border}` }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: cat?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: cat?.color, fontSize: '22px', fontWeight: 'bold' }}>{selectedProvider?.charAt(0)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', margin: '0 0 3px 0' }}>{selectedProvider}</p>
                  <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>{cat?.label} Bill Payment</p>
                </div>
                <div style={{ background: cat?.bg, borderRadius: '10px', padding: '6px 12px' }}>
                  <span style={{ color: cat?.color, fontSize: '12px', fontWeight: '700' }}>{cat?.label}</span>
                </div>
              </div>

              {/* Form */}
              <div style={{ background: colors.card, borderRadius: '16px', padding: '20px', border: `1px solid ${colors.border}`, marginBottom: '14px' }}>
                <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Payment Details</h3>

                <div style={{ marginBottom: '14px' }}>
                  <p style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reference / Account No.</p>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${focusedField === 'ref' || form.reference ? '#1A73E8' : colors.border}`, borderRadius: '12px', padding: '0 14px', background: colors.inputBg, transition: 'all 0.2s', boxShadow: focusedField === 'ref' ? '0 0 0 3px rgba(26,115,232,0.08)' : 'none' }}>
                    <FileText size={16} color={form.reference ? '#1A73E8' : colors.textSecondary} style={{ marginRight: '10px', flexShrink: 0 }} />
                    <input
                      style={{ flex: 1, padding: '13px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none' }}
                      placeholder="e.g. 1234567890" value={form.reference}
                      onChange={(e) => setForm({ ...form, reference: e.target.value })}
                      onFocus={() => setFocusedField('ref')} onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <p style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount (PKR)</p>
                  <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${focusedField === 'amt' || form.amount ? '#1A73E8' : colors.border}`, borderRadius: '12px', padding: '0 14px', background: colors.inputBg, transition: 'all 0.2s', boxShadow: focusedField === 'amt' ? '0 0 0 3px rgba(26,115,232,0.08)' : 'none' }}>
                    <span style={{ color: colors.textSecondary, fontWeight: '600', marginRight: '8px', fontSize: '16px' }}>PKR</span>
                    <input
                      style={{ flex: 1, padding: '14px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '22px', fontWeight: 'bold', outline: 'none' }}
                      type="number" placeholder="0" value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      onFocus={() => setFocusedField('amt')} onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>
              </div>

              {/* PIN */}
              <div style={{ background: colors.card, borderRadius: '16px', padding: '20px', border: `1px solid ${colors.border}`, marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={18} color="#1A73E8" />
                  </div>
                  <div>
                    <p style={{ color: colors.text, fontSize: '14px', fontWeight: '600', margin: 0 }}>Security PIN</p>
                    <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>Enter your 4-digit PIN to confirm</p>
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'text', zIndex: 1 }}
                    type="tel" inputMode="numeric" maxLength={4}
                    value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', padding: '16px', border: `2px solid ${pin.length === 4 ? '#1A73E8' : colors.border}`, borderRadius: '14px', background: colors.inputBg, transition: 'all 0.2s', boxShadow: pin.length === 4 ? '0 0 0 3px rgba(26,115,232,0.08)' : 'none' }}>
                    {[0, 1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        style={{ width: '52px', height: '52px', borderRadius: '14px', border: `2px solid ${i < pin.length ? '#1A73E8' : colors.border}`, background: i < pin.length ? 'rgba(26,115,232,0.1)' : colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', boxShadow: i < pin.length ? '0 4px 12px rgba(26,115,232,0.2)' : 'none' }}
                        animate={{ scale: i === pin.length - 1 ? [1, 1.12, 1] : 1 }}
                        transition={{ duration: 0.15 }}
                      >
                        <motion.div
                          style={{ width: '14px', height: '14px', borderRadius: '50%', background: i < pin.length ? '#1A73E8' : colors.textSecondary }}
                          animate={{ scale: i < pin.length ? 1 : 0.3, opacity: i < pin.length ? 1 : 0.4 }}
                          transition={{ duration: 0.15 }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                  <AlertCircle size={16} color="#DC2626" />
                  <span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span>
                </motion.div>
              )}

              <motion.button
                style={{ width: '100%', padding: '15px', background: form.reference && form.amount && pin.length === 4 ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : colors.actionBg, color: form.reference && form.amount && pin.length === 4 ? '#fff' : colors.textSecondary, border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: form.reference && form.amount && pin.length === 4 ? '0 6px 20px rgba(26,115,232,0.3)' : 'none', transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                whileTap={{ scale: 0.97 }} onClick={handlePay} disabled={loading}
              >
                {loading
                  ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>Processing...</motion.span>
                  : <><Lock size={16} color={form.reference && form.amount && pin.length === 4 ? '#fff' : colors.textSecondary} /> Pay PKR {form.amount ? parseFloat(form.amount).toLocaleString() : '0'}</>
                }
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}