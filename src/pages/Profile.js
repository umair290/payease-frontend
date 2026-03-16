import React, { useState, useEffect } from 'react';
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
  Phone, Calendar, CreditCard as IdCard, X
} from 'lucide-react';

// ── MODAL ──
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

// ── OTP INPUT ──
const OtpInput = ({ value, onChange, colors }) => (
  <div style={{ position: 'relative', marginBottom: '4px' }}>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px', border: `2px solid ${value.length === 6 ? '#1A73E8' : colors.border}`, borderRadius: '14px', background: colors.inputBg, transition: 'border-color 0.2s' }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <motion.div
          key={i}
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

// ── PIN INPUT ──
const PinInput = ({ value, onChange, label, colors }) => (
  <div style={{ marginBottom: '4px' }}>
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '14px', border: `2px solid ${value.length === 4 ? '#1A73E8' : colors.border}`, borderRadius: '14px', background: colors.inputBg, transition: 'border-color 0.2s' }}>
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
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

// ── ERROR BOX ──
const ErrorBox = ({ msg }) => msg ? (
  <motion.div
    style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
  >
    <AlertCircle size={14} color="#FF4444" style={{ flexShrink: 0 }} />
    <span style={{ color: '#FF4444', fontSize: '12px' }}>{msg}</span>
  </motion.div>
) : null;

export default function Profile() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [kycInfo, setKycInfo] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwStep, setPwStep] = useState(1);
  const [pwOtp, setPwOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwEmail, setPwEmail] = useState('');
  const [pwCountdown, setPwCountdown] = useState(0);
  const [devPwOtp, setDevPwOtp] = useState('');

  const [showChangePin, setShowChangePin] = useState(false);
  const [pinStep, setPinStep] = useState(1);
  const [pinOtp, setPinOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinEmail, setPinEmail] = useState('');
  const [pinCountdown, setPinCountdown] = useState(0);
  const [devPinOtp, setDevPinOtp] = useState('');

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (pwCountdown > 0) { const t = setTimeout(() => setPwCountdown(c => c - 1), 1000); return () => clearTimeout(t); }
  }, [pwCountdown]);

  useEffect(() => {
    if (pinCountdown > 0) { const t = setTimeout(() => setPinCountdown(c => c - 1), 1000); return () => clearTimeout(t); }
  }, [pinCountdown]);

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
    showToast('Wallet address copied!');
  };

  const sendPasswordOtp = async () => {
    setPwLoading(true); setPwError('');
    try {
      const res = await api.post('/api/otp/send', { purpose: 'change_password' });
      setPwEmail(res.data.email); setPwStep(2); setPwCountdown(60);
      if (res.data.dev_otp) setDevPwOtp(res.data.dev_otp);
    } catch (err) { setPwError(err.response?.data?.error || 'Failed to send OTP'); }
    setPwLoading(false);
  };

  const submitChangePassword = async () => {
    if (pwOtp.length !== 6) { setPwError('Enter the 6-digit OTP'); return; }
    if (newPassword.length < 6) { setPwError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match'); return; }
    setPwLoading(true); setPwError('');
    try {
      await api.post('/api/otp/change-password', { otp: pwOtp, new_password: newPassword });
      showToast('Password changed successfully!');
      setShowChangePassword(false);
      setPwStep(1); setPwOtp(''); setNewPassword(''); setConfirmPassword(''); setPwEmail(''); setPwCountdown(0); setDevPwOtp('');
    } catch (err) { setPwError(err.response?.data?.error || 'Failed'); }
    setPwLoading(false);
  };

  const sendPinOtp = async () => {
    setPinLoading(true); setPinError('');
    try {
      const res = await api.post('/api/otp/send', { purpose: 'change_pin' });
      setPinEmail(res.data.email); setPinStep(2); setPinCountdown(60);
      if (res.data.dev_otp) setDevPinOtp(res.data.dev_otp);
    } catch (err) { setPinError(err.response?.data?.error || 'Failed to send OTP'); }
    setPinLoading(false);
  };

  const submitChangePin = async () => {
    if (pinOtp.length !== 6) { setPinError('Enter the 6-digit OTP'); return; }
    if (newPin.length !== 4) { setPinError('PIN must be 4 digits'); return; }
    if (newPin !== confirmPin) { setPinError('PINs do not match'); return; }
    setPinLoading(true); setPinError('');
    try {
      await api.post('/api/otp/change-pin', { otp: pinOtp, new_pin: newPin });
      showToast('PIN changed successfully!');
      setShowChangePin(false);
      setPinStep(1); setPinOtp(''); setNewPin(''); setConfirmPin(''); setPinEmail(''); setPinCountdown(0); setDevPinOtp('');
    } catch (err) { setPinError(err.response?.data?.error || 'Failed'); }
    setPinLoading(false);
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: <User size={18} color="#1A73E8" />, label: 'Personal Information', sub: 'View your profile details', bg: 'rgba(26,115,232,0.1)', action: () => setShowPersonalInfo(true) },
        { icon: <CreditCard size={18} color="#9C27B0" />, label: 'Wallet Address', sub: balance?.wallet_number || 'Tap to copy', bg: 'rgba(156,39,176,0.1)', action: copyWallet, rightIcon: <Copy size={14} color="#9C27B0" /> },
        { icon: <FileText size={18} color="#FF6B35" />, label: 'KYC Verification', sub: kycInfo?.status === 'approved' ? '✓ Verified' : 'Verify your identity', bg: 'rgba(255,107,53,0.1)', action: () => navigate('/kyc') },
      ]
    },
    {
      title: 'Security',
      items: [
        { icon: <Key size={18} color="#00C853" />, label: 'Change Password', sub: 'Update your account password', bg: 'rgba(0,200,83,0.1)', action: () => setShowChangePassword(true) },
        { icon: <Shield size={18} color="#1A73E8" />, label: 'Change PIN', sub: 'Update your 4-digit transaction PIN', bg: 'rgba(26,115,232,0.1)', action: () => setShowChangePin(true) },
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

      {/* Toast */}
      <AnimatePresence>
        {toast.msg && (
          <motion.div
            style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? '#FF4444' : '#00C853', color: '#fff', padding: '12px 20px', borderRadius: '12px', zIndex: 9999, fontSize: '13px', fontWeight: 'bold', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
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
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
          <span style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>{balance?.full_name?.charAt(0).toUpperCase()}</span>
        </div>
        <h2 style={{ color: '#fff', fontSize: '19px', fontWeight: 'bold', margin: '0 0 3px 0' }}>{balance?.full_name}</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '0 0 10px 0' }}>{user?.email}</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0,200,83,0.2)', border: '1px solid rgba(0,200,83,0.4)', borderRadius: '20px', padding: '4px 12px' }}>
          <Shield size={11} color="#00FF6B" />
          <span style={{ color: '#00FF6B', fontSize: '11px', fontWeight: '600' }}>{kycInfo?.status === 'approved' ? 'KYC Verified' : 'KYC Pending'}</span>
        </div>
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

      {/* Menu */}
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
        <motion.button style={{ width: '100%', padding: '13px', background: 'rgba(255,68,68,0.08)', border: '1.5px solid rgba(255,68,68,0.25)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }} whileTap={{ scale: 0.97 }} onClick={() => setShowLogoutConfirm(true)}>
          <LogOut size={17} color="#FF4444" />
          <span style={{ color: '#FF4444', fontSize: '14px', fontWeight: '600' }}>Logout</span>
        </motion.button>
      </motion.div>

      {/* ── PERSONAL INFO MODAL ── */}
      <Modal show={showPersonalInfo} onClose={() => setShowPersonalInfo(false)} colors={colors}>
        <div style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', padding: '18px 20px 16px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
            <User size={24} color="#fff" />
          </div>
          <h3 style={{ color: '#fff', fontSize: '17px', fontWeight: 'bold', margin: '0 0 2px 0' }}>Personal Information</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: 0 }}>Your registered account details</p>
        </div>

        <div style={{ padding: '16px' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px', background: colors.actionBg, borderRadius: '12px', border: `1px solid ${colors.border}` }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>{balance?.full_name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p style={{ color: colors.text, fontSize: '15px', fontWeight: 'bold', margin: '0 0 2px 0' }}>{balance?.full_name}</p>
              <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>{user?.email}</p>
            </div>
          </div>

          {/* Info rows */}
          {[
            { icon: <User size={15} color="#1A73E8" />, label: 'Full Name', value: balance?.full_name || 'N/A', bg: 'rgba(26,115,232,0.1)' },
            { icon: <Mail size={15} color="#9C27B0" />, label: 'Email Address', value: user?.email || 'N/A', bg: 'rgba(156,39,176,0.1)' },
            { icon: <Phone size={15} color="#00C853" />, label: 'Phone Number', value: balance?.phone || user?.phone || 'N/A', bg: 'rgba(0,200,83,0.1)' },
            { icon: <IdCard size={15} color="#FF6B35" />, label: 'Identity Card No.', value: kycInfo?.cnic_number || 'Not submitted', bg: 'rgba(255,107,53,0.1)' },
            { icon: <Calendar size={15} color="#FFB300" />, label: 'Date of Birth', value: kycInfo?.date_of_birth || 'Not submitted', bg: 'rgba(255,179,0,0.1)' },
            { icon: <CreditCard size={15} color="#9C27B0" />, label: 'Wallet ID', value: balance?.wallet_number || 'N/A', bg: 'rgba(156,39,176,0.1)', copyable: true },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < 5 ? `1px solid ${colors.border}` : 'none' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {row.icon}
              </div>
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
                KYC Status: {kycInfo?.status === 'approved' ? 'Verified ✓' : kycInfo?.status === 'pending' ? 'Under Review' : 'Not Submitted'}
              </p>
              <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>
                {kycInfo?.status === 'approved' ? 'Your identity has been verified' : 'Complete KYC to unlock all features'}
              </p>
            </div>
          </div>

          <motion.button
            style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '14px', boxShadow: '0 4px 16px rgba(26,115,232,0.3)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowPersonalInfo(false)}
          >
            Close
          </motion.button>
        </div>
      </Modal>

      {/* ── CHANGE PASSWORD MODAL ── */}
      <Modal show={showChangePassword} onClose={() => { setShowChangePassword(false); setPwStep(1); setPwOtp(''); setNewPassword(''); setConfirmPassword(''); setPwError(''); setDevPwOtp(''); }} colors={colors}>
        <div style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', padding: '18px 20px 16px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
            <Key size={24} color="#fff" />
          </div>
          <h3 style={{ color: '#fff', fontSize: '17px', fontWeight: 'bold', margin: '0 0 3px 0' }}>Change Password</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: '0 0 12px 0' }}>
            {pwStep === 1 ? 'Step 1 of 2 — Verify identity' : 'Step 2 of 2 — Set new password'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
            {[1, 2].map(s => (
              <motion.div key={s} style={{ height: '3px', borderRadius: '2px', background: pwStep >= s ? '#fff' : 'rgba(255,255,255,0.25)' }} animate={{ width: pwStep === s ? '24px' : '10px' }} transition={{ duration: 0.3 }} />
            ))}
          </div>
        </div>

        <div style={{ padding: '16px' }}>
          <AnimatePresence mode="wait">
            {pwStep === 1 && (
              <motion.div key="pw-s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div style={{ background: colors.actionBg, borderRadius: '12px', padding: '12px 14px', marginBottom: '14px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={18} color="#1A73E8" />
                  </div>
                  <div>
                    <p style={{ color: colors.textSecondary, fontSize: '10px', margin: '0 0 2px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>OTP will be sent to</p>
                    <p style={{ color: colors.text, fontSize: '13px', fontWeight: '700', margin: 0 }}>{user?.email}</p>
                  </div>
                </div>
                <p style={{ color: colors.textSecondary, fontSize: '12px', textAlign: 'center', margin: '0 0 14px 0', lineHeight: '1.6' }}>
                  We'll send a 6-digit code to verify your identity.
                </p>
                <ErrorBox msg={pwError} />
                <motion.button style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,115,232,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}
                  whileTap={{ scale: 0.97 }} onClick={sendPasswordOtp} disabled={pwLoading}>
                  {pwLoading ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>Sending...</motion.span> : <><Mail size={15} color="#fff" /> Send Verification Code</>}
                </motion.button>
                <motion.button style={{ width: '100%', padding: '12px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer' }} whileTap={{ scale: 0.97 }} onClick={() => { setShowChangePassword(false); setPwStep(1); setPwOtp(''); setNewPassword(''); setConfirmPassword(''); setPwError(''); setDevPwOtp(''); }}>Cancel</motion.button>
              </motion.div>
            )}

            {pwStep === 2 && (
              <motion.div key="pw-s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div style={{ background: 'rgba(0,200,83,0.08)', border: '1px solid rgba(0,200,83,0.2)', borderRadius: '10px', padding: '8px 12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#00C853" style={{ flexShrink: 0 }} />
                  <div>
                    <p style={{ color: '#00C853', fontSize: '11px', fontWeight: '700', margin: 0 }}>Code sent to {pwEmail}</p>
                    <p style={{ color: colors.textSecondary, fontSize: '10px', margin: 0 }}>Check inbox & spam</p>
                  </div>
                </div>

                {devPwOtp && (
                  <motion.div style={{ background: colors.actionBg, border: `2px dashed ${colors.border}`, borderRadius: '12px', padding: '10px', marginBottom: '12px', textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p style={{ color: colors.textSecondary, fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0' }}>🔧 Dev OTP</p>
                    <p style={{ color: '#1A73E8', fontSize: '24px', fontWeight: 'bold', letterSpacing: '10px', fontFamily: 'monospace', margin: 0 }}>{devPwOtp}</p>
                  </motion.div>
                )}

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
                  <input style={{ flex: 1, padding: '11px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '13px', outline: 'none' }} type={showNewPw ? 'text' : 'password'} placeholder="Min 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowNewPw(!showNewPw)} style={{ cursor: 'pointer', padding: '4px' }}>
                    {showNewPw ? <EyeOff size={14} color={colors.textSecondary} /> : <Eye size={14} color={colors.textSecondary} />}
                  </motion.div>
                </div>

                <p style={{ color: colors.text, fontSize: '12px', fontWeight: '600', margin: '0 0 6px 0' }}>Confirm Password</p>
                <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${confirmPassword ? (confirmPassword === newPassword ? '#00C853' : '#FF4444') : colors.border}`, borderRadius: '10px', padding: '0 12px', background: colors.inputBg, marginBottom: '6px' }}>
                  <Lock size={14} color={colors.textSecondary} style={{ flexShrink: 0, marginRight: '8px' }} />
                  <input style={{ flex: 1, padding: '11px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '13px', outline: 'none' }} type={showConfirmPw ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowConfirmPw(!showConfirmPw)} style={{ cursor: 'pointer', padding: '4px' }}>
                    {showConfirmPw ? <EyeOff size={14} color={colors.textSecondary} /> : <Eye size={14} color={colors.textSecondary} />}
                  </motion.div>
                </div>

                {confirmPassword.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                    {confirmPassword === newPassword
                      ? <><CheckCircle size={12} color="#00C853" /><span style={{ color: '#00C853', fontSize: '11px', fontWeight: '600' }}>Passwords match</span></>
                      : <><AlertCircle size={12} color="#FF4444" /><span style={{ color: '#FF4444', fontSize: '11px', fontWeight: '600' }}>Passwords do not match</span></>
                    }
                  </div>
                )}

                <ErrorBox msg={pwError} />

                <div style={{ display: 'flex', gap: '8px' }}>
                  <motion.button style={{ flex: 1, padding: '12px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }} whileTap={{ scale: 0.97 }} onClick={() => setPwStep(1)}>Back</motion.button>
                  <motion.button style={{ flex: 2, padding: '12px', background: pwOtp.length === 6 && newPassword && confirmPassword ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : colors.actionBg, color: pwOtp.length === 6 && newPassword && confirmPassword ? '#fff' : colors.textSecondary, border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                    whileTap={{ scale: 0.97 }} onClick={submitChangePassword} disabled={pwLoading}>
                    {pwLoading ? 'Changing...' : 'Change Password'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      {/* ── CHANGE PIN MODAL ── */}
      <Modal show={showChangePin} onClose={() => { setShowChangePin(false); setPinStep(1); setPinOtp(''); setNewPin(''); setConfirmPin(''); setPinError(''); setDevPinOtp(''); }} colors={colors}>
        <div style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', padding: '18px 20px 16px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
            <Shield size={24} color="#fff" />
          </div>
          <h3 style={{ color: '#fff', fontSize: '17px', fontWeight: 'bold', margin: '0 0 3px 0' }}>Change PIN</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: '0 0 12px 0' }}>
            {pinStep === 1 ? 'Step 1 of 2 — Verify identity' : 'Step 2 of 2 — Set new PIN'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
            {[1, 2].map(s => (
              <motion.div key={s} style={{ height: '3px', borderRadius: '2px', background: pinStep >= s ? '#fff' : 'rgba(255,255,255,0.25)' }} animate={{ width: pinStep === s ? '24px' : '10px' }} transition={{ duration: 0.3 }} />
            ))}
          </div>
        </div>

        <div style={{ padding: '16px' }}>
          <AnimatePresence mode="wait">
            {pinStep === 1 && (
              <motion.div key="pin-s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div style={{ background: colors.actionBg, borderRadius: '12px', padding: '12px 14px', marginBottom: '14px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={18} color="#1A73E8" />
                  </div>
                  <div>
                    <p style={{ color: colors.textSecondary, fontSize: '10px', margin: '0 0 2px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>OTP will be sent to</p>
                    <p style={{ color: colors.text, fontSize: '13px', fontWeight: '700', margin: 0 }}>{user?.email}</p>
                  </div>
                </div>
                <p style={{ color: colors.textSecondary, fontSize: '12px', textAlign: 'center', margin: '0 0 14px 0', lineHeight: '1.6' }}>
                  Your PIN secures every transaction. Verify your identity first.
                </p>
                <ErrorBox msg={pinError} />
                <motion.button style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,115,232,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}
                  whileTap={{ scale: 0.97 }} onClick={sendPinOtp} disabled={pinLoading}>
                  {pinLoading ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>Sending...</motion.span> : <><Mail size={15} color="#fff" /> Send Verification Code</>}
                </motion.button>
                <motion.button style={{ width: '100%', padding: '12px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer' }} whileTap={{ scale: 0.97 }} onClick={() => { setShowChangePin(false); setPinStep(1); setPinOtp(''); setNewPin(''); setConfirmPin(''); setPinError(''); setDevPinOtp(''); }}>Cancel</motion.button>
              </motion.div>
            )}

            {pinStep === 2 && (
              <motion.div key="pin-s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div style={{ background: 'rgba(0,200,83,0.08)', border: '1px solid rgba(0,200,83,0.2)', borderRadius: '10px', padding: '8px 12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="#00C853" style={{ flexShrink: 0 }} />
                  <div>
                    <p style={{ color: '#00C853', fontSize: '11px', fontWeight: '700', margin: 0 }}>Code sent to {pinEmail}</p>
                    <p style={{ color: colors.textSecondary, fontSize: '10px', margin: 0 }}>Check inbox & spam</p>
                  </div>
                </div>

                {devPinOtp && (
                  <motion.div style={{ background: colors.actionBg, border: `2px dashed ${colors.border}`, borderRadius: '12px', padding: '10px', marginBottom: '12px', textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p style={{ color: colors.textSecondary, fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0' }}>🔧 Dev OTP</p>
                    <p style={{ color: '#1A73E8', fontSize: '24px', fontWeight: 'bold', letterSpacing: '10px', fontFamily: 'monospace', margin: 0 }}>{devPinOtp}</p>
                  </motion.div>
                )}

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
                  label={confirmPin.length === 4 ? (confirmPin === newPin ? '✓ PINs match' : '✗ PINs do not match') : 'Re-enter PIN'} />

                <ErrorBox msg={pinError} />

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <motion.button style={{ flex: 1, padding: '12px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }} whileTap={{ scale: 0.97 }} onClick={() => setPinStep(1)}>Back</motion.button>
                  <motion.button style={{ flex: 2, padding: '12px', background: pinOtp.length === 6 && newPin.length === 4 && confirmPin.length === 4 ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : colors.actionBg, color: pinOtp.length === 6 && newPin.length === 4 && confirmPin.length === 4 ? '#fff' : colors.textSecondary, border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                    whileTap={{ scale: 0.97 }} onClick={submitChangePin} disabled={pinLoading}>
                    {pinLoading ? 'Changing...' : 'Change PIN'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      {/* ── LOGOUT MODAL ── */}
      <Modal show={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} colors={colors}>
        <div style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', padding: '18px 20px 16px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
            <LogOut size={24} color="#fff" />
          </div>
          <h3 style={{ color: '#fff', fontSize: '17px', fontWeight: 'bold', margin: '0 0 2px 0' }}>Logout?</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: 0 }}>You will need to sign in again</p>
        </div>
        <div style={{ padding: '16px' }}>
          <p style={{ color: colors.textSecondary, fontSize: '13px', textAlign: 'center', margin: '0 0 16px 0', lineHeight: '1.6' }}>
            Are you sure you want to logout? Your data will remain safe and secure.
          </p>
          <motion.button style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #FF4444, #CC0000)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px', boxShadow: '0 4px 14px rgba(255,68,68,0.3)' }} whileTap={{ scale: 0.97 }} onClick={logout}>
            Yes, Logout
          </motion.button>
          <motion.button style={{ width: '100%', padding: '12px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer' }} whileTap={{ scale: 0.97 }} onClick={() => setShowLogoutConfirm(false)}>
            Cancel
          </motion.button>
        </div>
      </Modal>
    </div>
  );
}