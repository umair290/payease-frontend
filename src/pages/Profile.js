import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { accountService } from '../services/api';
import api from '../services/api';
import {
  ArrowLeft, User, Shield, Bell, Moon, Sun,
  ChevronRight, LogOut, Key, CreditCard,
  HelpCircle, FileText, Copy, CheckCircle,
  Lock, Mail, Eye, EyeOff, RefreshCw, AlertCircle,
  Phone, Calendar, CreditCard as IdCard,
  BarChart2, MapPin, Smartphone, AlertTriangle,
  Edit2, Camera, X
} from 'lucide-react';

// ── Reusable Modal ──
const Modal = ({ show, onClose, children, colors }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px', boxSizing: 'border-box' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={onClose} />
        <motion.div
          style={{ background: colors.card, borderRadius: '20px', width: '100%', maxWidth: '360px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '92vh', overflowY: 'auto', position: 'relative', zIndex: 1 }}
          initial={{ scale: 0.88, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── OTP Input ──
const OtpInput = ({ value, onChange, colors }) => (
  <div style={{ position: 'relative', marginBottom: '4px' }}>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px', border: `2px solid ${value.length === 6 ? '#1A73E8' : colors.border}`, borderRadius: '14px', background: colors.inputBg, transition: 'border-color 0.2s' }}>
      {[0,1,2,3,4,5].map(i => (
        <motion.div key={i}
          style={{ width: '34px', height: '42px', borderRadius: '10px', border: `2px solid ${i < value.length ? '#1A73E8' : colors.textSecondary}`, background: i < value.length ? 'rgba(26,115,232,0.1)' : colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', boxShadow: i < value.length ? '0 2px 8px rgba(26,115,232,0.2)' : 'none' }}
          animate={{ scale: i === value.length - 1 ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.15 }}
        >
          <span style={{ color: '#1A73E8', fontSize: '18px', fontWeight: 'bold' }}>{value[i] ? '●' : ''}</span>
        </motion.div>
      ))}
    </div>
    <input
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'text', zIndex: 1 }}
      type="tel" inputMode="numeric" maxLength={6} value={value}
      onChange={(e) => onChange(e.target.value.slice(0, 6).replace(/\D/g, ''))}
      autoFocus
    />
  </div>
);

// ── PIN Input ──
const PinInput = ({ value, onChange, label, colors }) => (
  <div style={{ marginBottom: '4px' }}>
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '14px', border: `2px solid ${value.length === 4 ? '#1A73E8' : colors.border}`, borderRadius: '14px', background: colors.inputBg, transition: 'border-color 0.2s' }}>
        {[0,1,2,3].map(i => (
          <motion.div key={i}
            style={{ width: '46px', height: '46px', borderRadius: '12px', border: `2px solid ${i < value.length ? '#1A73E8' : colors.textSecondary}`, background: i < value.length ? 'rgba(26,115,232,0.1)' : colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: i < value.length ? '0 2px 8px rgba(26,115,232,0.2)' : 'none' }}
            animate={{ scale: i === value.length - 1 ? [1, 1.12, 1] : 1 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              style={{ width: '12px', height: '12px', borderRadius: '50%', background: i < value.length ? '#1A73E8' : colors.textSecondary }}
              animate={{ scale: i < value.length ? 1 : 0.4, opacity: i < value.length ? 1 : 0.4 }}
              transition={{ duration: 0.15 }}
            />
          </motion.div>
        ))}
      </div>
      <input
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'text', zIndex: 1 }}
        type="tel" inputMode="numeric" maxLength={4} value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 4).replace(/\D/g, ''))}
      />
    </div>
    {label && (
      <p style={{ color: label.includes('✓') ? '#00C853' : label.includes('✗') ? '#FF4444' : colors.textSecondary, fontSize: '11px', textAlign: 'center', margin: '6px 0 0 0', fontWeight: '600' }}>
        {label}
      </p>
    )}
  </div>
);

// ── Error Box ──
const ErrorBox = ({ msg }) => msg ? (
  <motion.div
    style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
  >
    <AlertCircle size={14} color="#FF4444" style={{ flexShrink: 0 }} />
    <span style={{ color: '#FF4444', fontSize: '12px' }}>{msg}</span>
  </motion.div>
) : null;

// ── Step Header ──
const StepHeader = ({ icon, title, subtitle, steps, currentStep, grad = 'linear-gradient(135deg, #1A73E8, #0052CC)' }) => (
  <div style={{ background: grad, padding: '18px 20px 16px', textAlign: 'center' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
      {icon}
    </div>
    <h3 style={{ color: '#fff', fontSize: '17px', fontWeight: 'bold', margin: '0 0 3px 0' }}>{title}</h3>
    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: '0 0 12px 0' }}>{subtitle}</p>
    {steps > 1 && (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
        {Array.from({ length: steps }).map((_, s) => (
          <motion.div key={s} style={{ height: '3px', borderRadius: '2px', background: currentStep > s ? '#fff' : 'rgba(255,255,255,0.25)' }}
            animate={{ width: currentStep === s + 1 ? '24px' : '10px' }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    )}
  </div>
);

export default function Profile() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  // ── Data ──
  const [balance,  setBalance]  = useState(null);
  const [kycInfo,  setKycInfo]  = useState(null);
  const [avatar,   setAvatar]   = useState(null); // base64 profile pic
  const [toast,    setToast]    = useState({ msg: '', type: 'success' });

  // ── Modal visibility ──
  const [showLogout,       setShowLogout]       = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showEditProfile,  setShowEditProfile]  = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangePin,    setShowChangePin]    = useState(false);

  // ── Edit Profile state ──
  const [editStep,      setEditStep]      = useState(1); // 1=form, 2=otp
  const [editName,      setEditName]      = useState('');
  const [editPhone,     setEditPhone]     = useState('');
  const [editOtp,       setEditOtp]       = useState('');
  const [editLoading,   setEditLoading]   = useState(false);
  const [editError,     setEditError]     = useState('');
  const [editEmail,     setEditEmail]     = useState('');
  const [editCountdown, setEditCountdown] = useState(0);

  // ── Change Password state ──
  const [pwStep,           setPwStep]           = useState(1);
  const [pwOtp,            setPwOtp]            = useState('');
  const [newPassword,      setNewPassword]      = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [showNewPw,        setShowNewPw]        = useState(false);
  const [showConfirmPw,    setShowConfirmPw]    = useState(false);
  const [pwLoading,        setPwLoading]        = useState(false);
  const [pwError,          setPwError]          = useState('');
  const [pwEmail,          setPwEmail]          = useState('');
  const [pwCountdown,      setPwCountdown]      = useState(0);

  // ── Change PIN state ──
  const [pinStep,      setPinStep]      = useState(1);
  const [pinOtp,       setPinOtp]       = useState('');
  const [newPin,       setNewPin]       = useState('');
  const [confirmPin,   setConfirmPin]   = useState('');
  const [pinLoading,   setPinLoading]   = useState(false);
  const [pinError,     setPinError]     = useState('');
  const [pinEmail,     setPinEmail]     = useState('');
  const [pinCountdown, setPinCountdown] = useState(0);

  // ── Countdown timers ──
  useEffect(() => {
    if (pwCountdown > 0)   { const t = setTimeout(() => setPwCountdown(c => c - 1),   1000); return () => clearTimeout(t); }
  }, [pwCountdown]);
  useEffect(() => {
    if (pinCountdown > 0)  { const t = setTimeout(() => setPinCountdown(c => c - 1),  1000); return () => clearTimeout(t); }
  }, [pinCountdown]);
  useEffect(() => {
    if (editCountdown > 0) { const t = setTimeout(() => setEditCountdown(c => c - 1), 1000); return () => clearTimeout(t); }
  }, [editCountdown]);

  useEffect(() => {
    loadData();
    // Load saved avatar from localStorage
    const saved = localStorage.getItem('payease_avatar');
    if (saved) setAvatar(saved);
  }, []);

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
    setTimeout(() => setToast({ msg: '', type: 'success' }), 4000);
  };

  const copyWallet = () => {
    navigator.clipboard.writeText(balance?.wallet_number || '');
    showToast('Wallet address copied');
  };

  // ── Profile Picture ──
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setAvatar(base64);
      localStorage.setItem('payease_avatar', base64);
      showToast('Profile picture updated');
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatar(null);
    localStorage.removeItem('payease_avatar');
    showToast('Profile picture removed');
  };

  // ── Edit Profile ──
  const validateEditForm = () => {
    if (!editName.trim()) { setEditError('Full name is required'); return false; }
    if (!/^[a-zA-Z\s]+$/.test(editName.trim())) { setEditError('Name must contain only letters and spaces'); return false; }
    if (!editPhone.trim()) { setEditError('Phone number is required'); return false; }
    const cleanPhone = editPhone.replace(/[\s\-]/g, '');
    if (!/^\d{10,13}$/.test(cleanPhone)) { setEditError('Enter a valid phone number (10-13 digits)'); return false; }
    return true;
  };

  const sendEditOtp = async () => {
    if (!validateEditForm()) return;
    setEditLoading(true); setEditError('');
    try {
      const res = await api.post('/api/otp/send', { purpose: 'update_profile' });
      setEditEmail(res.data.email);
      setEditStep(2);
      setEditCountdown(60);
    } catch (err) { setEditError(err.response?.data?.error || 'Failed to send verification code'); }
    setEditLoading(false);
  };

  const submitEditProfile = async () => {
    if (editOtp.length !== 6) { setEditError('Enter the 6-digit verification code'); return; }
    setEditLoading(true); setEditError('');
    try {
      await api.post('/api/otp/update-profile', {
        otp:       editOtp,
        full_name: editName.trim(),
        phone:     editPhone.replace(/[\s\-]/g, ''),
      });
      showToast('Profile updated successfully');
      setShowEditProfile(false);
      resetEditProfile();
      await loadData();
    } catch (err) { setEditError(err.response?.data?.error || 'Failed to update profile'); }
    setEditLoading(false);
  };

  const resetEditProfile = () => {
    setEditStep(1); setEditName(''); setEditPhone('');
    setEditOtp(''); setEditError(''); setEditEmail(''); setEditCountdown(0);
  };

  // ── Change Password ──
  const sendPasswordOtp = async () => {
    setPwLoading(true); setPwError('');
    try {
      const res = await api.post('/api/otp/send', { purpose: 'change_password' });
      setPwEmail(res.data.email); setPwStep(2); setPwCountdown(60);
    } catch (err) { setPwError(err.response?.data?.error || 'Failed to send verification code'); }
    setPwLoading(false);
  };

  const submitChangePassword = async () => {
    if (pwOtp.length !== 6)           { setPwError('Enter the 6-digit verification code'); return; }
    if (newPassword.length < 6)       { setPwError('Password must be at least 6 characters'); return; }
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

  // ── Change PIN ──
  const sendPinOtp = async () => {
    setPinLoading(true); setPinError('');
    try {
      const res = await api.post('/api/otp/send', { purpose: 'change_pin' });
      setPinEmail(res.data.email); setPinStep(2); setPinCountdown(60);
    } catch (err) { setPinError(err.response?.data?.error || 'Failed to send verification code'); }
    setPinLoading(false);
  };

  const submitChangePin = async () => {
    if (pinOtp.length !== 6)     { setPinError('Enter the 6-digit verification code'); return; }
    if (newPin.length !== 4)     { setPinError('PIN must be 4 digits'); return; }
    if (newPin !== confirmPin)   { setPinError('PINs do not match'); return; }
    setPinLoading(true); setPinError('');
    try {
      await api.post('/api/otp/change-pin', { otp: pinOtp, new_pin: newPin });
      showToast('PIN changed successfully');
      setShowChangePin(false);
      setPinStep(1); setPinOtp(''); setNewPin(''); setConfirmPin(''); setPinEmail(''); setPinCountdown(0);
    } catch (err) { setPinError(err.response?.data?.error || 'Failed to change PIN'); }
    setPinLoading(false);
  };

  // ── Open edit profile ──
  const openEditProfile = () => {
    setEditName(balance?.full_name || '');
    setEditPhone(balance?.phone || '');
    resetEditProfile();
    setShowEditProfile(true);
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: <User size={18} color="#1A73E8" />,    label: 'Personal Information', sub: 'View and edit your profile',     bg: 'rgba(26,115,232,0.1)',  action: () => setShowPersonalInfo(true) },
        { icon: <CreditCard size={18} color="#7C3AED" />, label: 'Virtual Card',      sub: 'Your PayEase demo card',         bg: 'rgba(124,58,237,0.1)', action: () => navigate('/virtual-card') },
        { icon: <BarChart2 size={18} color="#0891B2" />,  label: 'Spending Insights', sub: 'Track your spending habits',     bg: 'rgba(8,145,178,0.1)',  action: () => navigate('/insights') },
        { icon: <FileText size={18} color="#FF6B35" />,   label: 'KYC Verification',  sub: kycInfo?.status === 'approved' ? 'Verified' : 'Verify your identity', bg: 'rgba(255,107,53,0.1)', action: () => navigate('/kyc') },
        { icon: <Copy size={18} color="#9C27B0" />,       label: 'Wallet Address',    sub: balance?.wallet_number || 'Tap to copy', bg: 'rgba(156,39,176,0.1)', action: copyWallet, rightIcon: <Copy size={14} color="#9C27B0" /> },
      ]
    },
    {
      title: 'Security',
      items: [
        { icon: <Key size={18} color="#00C853" />,         label: 'Change Password',   sub: 'Update your account password',        bg: 'rgba(0,200,83,0.1)',   action: () => { setPwStep(1); setPwError(''); setShowChangePassword(true); } },
        { icon: <Shield size={18} color="#1A73E8" />,      label: 'Change PIN',        sub: 'Update your 4-digit transaction PIN', bg: 'rgba(26,115,232,0.1)', action: () => { setPinStep(1); setPinError(''); setShowChangePin(true); } },
        { icon: <Smartphone size={18} color="#DC2626" />,  label: 'Active Sessions',   sub: 'Manage logged-in devices',            bg: 'rgba(220,38,38,0.1)',  action: () => showToast('Feature coming soon', 'error') },
        { icon: <AlertTriangle size={18} color="#CA8A04" />, label: 'Fraud Alerts',    sub: 'Security notifications',              bg: 'rgba(202,138,4,0.1)', action: () => navigate('/notifications') },
        { icon: <MapPin size={18} color="#7C3AED" />,      label: 'Login Locations',   sub: 'View recent login activity',          bg: 'rgba(124,58,237,0.1)', action: () => showToast('Feature coming soon', 'error') },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: isDark ? <Sun size={18} color="#FFB300" /> : <Moon size={18} color="#1A73E8" />, label: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode', sub: isDark ? 'Currently dark theme' : 'Currently light theme', bg: isDark ? 'rgba(255,179,0,0.1)' : 'rgba(26,115,232,0.1)', action: toggleTheme },
        { icon: <Bell size={18} color="#FF4444" />, label: 'Notifications', sub: 'Manage your notifications', bg: 'rgba(255,68,68,0.1)', action: () => navigate('/notifications') },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: <HelpCircle size={18} color="#888" />, label: 'Help & Support', sub: 'FAQs and contact us', bg: 'rgba(136,136,136,0.1)', action: () => navigate('/notifications') },
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', maxWidth: '480px', margin: '0 auto', background: colors.bg }}>

      {/* Hidden file input for avatar */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />

      {/* Toast */}
      <AnimatePresence>
        {toast.msg && (
          <motion.div
            style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? '#DC2626' : '#16A34A', color: '#fff', padding: '12px 20px', borderRadius: '12px', zIndex: 9999, fontSize: '13px', fontWeight: '600', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
            initial={{ opacity: 0, y: -40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <CheckCircle size={14} color="#fff" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: colors.card, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <motion.div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '10px', background: colors.actionBg, border: `1px solid ${colors.border}` }} whileTap={{ scale: 0.9 }} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={22} color={colors.text} />
        </motion.div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: colors.text }}>Profile</h2>
        <div style={{ width: 36 }} />
      </div>

      {/* Profile Card */}
      <motion.div
        style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', margin: '16px', borderRadius: '20px', padding: '24px 20px', textAlign: 'center', boxShadow: '0 12px 40px rgba(26,115,232,0.35)' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        {/* Avatar */}
        <div style={{ position: 'relative', width: '80px', margin: '0 auto 10px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {avatar
              ? <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: '#fff', fontSize: '30px', fontWeight: 'bold' }}>{balance?.full_name?.charAt(0).toUpperCase()}</span>
            }
          </div>
          {/* Camera button */}
          <motion.div
            style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.9 }} onClick={() => fileRef.current?.click()}
          >
            <Camera size={13} color="#1A73E8" />
          </motion.div>
        </div>

        <h2 style={{ color: '#fff', fontSize: '19px', fontWeight: 'bold', margin: '0 0 3px 0' }}>{balance?.full_name}</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '0 0 10px 0' }}>{user?.email}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0,200,83,0.2)', border: '1px solid rgba(0,200,83,0.4)', borderRadius: '20px', padding: '4px 12px' }}>
            <Shield size={11} color="#00FF6B" />
            <span style={{ color: '#00FF6B', fontSize: '11px', fontWeight: '600' }}>{kycInfo?.status === 'approved' ? 'KYC Verified' : 'KYC Pending'}</span>
          </div>
          {/* Edit button */}
          <motion.div
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', padding: '4px 12px', cursor: 'pointer' }}
            whileTap={{ scale: 0.95 }} onClick={openEditProfile}
          >
            <Edit2 size={11} color="#fff" />
            <span style={{ color: '#fff', fontSize: '11px', fontWeight: '600' }}>Edit</span>
          </motion.div>
        </div>

        {/* Remove avatar if set */}
        {avatar && (
          <motion.p
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '8px', cursor: 'pointer', textDecoration: 'underline' }}
            whileTap={{ scale: 0.95 }} onClick={removeAvatar}
          >
            Remove photo
          </motion.p>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div style={{ margin: '0 16px 16px', borderRadius: '16px', padding: '14px', display: 'flex', background: colors.card, border: `1px solid ${colors.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 3px 0', color: colors.text }}>PKR {balance?.balance?.toLocaleString() || '0'}</p>
          <p style={{ fontSize: '11px', margin: 0, color: colors.textSecondary }}>Current Balance</p>
        </div>
        <div style={{ width: '1px', margin: '0 8px', background: colors.border }} />
        <motion.div style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }} whileTap={{ scale: 0.95 }} onClick={copyWallet}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 3px 0', color: colors.text }}>{balance?.wallet_number?.slice(0, 8)}...</p>
            <Copy size={12} color="#9C27B0" />
          </div>
          <p style={{ fontSize: '11px', margin: 0, color: colors.textSecondary }}>Tap to copy wallet</p>
        </motion.div>
      </motion.div>

      {/* Menu Sections */}
      {menuSections.map((section, si) => (
        <motion.div key={si} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + si * 0.05 }} style={{ margin: '0 16px 10px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 4px', color: colors.textSecondary }}>{section.title}</p>
          <div style={{ borderRadius: '14px', overflow: 'hidden', background: colors.card, border: `1px solid ${colors.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {section.items.map((item, ii) => (
              <motion.div key={ii} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 14px', cursor: 'pointer', borderBottom: ii < section.items.length - 1 ? `1px solid ${colors.border}` : 'none' }} whileTap={{ scale: 0.98 }} onClick={item.action}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: item.bg }}>{item.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', margin: '0 0 2px 0', color: colors.text }}>{item.label}</p>
                  <p style={{ fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: colors.textSecondary }}>{item.sub}</p>
                </div>
                {item.rightIcon || <ChevronRight size={15} color={colors.textSecondary} />}
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Logout */}
      <motion.div style={{ margin: '6px 16px 40px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <motion.button style={{ width: '100%', padding: '13px', background: 'rgba(255,68,68,0.08)', border: '1.5px solid rgba(255,68,68,0.25)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }} whileTap={{ scale: 0.97 }} onClick={() => setShowLogout(true)}>
          <LogOut size={17} color="#FF4444" />
          <span style={{ color: '#FF4444', fontSize: '14px', fontWeight: '600' }}>Logout</span>
        </motion.button>
      </motion.div>


      {/* ─────────────────────────────────────── */}
      {/* PERSONAL INFO MODAL                    */}
      {/* ─────────────────────────────────────── */}
      <Modal show={showPersonalInfo} onClose={() => setShowPersonalInfo(false)} colors={colors}>
        <StepHeader icon={<User size={24} color="#fff" />} title="Personal Information" subtitle="Your registered account details" steps={0} currentStep={0} />
        <div style={{ padding: '16px' }}>

          {/* Avatar + Name row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px', background: colors.actionBg, borderRadius: '12px', border: `1px solid ${colors.border}` }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              {avatar
                ? <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>{balance?.full_name?.charAt(0).toUpperCase()}</span>
              }
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: colors.text, fontSize: '15px', fontWeight: 'bold', margin: '0 0 2px 0' }}>{balance?.full_name}</p>
              <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>{user?.email}</p>
            </div>
            <motion.div
              style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setShowPersonalInfo(false); openEditProfile(); }}
            >
              <Edit2 size={15} color="#1A73E8" />
            </motion.div>
          </div>

          {/* Info rows */}
          {[
            { icon: <User size={15} color="#1A73E8" />,     label: 'Full Name',        value: balance?.full_name || 'N/A',             bg: 'rgba(26,115,232,0.1)' },
            { icon: <Mail size={15} color="#9C27B0" />,     label: 'Email Address',    value: user?.email || 'N/A',                    bg: 'rgba(156,39,176,0.1)' },
            { icon: <Phone size={15} color="#00C853" />,    label: 'Phone Number',     value: balance?.phone || 'N/A',                 bg: 'rgba(0,200,83,0.1)' },
            { icon: <IdCard size={15} color="#FF6B35" />,   label: 'CNIC Number',      value: kycInfo?.cnic_number || 'Not submitted', bg: 'rgba(255,107,53,0.1)' },
            { icon: <Calendar size={15} color="#FFB300" />, label: 'Date of Birth',    value: kycInfo?.date_of_birth || 'Not submitted', bg: 'rgba(255,179,0,0.1)' },
            { icon: <CreditCard size={15} color="#9C27B0" />, label: 'Wallet ID',      value: balance?.wallet_number || 'N/A',         bg: 'rgba(156,39,176,0.1)', copyable: true },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < 5 ? `1px solid ${colors.border}` : 'none' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{row.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: colors.textSecondary, fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px 0' }}>{row.label}</p>
                <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</p>
              </div>
              {row.copyable && (
                <motion.div whileTap={{ scale: 0.9 }} onClick={copyWallet} style={{ cursor: 'pointer', padding: '4px' }}>
                  <Copy size={13} color={colors.textSecondary} />
                </motion.div>
              )}
            </div>
          ))}

          {/* KYC Status */}
          <div style={{ marginTop: '14px', padding: '12px', background: kycInfo?.status === 'approved' ? 'rgba(0,200,83,0.08)' : 'rgba(255,179,0,0.08)', borderRadius: '10px', border: `1px solid ${kycInfo?.status === 'approved' ? 'rgba(0,200,83,0.2)' : 'rgba(255,179,0,0.2)'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color={kycInfo?.status === 'approved' ? '#00C853' : '#FFB300'} />
            <div>
              <p style={{ color: kycInfo?.status === 'approved' ? '#00C853' : '#FFB300', fontSize: '12px', fontWeight: '700', margin: 0 }}>
                KYC Status: {kycInfo?.status === 'approved' ? 'Verified' : kycInfo?.status === 'pending' ? 'Under Review' : 'Not Submitted'}
              </p>
              <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>
                {kycInfo?.status === 'approved' ? 'Your identity has been verified' : 'Complete KYC to unlock all features'}
              </p>
            </div>
          </div>

          <motion.button
            style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '14px', boxShadow: '0 4px 16px rgba(26,115,232,0.3)' }}
            whileTap={{ scale: 0.97 }} onClick={() => setShowPersonalInfo(false)}
          >Close</motion.button>
        </div>
      </Modal>


      {/* ─────────────────────────────────────── */}
      {/* EDIT PROFILE MODAL                     */}
      {/* ─────────────────────────────────────── */}
      <Modal show={showEditProfile} onClose={() => { setShowEditProfile(false); resetEditProfile(); }} colors={colors}>
        <StepHeader
          icon={<Edit2 size={22} color="#fff" />}
          title="Edit Profile"
          subtitle={editStep === 1 ? 'Step 1 of 2 — Update your information' : 'Step 2 of 2 — Verify your identity'}
          steps={2}
          currentStep={editStep}
          grad="linear-gradient(135deg, #7C3AED, #5B21B6)"
        />
        <div style={{ padding: '16px' }}>
          <AnimatePresence mode="wait">

            {/* Step 1 — Form */}
            {editStep === 1 && (
              <motion.div key="edit-s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>

                {/* Profile Picture */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: colors.actionBg, borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '16px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {avatar
                      ? <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>{balance?.full_name?.charAt(0).toUpperCase()}</span>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>Profile Picture</p>
                    <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>JPG or PNG, max 2MB</p>
                  </div>
                  <motion.button
                    style={{ padding: '7px 12px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '8px', color: '#7C3AED', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    whileTap={{ scale: 0.95 }} onClick={() => fileRef.current?.click()}
                  >
                    Change
                  </motion.button>
                </div>

                {/* Full Name */}
                <p style={{ color: colors.text, fontSize: '12px', fontWeight: '600', margin: '0 0 6px 0' }}>Full Name</p>
                <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${editName ? '#7C3AED' : colors.border}`, borderRadius: '12px', padding: '0 14px', background: colors.inputBg, marginBottom: '4px', transition: 'all 0.2s' }}>
                  <User size={15} color={editName ? '#7C3AED' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '10px' }} />
                  <input
                    style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none' }}
                    type="text" placeholder="Enter your full name"
                    value={editName} onChange={(e) => { setEditName(e.target.value); setEditError(''); }}
                    autoFocus
                  />
                </div>
                <p style={{ color: colors.textSecondary, fontSize: '10px', margin: '0 0 12px 2px' }}>Letters and spaces only</p>

                {/* Phone */}
                <p style={{ color: colors.text, fontSize: '12px', fontWeight: '600', margin: '0 0 6px 0' }}>Phone Number</p>
                <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${editPhone ? '#7C3AED' : colors.border}`, borderRadius: '12px', padding: '0 14px', background: colors.inputBg, marginBottom: '4px', transition: 'all 0.2s' }}>
                  <Phone size={15} color={editPhone ? '#7C3AED' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '10px' }} />
                  <input
                    style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none' }}
                    type="tel" placeholder="e.g. 03001234567"
                    value={editPhone} onChange={(e) => { setEditPhone(e.target.value); setEditError(''); }}
                  />
                </div>
                <p style={{ color: colors.textSecondary, fontSize: '10px', margin: '0 0 12px 2px' }}>10-13 digits, no spaces</p>

                {/* Email locked */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: colors.actionBg, borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '14px' }}>
                  <Lock size={14} color={colors.textSecondary} style={{ flexShrink: 0 }} />
                  <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>
                    Email address cannot be changed. Contact support if needed.
                  </p>
                </div>

                <ErrorBox msg={editError} />

                <div style={{ display: 'flex', gap: '8px' }}>
                  <motion.button
                    style={{ flex: 1, padding: '13px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
                    whileTap={{ scale: 0.97 }} onClick={() => { setShowEditProfile(false); resetEditProfile(); }}
                  >Cancel</motion.button>
                  <motion.button
                    style={{ flex: 2, padding: '13px', background: editName && editPhone ? 'linear-gradient(135deg, #7C3AED, #5B21B6)' : colors.actionBg, color: editName && editPhone ? '#fff' : colors.textSecondary, border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', boxShadow: editName && editPhone ? '0 4px 14px rgba(124,58,237,0.3)' : 'none', transition: 'all 0.2s' }}
                    whileTap={{ scale: 0.97 }} onClick={sendEditOtp} disabled={editLoading}
                  >
                    {editLoading ? 'Sending code...' : 'Continue'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2 — OTP */}
            {editStep === 2 && (
              <motion.div key="edit-s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>

                <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={16} color="#16A34A" style={{ flexShrink: 0 }} />
                  <div>
                    <p style={{ color: '#16A34A', fontSize: '12px', fontWeight: '700', margin: 0 }}>Verification code sent</p>
                    <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>Check your inbox at {editEmail}</p>
                  </div>
                </div>

                {/* Summary of changes */}
                <div style={{ background: colors.actionBg, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '12px 14px', marginBottom: '16px' }}>
                  <p style={{ color: colors.textSecondary, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px 0' }}>Changes to be saved</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: colors.textSecondary, fontSize: '12px' }}>Name</span>
                    <span style={{ color: colors.text, fontSize: '12px', fontWeight: '600' }}>{editName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: colors.textSecondary, fontSize: '12px' }}>Phone</span>
                    <span style={{ color: colors.text, fontSize: '12px', fontWeight: '600' }}>{editPhone}</span>
                  </div>
                </div>

                <p style={{ color: colors.text, fontSize: '12px', fontWeight: '600', margin: '0 0 8px 0', textAlign: 'center' }}>Enter 6-Digit Verification Code</p>
                <OtpInput value={editOtp} onChange={setEditOtp} colors={colors} />

                <div style={{ textAlign: 'center', margin: '6px 0 14px' }}>
                  {editCountdown > 0
                    ? <span style={{ color: colors.textSecondary, fontSize: '11px' }}>Resend in <strong style={{ color: colors.text }}>{editCountdown}s</strong></span>
                    : <motion.span style={{ color: '#7C3AED', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }} whileTap={{ scale: 0.95 }} onClick={sendEditOtp}>
                        <RefreshCw size={11} /> Resend Code
                      </motion.span>
                  }
                </div>

                <ErrorBox msg={editError} />

                <div style={{ display: 'flex', gap: '8px' }}>
                  <motion.button
                    style={{ flex: 1, padding: '12px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }}
                    whileTap={{ scale: 0.97 }} onClick={() => { setEditStep(1); setEditOtp(''); setEditError(''); }}
                  >Back</motion.button>
                  <motion.button
                    style={{ flex: 2, padding: '12px', background: editOtp.length === 6 ? 'linear-gradient(135deg, #7C3AED, #5B21B6)' : colors.actionBg, color: editOtp.length === 6 ? '#fff' : colors.textSecondary, border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: editOtp.length === 6 ? '0 4px 14px rgba(124,58,237,0.3)' : 'none' }}
                    whileTap={{ scale: 0.97 }} onClick={submitEditProfile} disabled={editLoading}
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>


      {/* ─────────────────────────────────────── */}
      {/* CHANGE PASSWORD MODAL                  */}
      {/* ─────────────────────────────────────── */}
      <Modal show={showChangePassword} onClose={() => { setShowChangePassword(false); setPwStep(1); setPwOtp(''); setNewPassword(''); setConfirmPassword(''); setPwError(''); }} colors={colors}>
        <StepHeader
          icon={<Key size={24} color="#fff" />}
          title="Change Password"
          subtitle={pwStep === 1 ? 'Step 1 of 2 — Verify identity' : 'Step 2 of 2 — Set new password'}
          steps={2}
          currentStep={pwStep}
        />
        <div style={{ padding: '16px' }}>
          <AnimatePresence mode="wait">
            {pwStep === 1 && (
              <motion.div key="pw-s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div style={{ background: colors.actionBg, borderRadius: '12px', padding: '12px 14px', marginBottom: '14px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={18} color="#1A73E8" />
                  </div>
                  <div>
                    <p style={{ color: colors.textSecondary, fontSize: '10px', margin: '0 0 2px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verification code will be sent to</p>
                    <p style={{ color: colors.text, fontSize: '13px', fontWeight: '700', margin: 0 }}>{user?.email}</p>
                  </div>
                </div>
                <p style={{ color: colors.textSecondary, fontSize: '12px', textAlign: 'center', margin: '0 0 14px 0', lineHeight: '1.6' }}>
                  We will send a 6-digit code to verify your identity before allowing a password change.
                </p>
                <ErrorBox msg={pwError} />
                <motion.button
                  style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,115,232,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}
                  whileTap={{ scale: 0.97 }} onClick={sendPasswordOtp} disabled={pwLoading}
                >
                  {pwLoading ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>Sending...</motion.span> : <><Mail size={15} color="#fff" /> Send Verification Code</>}
                </motion.button>
                <motion.button
                  style={{ width: '100%', padding: '12px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer' }}
                  whileTap={{ scale: 0.97 }} onClick={() => { setShowChangePassword(false); setPwStep(1); setPwOtp(''); setNewPassword(''); setConfirmPassword(''); setPwError(''); }}
                >Cancel</motion.button>
              </motion.div>
            )}
            {pwStep === 2 && (
              <motion.div key="pw-s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '10px', padding: '8px 12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#16A34A" style={{ flexShrink: 0 }} />
                  <div>
                    <p style={{ color: '#16A34A', fontSize: '11px', fontWeight: '700', margin: 0 }}>Code sent to {pwEmail}</p>
                    <p style={{ color: colors.textSecondary, fontSize: '10px', margin: 0 }}>Check inbox and spam folder</p>
                  </div>
                </div>
                <p style={{ color: colors.text, fontSize: '12px', fontWeight: '600', margin: '0 0 6px 0', textAlign: 'center' }}>Enter 6-Digit Code</p>
                <OtpInput value={pwOtp} onChange={setPwOtp} colors={colors} />
                <div style={{ textAlign: 'center', margin: '6px 0 12px' }}>
                  {pwCountdown > 0
                    ? <span style={{ color: colors.textSecondary, fontSize: '11px' }}>Resend in <strong style={{ color: colors.text }}>{pwCountdown}s</strong></span>
                    : <motion.span style={{ color: '#1A73E8', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }} whileTap={{ scale: 0.95 }} onClick={sendPasswordOtp}><RefreshCw size={11} /> Resend Code</motion.span>
                  }
                </div>
                <p style={{ color: colors.text, fontSize: '12px', fontWeight: '600', margin: '0 0 6px 0' }}>New Password</p>
                <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${newPassword ? '#1A73E8' : colors.border}`, borderRadius: '10px', padding: '0 12px', background: colors.inputBg, marginBottom: '8px' }}>
                  <Lock size={14} color={colors.textSecondary} style={{ flexShrink: 0, marginRight: '8px' }} />
                  <input style={{ flex: 1, padding: '11px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '13px', outline: 'none' }} type={showNewPw ? 'text' : 'password'} placeholder="Minimum 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowNewPw(!showNewPw)} style={{ cursor: 'pointer', padding: '4px' }}>
                    {showNewPw ? <EyeOff size={14} color={colors.textSecondary} /> : <Eye size={14} color={colors.textSecondary} />}
                  </motion.div>
                </div>
                <p style={{ color: colors.text, fontSize: '12px', fontWeight: '600', margin: '0 0 6px 0' }}>Confirm Password</p>
                <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${confirmPassword ? (confirmPassword === newPassword ? '#16A34A' : '#DC2626') : colors.border}`, borderRadius: '10px', padding: '0 12px', background: colors.inputBg, marginBottom: '6px' }}>
                  <Lock size={14} color={colors.textSecondary} style={{ flexShrink: 0, marginRight: '8px' }} />
                  <input style={{ flex: 1, padding: '11px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '13px', outline: 'none' }} type={showConfirmPw ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowConfirmPw(!showConfirmPw)} style={{ cursor: 'pointer', padding: '4px' }}>
                    {showConfirmPw ? <EyeOff size={14} color={colors.textSecondary} /> : <Eye size={14} color={colors.textSecondary} />}
                  </motion.div>
                </div>
                {confirmPassword.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                    {confirmPassword === newPassword
                      ? <><CheckCircle size={12} color="#16A34A" /><span style={{ color: '#16A34A', fontSize: '11px', fontWeight: '600' }}>Passwords match</span></>
                      : <><AlertCircle size={12} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '11px', fontWeight: '600' }}>Passwords do not match</span></>
                    }
                  </div>
                )}
                <ErrorBox msg={pwError} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <motion.button style={{ flex: 1, padding: '12px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }} whileTap={{ scale: 0.97 }} onClick={() => setPwStep(1)}>Back</motion.button>
                  <motion.button
                    style={{ flex: 2, padding: '12px', background: pwOtp.length === 6 && newPassword && confirmPassword ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : colors.actionBg, color: pwOtp.length === 6 && newPassword && confirmPassword ? '#fff' : colors.textSecondary, border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                    whileTap={{ scale: 0.97 }} onClick={submitChangePassword} disabled={pwLoading}
                  >
                    {pwLoading ? 'Changing...' : 'Change Password'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>


      {/* ─────────────────────────────────────── */}
      {/* CHANGE PIN MODAL                       */}
      {/* ─────────────────────────────────────── */}
      <Modal show={showChangePin} onClose={() => { setShowChangePin(false); setPinStep(1); setPinOtp(''); setNewPin(''); setConfirmPin(''); setPinError(''); }} colors={colors}>
        <StepHeader
          icon={<Shield size={24} color="#fff" />}
          title="Change PIN"
          subtitle={pinStep === 1 ? 'Step 1 of 2 — Verify identity' : 'Step 2 of 2 — Set new PIN'}
          steps={2}
          currentStep={pinStep}
        />
        <div style={{ padding: '16px' }}>
          <AnimatePresence mode="wait">
            {pinStep === 1 && (
              <motion.div key="pin-s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div style={{ background: colors.actionBg, borderRadius: '12px', padding: '12px 14px', marginBottom: '14px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={18} color="#1A73E8" />
                  </div>
                  <div>
                    <p style={{ color: colors.textSecondary, fontSize: '10px', margin: '0 0 2px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verification code will be sent to</p>
                    <p style={{ color: colors.text, fontSize: '13px', fontWeight: '700', margin: 0 }}>{user?.email}</p>
                  </div>
                </div>
                <p style={{ color: colors.textSecondary, fontSize: '12px', textAlign: 'center', margin: '0 0 14px 0', lineHeight: '1.6' }}>
                  Your PIN secures every transaction. We will verify your identity before allowing a PIN change.
                </p>
                <ErrorBox msg={pinError} />
                <motion.button
                  style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,115,232,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}
                  whileTap={{ scale: 0.97 }} onClick={sendPinOtp} disabled={pinLoading}
                >
                  {pinLoading ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>Sending...</motion.span> : <><Mail size={15} color="#fff" /> Send Verification Code</>}
                </motion.button>
                <motion.button
                  style={{ width: '100%', padding: '12px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer' }}
                  whileTap={{ scale: 0.97 }} onClick={() => { setShowChangePin(false); setPinStep(1); setPinOtp(''); setNewPin(''); setConfirmPin(''); setPinError(''); }}
                >Cancel</motion.button>
              </motion.div>
            )}
            {pinStep === 2 && (
              <motion.div key="pin-s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '10px', padding: '8px 12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#16A34A" style={{ flexShrink: 0 }} />
                  <div>
                    <p style={{ color: '#16A34A', fontSize: '11px', fontWeight: '700', margin: 0 }}>Code sent to {pinEmail}</p>
                    <p style={{ color: colors.textSecondary, fontSize: '10px', margin: 0 }}>Check inbox and spam folder</p>
                  </div>
                </div>
                <p style={{ color: colors.text, fontSize: '12px', fontWeight: '600', margin: '0 0 6px 0', textAlign: 'center' }}>Enter 6-Digit Code</p>
                <OtpInput value={pinOtp} onChange={setPinOtp} colors={colors} />
                <div style={{ textAlign: 'center', margin: '6px 0 12px' }}>
                  {pinCountdown > 0
                    ? <span style={{ color: colors.textSecondary, fontSize: '11px' }}>Resend in <strong style={{ color: colors.text }}>{pinCountdown}s</strong></span>
                    : <motion.span style={{ color: '#1A73E8', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }} whileTap={{ scale: 0.95 }} onClick={sendPinOtp}><RefreshCw size={11} /> Resend Code</motion.span>
                  }
                </div>
                <p style={{ color: colors.text, fontSize: '12px', fontWeight: '600', margin: '0 0 6px 0', textAlign: 'center' }}>New 4-Digit PIN</p>
                <PinInput value={newPin} onChange={setNewPin} label="Enter your new PIN" colors={colors} />
                <p style={{ color: colors.text, fontSize: '12px', fontWeight: '600', margin: '12px 0 6px 0', textAlign: 'center' }}>Confirm New PIN</p>
                <PinInput value={confirmPin} onChange={setConfirmPin} colors={colors}
                  label={confirmPin.length === 4 ? (confirmPin === newPin ? '✓ PINs match' : '✗ PINs do not match') : 'Re-enter your new PIN'}
                />
                <ErrorBox msg={pinError} />
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <motion.button style={{ flex: 1, padding: '12px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }} whileTap={{ scale: 0.97 }} onClick={() => setPinStep(1)}>Back</motion.button>
                  <motion.button
                    style={{ flex: 2, padding: '12px', background: pinOtp.length === 6 && newPin.length === 4 && confirmPin.length === 4 ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : colors.actionBg, color: pinOtp.length === 6 && newPin.length === 4 && confirmPin.length === 4 ? '#fff' : colors.textSecondary, border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                    whileTap={{ scale: 0.97 }} onClick={submitChangePin} disabled={pinLoading}
                  >
                    {pinLoading ? 'Changing...' : 'Change PIN'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>


      {/* ─────────────────────────────────────── */}
      {/* LOGOUT MODAL                           */}
      {/* ─────────────────────────────────────── */}
      <Modal show={showLogout} onClose={() => setShowLogout(false)} colors={colors}>
        <StepHeader icon={<LogOut size={24} color="#fff" />} title="Logout?" subtitle="You will need to sign in again" steps={0} currentStep={0} grad="linear-gradient(135deg, #DC2626, #B91C1C)" />
        <div style={{ padding: '16px' }}>
          <p style={{ color: colors.textSecondary, fontSize: '13px', textAlign: 'center', margin: '0 0 16px 0', lineHeight: '1.6' }}>
            Are you sure you want to logout? Your data will remain safe and secure.
          </p>
          <motion.button
            style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #DC2626, #B91C1C)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px', boxShadow: '0 4px 14px rgba(220,38,38,0.3)' }}
            whileTap={{ scale: 0.97 }} onClick={logout}
          >Yes, Logout</motion.button>
          <motion.button
            style={{ width: '100%', padding: '12px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer' }}
            whileTap={{ scale: 0.97 }} onClick={() => setShowLogout(false)}
          >Cancel</motion.button>
        </div>
      </Modal>

    </div>
  );
}
