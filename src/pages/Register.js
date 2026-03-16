import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', pin: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <motion.div
        style={styles.pageWrapper}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          style={styles.card}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Logo */}
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>
              <span style={styles.logoP}>P</span>
            </div>
            <span style={styles.logoText}>PayEase</span>
          </div>

          <h2 style={styles.welcomeTitle}>Create Account</h2>
          <p style={styles.welcomeSub}>Sign up to get started</p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                style={styles.errorBox}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleRegister} style={styles.form}>

            {/* Row 1 - Full Name + Phone */}
            <div style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Name</label>
                <div style={{
                  ...styles.inputBox,
                  borderColor: focusedField === 'full_name' ? '#1A73E8' : '#E0E6F0',
                  boxShadow: focusedField === 'full_name' ? '0 0 0 3px rgba(26,115,232,0.12)' : 'none',
                }}>
                  <input
                    style={styles.input}
                    type="text"
                    name="full_name"
                    placeholder="Your name"
                    onChange={handleChange}
                    onFocus={() => setFocusedField('full_name')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Phone</label>
                <div style={{
                  ...styles.inputBox,
                  borderColor: focusedField === 'phone' ? '#1A73E8' : '#E0E6F0',
                  boxShadow: focusedField === 'phone' ? '0 0 0 3px rgba(26,115,232,0.12)' : 'none',
                }}>
                  <input
                    style={styles.input}
                    type="tel"
                    name="phone"
                    placeholder="03XXXXXXXXX"
                    onChange={handleChange}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div style={styles.fieldGroupFull}>
              <label style={styles.label}>Email</label>
              <div style={{
                ...styles.inputBox,
                borderColor: focusedField === 'email' ? '#1A73E8' : '#E0E6F0',
                boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(26,115,232,0.12)' : 'none',
              }}>
                <input
                  style={styles.input}
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            {/* Row 2 - Password + PIN */}
            <div style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Password</label>
                <div style={{
                  ...styles.inputBox,
                  borderColor: focusedField === 'password' ? '#1A73E8' : '#E0E6F0',
                  boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(26,115,232,0.12)' : 'none',
                }}>
                  <input
                    style={styles.input}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <span style={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '🙈' : '👁️'}
                  </span>
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>4-Digit PIN</label>
                <div style={{
                  ...styles.inputBox,
                  borderColor: focusedField === 'pin' ? '#1A73E8' : '#E0E6F0',
                  boxShadow: focusedField === 'pin' ? '0 0 0 3px rgba(26,115,232,0.12)' : 'none',
                }}>
                  <input
                    style={styles.input}
                    type={showPin ? 'text' : 'password'}
                    name="pin"
                    placeholder="••••"
                    maxLength={4}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('pin')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <span style={styles.eyeBtn} onClick={() => setShowPin(!showPin)}>
                    {showPin ? '🙈' : '👁️'}
                  </span>
                </div>
              </div>
            </div>

            {/* Register Button */}
            <motion.button
              style={{ ...styles.registerBtn, opacity: loading ? 0.8 : 1 }}
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
            >
              {loading ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Creating Account...
                </motion.span>
              ) : 'Create Account'}
            </motion.button>

            {/* Divider */}
            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>Or</span>
              <div style={styles.dividerLine} />
            </div>

            <p style={styles.loginText}>
              Already have an account?{' '}
              <Link to="/login" style={styles.loginLink}>Sign In</Link>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a2a4a 0%, #0d1b35 50%, #1a2a4a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pageWrapper: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
  },
  card: {
    background: '#fff',
    borderRadius: '24px',
    padding: '32px 32px',
    width: '100%',
    maxWidth: '460px',
    boxSizing: 'border-box',
    boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    justifyContent: 'center',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #1A73E8, #0052CC)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoP: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  logoText: {
    color: '#1A1A2E',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  welcomeTitle: {
    color: '#1A1A2E',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 4px 0',
    textAlign: 'center',
  },
  welcomeSub: {
    color: '#888',
    fontSize: '13px',
    textAlign: 'center',
    margin: '0 0 20px 0',
  },
  errorBox: {
    background: 'rgba(255,107,107,0.08)',
    border: '1px solid #ff6b6b',
    color: '#cc0000',
    padding: '10px 14px',
    borderRadius: '10px',
    marginBottom: '14px',
    fontSize: '13px',
  },
  form: { width: '100%' },
  row: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
  },
  fieldGroup: {
    flex: 1,
    minWidth: 0,
  },
  fieldGroupFull: {
    marginBottom: '12px',
  },
  label: {
    color: '#444',
    fontSize: '12px',
    fontWeight: '600',
    display: 'block',
    marginBottom: '5px',
  },
  inputBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid #E0E6F0',
    borderRadius: '10px',
    padding: '0 12px',
    background: '#F8FAFF',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  input: {
    flex: 1,
    padding: '11px 0',
    border: 'none',
    background: 'transparent',
    color: '#1A1A2E',
    fontSize: '13px',
    outline: 'none',
    minWidth: 0,
  },
  eyeBtn: {
    fontSize: '14px',
    cursor: 'pointer',
    opacity: 0.5,
    userSelect: 'none',
    flexShrink: 0,
  },
  registerBtn: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #1A73E8, #0052CC)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '4px',
    boxShadow: '0 6px 20px rgba(26,115,232,0.35)',
    boxSizing: 'border-box',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '16px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#E0E6F0',
  },
  dividerText: {
    color: '#aaa',
    fontSize: '13px',
  },
  loginText: {
    color: '#888',
    textAlign: 'center',
    fontSize: '13px',
    margin: 0,
  },
  loginLink: {
    color: '#1A73E8',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
};