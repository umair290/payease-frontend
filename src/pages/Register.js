import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  Shield, AlertCircle, CheckCircle, ArrowRight
} from 'lucide-react';

export default function Register() {
  const { colors, isDark } = useTheme();
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', pin: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [pin, setPin] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) { setError('PIN must be exactly 4 digits'); return; }
    setLoading(true);
    setError('');
    try {
      await authService.register({ ...form, pin });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  const fields = [
    { name: 'full_name', label: 'Full Name', placeholder: 'John Doe', icon: <User size={16} />, type: 'text' },
    { name: 'email', label: 'Email Address', placeholder: 'example@gmail.com', icon: <Mail size={16} />, type: 'email' },
    { name: 'phone', label: 'Phone Number', placeholder: '03XXXXXXXXX', icon: <Phone size={16} />, type: 'tel' },
    { name: 'password', label: 'Password', placeholder: '••••••••', icon: <Lock size={16} />, type: showPassword ? 'text' : 'password', toggle: () => setShowPassword(!showPassword), show: showPassword },
  ];

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
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Card */}
        <div style={{ background: colors.card, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', padding: '28px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', bottom: '-30px', left: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <motion.div
              style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '2px solid rgba(255,255,255,0.3)' }}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            >
              <span style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold' }}>P</span>
            </motion.div>
            <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Create Account</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>Join PayEase — your smart digital wallet</p>
          </div>

          {/* Form */}
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

            <form onSubmit={handleRegister}>

              {/* Name + Phone Row */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                {/* Full Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Full Name</label>
                  <div style={inputStyle('full_name')}>
                    <User size={15} color={focusedField === 'full_name' ? '#1A73E8' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '8px', transition: 'color 0.2s' }} />
                    <input
                      style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none', minWidth: 0 }}
                      type="text" name="full_name" placeholder="John Doe"
                      onChange={handleChange}
                      onFocus={() => setFocusedField('full_name')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Phone</label>
                  <div style={inputStyle('phone')}>
                    <Phone size={15} color={focusedField === 'phone' ? '#1A73E8' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '8px', transition: 'color 0.2s' }} />
                    <input
                      style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none', minWidth: 0 }}
                      type="tel" name="phone" placeholder="03XX..."
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Email Address</label>
                <div style={inputStyle('email')}>
                  <Mail size={15} color={focusedField === 'email' ? '#1A73E8' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '8px', transition: 'color 0.2s' }} />
                  <input
                    style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none', minWidth: 0 }}
                    type="email" name="email" placeholder="example@gmail.com"
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>

              {/* Password + PIN Row */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                {/* Password */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Password</label>
                  <div style={inputStyle('password')}>
                    <Lock size={15} color={focusedField === 'password' ? '#1A73E8' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '8px', transition: 'color 0.2s' }} />
                    <input
                      style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none', minWidth: 0 }}
                      type={showPassword ? 'text' : 'password'}
                      name="password" placeholder="••••••"
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                    <motion.span
                      style={{ cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', opacity: 0.6 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={15} color={colors.textSecondary} /> : <Eye size={15} color={colors.textSecondary} />}
                    </motion.span>
                  </div>
                </div>

                {/* PIN */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>4-Digit PIN</label>
                  <div style={inputStyle('pin')}>
                    <Shield size={15} color={focusedField === 'pin' ? '#1A73E8' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '8px', transition: 'color 0.2s' }} />
                    <input
                      style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none', minWidth: 0 }}
                      type={showPin ? 'text' : 'password'}
                      name="pin" placeholder="••••"
                      maxLength={4} inputMode="numeric"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      onFocus={() => setFocusedField('pin')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                    <motion.span
                      style={{ cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', opacity: 0.6 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPin(!showPin)}
                    >
                      {showPin ? <EyeOff size={15} color={colors.textSecondary} /> : <Eye size={15} color={colors.textSecondary} />}
                    </motion.span>
                  </div>
                </div>
              </div>

              {/* PIN Strength Indicator */}
              {pin.length > 0 && (
                <motion.div
                  style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < pin.length ? '#1A73E8' : colors.border, transition: 'background 0.2s' }} />
                  ))}
                </motion.div>
              )}

              {/* Terms */}
              <div style={{ background: colors.actionBg, borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle size={15} color="#1A73E8" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
                  By creating an account you agree to our{' '}
                  <span style={{ color: '#1A73E8', fontWeight: '600', cursor: 'pointer' }}>Terms of Service</span>
                  {' '}and{' '}
                  <span style={{ color: '#1A73E8', fontWeight: '600', cursor: 'pointer' }}>Privacy Policy</span>
                </p>
              </div>

              {/* Submit */}
              <motion.button
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,115,232,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.8 : 1, transition: 'all 0.2s' }}
                type="submit" disabled={loading}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01, boxShadow: '0 8px 28px rgba(26,115,232,0.45)' }}
              >
                {loading
                  ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>Creating Account...</motion.span>
                  : <><ArrowRight size={16} color="#fff" /> Create Account</>
                }
              </motion.button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0 14px' }}>
                <div style={{ flex: 1, height: '1px', background: colors.border }} />
                <span style={{ color: colors.textSecondary, fontSize: '12px' }}>Already have an account?</span>
                <div style={{ flex: 1, height: '1px', background: colors.border }} />
              </div>

              <Link to="/login" style={{ textDecoration: 'none' }}>
                <motion.button
                  type="button"
                  style={{ width: '100%', padding: '13px', background: 'transparent', color: '#1A73E8', border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxSizing: 'border-box' }}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ background: colors.actionBg, borderColor: '#1A73E8' }}
                >
                  Sign In Instead
                </motion.button>
              </Link>
            </form>
          </div>
        </div>

        {/* Bottom note */}
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
