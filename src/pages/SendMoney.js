import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { accountService, preferencesService, generateIdempotencyKey } from '../services/api';
import {
  ArrowLeft, Send, User, Phone, CreditCard,
  CheckCircle, AlertCircle, Eye, EyeOff,
  RefreshCw, Shield, Star, ChevronRight,
  Wallet, UserCheck, X, Plus, Search,
  ArrowDownLeft
} from 'lucide-react';

const PinInput = ({ value, onChange, isDark, text }) => (
  <div style={{ position: 'relative' }}>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '16px', border: `2px solid ${value.length === 4 ? '#1A73E8' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', background: 'rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
      {[0,1,2,3].map(i => (
        <motion.div key={i} style={{ width: '44px', height: '44px', borderRadius: '13px', border: `2px solid ${i < value.length ? '#1A73E8' : 'rgba(255,255,255,0.15)'}`, background: i < value.length ? 'rgba(26,115,232,0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} animate={{ scale: i === value.length - 1 ? [1, 1.12, 1] : 1 }} transition={{ duration: 0.15 }}>
          <motion.div style={{ width: '10px', height: '10px', borderRadius: '50%', background: i < value.length ? '#1A73E8' : 'rgba(255,255,255,0.2)' }} animate={{ scale: i < value.length ? 1 : 0.4 }} />
        </motion.div>
      ))}
    </div>
    <input style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'text', zIndex: 1 }} type="tel" inputMode="numeric" maxLength={4} value={value} onChange={(e) => onChange(e.target.value.slice(0, 4).replace(/\D/g, ''))} autoFocus />
  </div>
);

export default function SendMoney() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate   = useNavigate();

  const [step,          setStep]          = useState(1); // 1=lookup, 2=amount, 3=pin, 4=done
  const [lookupTab,     setLookupTab]     = useState('wallet'); // wallet | phone | beneficiary
  const [walletNumber,  setWalletNumber]  = useState('');
  const [phoneNumber,   setPhoneNumber]   = useState('');
  const [amount,        setAmount]        = useState('');
  const [description,   setDescription]  = useState('');
  const [pin,           setPin]           = useState('');
  const [recipient,     setRecipient]     = useState(null);
  const [senderInfo,    setSenderInfo]    = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [result,        setResult]        = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [savingBen,     setSavingBen]     = useState(false);
  const [savedBen,      setSavedBen]      = useState(false);
  const [benSearch,     setBenSearch]     = useState('');

  const bg       = '#0A0F1E';
  const card     = 'rgba(255,255,255,0.04)';
  const border   = 'rgba(255,255,255,0.08)';
  const text      = '#F0F6FC';
  const textSec  = 'rgba(255,255,255,0.45)';

  useEffect(() => {
    loadBeneficiaries();
    accountService.getBalance().then(r => setSenderInfo(r.data)).catch(() => {});
  }, []);

  const loadBeneficiaries = async () => {
    try {
      const res = await preferencesService.getBeneficiaries();
      setBeneficiaries(res.data.beneficiaries || []);
    } catch (e) {}
  };

  // ── Lookup by wallet ──
  const lookupWalletByNumber = async (wNumber) => {
    const num = (wNumber || walletNumber).trim().toUpperCase();
    if (!num) { setError('Please enter a wallet number'); return; }
    setLoading(true); setError('');
    try {
      const res    = await accountService.lookupWallet(num);
      const balRes = await accountService.getBalance();
      setRecipient(res.data);
      setSenderInfo(balRes.data);
      setWalletNumber(res.data.wallet_number);
      // Check if already a beneficiary
      const isSaved = beneficiaries.some(b => b.wallet_number === res.data.wallet_number);
      setSavedBen(isSaved);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Wallet not found');
    }
    setLoading(false);
  };

  // ── Lookup by phone ──
  const lookupByPhone = async () => {
    if (!phoneNumber.trim()) { setError('Please enter a phone number'); return; }
    setLoading(true); setError('');
    try {
      const res    = await accountService.lookupPhone(phoneNumber);
      const balRes = await accountService.getBalance();
      setRecipient(res.data);
      setSenderInfo(balRes.data);
      setWalletNumber(res.data.wallet_number);
      const isSaved = beneficiaries.some(b => b.wallet_number === res.data.wallet_number);
      setSavedBen(isSaved);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'No account found with this phone number');
    }
    setLoading(false);
  };

  // ── Select from beneficiaries ──
  const selectBeneficiary = (ben) => {
    setRecipient({ full_name: ben.full_name, wallet_number: ben.wallet_number, phone: ben.phone, avatar_url: ben.avatar_url });
    setWalletNumber(ben.wallet_number);
    setSavedBen(true);
    setStep(2);
  };

  // ── Save as beneficiary ──
  const saveAsBeneficiary = async () => {
    if (!recipient || savedBen) return;
    setSavingBen(true);
    try {
      await preferencesService.saveBeneficiary({
        wallet_number: recipient.wallet_number,
        full_name:     recipient.full_name,
        phone:         recipient.phone     || '',
        avatar_url:    recipient.avatar_url || '',
      });
      setSavedBen(true);
      setBeneficiaries(prev => [...prev, { wallet_number: recipient.wallet_number, full_name: recipient.full_name, avatar_url: recipient.avatar_url }]);
    } catch (e) {}
    setSavingBen(false);
  };

  // ── Send money ──
  const handleSend = async () => {
    if (!pin || pin.length !== 4) { setError('Enter your 4-digit PIN'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0)         { setError('Invalid amount'); return; }
    if (amt > 50000)              { setError('Maximum transfer is PKR 50,000'); return; }
    setLoading(true); setError('');
    try {
      const res = await accountService.send({
        to_wallet:       recipient.wallet_number,
        amount:          amt,
        pin,
        description:     description || 'Transfer',
        idempotency_key: generateIdempotencyKey(),
      });
      setResult(res.data);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed');
    }
    setLoading(false);
  };

  const filteredBeneficiaries = beneficiaries.filter(b =>
    b.full_name?.toLowerCase().includes(benSearch.toLowerCase()) ||
    b.wallet_number?.toLowerCase().includes(benSearch.toLowerCase()) ||
    b.phone?.includes(benSearch)
  );

  const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

  // ── Avatar helper ──
  const Avatar = ({ src, name, size = 44, fontSize = 18 }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.15)' }}>
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ color: '#fff', fontSize, fontWeight: '800' }}>{name?.charAt(0)?.toUpperCase() || '?'}</span>
      }
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: bg, maxWidth: '480px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', color: text }}>

      {/* ── HEADER ── */}
      <div style={{ background: 'linear-gradient(160deg,#1A1FEF 0%,#1A73E8 50%,#7C3AED 100%)', padding: '48px 20px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
          <motion.div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)' }} whileTap={{ scale: 0.88 }} onClick={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)}>
            <ArrowLeft size={18} color="#fff" />
          </motion.div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '20px', padding: '6px 14px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>
              {step === 1 ? 'Find Recipient' : step === 2 ? 'Set Amount' : step === 3 ? 'Confirm PIN' : 'Transfer Done'}
            </span>
          </div>
          <div style={{ width: '38px' }} />
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', zIndex: 1 }}>
          {[1,2,3,4].map((s, i) => (
            <React.Fragment key={s}>
              <motion.div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step > s ? 'rgba(74,222,128,0.3)' : step === s ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: step === s ? '2px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.15)' }} animate={{ scale: step === s ? 1.1 : 1 }}>
                {step > s ? <CheckCircle size={13} color="#4ADE80" /> : <span style={{ color: '#fff', fontSize: '10px', fontWeight: '800', opacity: step >= s ? 1 : 0.4 }}>{s}</span>}
              </motion.div>
              {i < 3 && <div style={{ flex: 1, height: '2px', borderRadius: '1px', background: step > s ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.15)', transition: 'background 0.3s' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Find Recipient ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

              {/* Lookup tabs */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: card, borderRadius: '14px', padding: '5px', border: `1px solid ${border}` }}>
                {[
                  { id: 'wallet',      label: 'Wallet ID', icon: <Wallet size={13} /> },
                  { id: 'phone',       label: 'Phone',     icon: <Phone size={13} /> },
                  { id: 'beneficiary', label: 'Saved',     icon: <Star size={13} /> },
                ].map(tab => (
                  <motion.button key={tab.id}
                    style={{ flex: 1, padding: '9px 4px', background: lookupTab === tab.id ? 'linear-gradient(135deg,#1A73E8,#7C3AED)' : 'transparent', border: 'none', borderRadius: '10px', color: lookupTab === tab.id ? '#fff' : textSec, fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'all 0.2s', boxShadow: lookupTab === tab.id ? '0 4px 12px rgba(26,115,232,0.35)' : 'none' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setLookupTab(tab.id); setError(''); }}
                  >
                    {tab.icon}{tab.label}
                  </motion.button>
                ))}
              </div>

              {/* Wallet lookup */}
              {lookupTab === 'wallet' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{ background: card, borderRadius: '18px', padding: '18px', border: `1px solid ${border}`, marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#1A73E8,#0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Wallet size={18} color="#fff" /></div>
                      <div><p style={{ color: text, fontSize: '14px', fontWeight: '700', margin: 0 }}>Wallet ID Lookup</p><p style={{ color: textSec, fontSize: '11px', margin: 0 }}>Enter recipient's PayEase wallet ID</p></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${walletNumber ? '#1A73E8' : border}`, borderRadius: '14px', padding: '0 14px', background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s', marginBottom: '12px' }}>
                      <Wallet size={15} color={walletNumber ? '#1A73E8' : textSec} style={{ flexShrink: 0, marginRight: '10px' }} />
                      <input
                        style={{ flex: 1, padding: '14px 0', border: 'none', background: 'transparent', color: text, fontSize: '14px', outline: 'none', fontFamily: 'monospace', letterSpacing: '1px' }}
                        placeholder="PK••••••••••"
                        value={walletNumber}
                        onChange={(e) => setWalletNumber(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && lookupWalletByNumber(walletNumber)}
                        autoFocus
                      />
                      {walletNumber && <motion.div whileTap={{ scale: 0.9 }} onClick={() => setWalletNumber('')} style={{ cursor: 'pointer', padding: '4px' }}><X size={14} color={textSec} /></motion.div>}
                    </div>
                    <motion.button
                      style={{ width: '100%', padding: '14px', background: walletNumber.length >= 6 ? 'linear-gradient(135deg,#1A73E8,#0052CC)' : 'rgba(255,255,255,0.05)', color: walletNumber.length >= 6 ? '#fff' : textSec, border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => lookupWalletByNumber(walletNumber)}
                      disabled={loading}
                    >
                      {loading ? <><RefreshCw size={14} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> Searching...</> : <><Search size={14} /> Find Recipient</>}
                    </motion.button>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  </div>
                </motion.div>
              )}

              {/* Phone lookup */}
              {lookupTab === 'phone' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{ background: card, borderRadius: '18px', padding: '18px', border: `1px solid ${border}`, marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Phone size={18} color="#fff" /></div>
                      <div><p style={{ color: text, fontSize: '14px', fontWeight: '700', margin: 0 }}>Phone Lookup</p><p style={{ color: textSec, fontSize: '11px', margin: 0 }}>Find by registered phone number</p></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${phoneNumber ? '#7C3AED' : border}`, borderRadius: '14px', padding: '0 14px', background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s', marginBottom: '12px' }}>
                      <Phone size={15} color={phoneNumber ? '#7C3AED' : textSec} style={{ flexShrink: 0, marginRight: '10px' }} />
                      <input
                        style={{ flex: 1, padding: '14px 0', border: 'none', background: 'transparent', color: text, fontSize: '14px', outline: 'none' }}
                        placeholder="03001234567"
                        value={phoneNumber}
                        inputMode="tel"
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        onKeyPress={(e) => e.key === 'Enter' && lookupByPhone()}
                        autoFocus
                      />
                      {phoneNumber && <motion.div whileTap={{ scale: 0.9 }} onClick={() => setPhoneNumber('')} style={{ cursor: 'pointer', padding: '4px' }}><X size={14} color={textSec} /></motion.div>}
                    </div>
                    <motion.button
                      style={{ width: '100%', padding: '14px', background: phoneNumber.length >= 10 ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'rgba(255,255,255,0.05)', color: phoneNumber.length >= 10 ? '#fff' : textSec, border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={lookupByPhone}
                      disabled={loading}
                    >
                      {loading ? <><RefreshCw size={14} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> Searching...</> : <><Search size={14} /> Find Recipient</>}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Beneficiary list */}
              {lookupTab === 'beneficiary' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {beneficiaries.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: card, borderRadius: '18px', border: `1px solid ${border}` }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Star size={26} color={textSec} /></div>
                      <p style={{ color: text, fontSize: '15px', fontWeight: '700', margin: '0 0 6px 0' }}>No saved recipients</p>
                      <p style={{ color: textSec, fontSize: '12px', margin: 0 }}>Send money once and save them for quick access next time</p>
                    </div>
                  ) : (
                    <div style={{ background: card, borderRadius: '18px', border: `1px solid ${border}`, overflow: 'hidden' }}>
                      <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${border}` }}>
                        <Search size={14} color={textSec} />
                        <input style={{ flex: 1, border: 'none', background: 'transparent', color: text, fontSize: '13px', outline: 'none' }} placeholder="Search beneficiaries..." value={benSearch} onChange={(e) => setBenSearch(e.target.value)} autoFocus />
                      </div>
                      {filteredBeneficiaries.map((ben, i) => (
                        <motion.div key={ben.id || i}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderBottom: i < filteredBeneficiaries.length - 1 ? `1px solid ${border}` : 'none', cursor: 'pointer' }}
                          whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => selectBeneficiary(ben)}
                        >
                          <Avatar src={ben.avatar_url} name={ben.full_name} size={46} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: text, fontSize: '14px', fontWeight: '700', margin: '0 0 3px 0' }}>{ben.nickname || ben.full_name}</p>
                            <p style={{ color: textSec, fontSize: '11px', margin: 0, fontFamily: 'monospace' }}>{ben.wallet_number}</p>
                          </div>
                          <ChevronRight size={15} color={textSec} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {error && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '12px 14px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle size={13} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span></motion.div>}
            </motion.div>
          )}

          {/* ── STEP 2: Amount ── */}
          {step === 2 && recipient && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

              {/* Recipient card — shows avatar */}
              <div style={{ background: card, borderRadius: '18px', padding: '16px', border: `1px solid ${border}`, marginBottom: '14px' }}>
                <p style={{ color: textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 12px 0' }}>Sending To</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Avatar src={recipient.avatar_url} name={recipient.full_name} size={56} fontSize={22} />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: text, fontSize: '17px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>{recipient.full_name}</p>
                    <p style={{ color: textSec, fontSize: '11px', margin: '0 0 6px 0', fontFamily: 'monospace' }}>{recipient.wallet_number}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {recipient.kyc_verified && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(22,163,74,0.1)', borderRadius: '20px', padding: '3px 8px' }}>
                          <Shield size={10} color="#16A34A" />
                          <span style={{ color: '#16A34A', fontSize: '10px', fontWeight: '700' }}>KYC Verified</span>
                        </div>
                      )}
                      {/* Save as beneficiary button */}
                      {!savedBen ? (
                        <motion.div
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(202,138,4,0.1)', borderRadius: '20px', padding: '3px 10px', cursor: 'pointer', border: '1px solid rgba(202,138,4,0.2)' }}
                          whileTap={{ scale: 0.93 }}
                          onClick={saveAsBeneficiary}
                        >
                          {savingBen
                            ? <RefreshCw size={10} color="#CA8A04" style={{ animation: 'spin 1s linear infinite' }} />
                            : <Plus size={10} color="#CA8A04" />
                          }
                          <span style={{ color: '#CA8A04', fontSize: '10px', fontWeight: '700' }}>Save recipient</span>
                        </motion.div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(26,115,232,0.1)', borderRadius: '20px', padding: '3px 8px' }}>
                          <Star size={10} color="#1A73E8" />
                          <span style={{ color: '#1A73E8', fontSize: '10px', fontWeight: '700' }}>Saved</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Your balance */}
              {senderInfo && (
                <div style={{ background: 'rgba(26,115,232,0.06)', borderRadius: '12px', padding: '10px 14px', border: '1px solid rgba(26,115,232,0.15)', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: textSec, fontSize: '12px' }}>Your balance</span>
                  <span style={{ color: '#1A73E8', fontSize: '14px', fontWeight: '800' }}>PKR {Number(senderInfo.balance).toLocaleString()}</span>
                </div>
              )}

              {/* Amount input */}
              <div style={{ background: card, borderRadius: '18px', padding: '18px', border: `1px solid ${border}`, marginBottom: '12px' }}>
                <p style={{ color: textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px 0' }}>Amount</p>
                <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${amount ? '#1A73E8' : border}`, borderRadius: '14px', padding: '0 16px', background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s', marginBottom: '12px', boxShadow: amount ? '0 0 0 4px rgba(26,115,232,0.1)' : 'none' }}>
                  <span style={{ color: textSec, fontSize: '18px', fontWeight: '600', marginRight: '10px', flexShrink: 0 }}>PKR</span>
                  <input
                    style={{ flex: 1, padding: '18px 0', border: 'none', background: 'transparent', color: text, fontSize: '28px', fontWeight: '800', outline: 'none', letterSpacing: '-1px', width: '100%' }}
                    type="number" inputMode="decimal" placeholder="0" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus min="1" max="50000"
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {QUICK_AMOUNTS.map(amt => (
                    <motion.button key={amt}
                      style={{ flex: 1, padding: '9px 4px', background: Number(amount) === amt ? 'linear-gradient(135deg,#1A73E8,#0052CC)' : 'rgba(255,255,255,0.05)', color: Number(amount) === amt ? '#fff' : textSec, border: `1px solid ${Number(amount) === amt ? 'transparent' : border}`, borderRadius: '10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setAmount(String(amt))}
                    >
                      {amt >= 1000 ? `${amt/1000}K` : amt}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div style={{ background: card, borderRadius: '14px', padding: '12px 14px', border: `1px solid ${border}`, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={15} color={textSec} style={{ flexShrink: 0 }} />
                <input style={{ flex: 1, border: 'none', background: 'transparent', color: text, fontSize: '13px', outline: 'none' }} placeholder="Add a note (optional)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={100} />
              </div>

              {error && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle size={13} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span></motion.div>}

              <motion.button
                style={{ width: '100%', padding: '16px', background: amount && parseFloat(amount) > 0 ? 'linear-gradient(135deg,#1A73E8,#7C3AED)' : 'rgba(255,255,255,0.06)', color: amount && parseFloat(amount) > 0 ? '#fff' : textSec, border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: amount && parseFloat(amount) > 0 ? '0 8px 28px rgba(26,115,232,0.4)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const a = parseFloat(amount);
                  if (!a || a <= 0)  { setError('Enter a valid amount'); return; }
                  if (a > 50000)     { setError('Maximum transfer is PKR 50,000'); return; }
                  if (!senderInfo || a > Number(senderInfo.balance)) { setError('Insufficient balance'); return; }
                  setError(''); setStep(3);
                }}
              >
                <Send size={16} /> Continue to Confirm
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP 3: PIN ── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

              {/* Summary */}
              <div style={{ background: 'linear-gradient(135deg,rgba(26,115,232,0.12),rgba(124,58,237,0.12))', borderRadius: '20px', padding: '20px', border: '1px solid rgba(26,115,232,0.2)', marginBottom: '20px', textAlign: 'center' }}>
                <Avatar src={recipient?.avatar_url} name={recipient?.full_name} size={64} fontSize={24} />
                <p style={{ color: text, fontSize: '22px', fontWeight: '800', margin: '12px 0 4px 0', letterSpacing: '-0.5px' }}>PKR {parseFloat(amount).toLocaleString()}</p>
                <p style={{ color: textSec, fontSize: '13px', margin: 0 }}>to <strong style={{ color: text }}>{recipient?.full_name}</strong></p>
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '4px 12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: textSec, fontSize: '11px', fontFamily: 'monospace' }}>{recipient?.wallet_number}</span>
                  </div>
                </div>
              </div>

              <div style={{ background: card, borderRadius: '18px', padding: '20px', border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={20} color="#fff" /></div>
                  <div><p style={{ color: text, fontSize: '15px', fontWeight: '700', margin: 0 }}>Enter your PIN</p><p style={{ color: textSec, fontSize: '12px', margin: 0 }}>Confirm this transaction</p></div>
                </div>
                <PinInput value={pin} onChange={setPin} isDark={isDark} text={text} />
              </div>

              {error && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '12px 14px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle size={13} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span></motion.div>}

              <motion.button
                style={{ width: '100%', padding: '16px', background: pin.length === 4 && !loading ? 'linear-gradient(135deg,#16A34A,#15803D)' : 'rgba(255,255,255,0.06)', color: pin.length === 4 && !loading ? '#fff' : textSec, border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: pin.length === 4 ? '0 8px 24px rgba(22,163,74,0.4)' : 'none' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSend}
                disabled={loading || pin.length !== 4}
              >
                {loading ? <><RefreshCw size={15} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : <><Send size={15} /> Send PKR {parseFloat(amount || 0).toLocaleString()}</>}
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP 4: Success ── */}
          {step === 4 && result && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
                <motion.div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg,#16A34A,#15803D)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 16px 48px rgba(22,163,74,0.4)' }} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
                  <CheckCircle size={40} color="#fff" />
                </motion.div>
                <motion.p style={{ color: text, fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.5px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  PKR {Number(result.amount || amount).toLocaleString()} Sent!
                </motion.p>
                <motion.p style={{ color: textSec, fontSize: '14px', margin: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  to <strong style={{ color: text }}>{recipient?.full_name}</strong>
                </motion.p>
              </div>

              {/* Recipient avatar in success */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <Avatar src={recipient?.avatar_url} name={recipient?.full_name} size={72} fontSize={28} />
              </div>

              <div style={{ background: card, borderRadius: '18px', overflow: 'hidden', border: `1px solid ${border}`, marginBottom: '16px' }}>
                {[
                  { label: 'Recipient',    value: recipient?.full_name },
                  { label: 'Wallet',       value: recipient?.wallet_number },
                  { label: 'Amount',       value: `PKR ${Number(result.amount || amount).toLocaleString()}` },
                  { label: 'New Balance',  value: `PKR ${Number(result.new_balance).toLocaleString()}` },
                  { label: 'Status',       value: 'Completed', color: '#16A34A' },
                ].map((row, i, arr) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}>
                    <span style={{ color: textSec, fontSize: '12px' }}>{row.label}</span>
                    <span style={{ color: row.color || text, fontSize: '13px', fontWeight: '700', maxWidth: '55%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.button style={{ flex: 1, padding: '14px', background: card, color: textSec, border: `1.5px solid ${border}`, borderRadius: '14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }} whileTap={{ scale: 0.97 }} onClick={() => { setStep(1); setRecipient(null); setAmount(''); setPin(''); setResult(null); setWalletNumber(''); setPhoneNumber(''); setSavedBen(false); }}>Send Again</motion.button>
                <motion.button style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,115,232,0.4)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/dashboard')}>Back to Dashboard</motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}