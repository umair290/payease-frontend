import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService, logActivity } from '../services/api';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Mail, Lock, Eye, EyeOff,
  CheckCircle, RefreshCw, AlertCircle, Key, ArrowLeft,
  MapPin, Shield, X
} from 'lucide-react';

const API_URL = 'https://web-production-91d7.up.railway.app';

// ── Location Popup ──
const LocationPopup = ({ onAllow, onDeny }) => (
  <motion.div
    style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,25,0.9)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', boxSizing: 'border-box' }}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
  >
    <motion.div
      style={{ background: '#fff', borderRadius: '28px', width: '100%', maxWidth: '340px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}
      initial={{ scale: 0.82, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.82, opacity: 0, y: 50 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
    >
      <div style={{ background: 'linear-gradient(135deg,#1A1FEF,#1A73E8,#7C3AED)', padding: '28px 24px 22px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)' }} />
        <motion.div
          style={{ width: '68px', height: '68px', borderRadius: '22px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
        >
          <MapPin size={32} color="#fff" />
        </motion.div>
        <h3 style={{ color: '#fff', fontSize: '19px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>Allow Location</h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0, fontWeight: '500' }}>For your account security</p>
      </div>
      <div style={{ padding: '20px 20px 24px' }}>
        <div style={{ marginBottom: '16px' }}>
          {[
            { icon: <Shield size={14} color="#1A73E8" />,      bg: 'rgba(26,115,232,0.07)',  text: 'Verify your login location for security' },
            { icon: <MapPin size={14} color="#16A34A" />,      bg: 'rgba(22,163,74,0.07)',   text: 'Detect suspicious logins from new places' },
            { icon: <CheckCircle size={14} color="#7C3AED" />, bg: 'rgba(124,58,237,0.07)', text: 'Your location is never shared with others' },
          ].map((item, i) => (
            <motion.div key={i}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: item.bg, borderRadius: '12px', marginBottom: '6px' }}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
            >
              {item.icon}
              <span style={{ color: '#0F172A', fontSize: '12px', fontWeight: '600' }}>{item.text}</span>
            </motion.div>
          ))}
        </div>
        <motion.button
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', marginBottom: '8px', boxShadow: '0 6px 20px rgba(26,115,232,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          whileTap={{ scale: 0.97 }} onClick={onAllow}
        >
          <MapPin size={15} color="#fff" /> Allow Location Access
        </motion.button>
        <motion.button
          style={{ width: '100%', padding: '12px', background: 'transparent', color: '#94A3B8', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          whileTap={{ scale: 0.97 }} onClick={onDeny}
        >
          <X size={13} color="#94A3B8" /> Not Now
        </motion.button>
        <p style={{ color: '#94A3B8', fontSize: '10px', textAlign: 'center', margin: '10px 0 0 0', lineHeight: '1.6' }}>
          You can change this anytime in your browser settings
        </p>
      </div>
    </motion.div>
  </motion.div>
);

// ── Forgot Password Modal ──
const ForgotModal = ({ show, onClose }) => {
  const [step,            setStep]            = useState(1);
  const [email,           setEmail]           = useState('');
  const [otp,             setOtp]             = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw,          setShowPw]          = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [countdown,       setCountdown]       = useState(0);
  const [success,         setSuccess]         = useState(false);

  useEffect(() => {
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t); }
  }, [countdown]);

  const resetForm  = () => { setStep(1); setEmail(''); setOtp(''); setNewPassword(''); setConfirmPassword(''); setError(''); setCountdown(0); setSuccess(false); };
  const handleClose = () => { resetForm(); onClose(); };

  const sendOtp = async () => {
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API_URL}/api/otp/forgot-password/send`, { email });
      setStep(2); setCountdown(60);
    } catch (err) { setError(err.response?.data?.error || 'No account found with this email'); }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (otp.length !== 6)                { setError('Enter the 6-digit OTP'); return; }
    if (newPassword.length < 6)          { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API_URL}/api/otp/forgot-password/reset`, { email, otp, new_password: newPassword });
      setSuccess(true);
    } catch (err) { setError(err.response?.data?.error || 'Failed to reset password'); }
    setLoading(false);
  };

  if (!show) return null;

  const iStyle = (active) => ({
    display: 'flex', alignItems: 'center',
    border: `2px solid ${active ? '#1A73E8' : '#E2E8F0'}`,
    borderRadius: '13px', padding: '0 14px',
    background: '#F8FAFF', transition: 'all 0.2s',
    boxShadow: active ? '0 0 0 4px rgba(26,115,232,0.1)' : 'none',
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, padding: '20px', boxSizing: 'border-box' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div style={{ position: 'absolute', inset: 0, background: 'rgba(5,10,25,0.9)', backdropFilter: 'blur(12px)' }} onClick={handleClose} />
          <motion.div
            style={{ background: '#fff', borderRadius: '26px', width: '100%', maxWidth: '360px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1 }}
            initial={{ scale: 0.82, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.82, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ background: success ? 'linear-gradient(135deg,#134E5E,#16A34A)' : 'linear-gradient(135deg,#1A1FEF,#1A73E8,#7C3AED)', padding: '22px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />
              {step === 2 && !success && (
                <motion.div style={{ position: 'absolute', top: '16px', left: '16px', width: '34px', height: '34px', borderRadius: '11px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  whileTap={{ scale: 0.9 }} onClick={() => { setStep(1); setOtp(''); setError(''); }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <ArrowLeft size={16} color="#fff" />
                </motion.div>
              )}
              <motion.div
                style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '1px solid rgba(255,255,255,0.2)' }}
                initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              >
                {success ? <CheckCircle size={26} color="#fff" /> : <Key size={26} color="#fff" />}
              </motion.div>
              <motion.h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '800', margin: '0 0 3px 0', letterSpacing: '-0.3px' }}
                key={`t-${step}-${success}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                {success ? 'Password Reset!' : step === 1 ? 'Forgot Password?' : 'Reset Password'}
              </motion.h3>
              <motion.p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 14px 0', fontWeight: '500' }}
                key={`s-${step}-${success}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                {success ? 'Login with your new password' : step === 1 ? 'Enter your email for a reset code' : `Code sent to ${email}`}
              </motion.p>
              {!success && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                  {[1,2].map(s => (
                    <motion.div key={s} style={{ height: '3px', borderRadius: '2px', background: step >= s ? '#fff' : 'rgba(255,255,255,0.25)' }}
                      animate={{ width: step === s ? '24px' : '10px' }} transition={{ duration: 0.3 }} />
                  ))}
                </div>
              )}
            </div>

            {/* Body */}
            <div style={{ padding: '18px' }}>
              {success ? (
                <motion.div style={{ textAlign: 'center', padding: '8px 0' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <motion.div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
                    <CheckCircle size={30} color="#16A34A" />
                  </motion.div>
                  <p style={{ color: '#0F172A', fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>All Done!</p>
                  <p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 16px 0', lineHeight: '1.6' }}>Your password has been reset. Login with your new password.</p>
                  <motion.button style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '13px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,115,232,0.35)' }}
                    whileTap={{ scale: 0.97 }} onClick={handleClose}>Back to Login</motion.button>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="f1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <p style={{ color: '#94A3B8', fontSize: '12px', textAlign: 'center', margin: '0 0 14px 0', lineHeight: '1.6', fontWeight: '500' }}>
                        Enter your registered email and we'll send a 6-digit verification code.
                      </p>
                      <div style={iStyle(!!email)}>
                        <Mail size={15} color={email ? '#1A73E8' : '#94A3B8'} style={{ marginRight: '10px', flexShrink: 0 }} />
                        <input style={{ flex: 1, padding: '13px 0', border: 'none', background: 'transparent', color: '#0F172A', fontSize: '14px', outline: 'none', fontWeight: '500' }}
                          type="email" placeholder="your@email.com" value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(''); }}
                          onKeyPress={(e) => e.key === 'Enter' && sendOtp()} autoFocus />
                      </div>
                      {error && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '10px', padding: '8px 12px', margin: '10px 0', display: 'flex', alignItems: 'center', gap: '7px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <AlertCircle size={13} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '12px' }}>{error}</span>
                      </motion.div>}
                      <motion.button style={{ width: '100%', padding: '13px', marginTop: '12px', background: email ? 'linear-gradient(135deg,#1A73E8,#7C3AED)' : '#F1F5F9', color: email ? '#fff' : '#94A3B8', border: 'none', borderRadius: '13px', fontSize: '14px', fontWeight: '800', cursor: email ? 'pointer' : 'default', boxShadow: email ? '0 6px 20px rgba(26,115,232,0.35)' : 'none', marginBottom: '8px', transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}
                        whileTap={email ? { scale: 0.97 } : {}} onClick={sendOtp} disabled={loading}>
                        {loading
                          ? <motion.span animate={{ opacity: [1,0.4,1] }} transition={{ duration: 1, repeat: Infinity }}>Sending...</motion.span>
                          : <><Mail size={14} color={email ? '#fff' : '#94A3B8'} /> Send Code</>
                        }
                      </motion.button>
                      <motion.button style={{ width: '100%', padding: '11px', background: 'transparent', color: '#94A3B8', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
                        whileTap={{ scale: 0.97 }} onClick={handleClose}>Cancel</motion.button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="f2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div style={{ background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '11px', background: 'linear-gradient(135deg,#16A34A,#15803D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
                          <CheckCircle size={16} color="#fff" />
                        </div>
                        <div>
                          <p style={{ color: '#16A34A', fontSize: '12px', fontWeight: '800', margin: 0 }}>Code sent!</p>
                          <p style={{ color: '#94A3B8', fontSize: '11px', margin: 0 }}>Check inbox at {email}</p>
                        </div>
                      </div>

                      <p style={{ color: '#0F172A', fontSize: '12px', fontWeight: '700', margin: '0 0 8px 0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>6-Digit Code</p>
                      <div style={{ position: 'relative', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', padding: '10px', border: `2px solid ${otp.length === 6 ? '#1A73E8' : '#E2E8F0'}`, borderRadius: '14px', background: '#F8FAFF', transition: 'all 0.2s', boxShadow: otp.length === 6 ? '0 0 0 4px rgba(26,115,232,0.1)' : 'none' }}>
                          {[0,1,2,3,4,5].map(i => (
                            <motion.div key={i} style={{ width: '32px', height: '38px', borderRadius: '10px', border: `2px solid ${i < otp.length ? '#1A73E8' : '#CBD5E1'}`, background: i < otp.length ? 'rgba(26,115,232,0.1)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                              animate={{ scale: i === otp.length - 1 ? [1,1.1,1] : 1 }} transition={{ duration: 0.15 }}>
                              <motion.div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1A73E8' }}
                                animate={{ scale: i < otp.length ? 1 : 0, opacity: i < otp.length ? 1 : 0 }} transition={{ duration: 0.15 }} />
                            </motion.div>
                          ))}
                        </div>
                        <input style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'text', zIndex: 1 }}
                          type="tel" inputMode="numeric" maxLength={6} value={otp}
                          onChange={(e) => { setOtp(e.target.value.slice(0,6).replace(/\D/g,'')); setError(''); }} autoFocus />
                      </div>

                      <div style={{ textAlign: 'center', margin: '6px 0 12px' }}>
                        {countdown > 0
                          ? <span style={{ color: '#94A3B8', fontSize: '11px', fontWeight: '500' }}>Resend in <strong style={{ color: '#0F172A' }}>{countdown}s</strong></span>
                          : <motion.span style={{ color: '#1A73E8', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }} whileTap={{ scale: 0.95 }} onClick={sendOtp}>
                              <RefreshCw size={11} /> Resend Code
                            </motion.span>
                        }
                      </div>

                      <div style={{ ...iStyle(!!newPassword), marginBottom: '8px' }}>
                        <Lock size={14} color={newPassword ? '#1A73E8' : '#94A3B8'} style={{ marginRight: '8px', flexShrink: 0 }} />
                        <input style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: '#0F172A', fontSize: '13px', outline: 'none', fontWeight: '500' }}
                          type={showPw ? 'text' : 'password'} placeholder="New password (min 6 chars)"
                          value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setError(''); }} />
                        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowPw(!showPw)} style={{ cursor: 'pointer', display: 'flex' }}>
                          {showPw ? <EyeOff size={14} color="#94A3B8" /> : <Eye size={14} color="#94A3B8" />}
                        </motion.div>
                      </div>

                      <div style={{ ...iStyle(!!confirmPassword), borderColor: confirmPassword ? (confirmPassword === newPassword ? '#16A34A' : '#DC2626') : '#E2E8F0', marginBottom: '6px' }}>
                        <Lock size={14} color={confirmPassword ? (confirmPassword === newPassword ? '#16A34A' : '#DC2626') : '#94A3B8'} style={{ marginRight: '8px', flexShrink: 0 }} />
                        <input style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: '#0F172A', fontSize: '13px', outline: 'none', fontWeight: '500' }}
                          type={showConfirm ? 'text' : 'password'} placeholder="Confirm new password"
                          value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} />
                        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowConfirm(!showConfirm)} style={{ cursor: 'pointer', display: 'flex' }}>
                          {showConfirm ? <EyeOff size={14} color="#94A3B8" /> : <Eye size={14} color="#94A3B8" />}
                        </motion.div>
                      </div>

                      {confirmPassword.length > 0 && (
                        <motion.div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          {confirmPassword === newPassword
                            ? <><CheckCircle size={11} color="#16A34A" /><span style={{ color: '#16A34A', fontSize: '11px', fontWeight: '700' }}>Passwords match</span></>
                            : <><AlertCircle size={11} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '11px', fontWeight: '700' }}>Passwords do not match</span></>
                          }
                        </motion.div>
                      )}

                      {error && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '10px', padding: '8px 12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <AlertCircle size={12} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '12px' }}>{error}</span>
                      </motion.div>}

                      <motion.button
                        style={{ width: '100%', padding: '13px', background: otp.length === 6 && newPassword && confirmPassword === newPassword ? 'linear-gradient(135deg,#1A73E8,#7C3AED)' : '#F1F5F9', color: otp.length === 6 && newPassword && confirmPassword === newPassword ? '#fff' : '#94A3B8', border: 'none', borderRadius: '13px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.25s', boxShadow: otp.length === 6 && newPassword && confirmPassword === newPassword ? '0 6px 20px rgba(26,115,232,0.35)' : 'none' }}
                        whileTap={{ scale: 0.97 }} onClick={resetPassword} disabled={loading}>
                        {loading
                          ? <motion.span animate={{ opacity: [1,0.4,1] }} transition={{ duration: 1, repeat: Infinity }}>Resetting...</motion.span>
                          : 'Reset Password'
                        }
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Main Login ──
export default function Login() {
  const [showSplash,        setShowSplash]        = useState(true);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [locationGranted,   setLocationGranted]   = useState(false);
  const [locationData,      setLocationData]      = useState(null);
  const [email,             setEmail]             = useState('');
  const [password,          setPassword]          = useState('');
  const [error,             setError]             = useState('');
  const [loading,           setLoading]           = useState(false);
  const [showPassword,      setShowPassword]      = useState(false);
  const [focusedField,      setFocusedField]      = useState(null);
  const [showForgot,        setShowForgot]        = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      setShowSplash(false);
      const asked = sessionStorage.getItem('payease_location_asked');
      if (!asked) setTimeout(() => setShowLocationPopup(true), 500);
    }, 2600);
    return () => clearTimeout(t);
  }, []);

  const handleAllowLocation = () => {
    setShowLocationPopup(false);
    sessionStorage.setItem('payease_location_asked', 'true');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationData({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setLocationGranted(true);
        },
        () => setLocationGranted(false),
        { timeout: 8000 }
      );
    }
  };

  const handleDenyLocation = () => {
    setShowLocationPopup(false);
    sessionStorage.setItem('payease_location_asked', 'true');
  };

  // ── UPDATED: passes refresh token to AuthContext ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res          = await authService.login({
        email,
        password,
        ...(locationData && locationData),
      });
      const userData     = res.data.user;
      const accessToken  = res.data.access_token;
      const refreshToken = res.data.refresh_token;  // ← new

      // Pass refresh token to AuthContext
      login(userData, accessToken, refreshToken);   // ← updated

      setTimeout(() => {
        const loc = locationData
          ? `${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`
          : 'not shared';
        logActivity('User Login', `Logged in from web — Location: ${loc}`);
      }, 600);

      if (userData?.is_admin) { navigate('/admin'); return; }

      // Onboarding check (will be moved to DB in next phase)
      const onboardingKey = `payease_onboarded_${email.toLowerCase().trim()}`;
      if (!localStorage.getItem(onboardingKey)) {
        localStorage.setItem('payease_pending_onboard_email', email.toLowerCase().trim());
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#060B18 0%,#0D1B35 50%,#0A0F1E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', position: 'relative' }}>

      {/* Background blobs */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(26,115,232,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <AnimatePresence>
        {showLocationPopup && <LocationPopup onAllow={handleAllowLocation} onDeny={handleDenyLocation} />}
      </AnimatePresence>

      <ForgotModal show={showForgot} onClose={() => setShowForgot(false)} />

      <AnimatePresence mode="wait">

        {/* ── SPLASH ── */}
        {showSplash ? (
          <motion.div key="splash"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', position: 'relative', zIndex: 1 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.4 }}
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 180 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <motion.div
                style={{ width: '96px', height: '96px', borderRadius: '30px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}
                animate={{ boxShadow: ['0 20px 50px rgba(26,115,232,0.5)','0 20px 80px rgba(26,115,232,0.8)','0 20px 50px rgba(26,115,232,0.5)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span style={{ color: '#fff', fontSize: '48px', fontWeight: '800' }}>P</span>
              </motion.div>
              <motion.h1 style={{ color: '#fff', fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-1px' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                PayEase
              </motion.h1>
              <motion.p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', margin: '0 0 52px 0', fontWeight: '500' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                Smart Wallet System
              </motion.p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1A73E8' }}
                    animate={{ scale: [1,1.6,1], opacity: [0.4,1,0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

        ) : (

          // ── LOGIN FORM ──
          <motion.div key="login"
            style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          >
            <motion.div
              style={{ background: 'rgba(15,22,41,0.95)', backdropFilter: 'blur(20px)', borderRadius: '28px', padding: '40px 36px', width: '100%', maxWidth: '420px', boxSizing: 'border-box', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Logo */}
              <motion.div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', justifyContent: 'center' }}
                initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(26,115,232,0.4)' }}>
                  <span style={{ color: '#fff', fontSize: '22px', fontWeight: '800' }}>P</span>
                </div>
                <span style={{ color: '#fff', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>PayEase</span>
              </motion.div>

              <motion.h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', textAlign: 'center', letterSpacing: '-0.5px' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                Welcome Back
              </motion.h2>
              <motion.p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', textAlign: 'center', margin: '0 0 24px 0', fontWeight: '500' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                Sign in to your account
              </motion.p>

              {/* Location badge */}
              <AnimatePresence>
                {locationGranted && (
                  <motion.div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '20px', padding: '6px 14px', marginBottom: '16px', width: 'fit-content', margin: '0 auto 16px' }}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <MapPin size={11} color="#16A34A" />
                    <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: '700' }}>Location verified for security</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', color: '#FCA5A5', padding: '11px 14px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <AlertCircle size={14} color="#FCA5A5" style={{ flexShrink: 0 }} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.form onSubmit={handleLogin} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>

                {/* Email */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Email Address</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${focusedField === 'email' ? '#1A73E8' : 'rgba(255,255,255,0.08)'}`, borderRadius: '14px', padding: '0 16px', background: 'rgba(255,255,255,0.04)', transition: 'all 0.2s', boxShadow: focusedField === 'email' ? '0 0 0 4px rgba(26,115,232,0.15)' : 'none' }}>
                    <Mail size={16} color={focusedField === 'email' ? '#1A73E8' : 'rgba(255,255,255,0.3)'} style={{ flexShrink: 0, marginRight: '10px' }} />
                    <input style={{ flex: 1, padding: '14px 0', border: 'none', background: 'transparent', color: '#fff', fontSize: '14px', outline: 'none', fontWeight: '500' }}
                      type="email" placeholder="example@gmail.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} required />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Password</label>
                    <motion.span style={{ color: '#1A73E8', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      whileTap={{ scale: 0.92 }} onClick={(e) => { e.preventDefault(); setShowForgot(true); }}>
                      Forgot Password?
                    </motion.span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${focusedField === 'password' ? '#1A73E8' : 'rgba(255,255,255,0.08)'}`, borderRadius: '14px', padding: '0 16px', background: 'rgba(255,255,255,0.04)', transition: 'all 0.2s', boxShadow: focusedField === 'password' ? '0 0 0 4px rgba(26,115,232,0.15)' : 'none' }}>
                    <Lock size={16} color={focusedField === 'password' ? '#1A73E8' : 'rgba(255,255,255,0.3)'} style={{ flexShrink: 0, marginRight: '10px' }} />
                    <input style={{ flex: 1, padding: '14px 0', border: 'none', background: 'transparent', color: '#fff', fontSize: '14px', outline: 'none', fontWeight: '500' }}
                      type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} required />
                    <motion.span style={{ cursor: 'pointer', opacity: 0.5, display: 'flex', flexShrink: 0 }}
                      onClick={() => setShowPassword(!showPassword)} whileTap={{ scale: 0.9 }}>
                      {showPassword ? <EyeOff size={16} color="#fff" /> : <Eye size={16} color="#fff" />}
                    </motion.span>
                  </div>
                </div>

                {/* Login button */}
                <motion.button
                  style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 28px rgba(26,115,232,0.4)', marginBottom: '16px', opacity: loading ? 0.85 : 1, letterSpacing: '0.2px' }}
                  type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                >
                  {loading
                    ? <motion.span animate={{ opacity: [1,0.5,1] }} transition={{ duration: 1, repeat: Infinity }}>Signing in...</motion.span>
                    : 'Log In'
                  }
                </motion.button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', fontWeight: '600' }}>New to PayEase?</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                </div>

                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <motion.button type="button"
                    style={{ width: '100%', padding: '14px', background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxSizing: 'border-box' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Create an Account
                  </motion.button>
                </Link>
              </motion.form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
