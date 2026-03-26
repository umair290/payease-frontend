import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  Shield, AlertCircle, CheckCircle,
  RefreshCw, Mail as MailIcon, Sparkles
} from 'lucide-react';

const API_URL = 'https://web-production-91d7.up.railway.app';

// ── OTP Input ──
const OtpInput = ({ value, onChange, isDark }) => {
  const inputBg  = isDark ? 'rgba(255,255,255,0.04)' : '#F0F4FF';
  const border   = isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  return (
    <div style={{ position: 'relative', marginBottom: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '16px', border: `2px solid ${value.length === 6 ? '#1A73E8' : border}`, borderRadius: '18px', background: inputBg, transition: 'all 0.2s', boxShadow: value.length === 6 ? '0 0 0 4px rgba(26,115,232,0.1)' : 'none' }}>
        {[0,1,2,3,4,5].map(i => (
          <motion.div key={i}
            style={{ width: '40px', height: '48px', borderRadius: '13px', border: `2px solid ${i < value.length ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.1)' : '#CBD5E1'}`, background: i < value.length ? 'rgba(26,115,232,0.12)' : isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', boxShadow: i < value.length ? '0 4px 12px rgba(26,115,232,0.2)' : 'none' }}
            animate={{ scale: i === value.length - 1 ? [1, 1.12, 1] : 1 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1A73E8' }}
              animate={{ scale: i < value.length ? 1 : 0, opacity: i < value.length ? 1 : 0 }}
              transition={{ duration: 0.15 }}
            />
          </motion.div>
        ))}
      </div>
      <input
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'text', zIndex: 1 }}
        type="tel" inputMode="numeric" maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0,6).replace(/\D/g,''))}
        autoFocus
      />
    </div>
  );
};

export default function Register() {
  const { isDark } = useTheme();
  const navigate   = useNavigate();

  const [form,          setForm]          = useState({ full_name: '', email: '', phone: '', password: '' });
  const [pin,           setPin]           = useState('');
  const [showPassword,  setShowPassword]  = useState(false);
  const [showPin,       setShowPin]       = useState(false);
  const [focusedField,  setFocusedField]  = useState(null);
  const [otp,           setOtp]           = useState('');
  const [countdown,     setCountdown]     = useState(0);
  const [step,          setStep]          = useState(1);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Theme vars
  const card    = isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
  const border  = isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const text    = isDark ? '#F0F6FC' : '#0F172A';
  const textSec = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF';

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

  const handleInitiate = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) { setError('PIN must be exactly 4 digits'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API_URL}/api/auth/register/initiate`, {
        ...form, pin, email: form.email.trim().toLowerCase()
      });
      setRegisteredEmail(form.email.trim().toLowerCase());
      setStep(2);
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (otp.length !== 6) { setError('Please enter the 6-digit code'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API_URL}/api/auth/register/verify`, { email: registeredEmail, otp });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true); setError('');
    try {
      await axios.post(`${API_URL}/api/auth/register/resend-otp`, { email: registeredEmail });
      setCountdown(60); setOtp('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend');
    }
    setLoading(false);
  };

  const iStyle = (field) => ({
    display: 'flex', alignItems: 'center',
    border: `2px solid ${focusedField === field ? '#1A73E8' : border}`,
    borderRadius: '14px', padding: '0 16px',
    background: inputBg, transition: 'all 0.2s',
    boxShadow: focusedField === field ? '0 0 0 4px rgba(26,115,232,0.1)' : 'none',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#060B18 0%,#0D1B35 50%,#0A0F1E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Background blobs */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(26,115,232,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(26,115,232,0.04) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <motion.div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      >
        {/* ── CARD ── */}
        <div style={{ background: isDark ? 'rgba(15,22,41,0.95)' : 'rgba(255,255,255,0.97)', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, backdropFilter: 'blur(20px)' }}>

          {/* ── GRADIENT HEADER ── */}
          <div style={{ background: step === 1 ? 'linear-gradient(135deg,#1A1FEF 0%,#1A73E8 50%,#7C3AED 100%)' : 'linear-gradient(135deg,#134E5E 0%,#16A34A 100%)', padding: '28px 28px 24px', position: 'relative', overflow: 'hidden', transition: 'background 0.4s' }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)' }} />

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '13px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.25)' }}>
                <span style={{ color: '#fff', fontSize: '20px', fontWeight: '800' }}>P</span>
              </div>
              <span style={{ color: '#fff', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>PayEase</span>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <AnimatePresence mode="wait">
                <motion.div key={step}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
                    {step === 1 ? 'Create Account' : 'Verify Email'}
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: '0 0 18px 0', fontWeight: '500' }}>
                    {step === 1 ? 'Join PayEase — your smart digital wallet' : `Code sent to ${registeredEmail}`}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Step pills */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {[1,2].map(s => (
                  <motion.div key={s}
                    style={{ height: '4px', borderRadius: '2px', background: step >= s ? '#fff' : 'rgba(255,255,255,0.25)' }}
                    animate={{ width: step === s ? '32px' : '14px' }}
                    transition={{ duration: 0.3, type: 'spring' }}
                  />
                ))}
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '700', marginLeft: '4px' }}>
                  {step}/2
                </span>
              </div>
            </div>
          </div>

          {/* ── BODY ── */}
          <div style={{ padding: '24px 28px 28px' }}>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                >
                  <AlertCircle size={15} color="#DC2626" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#DC2626', fontSize: '13px', fontWeight: '500' }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <motion.form key="s1"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                  onSubmit={handleInitiate}
                >
                  {/* Name + Phone row */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                    {[
                      { key: 'full_name', label: 'Full Name',    icon: <User size={15} />,  placeholder: 'John Doe',  type: 'text' },
                      { key: 'phone',     label: 'Phone',        icon: <Phone size={15} />, placeholder: '03XX...', type: 'tel' },
                    ].map(f => (
                      <div key={f.key} style={{ flex: 1, minWidth: 0 }}>
                        <label style={{ color: textSec, fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{f.label}</label>
                        <div style={iStyle(f.key)}>
                          <span style={{ color: focusedField === f.key ? '#1A73E8' : textSec, marginRight: '8px', flexShrink: 0, display: 'flex' }}>{f.icon}</span>
                          <input
                            style={{ flex: 1, padding: '13px 0', border: 'none', background: 'transparent', color: text, fontSize: '13px', outline: 'none', minWidth: 0, fontWeight: '500' }}
                            type={f.type} name={f.key} placeholder={f.placeholder}
                            value={form[f.key]} onChange={handleChange}
                            onFocus={() => setFocusedField(f.key)} onBlur={() => setFocusedField(null)}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ color: textSec, fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Email Address</label>
                    <div style={iStyle('email')}>
                      <Mail size={15} color={focusedField === 'email' ? '#1A73E8' : textSec} style={{ marginRight: '10px', flexShrink: 0 }} />
                      <input
                        style={{ flex: 1, padding: '13px 0', border: 'none', background: 'transparent', color: text, fontSize: '14px', outline: 'none', fontWeight: '500' }}
                        type="email" name="email" placeholder="example@gmail.com"
                        value={form.email} onChange={handleChange}
                        onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                        required
                      />
                    </div>
                  </div>

                  {/* Password + PIN row */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '6px' }}>
                    {/* Password */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <label style={{ color: textSec, fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Password</label>
                      <div style={iStyle('password')}>
                        <Lock size={15} color={focusedField === 'password' ? '#1A73E8' : textSec} style={{ marginRight: '8px', flexShrink: 0 }} />
                        <input
                          style={{ flex: 1, padding: '13px 0', border: 'none', background: 'transparent', color: text, fontSize: '13px', outline: 'none', minWidth: 0, fontWeight: '500' }}
                          type={showPassword ? 'text' : 'password'} name="password" placeholder="Min 6 chars"
                          value={form.password} onChange={handleChange}
                          onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                          required
                        />
                        <motion.span style={{ cursor: 'pointer', flexShrink: 0, display: 'flex', opacity: 0.6 }} whileTap={{ scale: 0.9 }} onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={14} color={textSec} /> : <Eye size={14} color={textSec} />}
                        </motion.span>
                      </div>
                    </div>

                    {/* PIN */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <label style={{ color: textSec, fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>4-Digit PIN</label>
                      <div style={iStyle('pin')}>
                        <Shield size={15} color={focusedField === 'pin' ? '#1A73E8' : textSec} style={{ marginRight: '8px', flexShrink: 0 }} />
                        <input
                          style={{ flex: 1, padding: '13px 0', border: 'none', background: 'transparent', color: text, fontSize: '13px', outline: 'none', minWidth: 0, fontWeight: '500' }}
                          type={showPin ? 'text' : 'password'} placeholder="••••"
                          maxLength={4} inputMode="numeric"
                          value={pin}
                          onChange={(e) => { setPin(e.target.value.replace(/\D/g,'').slice(0,4)); setError(''); }}
                          onFocus={() => setFocusedField('pin')} onBlur={() => setFocusedField(null)}
                        />
                        <motion.span style={{ cursor: 'pointer', flexShrink: 0, display: 'flex', opacity: 0.6 }} whileTap={{ scale: 0.9 }} onClick={() => setShowPin(!showPin)}>
                          {showPin ? <EyeOff size={14} color={textSec} /> : <Eye size={14} color={textSec} />}
                        </motion.span>
                      </div>
                    </div>
                  </div>

                  {/* PIN strength dots */}
                  <AnimatePresence>
                    {pin.length > 0 && (
                      <motion.div style={{ display: 'flex', gap: '5px', marginBottom: '14px', marginTop: '8px' }}
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      >
                        {[0,1,2,3].map(i => (
                          <motion.div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < pin.length ? 'linear-gradient(90deg,#1A73E8,#7C3AED)' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', transition: 'background 0.2s' }} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Notice */}
                  <motion.div
                    style={{ background: isDark ? 'rgba(26,115,232,0.08)' : 'rgba(26,115,232,0.05)', borderRadius: '13px', padding: '11px 14px', marginBottom: '16px', border: `1px solid ${isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.12)'}`, display: 'flex', alignItems: 'flex-start', gap: '10px' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                  >
                    <MailIcon size={14} color="#1A73E8" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <p style={{ color: textSec, fontSize: '12px', margin: 0, lineHeight: '1.6', fontWeight: '500' }}>
                      A 6-digit verification code will be sent to your email to confirm your account.
                    </p>
                  </motion.div>

                  {/* Submit */}
                  <motion.button
                    style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 28px rgba(26,115,232,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.8 : 1, letterSpacing: '0.2px' }}
                    type="submit" disabled={loading}
                    whileTap={{ scale: 0.97 }}
                  >
                    {loading
                      ? <motion.span animate={{ opacity: [1,0.5,1] }} transition={{ duration: 1, repeat: Infinity }}>Sending verification code...</motion.span>
                      : <><MailIcon size={16} color="#fff" /> Send Verification Code</>
                    }
                  </motion.button>

                  {/* Divider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0 12px' }}>
                    <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }} />
                    <span style={{ color: textSec, fontSize: '11px', fontWeight: '600' }}>Already have an account?</span>
                    <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }} />
                  </div>

                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <motion.button type="button"
                      style={{ width: '100%', padding: '14px', background: 'transparent', color: '#1A73E8', border: `1.5px solid ${isDark ? 'rgba(26,115,232,0.25)' : 'rgba(26,115,232,0.2)'}`, borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxSizing: 'border-box' }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Sign In Instead
                    </motion.button>
                  </Link>
                </motion.form>
              )}

              {/* ── STEP 2 — OTP ── */}
              {step === 2 && (
                <motion.div key="s2"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  {/* Email sent banner */}
                  <motion.div
                    style={{ background: isDark ? 'rgba(22,163,74,0.08)' : 'rgba(22,163,74,0.05)', border: `1px solid ${isDark ? 'rgba(22,163,74,0.2)' : 'rgba(22,163,74,0.15)'}`, borderRadius: '14px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'linear-gradient(135deg,#16A34A,#15803D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}>
                      <CheckCircle size={20} color="#fff" />
                    </div>
                    <div>
                      <p style={{ color: '#16A34A', fontSize: '13px', fontWeight: '800', margin: '0 0 2px 0' }}>Verification code sent!</p>
                      <p style={{ color: textSec, fontSize: '12px', margin: 0, fontWeight: '500' }}>
                        Check your inbox at <strong style={{ color: text }}>{registeredEmail}</strong>
                      </p>
                    </div>
                  </motion.div>

                  <p style={{ color: text, fontSize: '13px', fontWeight: '700', margin: '0 0 12px 0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Enter 6-Digit Code
                  </p>

                  <OtpInput value={otp} onChange={setOtp} isDark={isDark} />

                  {/* Resend */}
                  <div style={{ textAlign: 'center', margin: '14px 0 20px' }}>
                    {countdown > 0
                      ? <span style={{ color: textSec, fontSize: '13px', fontWeight: '500' }}>
                          Resend in <strong style={{ color: '#1A73E8' }}>{countdown}s</strong>
                        </span>
                      : <motion.span
                          style={{ color: '#1A73E8', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          whileTap={{ scale: 0.95 }} onClick={handleResend}
                        >
                          <RefreshCw size={13} /> Resend Code
                        </motion.span>
                    }
                  </div>

                  {/* Verify button */}
                  <motion.button
                    style={{ width: '100%', padding: '15px', background: otp.length === 6 ? 'linear-gradient(135deg,#16A34A,#15803D)' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: otp.length === 6 ? '#fff' : textSec, border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: otp.length === 6 ? 'pointer' : 'default', boxShadow: otp.length === 6 ? '0 8px 28px rgba(22,163,74,0.4)' : 'none', marginBottom: '10px', transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '0.2px' }}
                    whileTap={otp.length === 6 ? { scale: 0.97 } : {}}
                    onClick={handleVerify} disabled={loading}
                  >
                    {loading
                      ? <motion.span animate={{ opacity: [1,0.5,1] }} transition={{ duration: 1, repeat: Infinity }}>Verifying...</motion.span>
                      : <><CheckCircle size={16} color={otp.length === 6 ? '#fff' : textSec} /> Verify & Create Account</>
                    }
                  </motion.button>

                  <motion.button
                    style={{ width: '100%', padding: '13px', background: 'transparent', color: textSec, border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '14px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setStep(1); setOtp(''); setError(''); }}
                  >
                    ← Back to Registration
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom tag */}
        <motion.div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          <Shield size={12} color="rgba(255,255,255,0.3)" />
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0, fontWeight: '500' }}>
            Your data is encrypted and secure
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
