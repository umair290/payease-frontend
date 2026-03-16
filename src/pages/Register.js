import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  Shield, AlertCircle, CheckCircle, ArrowRight,
  RefreshCw, Mail as MailIcon
} from 'lucide-react';

const API_URL = 'https://web-production-91d7.up.railway.app';

// ── OTP Input Component ──
const OtpInput = ({ value, onChange, colors }) => (
  <div style={{ position: 'relative', marginBottom: '4px' }}>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '16px', border: `2px solid ${value.length === 6 ? '#1A73E8' : '#CBD5E0'}`, borderRadius: '16px', background: '#EEF2FF', transition: 'all 0.2s', boxShadow: value.length === 6 ? '0 0 0 3px rgba(26,115,232,0.08)' : 'none' }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <motion.div
          key={i}
          style={{ width: '38px', height: '46px', borderRadius: '12px', border: `2px solid ${i < value.length ? '#1A73E8' : '#94A3B8'}`, background: i < value.length ? 'rgba(26,115,232,0.1)' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', boxShadow: i < value.length ? '0 2px 8px rgba(26,115,232,0.2)' : 'inset 0 1px 3px rgba(0,0,0,0.08)' }}
          animate={{ scale: i === value.length - 1 ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.15 }}
        >
          <span style={{ color: '#1A73E8', fontSize: '20px', fontWeight: 'bold' }}>{value[i] ? '●' : ''}</span>
        </motion.div>
      ))}
    </div>
    <input
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'text', zIndex: 1 }}
      type="tel" inputMode="numeric" maxLength={6}
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, 6).replace(/\D/g, ''))}
      autoFocus
    />
  </div>
);

export default function Register() {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();

  // Step 1 state
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', pin: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [pin, setPin] = useState('');

  // Step 2 state
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Common state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // Step 1 — Send OTP
  const handleInitiate = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) { setError('PIN must be exactly 4 digits'); return; }
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/register/initiate`, {
        ...form,
        pin,
        email: form.email.trim().toLowerCase()
      });
      setRegisteredEmail(form.email.trim().toLowerCase());
      setDevOtp(res.data.dev_otp || '');
      setStep(2);
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  // Step 2 — Verify OTP
  const handleVerify = async () => {
    if (otp.length !== 6) { setError('Please enter the 6-digit code'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API_URL}/api/auth/register/verify`, {
        email: registeredEmail,
        otp
      });
      // Success — go to login
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    }
    setLoading(false);
  };

  // Resend OTP
  const handleResend = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/register/resend-otp`, {
        email: registeredEmail
      });
      setDevOtp(res.data.dev_otp || '');
      setCountdown(60);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend');
    }
    setLoading(false);
  };

  const inputStyle = (field) => ({
    display: 'flex', alignItems: 'center',
    border: `1.5px solid ${focusedField === field ? '#1A73E8' : colors.border}`,
    borderRadius: '12px', padding: '0 14px',
    background: colors.inputBg,
    transition: 'all 0.2s',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(26,115,232,0.1)' : 'none',
  });

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0D1117' : 'linear-gradient(135deg, #0d1b35 0%, #1a2a4a 50%, #0d1b35 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
      <motion.div
        style={{ width: '100%', maxWidth: '460px' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ background: colors.card, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', padding: '24px 32px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', bottom: '-30px', left: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>P</span>
              </div>
              <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>PayEase</span>
            </div>

            <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
              {step === 1 ? 'Create Account' : 'Verify Email'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 16px 0' }}>
              {step === 1 ? 'Join PayEase — your smart digital wallet' : `Enter the code sent to ${registeredEmail}`}
            </p>

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2].map(s => (
                <motion.div
                  key={s}
                  style={{ height: '4px', borderRadius: '2px', background: step >= s ? '#fff' : 'rgba(255,255,255,0.3)' }}
                  animate={{ width: step === s ? '28px' : '12px' }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '24px 28px 28px' }}>
            <AnimatePresence>
              {error && (
                <motion.div
                  style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                >
                  <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">

              {/* ── STEP 1: Registration Form ── */}
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleInitiate}
                >
                  {/* Name + Phone */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <label style={{ color: colors.textSecondary, fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Full Name</label>
                      <div style={inputStyle('full_name')}>
                        <User size={15} color={focusedField === 'full_name' ? '#1A73E8' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '8px' }} />
                        <input
                          style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none', minWidth: 0 }}
                          type="text" name="full_name" placeholder="John Doe"
                          value={form.full_name} onChange={handleChange}
                          onFocus={() => setFocusedField('full_name')} onBlur={() => setFocusedField(null)}
                          required
                        />
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <label style={{ color: colors.textSecondary, fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Phone</label>
                      <div style={inputStyle('phone')}>
                        <Phone size={15} color={focusedField === 'phone' ? '#1A73E8' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '8px' }} />
                        <input
                          style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none', minWidth: 0 }}
                          type="tel" name="phone" placeholder="03XX..."
                          value={form.phone} onChange={handleChange}
                          onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ color: colors.textSecondary, fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Email Address</label>
                    <div style={inputStyle('email')}>
                      <Mail size={15} color={focusedField === 'email' ? '#1A73E8' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '8px' }} />
                      <input
                        style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none', minWidth: 0 }}
                        type="email" name="email" placeholder="example@gmail.com"
                        value={form.email} onChange={handleChange}
                        onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                        required
                      />
                    </div>
                  </div>

                  {/* Password + PIN */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <label style={{ color: colors.textSecondary, fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Password</label>
                      <div style={inputStyle('password')}>
                        <Lock size={15} color={focusedField === 'password' ? '#1A73E8' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '8px' }} />
                        <input
                          style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none', minWidth: 0 }}
                          type={showPassword ? 'text' : 'password'} name="password" placeholder="Min 6 chars"
                          value={form.password} onChange={handleChange}
                          onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                          required
                        />
                        <motion.span style={{ cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', opacity: 0.6 }} whileTap={{ scale: 0.9 }} onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={15} color={colors.textSecondary} /> : <Eye size={15} color={colors.textSecondary} />}
                        </motion.span>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <label style={{ color: colors.textSecondary, fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>4-Digit PIN</label>
                      <div style={inputStyle('pin')}>
                        <Shield size={15} color={focusedField === 'pin' ? '#1A73E8' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '8px' }} />
                        <input
                          style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none', minWidth: 0 }}
                          type={showPin ? 'text' : 'password'} name="pin" placeholder="••••"
                          maxLength={4} inputMode="numeric"
                          value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                          onFocus={() => setFocusedField('pin')} onBlur={() => setFocusedField(null)}
                          required
                        />
                        <motion.span style={{ cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', opacity: 0.6 }} whileTap={{ scale: 0.9 }} onClick={() => setShowPin(!showPin)}>
                          {showPin ? <EyeOff size={15} color={colors.textSecondary} /> : <Eye size={15} color={colors.textSecondary} />}
                        </motion.span>
                      </div>
                    </div>
                  </div>

                  {/* PIN indicator */}
                  {pin.length > 0 && (
                    <motion.div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < pin.length ? '#1A73E8' : colors.border, transition: 'background 0.2s' }} />
                      ))}
                    </motion.div>
                  )}

                  {/* Terms */}
                  <div style={{ background: colors.actionBg, borderRadius: '12px', padding: '10px 14px', marginBottom: '16px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <CheckCircle size={14} color="#1A73E8" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
                      A verification code will be sent to your email to confirm your account.
                    </p>
                  </div>

                  <motion.button
                    style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,115,232,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.8 : 1 }}
                    type="submit" disabled={loading}
                    whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01 }}
                  >
                    {loading
                      ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>Sending verification code...</motion.span>
                      : <><MailIcon size={16} color="#fff" /> Send Verification Code</>
                    }
                  </motion.button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0 12px' }}>
                    <div style={{ flex: 1, height: '1px', background: colors.border }} />
                    <span style={{ color: colors.textSecondary, fontSize: '12px' }}>Already have an account?</span>
                    <div style={{ flex: 1, height: '1px', background: colors.border }} />
                  </div>

                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <motion.button
                      type="button"
                      style={{ width: '100%', padding: '13px', background: 'transparent', color: '#1A73E8', border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxSizing: 'border-box' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Sign In Instead
                    </motion.button>
                  </Link>
                </motion.form>
              )}

              {/* ── STEP 2: OTP Verification ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Email sent confirmation */}
                  <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle size={18} color="#16A34A" style={{ flexShrink: 0 }} />
                    <div>
                      <p style={{ color: '#16A34A', fontSize: '13px', fontWeight: '600', margin: 0 }}>Verification code sent!</p>
                      <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>Check your inbox: {registeredEmail}</p>
                    </div>
                  </div>

                  {/* Dev OTP */}
                  {devOtp && (
                    <motion.div
                      style={{ background: colors.actionBg, border: `2px dashed ${colors.border}`, borderRadius: '14px', padding: '12px', marginBottom: '20px', textAlign: 'center' }}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    >
                      <p style={{ color: colors.textSecondary, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px 0' }}>🔧 Dev Mode OTP</p>
                      <p style={{ color: '#1A73E8', fontSize: '28px', fontWeight: 'bold', letterSpacing: '10px', fontFamily: 'monospace', margin: 0 }}>{devOtp}</p>
                    </motion.div>
                  )}

                  <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: '0 0 10px 0', textAlign: 'center' }}>Enter 6-Digit Verification Code</p>
                  <OtpInput value={otp} onChange={setOtp} colors={colors} />

                  {/* Resend */}
                  <div style={{ textAlign: 'center', margin: '10px 0 20px' }}>
                    {countdown > 0
                      ? <span style={{ color: colors.textSecondary, fontSize: '13px' }}>Resend code in <strong style={{ color: colors.text }}>{countdown}s</strong></span>
                      : <motion.span
                          style={{ color: '#1A73E8', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          whileTap={{ scale: 0.95 }} onClick={handleResend}
                        >
                          <RefreshCw size={13} /> Resend Code
                        </motion.span>
                    }
                  </div>

                  <motion.button
                    style={{ width: '100%', padding: '14px', background: otp.length === 6 ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : '#E5E7EB', color: otp.length === 6 ? '#fff' : '#9CA3AF', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: otp.length === 6 ? 'pointer' : 'not-allowed', boxShadow: otp.length === 6 ? '0 6px 20px rgba(26,115,232,0.35)' : 'none', marginBottom: '10px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    whileTap={otp.length === 6 ? { scale: 0.98 } : {}}
                    onClick={handleVerify} disabled={loading}
                  >
                    {loading
                      ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>Verifying...</motion.span>
                      : <><CheckCircle size={16} color={otp.length === 6 ? '#fff' : '#9CA3AF'} /> Verify & Create Account</>
                    }
                  </motion.button>

                  <motion.button
                    style={{ width: '100%', padding: '13px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}
                    whileTap={{ scale: 0.97 }} onClick={() => { setStep(1); setOtp(''); setError(''); setDevOtp(''); }}
                  >
                    ← Back to Registration
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.p
          style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          🔒 Your data is encrypted and secure
        </motion.p>
      </motion.div>
    </div>
  );
}
