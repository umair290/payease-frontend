import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Mail, Lock, Eye, EyeOff,
  CheckCircle, RefreshCw, AlertCircle, Key, ArrowLeft
} from 'lucide-react';

const API_URL = 'https://web-production-91d7.up.railway.app';

const ForgotModal = ({ show, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const resetForm = () => {
    setStep(1); setEmail(''); setOtp(''); setNewPassword('');
    setConfirmPassword(''); setError(''); setDevOtp('');
    setCountdown(0); setSuccess(false);
    setShowPw(false); setShowConfirm(false);
  };

  const handleClose = () => { resetForm(); onClose(); };

  const sendOtp = async () => {
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_URL}/api/otp/forgot-password/send`, { email });
      setDevOtp(res.data.dev_otp || '');
      setStep(2);
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.error || 'No account found with this email');
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API_URL}/api/otp/forgot-password/reset`, {
        email, otp, new_password: newPassword
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    }
    setLoading(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', boxSizing: 'border-box' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10,20,50,0.85)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '360px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.4)', position: 'relative', zIndex: 1 }}
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', padding: '20px', textAlign: 'center', position: 'relative' }}>
              {step === 2 && !success && (
                <motion.div
                  style={{ position: 'absolute', top: '16px', left: '16px', width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setStep(1); setOtp(''); setError(''); }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  <ArrowLeft size={16} color="#fff" />
                </motion.div>
              )}

              <motion.div
                style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              >
                {success ? <CheckCircle size={24} color="#fff" /> : <Key size={24} color="#fff" />}
              </motion.div>

              <motion.h3
                style={{ color: '#fff', fontSize: '17px', fontWeight: 'bold', margin: '0 0 3px 0' }}
                key={`title-${step}-${success}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              >
                {success ? '🎉 Password Reset!' : step === 1 ? 'Forgot Password?' : 'Reset Password'}
              </motion.h3>

              <motion.p
                style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: '0 0 12px 0' }}
                key={`sub-${step}-${success}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              >
                {success ? 'You can now login with your new password'
                  : step === 1 ? 'Enter your email to receive a reset code'
                  : `Code sent to ${email}`}
              </motion.p>

              {!success && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                  {[1, 2].map(s => (
                    <motion.div key={s}
                      style={{ height: '3px', borderRadius: '2px', background: step >= s ? '#fff' : 'rgba(255,255,255,0.3)' }}
                      animate={{ width: step === s ? '24px' : '10px' }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Body */}
            <div style={{ padding: '16px' }}>
              {success ? (
                <motion.div style={{ textAlign: 'center', padding: '8px 0' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                  <motion.div
                    style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0,200,83,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  >
                    <CheckCircle size={28} color="#00C853" />
                  </motion.div>
                  <p style={{ color: '#1A1A2E', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>All Done!</p>
                  <p style={{ color: '#888', fontSize: '12px', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                    Your password has been reset. Login with your new password.
                  </p>
                  <motion.button
                    style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 16px rgba(26,115,232,0.3)' }}
                    whileTap={{ scale: 0.97 }} onClick={handleClose}
                  >
                    Back to Login
                  </motion.button>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {/* Step 1 */}
                  {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <p style={{ color: '#888', fontSize: '12px', textAlign: 'center', margin: '0 0 14px 0', lineHeight: '1.6' }}>
                        Enter your registered email and we'll send a 6-digit verification code.
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${email ? '#1A73E8' : '#CBD5E0'}`, borderRadius: '12px', padding: '0 14px', background: '#F8FAFF', marginBottom: '12px', transition: 'all 0.2s', boxShadow: email ? '0 0 0 3px rgba(26,115,232,0.08)' : 'none' }}>
                        <Mail size={15} color={email ? '#1A73E8' : '#94A3B8'} style={{ flexShrink: 0, marginRight: '10px', transition: 'color 0.2s' }} />
                        <input
                          style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: '#1A1A2E', fontSize: '14px', outline: 'none' }}
                          type="email" placeholder="your@email.com"
                          value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                          onKeyPress={(e) => e.key === 'Enter' && sendOtp()}
                          autoFocus
                        />
                      </div>

                      {error && (
                        <motion.div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '10px', padding: '8px 12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                          <AlertCircle size={13} color="#FF4444" />
                          <span style={{ color: '#FF4444', fontSize: '12px' }}>{error}</span>
                        </motion.div>
                      )}

                      <motion.button
                        style={{ width: '100%', padding: '13px', background: email ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : '#E2E8F0', color: email ? '#fff' : '#94A3B8', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: email ? 'pointer' : 'not-allowed', boxShadow: email ? '0 4px 16px rgba(26,115,232,0.3)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', transition: 'all 0.25s' }}
                        whileTap={email ? { scale: 0.97 } : {}} onClick={sendOtp} disabled={loading}
                      >
                        {loading
                          ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>Sending code...</motion.span>
                          : <><Mail size={15} color={email ? '#fff' : '#94A3B8'} /> Send Verification Code</>
                        }
                      </motion.button>

                      <motion.button
                        style={{ width: '100%', padding: '11px', background: 'transparent', color: '#94A3B8', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '13px', cursor: 'pointer' }}
                        whileTap={{ scale: 0.97 }} onClick={handleClose}
                      >
                        Cancel
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

                      {/* Dev OTP */}
                      {devOtp && (
                        <motion.div
                          style={{ background: '#EEF2FF', border: '1.5px dashed #1A73E8', borderRadius: '12px', padding: '8px 12px', marginBottom: '12px', textAlign: 'center' }}
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        >
                          <p style={{ color: '#64748B', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 3px 0' }}>🔧 Dev Mode OTP</p>
                          <p style={{ color: '#1A73E8', fontSize: '22px', fontWeight: 'bold', letterSpacing: '10px', fontFamily: 'monospace', margin: 0 }}>{devOtp}</p>
                        </motion.div>
                      )}

                      {/* OTP Boxes */}
                      <p style={{ color: '#1A1A2E', fontSize: '12px', fontWeight: '600', margin: '0 0 6px 0', textAlign: 'center' }}>Enter 6-Digit Verification Code</p>
                      <div style={{ position: 'relative', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', padding: '10px', border: `2px solid ${otp.length === 6 ? '#1A73E8' : '#CBD5E0'}`, borderRadius: '14px', background: '#EEF2FF', transition: 'all 0.2s', boxShadow: otp.length === 6 ? '0 0 0 3px rgba(26,115,232,0.08)' : 'none' }}>
                          {[0, 1, 2, 3, 4, 5].map(i => (
                            <motion.div
                              key={i}
                              style={{
                                width: '30px', height: '36px', borderRadius: '10px',
                                border: `2px solid ${i < otp.length ? '#1A73E8' : '#94A3B8'}`,
                                background: i < otp.length ? 'rgba(26,115,232,0.12)' : '#E2E8F0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                                boxShadow: i < otp.length ? '0 2px 8px rgba(26,115,232,0.2)' : 'inset 0 1px 3px rgba(0,0,0,0.08)',
                              }}
                              animate={{ scale: i === otp.length - 1 ? [1, 1.12, 1] : 1 }}
                              transition={{ duration: 0.15 }}
                            >
                              <span style={{ color: '#1A73E8', fontSize: '14px', fontWeight: 'bold' }}>
                                {otp[i] ? '●' : ''}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                        <input
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'text', zIndex: 1 }}
                          type="tel" inputMode="numeric" maxLength={6} value={otp}
                          onChange={(e) => { setOtp(e.target.value.slice(0, 6).replace(/\D/g, '')); setError(''); }}
                          autoFocus
                        />
                      </div>

                      {/* Resend */}
                      <div style={{ textAlign: 'center', margin: '4px 0 10px' }}>
                        {countdown > 0
                          ? <span style={{ color: '#94A3B8', fontSize: '11px' }}>Resend in <strong style={{ color: '#1A1A2E' }}>{countdown}s</strong></span>
                          : <motion.span style={{ color: '#1A73E8', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }} whileTap={{ scale: 0.95 }} onClick={sendOtp}>
                              <RefreshCw size={11} /> Resend Code
                            </motion.span>
                        }
                      </div>

                      {/* New Password */}
                      <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${newPassword ? '#1A73E8' : '#CBD5E0'}`, borderRadius: '11px', padding: '0 12px', background: '#F8FAFF', marginBottom: '8px', transition: 'all 0.2s', boxShadow: newPassword ? '0 0 0 3px rgba(26,115,232,0.08)' : 'none' }}>
                        <Lock size={14} color={newPassword ? '#1A73E8' : '#94A3B8'} style={{ flexShrink: 0, marginRight: '8px', transition: 'color 0.2s' }} />
                        <input
                          style={{ flex: 1, padding: '11px 0', border: 'none', background: 'transparent', color: '#1A1A2E', fontSize: '13px', outline: 'none' }}
                          type={showPw ? 'text' : 'password'} placeholder="New password (min 6 chars)"
                          value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                        />
                        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowPw(!showPw)} style={{ cursor: 'pointer', padding: '4px' }}>
                          {showPw ? <EyeOff size={14} color="#94A3B8" /> : <Eye size={14} color="#94A3B8" />}
                        </motion.div>
                      </div>

                      {/* Confirm Password */}
                      <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${confirmPassword ? (confirmPassword === newPassword ? '#00C853' : '#FF4444') : '#CBD5E0'}`, borderRadius: '11px', padding: '0 12px', background: '#F8FAFF', marginBottom: '6px', transition: 'all 0.2s' }}>
                        <Lock size={14} color={confirmPassword ? (confirmPassword === newPassword ? '#00C853' : '#FF4444') : '#94A3B8'} style={{ flexShrink: 0, marginRight: '8px', transition: 'color 0.2s' }} />
                        <input
                          style={{ flex: 1, padding: '11px 0', border: 'none', background: 'transparent', color: '#1A1A2E', fontSize: '13px', outline: 'none' }}
                          type={showConfirm ? 'text' : 'password'} placeholder="Confirm new password"
                          value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                        />
                        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowConfirm(!showConfirm)} style={{ cursor: 'pointer', padding: '4px' }}>
                          {showConfirm ? <EyeOff size={14} color="#94A3B8" /> : <Eye size={14} color="#94A3B8" />}
                        </motion.div>
                      </div>

                      {/* Match indicator */}
                      {confirmPassword.length > 0 && (
                        <motion.div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          {confirmPassword === newPassword
                            ? <><CheckCircle size={12} color="#00C853" /><span style={{ color: '#00C853', fontSize: '11px', fontWeight: '600' }}>Passwords match</span></>
                            : <><AlertCircle size={12} color="#FF4444" /><span style={{ color: '#FF4444', fontSize: '11px', fontWeight: '600' }}>Passwords do not match</span></>
                          }
                        </motion.div>
                      )}

                      {error && (
                        <motion.div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '10px', padding: '8px 12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <AlertCircle size={13} color="#FF4444" />
                          <span style={{ color: '#FF4444', fontSize: '12px' }}>{error}</span>
                        </motion.div>
                      )}

                      <motion.button
                        style={{ width: '100%', padding: '13px', background: otp.length === 6 && newPassword && confirmPassword === newPassword ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : '#E2E8F0', color: otp.length === 6 && newPassword && confirmPassword === newPassword ? '#fff' : '#94A3B8', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: otp.length === 6 ? '0 4px 16px rgba(26,115,232,0.3)' : 'none', transition: 'all 0.25s' }}
                        whileTap={{ scale: 0.97 }} onClick={resetPassword} disabled={loading}
                      >
                        {loading
                          ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>Resetting...</motion.span>
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

export default function Login() {
  const [showSplash, setShowSplash] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showForgot, setShowForgot] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authService.login({ email, password });
      login(res.data.user, res.data.access_token);
      if (res.data.user?.is_admin) navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <ForgotModal show={showForgot} onClose={() => setShowForgot(false)} />

      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div key="splash" style={styles.splash}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.4 }}>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 200 }}
              style={styles.splashLogoWrapper}
            >
              <motion.div
                style={styles.splashLogo}
                animate={{ boxShadow: ['0 20px 50px rgba(26,115,232,0.5)', '0 20px 70px rgba(26,115,232,0.8)', '0 20px 50px rgba(26,115,232,0.5)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span style={styles.splashLogoP}>P</span>
              </motion.div>
              <motion.h1 style={styles.splashTitle} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                PayEase
              </motion.h1>
              <motion.p style={styles.splashTagline} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                Smart Wallet System
              </motion.p>
            </motion.div>
            <motion.div style={styles.splashDots} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} style={styles.dot}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="login" style={styles.pageWrapper}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <motion.div style={styles.card}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}>

              {/* Logo */}
              <motion.div style={styles.logoRow} initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div style={styles.logoIcon}><span style={styles.logoP}>P</span></div>
                <span style={styles.logoText}>PayEase</span>
              </motion.div>

              <motion.h2 style={styles.welcomeTitle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                Welcome Back 👋
              </motion.h2>
              <motion.p style={styles.welcomeSub} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                Sign in to your account
              </motion.p>

              <AnimatePresence>
                {error && (
                  <motion.div style={styles.errorBox}
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}>
                    <AlertCircle size={14} color="#cc0000" style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.form onSubmit={handleLogin} style={styles.form}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>

                {/* Email */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Email Address</label>
                  <div style={{ ...styles.inputBox, borderColor: focusedField === 'email' ? '#1A73E8' : '#E0E6F0', boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(26,115,232,0.12)' : 'none' }}>
                    <Mail size={16} color={focusedField === 'email' ? '#1A73E8' : '#888'} style={{ flexShrink: 0, marginRight: '10px', transition: 'color 0.2s' }} />
                    <input
                      style={styles.input}
                      type="email" placeholder="example@gmail.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={styles.fieldGroup}>
                  <div style={styles.labelRow}>
                    <label style={styles.label}>Password</label>
                    <motion.span
                      style={styles.forgotText}
                      whileTap={{ scale: 0.92 }}
                      whileHover={{ color: '#0052CC' }}
                      onClick={(e) => { e.preventDefault(); setShowForgot(true); }}
                    >
                      Forgot Password?
                    </motion.span>
                  </div>
                  <div style={{ ...styles.inputBox, borderColor: focusedField === 'password' ? '#1A73E8' : '#E0E6F0', boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(26,115,232,0.12)' : 'none' }}>
                    <Lock size={16} color={focusedField === 'password' ? '#1A73E8' : '#888'} style={{ flexShrink: 0, marginRight: '10px', transition: 'color 0.2s' }} />
                    <input
                      style={styles.input}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                    <motion.span style={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} whileTap={{ scale: 0.9 }}>
                      {showPassword ? <EyeOff size={16} color="#888" /> : <Eye size={16} color="#888" />}
                    </motion.span>
                  </div>
                </div>

                <motion.button
                  style={{ ...styles.loginBtn, opacity: loading ? 0.85 : 1 }}
                  type="submit" disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01, boxShadow: '0 8px 28px rgba(26,115,232,0.45)' }}
                >
                  {loading
                    ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>Signing in...</motion.span>
                    : 'Log In'
                  }
                </motion.button>

                <div style={styles.divider}>
                  <div style={styles.dividerLine} />
                  <span style={styles.dividerText}>New to PayEase?</span>
                  <div style={styles.dividerLine} />
                </div>

                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <motion.button
                    type="button"
                    style={styles.registerBtn}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ background: '#EEF2FF', borderColor: '#1A73E8' }}
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

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0d1b35 0%, #1a2a4a 50%, #0d1b35 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  splash: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' },
  splashLogoWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  splashLogo: { width: '90px', height: '90px', borderRadius: '26px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  splashLogoP: { color: '#fff', fontSize: '44px', fontWeight: 'bold' },
  splashTitle: { color: '#fff', fontSize: '34px', fontWeight: 'bold', margin: '0 0 8px 0' },
  splashTagline: { color: 'rgba(255,255,255,0.5)', fontSize: '15px', margin: '0 0 48px 0' },
  splashDots: { display: 'flex', gap: '8px' },
  dot: { width: '8px', height: '8px', borderRadius: '50%', background: '#1A73E8' },
  pageWrapper: { width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' },
  card: { background: '#fff', borderRadius: '24px', padding: '40px 36px', width: '100%', maxWidth: '420px', boxSizing: 'border-box', boxShadow: '0 24px 80px rgba(0,0,0,0.35)' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', justifyContent: 'center' },
  logoIcon: { width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoP: { color: '#fff', fontSize: '20px', fontWeight: 'bold' },
  logoText: { color: '#1A1A2E', fontSize: '22px', fontWeight: 'bold' },
  welcomeTitle: { color: '#1A1A2E', fontSize: '22px', fontWeight: 'bold', margin: '0 0 6px 0', textAlign: 'center' },
  welcomeSub: { color: '#888', fontSize: '14px', textAlign: 'center', margin: '0 0 24px 0' },
  errorBox: { background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.3)', color: '#cc0000', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' },
  form: { width: '100%' },
  fieldGroup: { marginBottom: '16px' },
  label: { color: '#444', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  forgotText: { color: '#1A73E8', fontSize: '12px', fontWeight: '600', cursor: 'pointer', userSelect: 'none' },
  inputBox: { display: 'flex', alignItems: 'center', border: '1.5px solid #E0E6F0', borderRadius: '12px', padding: '0 14px', background: '#F8FAFF', transition: 'border-color 0.2s, box-shadow 0.2s' },
  input: { flex: 1, padding: '13px 0', border: 'none', background: 'transparent', color: '#1A1A2E', fontSize: '14px', outline: 'none', minWidth: 0 },
  eyeBtn: { cursor: 'pointer', opacity: 0.6, userSelect: 'none', flexShrink: 0, display: 'flex', alignItems: 'center' },
  loginBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px', boxShadow: '0 6px 20px rgba(26,115,232,0.35)', boxSizing: 'border-box', transition: 'all 0.2s' },
  divider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 12px' },
  dividerLine: { flex: 1, height: '1px', background: '#E0E6F0' },
  dividerText: { color: '#aaa', fontSize: '12px', whiteSpace: 'nowrap' },
  registerBtn: { width: '100%', padding: '13px', background: '#F8FAFF', color: '#1A73E8', border: '1.5px solid #E0E6F0', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxSizing: 'border-box' },
};