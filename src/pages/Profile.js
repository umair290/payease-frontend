import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { accountService, preferencesService } from '../services/api';
import api from '../services/api';
import {
  ArrowLeft, User, Shield, Bell, Moon, Sun,
  ChevronRight, LogOut, Key, CreditCard,
  HelpCircle, FileText, Copy, CheckCircle,
  Lock, Mail, Eye, EyeOff, RefreshCw, AlertCircle,
  Phone, Calendar, CreditCard as IdCard,
  BarChart2, Smartphone, AlertTriangle,
  Camera, ClipboardList, Wallet, Settings,
  TrendingUp, Star
} from 'lucide-react';

const Modal = ({ show, onClose, children, isDark }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px', boxSizing: 'border-box', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={onClose} />
        <motion.div
          style={{ background: isDark ? '#0F1629' : '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '360px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.4)', maxHeight: '92vh', overflowY: 'auto', position: 'relative', zIndex: 1 }}
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const OtpInput = ({ value, onChange, isDark }) => (
  <div style={{ position: 'relative', marginBottom: '4px' }}>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px', border: `2px solid ${value.length === 6 ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '16px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', transition: 'all 0.2s', boxShadow: value.length === 6 ? '0 0 0 4px rgba(26,115,232,0.1)' : 'none' }}>
      {[0,1,2,3,4,5].map(i => (
        <motion.div key={i}
          style={{ width: '34px', height: '42px', borderRadius: '10px', border: `2px solid ${i < value.length ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.15)' : '#CBD5E1'}`, background: i < value.length ? 'rgba(26,115,232,0.12)' : isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
          animate={{ scale: i === value.length - 1 ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.15 }}
        >
          <span style={{ color: '#1A73E8', fontSize: '18px', fontWeight: 'bold' }}>{value[i] ? '●' : ''}</span>
        </motion.div>
      ))}
    </div>
    <input style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'text', zIndex: 1 }} type="tel" inputMode="numeric" maxLength={6} value={value} onChange={(e) => onChange(e.target.value.slice(0, 6).replace(/\D/g, ''))} autoFocus />
  </div>
);

const PinInput = ({ value, onChange, label, isDark }) => (
  <div style={{ marginBottom: '4px' }}>
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '14px', border: `2px solid ${value.length === 4 ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '16px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', transition: 'all 0.2s', boxShadow: value.length === 4 ? '0 0 0 4px rgba(26,115,232,0.1)' : 'none' }}>
        {[0,1,2,3].map(i => (
          <motion.div key={i}
            style={{ width: '48px', height: '48px', borderRadius: '14px', border: `2px solid ${i < value.length ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.15)' : '#CBD5E1'}`, background: i < value.length ? 'rgba(26,115,232,0.12)' : isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: i < value.length ? '0 4px 12px rgba(26,115,232,0.2)' : 'none' }}
            animate={{ scale: i === value.length - 1 ? [1, 1.12, 1] : 1 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div style={{ width: '12px', height: '12px', borderRadius: '50%', background: i < value.length ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1' }} animate={{ scale: i < value.length ? 1 : 0.4, opacity: i < value.length ? 1 : 0.4 }} transition={{ duration: 0.15 }} />
          </motion.div>
        ))}
      </div>
      <input style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'text', zIndex: 1 }} type="tel" inputMode="numeric" maxLength={4} value={value} onChange={(e) => onChange(e.target.value.slice(0, 4).replace(/\D/g, ''))} />
    </div>
    {label && <p style={{ color: label.includes('✓') ? '#16A34A' : label.includes('✗') ? '#DC2626' : '#94A3B8', fontSize: '11px', textAlign: 'center', margin: '6px 0 0 0', fontWeight: '600' }}>{label}</p>}
  </div>
);

const StepHeader = ({ icon, title, subtitle, steps, currentStep, grad = 'linear-gradient(135deg,#1A73E8,#7C3AED)' }) => (
  <div style={{ background: grad, padding: '24px 20px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
    <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
    <motion.div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', border: '1px solid rgba(255,255,255,0.2)', position: 'relative', zIndex: 1 }} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, delay: 0.05 }}>
      {icon}
    </motion.div>
    <h3 style={{ color: '#fff', fontSize: '17px', fontWeight: '800', margin: '0 0 4px 0', position: 'relative', zIndex: 1, letterSpacing: '-0.3px' }}>{title}</h3>
    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', margin: '0 0 14px 0', position: 'relative', zIndex: 1 }}>{subtitle}</p>
    {steps > 1 && (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', position: 'relative', zIndex: 1 }}>
        {Array.from({ length: steps }).map((_, s) => (
          <motion.div key={s} style={{ height: '3px', borderRadius: '2px', background: currentStep > s ? '#fff' : 'rgba(255,255,255,0.25)' }} animate={{ width: currentStep === s + 1 ? '24px' : '10px' }} transition={{ duration: 0.3 }} />
        ))}
      </div>
    )}
  </div>
);

export default function Profile() {
  const { user, logout, updateAvatar, removeAvatar: removeAvatarFromContext, avatarUrl: contextAvatarUrl } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [balance,   setBalance]   = useState(null);
  const [kycInfo,   setKycInfo]   = useState(null);
  const [avatar,    setAvatar]    = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast,     setToast]     = useState({ msg: '', type: 'success' });
  const [copied,    setCopied]    = useState(false);

  const [showLogout,         setShowLogout]         = useState(false);
  const [showPersonalInfo,   setShowPersonalInfo]   = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangePin,      setShowChangePin]      = useState(false);
  const [showChangeRequest,  setShowChangeRequest]  = useState(false);

  // Change Password
  const [pwStep,          setPwStep]          = useState(1);
  const [pwOtp,           setPwOtp]           = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw,       setShowNewPw]       = useState(false);
  const [showConfirmPw,   setShowConfirmPw]   = useState(false);
  const [pwLoading,       setPwLoading]       = useState(false);
  const [pwError,         setPwError]         = useState('');
  const [pwEmail,         setPwEmail]         = useState('');
  const [pwCountdown,     setPwCountdown]     = useState(0);

  // Change PIN
  const [pinStep,      setPinStep]      = useState(1);
  const [pinOtp,       setPinOtp]       = useState('');
  const [newPin,       setNewPin]       = useState('');
  const [confirmPin,   setConfirmPin]   = useState('');
  const [pinLoading,   setPinLoading]   = useState(false);
  const [pinError,     setPinError]     = useState('');
  const [pinEmail,     setPinEmail]     = useState('');
  const [pinCountdown, setPinCountdown] = useState(0);

  // Change Request
  const [crStep,    setCrStep]    = useState(1);
  const [crField,   setCrField]   = useState('');
  const [crValue,   setCrValue]   = useState('');
  const [crReason,  setCrReason]  = useState('');
  const [crLoading, setCrLoading] = useState(false);
  const [crError,   setCrError]   = useState('');
  const [crSuccess, setCrSuccess] = useState(false);

  const CR_FIELDS = [
    { id: 'full_name',         label: 'Full Name',      icon: <User size={18} color="#1A73E8" />,    bg: 'rgba(26,115,232,0.12)',  placeholder: 'Enter correct full name',      desc: 'Correct a typo or spelling mistake' },
    { id: 'phone',             label: 'Phone Number',   icon: <Phone size={18} color="#16A34A" />,   bg: 'rgba(22,163,74,0.12)',   placeholder: 'e.g. 03001234567',             desc: 'Update your registered contact number' },
    { id: 'date_of_birth',     label: 'Date of Birth',  icon: <Calendar size={18} color="#F59E0B" />,bg: 'rgba(245,158,11,0.12)',  placeholder: 'e.g. 01-01-1995',              desc: 'Correct your registered date of birth' },
    { id: 'cnic_number',       label: 'CNIC Number',    icon: <IdCard size={18} color="#EA580C" />,  bg: 'rgba(234,88,12,0.12)',   placeholder: 'e.g. 12345-1234567-1',         desc: 'Correct your national identity number' },
    { id: 'full_name_on_card', label: 'Name on CNIC',   icon: <IdCard size={18} color="#7C3AED" />,  bg: 'rgba(124,58,237,0.12)', placeholder: 'Name exactly as on your CNIC', desc: 'Correct the name shown on your CNIC' },
  ];

  const selectedCrField = CR_FIELDS.find(f => f.id === crField);
  const resetCr = () => { setCrStep(1); setCrField(''); setCrValue(''); setCrReason(''); setCrError(''); setCrSuccess(false); };

  const submitChangeRequest = async () => {
    if (!crValue.trim())  { setCrError('Please enter the new value'); return; }
    if (!crReason.trim()) { setCrError('Please provide a reason'); return; }
    if (crReason.trim().length < 10) { setCrError('Please provide more detail (min 10 characters)'); return; }
    setCrLoading(true); setCrError('');
    try {
      await api.post('/api/admin/change-requests/submit', { field: crField, value: crValue.trim(), reason: crReason.trim() });
      setCrSuccess(true);
    } catch (err) { setCrError(err.response?.data?.error || 'Failed to submit request'); }
    setCrLoading(false);
  };

  useEffect(() => {
    if (pwCountdown  > 0) { const t = setTimeout(() => setPwCountdown(c  => c - 1), 1000); return () => clearTimeout(t); }
  }, [pwCountdown]);
  useEffect(() => {
    if (pinCountdown > 0) { const t = setTimeout(() => setPinCountdown(c => c - 1), 1000); return () => clearTimeout(t); }
  }, [pinCountdown]);

  // ── Load avatar: prefer context (cloud) over localStorage ──
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (contextAvatarUrl) {
      setAvatar(contextAvatarUrl);
    } else {
      const saved = localStorage.getItem('payease_avatar');
      if (saved) setAvatar(saved);
    }
  }, [contextAvatarUrl]);

  const loadData = async () => {
    try {
      const [balRes, kycRes] = await Promise.all([
        accountService.getBalance(),
        api.get('/api/kyc/status')
      ]);
      setBalance(balRes.data);
      setKycInfo(kycRes.data);
    } catch (err) { console.error(err); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  const copyWallet = () => {
    navigator.clipboard.writeText(balance?.wallet_number || '');
    setCopied(true);
    showToast('Wallet address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Avatar upload — Cloudinary via backend ──
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return; }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const res = await preferencesService.uploadAvatar(file);
      const url = res.data.avatar_url;
      setAvatar(url);
      updateAvatar(url);  // sync to AuthContext + localStorage
      showToast('Profile picture updated');
    } catch (err) {
      showToast(err.response?.data?.error || 'Upload failed', 'error');
      // Revert to previous
      const prev = contextAvatarUrl || localStorage.getItem('payease_avatar') || null;
      setAvatar(prev);
    }
    setUploading(false);
    // Reset file input
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── Avatar remove — Cloudinary via backend ──
  const handleRemoveAvatar = async () => {
    setAvatar(null);
    removeAvatarFromContext();
    try {
      await preferencesService.removeAvatar();
      showToast('Profile picture removed');
    } catch (err) {
      showToast('Failed to remove picture', 'error');
    }
  };

  const sendPasswordOtp = async () => {
    setPwLoading(true); setPwError('');
    try {
      const res = await api.post('/api/otp/send', { purpose: 'change_password' });
      setPwEmail(res.data.email); setPwStep(2); setPwCountdown(60);
    } catch (err) { setPwError(err.response?.data?.error || 'Failed to send code'); }
    setPwLoading(false);
  };

  const submitChangePassword = async () => {
    if (pwOtp.length !== 6)              { setPwError('Enter the 6-digit code'); return; }
    if (newPassword.length < 6)          { setPwError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match'); return; }
    setPwLoading(true); setPwError('');
    try {
      await api.post('/api/otp/change-password', { otp: pwOtp, new_password: newPassword });
      showToast('Password changed successfully');
      setShowChangePassword(false);
      setPwStep(1); setPwOtp(''); setNewPassword(''); setConfirmPassword(''); setPwEmail(''); setPwCountdown(0);
    } catch (err) { setPwError(err.response?.data?.error || 'Failed to change password'); }
    setPwLoading(false);
  };

  const sendPinOtp = async () => {
    setPinLoading(true); setPinError('');
    try {
      const res = await api.post('/api/otp/send', { purpose: 'change_pin' });
      setPinEmail(res.data.email); setPinStep(2); setPinCountdown(60);
    } catch (err) { setPinError(err.response?.data?.error || 'Failed to send code'); }
    setPinLoading(false);
  };

  const submitChangePin = async () => {
    if (pinOtp.length !== 6)   { setPinError('Enter the 6-digit code'); return; }
    if (newPin.length !== 4)   { setPinError('PIN must be 4 digits'); return; }
    if (newPin !== confirmPin) { setPinError('PINs do not match'); return; }
    setPinLoading(true); setPinError('');
    try {
      await api.post('/api/otp/change-pin', { otp: pinOtp, new_pin: newPin });
      showToast('PIN changed successfully');
      setShowChangePin(false);
      setPinStep(1); setPinOtp(''); setNewPin(''); setConfirmPin(''); setPinEmail(''); setPinCountdown(0);
    } catch (err) { setPinError(err.response?.data?.error || 'Failed to change PIN'); }
    setPinLoading(false);
  };

  const bg        = isDark ? '#0A0F1E' : '#F0F4FF';
  const card      = isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
  const cardSolid = isDark ? '#0F1629' : '#FFFFFF';
  const border    = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const text      = isDark ? '#F0F6FC' : '#0F172A';
  const textSec   = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8';

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: <User size={17} color="#fff" />,       grad: 'linear-gradient(135deg,#1A73E8,#0052CC)', label: 'Personal Information', sub: 'View your profile details',           action: () => setShowPersonalInfo(true) },
        { icon: <CreditCard size={17} color="#fff" />, grad: 'linear-gradient(135deg,#7C3AED,#5B21B6)', label: 'Virtual Card',          sub: 'Your PayEase card',                  action: () => navigate('/virtual-card') },
        { icon: <BarChart2 size={17} color="#fff" />,  grad: 'linear-gradient(135deg,#0891B2,#0E7490)', label: 'Spending Insights',     sub: 'Track your habits',                  action: () => navigate('/insights') },
        { icon: <FileText size={17} color="#fff" />,   grad: 'linear-gradient(135deg,#EA580C,#C2410C)', label: 'KYC Verification',      sub: kycInfo?.status === 'approved' ? 'Identity verified' : 'Verify your identity', action: () => navigate('/kyc') },
        { icon: copied ? <CheckCircle size={17} color="#fff" /> : <Copy size={17} color="#fff" />, grad: 'linear-gradient(135deg,#9C27B0,#7B1FA2)', label: 'Wallet Address', sub: balance?.wallet_number ? `${balance.wallet_number.slice(0,8)}...` : 'Tap to copy', action: copyWallet },
        { icon: <ClipboardList size={17} color="#fff" />, grad: 'linear-gradient(135deg,#CA8A04,#92400E)', label: 'Change Request', sub: 'Request account info changes', action: () => { resetCr(); setShowChangeRequest(true); }, badge: 'Admin Review' },
      ]
    },
    {
      title: 'Security',
      items: [
        { icon: <Key size={17} color="#fff" />,           grad: 'linear-gradient(135deg,#16A34A,#15803D)', label: 'Change Password',  sub: 'Update your password',           action: () => { setPwStep(1); setPwError(''); setShowChangePassword(true); } },
        { icon: <Shield size={17} color="#fff" />,        grad: 'linear-gradient(135deg,#1A73E8,#0052CC)', label: 'Change PIN',       sub: 'Update transaction PIN',         action: () => { setPinStep(1); setPinError(''); setShowChangePin(true); } },
        { icon: <Smartphone size={17} color="#fff" />,    grad: 'linear-gradient(135deg,#DC2626,#B91C1C)', label: 'Active Sessions',  sub: 'Manage logged-in devices',       action: () => showToast('Coming soon', 'error'), badge: 'Soon' },
        { icon: <AlertTriangle size={17} color="#fff" />, grad: 'linear-gradient(135deg,#CA8A04,#92400E)', label: 'Fraud Alerts',     sub: 'Security notifications',         action: () => navigate('/notifications') },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: isDark ? <Sun size={17} color="#fff" /> : <Moon size={17} color="#fff" />, grad: isDark ? 'linear-gradient(135deg,#CA8A04,#92400E)' : 'linear-gradient(135deg,#4F46E5,#3730A3)', label: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode', sub: isDark ? 'Currently dark theme' : 'Currently light theme', action: toggleTheme },
        { icon: <Bell size={17} color="#fff" />,      grad: 'linear-gradient(135deg,#DC2626,#B91C1C)', label: 'Notifications',    sub: 'Manage notifications',   action: () => navigate('/notifications') },
        { icon: <HelpCircle size={17} color="#fff" />, grad: 'linear-gradient(135deg,#64748B,#475569)', label: 'Help and Support', sub: 'FAQs and contact us',    action: () => navigate('/notifications') },
      ]
    },
  ];

  return (
    <div style={{ minHeight: '100vh', maxWidth: '480px', margin: '0 auto', background: bg, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast.msg && (
          <motion.div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? 'linear-gradient(135deg,#DC2626,#B91C1C)' : 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', padding: '12px 20px', borderRadius: '14px', zIndex: 9999, fontSize: '13px', fontWeight: '600', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
            initial={{ opacity: 0, y: -50, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
            <CheckCircle size={14} color="#fff" /> {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(160deg,#1A1FEF 0%,#1A73E8 50%,#7C3AED 100%)', padding: '60px 20px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />

        <motion.div style={{ position: 'absolute', top: '20px', left: '20px', width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', zIndex: 2 }} whileTap={{ scale: 0.88 }} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} color="#fff" />
        </motion.div>
        <motion.div style={{ position: 'absolute', top: '20px', right: '20px', width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', zIndex: 2 }} whileTap={{ scale: 0.88 }} onClick={toggleTheme}>
          {isDark ? <Sun size={16} color="#FCD34D" /> : <Moon size={16} color="#fff" />}
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(255,255,255,0.4),rgba(255,255,255,0.1))', zIndex: 0 }} />
            <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', zIndex: 1, border: '3px solid rgba(255,255,255,0.3)' }}>
              {avatar
                ? <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: '#fff', fontSize: '34px', fontWeight: '800' }}>{balance?.full_name?.charAt(0)?.toUpperCase() || user?.full_name?.charAt(0)?.toUpperCase()}</span>
              }
              {uploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <RefreshCw size={20} color="#fff" />
                  </motion.div>
                </div>
              )}
            </div>
            <motion.div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 2, border: '2px solid rgba(255,255,255,0.5)' }} whileTap={{ scale: 0.88 }} onClick={() => !uploading && fileRef.current?.click()}>
              <Camera size={13} color="#fff" />
            </motion.div>
          </div>

          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>{balance?.full_name || user?.full_name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: '0 0 12px 0' }}>{user?.email}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: kycInfo?.status === 'approved' ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)', border: `1px solid ${kycInfo?.status === 'approved' ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`, borderRadius: '20px', padding: '5px 12px' }}>
              <Shield size={11} color={kycInfo?.status === 'approved' ? '#4ADE80' : '#FBBF24'} />
              <span style={{ color: kycInfo?.status === 'approved' ? '#4ADE80' : '#FBBF24', fontSize: '11px', fontWeight: '700' }}>
                {kycInfo?.status === 'approved' ? 'KYC Verified' : 'KYC Pending'}
              </span>
            </div>
            {avatar && !uploading && (
              <motion.div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '5px 12px', cursor: 'pointer' }} whileTap={{ scale: 0.95 }} onClick={handleRemoveAvatar}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '600' }}>Remove photo</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── STATS CARD ── */}
      <div style={{ padding: '0 16px', marginTop: '-40px', position: 'relative', zIndex: 2 }}>
        <motion.div
          style={{ background: isDark ? 'rgba(15,22,41,0.95)' : '#FFFFFF', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '16px 20px', border: `1px solid ${border}`, boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)', display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr' }}
          initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          <div style={{ textAlign: 'center', padding: '4px 8px' }}>
            <p style={{ color: text, fontSize: '15px', fontWeight: '800', margin: '0 0 3px 0', letterSpacing: '-0.5px' }}>{Number(balance?.balance || 0).toLocaleString()}</p>
            <p style={{ color: textSec, fontSize: '10px', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>PKR Balance</p>
          </div>
          <div style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: '2px' }} />
          <motion.div style={{ textAlign: 'center', padding: '4px 8px', cursor: 'pointer' }} whileTap={{ scale: 0.95 }} onClick={copyWallet}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '3px' }}>
              <p style={{ color: text, fontSize: '12px', fontWeight: '700', margin: 0 }}>{balance?.wallet_number?.slice(0, 6)}...</p>
              {copied ? <CheckCircle size={11} color="#16A34A" /> : <Copy size={11} color="#94A3B8" />}
            </div>
            <p style={{ color: textSec, fontSize: '10px', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wallet ID</p>
          </motion.div>
          <div style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: '2px' }} />
          <div style={{ textAlign: 'center', padding: '4px 8px' }}>
            <p style={{ color: kycInfo?.status === 'approved' ? '#16A34A' : '#CA8A04', fontSize: '12px', fontWeight: '800', margin: '0 0 3px 0' }}>
              {kycInfo?.status === 'approved' ? 'Verified' : kycInfo?.status === 'pending' ? 'Pending' : 'None'}
            </p>
            <p style={{ color: textSec, fontSize: '10px', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>KYC Status</p>
          </div>
        </motion.div>
      </div>

      {/* ── MENU SECTIONS ── */}
      <div style={{ padding: '16px 16px 0' }}>
        {menuSections.map((section, si) => (
          <motion.div key={si} style={{ marginBottom: '16px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + si * 0.06 }}>
            <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px 4px', color: textSec }}>{section.title}</p>
            <div style={{ borderRadius: '18px', overflow: 'hidden', background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.05)' }}>
              {section.items.map((item, ii) => (
                <motion.div key={ii}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', cursor: 'pointer', borderBottom: ii < section.items.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` : 'none', transition: 'background 0.15s' }}
                  whileHover={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}
                  whileTap={{ scale: 0.99 }}
                  onClick={item.action}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '13px', background: item.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 2px 0', color: text }}>{item.label}</p>
                    <p style={{ fontSize: '11px', margin: 0, color: textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sub}</p>
                  </div>
                  {item.badge ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ background: item.badge === 'Soon' ? 'rgba(124,58,237,0.1)' : 'rgba(202,138,4,0.1)', borderRadius: '20px', padding: '3px 8px', border: `1px solid ${item.badge === 'Soon' ? 'rgba(124,58,237,0.2)' : 'rgba(202,138,4,0.2)'}` }}>
                        <span style={{ color: item.badge === 'Soon' ? '#7C3AED' : '#CA8A04', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.badge}</span>
                      </div>
                      <ChevronRight size={14} color={textSec} />
                    </div>
                  ) : (
                    <ChevronRight size={14} color={textSec} />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── LOGOUT BUTTON ── */}
      <motion.div style={{ padding: '4px 16px 48px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <motion.button
          style={{ width: '100%', padding: '15px', background: isDark ? 'rgba(220,38,38,0.08)' : 'rgba(220,38,38,0.05)', border: `1.5px solid ${isDark ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.15)'}`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
          whileTap={{ scale: 0.97 }} whileHover={{ background: 'rgba(220,38,38,0.1)' }}
          onClick={() => setShowLogout(true)}
        >
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#DC2626,#B91C1C)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(220,38,38,0.3)' }}>
            <LogOut size={15} color="#fff" />
          </div>
          <span style={{ color: '#DC2626', fontSize: '14px', fontWeight: '700' }}>Logout</span>
        </motion.button>
      </motion.div>

      {/* ── PERSONAL INFO MODAL ── */}
      <Modal show={showPersonalInfo} onClose={() => setShowPersonalInfo(false)} isDark={isDark}>
        <StepHeader icon={<User size={22} color="#fff" />} title="Personal Information" subtitle="Your registered account details" steps={0} currentStep={0} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '14px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', borderRadius: '14px', border: `1px solid ${border}` }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              {avatar ? <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#fff', fontSize: '20px', fontWeight: '800' }}>{balance?.full_name?.charAt(0)?.toUpperCase()}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: text, fontSize: '15px', fontWeight: '700', margin: '0 0 2px 0' }}>{balance?.full_name}</p>
              <p style={{ color: textSec, fontSize: '12px', margin: 0 }}>{user?.email}</p>
            </div>
          </div>

          {[
            { icon: <User size={14} color="#1A73E8" />,     bg: 'rgba(26,115,232,0.1)',  label: 'Full Name',     value: balance?.full_name || 'N/A' },
            { icon: <Mail size={14} color="#7C3AED" />,     bg: 'rgba(124,58,237,0.1)',  label: 'Email',         value: user?.email || 'N/A' },
            { icon: <Phone size={14} color="#16A34A" />,    bg: 'rgba(22,163,74,0.1)',   label: 'Phone',         value: balance?.phone || 'N/A' },
            { icon: <IdCard size={14} color="#EA580C" />,   bg: 'rgba(234,88,12,0.1)',   label: 'CNIC Number',   value: kycInfo?.cnic_number || 'Not submitted' },
            { icon: <Calendar size={14} color="#F59E0B" />, bg: 'rgba(245,158,11,0.1)',  label: 'Date of Birth', value: kycInfo?.date_of_birth || 'Not submitted' },
            { icon: <Wallet size={14} color="#9C27B0" />,   bg: 'rgba(156,39,176,0.1)',  label: 'Wallet ID',     value: balance?.wallet_number || 'N/A', copyable: true },
          ].map((row, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 0', borderBottom: i < arr.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'}` : 'none' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{row.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: textSec, fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px 0' }}>{row.label}</p>
                <p style={{ color: text, fontSize: '13px', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</p>
              </div>
              {row.copyable && (
                <motion.div whileTap={{ scale: 0.9 }} onClick={copyWallet} style={{ cursor: 'pointer', width: '28px', height: '28px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {copied ? <CheckCircle size={12} color="#16A34A" /> : <Copy size={12} color="#94A3B8" />}
                </motion.div>
              )}
            </div>
          ))}

          <div style={{ marginTop: '14px', padding: '12px 14px', background: kycInfo?.status === 'approved' ? 'rgba(22,163,74,0.08)' : 'rgba(245,158,11,0.08)', borderRadius: '12px', border: `1px solid ${kycInfo?.status === 'approved' ? 'rgba(22,163,74,0.2)' : 'rgba(245,158,11,0.2)'}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={16} color={kycInfo?.status === 'approved' ? '#16A34A' : '#F59E0B'} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ color: kycInfo?.status === 'approved' ? '#16A34A' : '#F59E0B', fontSize: '12px', fontWeight: '700', margin: 0 }}>
                KYC: {kycInfo?.status === 'approved' ? 'Verified' : kycInfo?.status === 'pending' ? 'Under Review' : 'Not Submitted'}
              </p>
              <p style={{ color: textSec, fontSize: '11px', margin: 0 }}>
                {kycInfo?.status === 'approved' ? 'Identity fully verified' : 'Complete KYC to unlock all features'}
              </p>
            </div>
          </div>

          <motion.div style={{ marginTop: '10px', padding: '12px 14px', background: 'rgba(202,138,4,0.06)', border: '1px solid rgba(202,138,4,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} whileTap={{ scale: 0.98 }} onClick={() => { setShowPersonalInfo(false); resetCr(); setShowChangeRequest(true); }}>
            <ClipboardList size={15} color="#CA8A04" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ color: '#CA8A04', fontSize: '12px', fontWeight: '700', margin: 0 }}>Need to update your info?</p>
              <p style={{ color: textSec, fontSize: '11px', margin: 0 }}>Submit a change request for admin review</p>
            </div>
            <ChevronRight size={13} color="#CA8A04" />
          </motion.div>

          <motion.button style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '14px', boxShadow: '0 6px 20px rgba(26,115,232,0.3)' }} whileTap={{ scale: 0.97 }} onClick={() => setShowPersonalInfo(false)}>Close</motion.button>
        </div>
      </Modal>

      {/* ── CHANGE PASSWORD MODAL ── */}
      <Modal show={showChangePassword} onClose={() => { setShowChangePassword(false); setPwStep(1); setPwOtp(''); setNewPassword(''); setConfirmPassword(''); setPwError(''); }} isDark={isDark}>
        <StepHeader icon={<Key size={22} color="#fff" />} title="Change Password" subtitle={pwStep === 1 ? 'Step 1 — Verify your identity' : 'Step 2 — Set new password'} steps={2} currentStep={pwStep} grad="linear-gradient(135deg,#16A34A,#15803D)" />
        <div style={{ padding: '16px' }}>
          <AnimatePresence mode="wait">
            {pwStep === 1 && (
              <motion.div key="pw1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', borderRadius: '14px', padding: '14px', marginBottom: '14px', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Mail size={18} color="#16A34A" /></div>
                  <div>
                    <p style={{ color: textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px 0' }}>Code sent to</p>
                    <p style={{ color: text, fontSize: '13px', fontWeight: '700', margin: 0 }}>{user?.email}</p>
                  </div>
                </div>
                {pwError && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle size={13} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '12px' }}>{pwError}</span></motion.div>}
                <motion.button style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 20px rgba(22,163,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }} whileTap={{ scale: 0.97 }} onClick={sendPasswordOtp} disabled={pwLoading}>
                  {pwLoading ? <motion.span animate={{ opacity: [1,0.4,1] }} transition={{ duration: 1, repeat: Infinity }}>Sending...</motion.span> : <><Mail size={15} color="#fff" /> Send Verification Code</>}
                </motion.button>
                <motion.button style={{ width: '100%', padding: '13px', background: 'transparent', color: textSec, border: `1.5px solid ${border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }} whileTap={{ scale: 0.97 }} onClick={() => setShowChangePassword(false)}>Cancel</motion.button>
              </motion.div>
            )}
            {pwStep === 2 && (
              <motion.div key="pw2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#16A34A" style={{ flexShrink: 0 }} />
                  <div><p style={{ color: '#16A34A', fontSize: '11px', fontWeight: '700', margin: 0 }}>Code sent to {pwEmail}</p><p style={{ color: textSec, fontSize: '10px', margin: 0 }}>Check inbox and spam</p></div>
                </div>
                <p style={{ color: text, fontSize: '12px', fontWeight: '700', margin: '0 0 8px 0', textAlign: 'center' }}>Enter 6-Digit Code</p>
                <OtpInput value={pwOtp} onChange={setPwOtp} isDark={isDark} />
                <div style={{ textAlign: 'center', margin: '8px 0 14px' }}>
                  {pwCountdown > 0 ? <span style={{ color: textSec, fontSize: '11px' }}>Resend in <strong style={{ color: text }}>{pwCountdown}s</strong></span>
                    : <motion.span style={{ color: '#1A73E8', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }} whileTap={{ scale: 0.95 }} onClick={sendPasswordOtp}><RefreshCw size={11} /> Resend Code</motion.span>}
                </div>
                {['New Password', 'Confirm Password'].map((label, idx) => (
                  <div key={idx} style={{ marginBottom: '10px' }}>
                    <p style={{ color: textSec, fontSize: '12px', fontWeight: '600', margin: '0 0 6px 0' }}>{label}</p>
                    <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${idx === 0 ? (newPassword ? '#16A34A' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0') : (confirmPassword ? (confirmPassword === newPassword ? '#16A34A' : '#DC2626') : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0')}`, borderRadius: '12px', padding: '0 14px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF' }}>
                      <Lock size={14} color="#94A3B8" style={{ flexShrink: 0, marginRight: '8px' }} />
                      <input style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: text, fontSize: '14px', outline: 'none' }} type={idx === 0 ? (showNewPw ? 'text' : 'password') : (showConfirmPw ? 'text' : 'password')} placeholder={idx === 0 ? 'Min 6 characters' : 'Re-enter password'} value={idx === 0 ? newPassword : confirmPassword} onChange={(e) => idx === 0 ? setNewPassword(e.target.value) : setConfirmPassword(e.target.value)} />
                      <motion.div whileTap={{ scale: 0.9 }} onClick={() => idx === 0 ? setShowNewPw(!showNewPw) : setShowConfirmPw(!showConfirmPw)} style={{ cursor: 'pointer', padding: '4px' }}>
                        {(idx === 0 ? showNewPw : showConfirmPw) ? <EyeOff size={14} color="#94A3B8" /> : <Eye size={14} color="#94A3B8" />}
                      </motion.div>
                    </div>
                  </div>
                ))}
                {confirmPassword.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                    {confirmPassword === newPassword ? <><CheckCircle size={12} color="#16A34A" /><span style={{ color: '#16A34A', fontSize: '11px', fontWeight: '600' }}>Passwords match</span></> : <><AlertCircle size={12} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '11px', fontWeight: '600' }}>Passwords do not match</span></>}
                  </div>
                )}
                {pwError && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle size={13} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '12px' }}>{pwError}</span></motion.div>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <motion.button style={{ flex: 1, padding: '13px', background: 'transparent', color: textSec, border: `1.5px solid ${border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }} whileTap={{ scale: 0.97 }} onClick={() => setPwStep(1)}>Back</motion.button>
                  <motion.button style={{ flex: 2, padding: '13px', background: pwOtp.length === 6 && newPassword && confirmPassword ? 'linear-gradient(135deg,#16A34A,#15803D)' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: pwOtp.length === 6 && newPassword && confirmPassword ? '#fff' : textSec, border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }} whileTap={{ scale: 0.97 }} onClick={submitChangePassword} disabled={pwLoading}>{pwLoading ? 'Changing...' : 'Change Password'}</motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      {/* ── CHANGE PIN MODAL ── */}
      <Modal show={showChangePin} onClose={() => { setShowChangePin(false); setPinStep(1); setPinOtp(''); setNewPin(''); setConfirmPin(''); setPinError(''); }} isDark={isDark}>
        <StepHeader icon={<Shield size={22} color="#fff" />} title="Change PIN" subtitle={pinStep === 1 ? 'Step 1 — Verify your identity' : 'Step 2 — Set new PIN'} steps={2} currentStep={pinStep} />
        <div style={{ padding: '16px' }}>
          <AnimatePresence mode="wait">
            {pinStep === 1 && (
              <motion.div key="pin1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', borderRadius: '14px', padding: '14px', marginBottom: '14px', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Mail size={18} color="#1A73E8" /></div>
                  <div><p style={{ color: textSec, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px 0' }}>Verification to</p><p style={{ color: text, fontSize: '13px', fontWeight: '700', margin: 0 }}>{user?.email}</p></div>
                </div>
                {pinError && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle size={13} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '12px' }}>{pinError}</span></motion.div>}
                <motion.button style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#1A73E8,#0052CC)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,115,232,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }} whileTap={{ scale: 0.97 }} onClick={sendPinOtp} disabled={pinLoading}>
                  {pinLoading ? <motion.span animate={{ opacity: [1,0.4,1] }} transition={{ duration: 1, repeat: Infinity }}>Sending...</motion.span> : <><Mail size={15} color="#fff" /> Send Verification Code</>}
                </motion.button>
                <motion.button style={{ width: '100%', padding: '13px', background: 'transparent', color: textSec, border: `1.5px solid ${border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }} whileTap={{ scale: 0.97 }} onClick={() => setShowChangePin(false)}>Cancel</motion.button>
              </motion.div>
            )}
            {pinStep === 2 && (
              <motion.div key="pin2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#16A34A" style={{ flexShrink: 0 }} /><div><p style={{ color: '#16A34A', fontSize: '11px', fontWeight: '700', margin: 0 }}>Code sent to {pinEmail}</p><p style={{ color: textSec, fontSize: '10px', margin: 0 }}>Check inbox and spam</p></div>
                </div>
                <p style={{ color: text, fontSize: '12px', fontWeight: '700', margin: '0 0 8px 0', textAlign: 'center' }}>Enter 6-Digit Code</p>
                <OtpInput value={pinOtp} onChange={setPinOtp} isDark={isDark} />
                <div style={{ textAlign: 'center', margin: '8px 0 16px' }}>
                  {pinCountdown > 0 ? <span style={{ color: textSec, fontSize: '11px' }}>Resend in <strong>{pinCountdown}s</strong></span>
                    : <motion.span style={{ color: '#1A73E8', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }} whileTap={{ scale: 0.95 }} onClick={sendPinOtp}><RefreshCw size={11} /> Resend Code</motion.span>}
                </div>
                <p style={{ color: text, fontSize: '12px', fontWeight: '700', margin: '0 0 8px 0', textAlign: 'center' }}>New 4-Digit PIN</p>
                <PinInput value={newPin} onChange={setNewPin} isDark={isDark} />
                <p style={{ color: text, fontSize: '12px', fontWeight: '700', margin: '14px 0 8px 0', textAlign: 'center' }}>Confirm New PIN</p>
                <PinInput value={confirmPin} onChange={setConfirmPin} isDark={isDark} label={confirmPin.length === 4 ? (confirmPin === newPin ? '✓ PINs match' : '✗ PINs do not match') : 'Re-enter your new PIN'} />
                {pinError && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '10px 14px', margin: '10px 0', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle size={13} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '12px' }}>{pinError}</span></motion.div>}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <motion.button style={{ flex: 1, padding: '13px', background: 'transparent', color: textSec, border: `1.5px solid ${border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }} whileTap={{ scale: 0.97 }} onClick={() => setPinStep(1)}>Back</motion.button>
                  <motion.button style={{ flex: 2, padding: '13px', background: pinOtp.length === 6 && newPin.length === 4 && confirmPin.length === 4 ? 'linear-gradient(135deg,#1A73E8,#0052CC)' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: pinOtp.length === 6 && newPin.length === 4 && confirmPin.length === 4 ? '#fff' : textSec, border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }} whileTap={{ scale: 0.97 }} onClick={submitChangePin} disabled={pinLoading}>{pinLoading ? 'Changing...' : 'Change PIN'}</motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      {/* ── CHANGE REQUEST MODAL ── */}
      <Modal show={showChangeRequest} onClose={() => { setShowChangeRequest(false); resetCr(); }} isDark={isDark}>
        <StepHeader icon={<ClipboardList size={22} color="#fff" />} title="Change Request" subtitle={crSuccess ? 'Request submitted!' : crStep === 1 ? 'Select what to change' : 'Provide details'} steps={crSuccess ? 0 : 2} currentStep={crStep} grad="linear-gradient(135deg,#CA8A04,#92400E)" />
        <div style={{ padding: '16px' }}>
          <AnimatePresence mode="wait">
            {crSuccess && (
              <motion.div key="cr-ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <motion.div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                    <CheckCircle size={32} color="#16A34A" />
                  </motion.div>
                  <h3 style={{ color: text, fontSize: '17px', fontWeight: '800', margin: '0 0 6px 0' }}>Request Submitted!</h3>
                  <p style={{ color: textSec, fontSize: '13px', margin: '0 0 20px 0', lineHeight: '1.6' }}>Admin will review within 24-48 hours. You will be notified by email.</p>
                </div>
                <div style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', borderRadius: '14px', padding: '14px', border: `1px solid ${border}`, marginBottom: '16px' }}>
                  {[{ label: 'Field', value: selectedCrField?.label }, { label: 'New Value', value: crValue }, { label: 'Status', value: 'Pending Review', color: '#CA8A04' }].map((row, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}>
                      <span style={{ color: textSec, fontSize: '12px' }}>{row.label}</span>
                      <span style={{ color: row.color || text, fontSize: '12px', fontWeight: '700' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <motion.button style={{ flex: 1, padding: '13px', background: 'transparent', color: textSec, border: `1.5px solid ${border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }} whileTap={{ scale: 0.97 }} onClick={resetCr}>New Request</motion.button>
                  <motion.button style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg,#CA8A04,#92400E)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }} whileTap={{ scale: 0.97 }} onClick={() => { setShowChangeRequest(false); resetCr(); }}>Done</motion.button>
                </div>
              </motion.div>
            )}
            {!crSuccess && crStep === 1 && (
              <motion.div key="cr1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div style={{ background: 'rgba(202,138,4,0.07)', border: '1px solid rgba(202,138,4,0.15)', borderRadius: '12px', padding: '12px 14px', marginBottom: '14px', display: 'flex', gap: '10px' }}>
                  <ClipboardList size={15} color="#CA8A04" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ color: textSec, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>Changes require admin approval and are reviewed within 24-48 hours.</p>
                </div>
                {CR_FIELDS.map((f, i) => (
                  <motion.div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFF', borderRadius: '14px', marginBottom: '8px', cursor: 'pointer', border: `1.5px solid ${border}` }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => { setCrField(f.id); setCrStep(2); setCrError(''); }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{f.icon}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: text, fontSize: '13px', fontWeight: '600', margin: '0 0 2px 0' }}>{f.label}</p>
                      <p style={{ color: textSec, fontSize: '11px', margin: 0 }}>{f.desc}</p>
                    </div>
                    <ChevronRight size={15} color={textSec} />
                  </motion.div>
                ))}
                <motion.button style={{ width: '100%', padding: '13px', background: 'transparent', color: textSec, border: `1.5px solid ${border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer', marginTop: '4px', fontWeight: '600' }} whileTap={{ scale: 0.97 }} onClick={() => { setShowChangeRequest(false); resetCr(); }}>Cancel</motion.button>
              </motion.div>
            )}
            {!crSuccess && crStep === 2 && selectedCrField && (
              <motion.div key="cr2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', borderRadius: '14px', border: `1px solid ${border}`, marginBottom: '16px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: selectedCrField.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{selectedCrField.icon}</div>
                  <div><p style={{ color: text, fontSize: '13px', fontWeight: '700', margin: 0 }}>Changing: {selectedCrField.label}</p><p style={{ color: textSec, fontSize: '11px', margin: 0 }}>{selectedCrField.desc}</p></div>
                </div>
                <p style={{ color: textSec, fontSize: '12px', fontWeight: '700', margin: '0 0 6px 0' }}>New {selectedCrField.label}</p>
                <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${crValue ? '#CA8A04' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '12px', padding: '0 14px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', marginBottom: '14px', transition: 'all 0.2s' }}>
                  <div style={{ marginRight: '10px', flexShrink: 0 }}>{selectedCrField.icon}</div>
                  <input style={{ flex: 1, padding: '13px 0', border: 'none', background: 'transparent', color: text, fontSize: '14px', outline: 'none' }} placeholder={selectedCrField.placeholder} value={crValue} onChange={(e) => { setCrValue(e.target.value); setCrError(''); }} autoFocus />
                </div>
                <p style={{ color: textSec, fontSize: '12px', fontWeight: '700', margin: '0 0 6px 0' }}>Reason for Change</p>
                <textarea style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${crReason ? '#CA8A04' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', color: text, fontSize: '13px', outline: 'none', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5', boxSizing: 'border-box', marginBottom: '6px' }} placeholder="Why does this need to be updated?" value={crReason} onChange={(e) => { setCrReason(e.target.value); setCrError(''); }} />
                <p style={{ color: textSec, fontSize: '10px', margin: '0 0 12px 2px' }}>Minimum 10 characters</p>
                {crError && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle size={13} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '12px' }}>{crError}</span></motion.div>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <motion.button style={{ flex: 1, padding: '13px', background: 'transparent', color: textSec, border: `1.5px solid ${border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }} whileTap={{ scale: 0.97 }} onClick={() => { setCrStep(1); setCrValue(''); setCrReason(''); setCrError(''); }}>Back</motion.button>
                  <motion.button style={{ flex: 2, padding: '13px', background: crValue && crReason ? 'linear-gradient(135deg,#CA8A04,#92400E)' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: crValue && crReason ? '#fff' : textSec, border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: crValue && crReason ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }} whileTap={crValue && crReason ? { scale: 0.97 } : {}} onClick={submitChangeRequest} disabled={crLoading}>{crLoading ? 'Submitting...' : 'Submit Request'}</motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      {/* ── LOGOUT MODAL ── */}
      <Modal show={showLogout} onClose={() => setShowLogout(false)} isDark={isDark}>
        <StepHeader icon={<LogOut size={22} color="#fff" />} title="Logout?" subtitle="You will need to sign in again" steps={0} currentStep={0} grad="linear-gradient(135deg,#DC2626,#B91C1C)" />
        <div style={{ padding: '20px' }}>
          <p style={{ color: textSec, fontSize: '13px', textAlign: 'center', margin: '0 0 20px 0', lineHeight: '1.7' }}>Are you sure you want to logout? Your wallet data stays safe and secure.</p>
          <motion.button style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg,#DC2626,#B91C1C)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 8px 24px rgba(220,38,38,0.35)' }} whileTap={{ scale: 0.97 }} onClick={logout}>Yes, Logout</motion.button>
          <motion.button style={{ width: '100%', padding: '14px', background: 'transparent', color: textSec, border: `1.5px solid ${border}`, borderRadius: '14px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }} whileTap={{ scale: 0.97 }} onClick={() => setShowLogout(false)}>Stay Logged In</motion.button>
        </div>
      </Modal>

    </div>
  );
}
