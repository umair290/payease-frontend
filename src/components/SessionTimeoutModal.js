import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SessionTimeoutModal({ show, onStayLoggedIn, onLogout, countdown }) {
  const { colors } = useTheme();

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const isUrgent = countdown <= 60;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            style={{ background: colors.card, borderRadius: '24px', width: '100%', maxWidth: '340px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div style={{ background: isUrgent ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : 'linear-gradient(135deg, #CA8A04, #92400E)', padding: '24px', textAlign: 'center', transition: 'background 0.5s' }}>
              <motion.div
                style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '2px solid rgba(255,255,255,0.4)' }}
                animate={{ scale: isUrgent ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.8, repeat: isUrgent ? Infinity : 0 }}
              >
                <Clock size={28} color="#fff" />
              </motion.div>
              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                {isUrgent ? '⚠️ Logging Out Soon!' : 'Session Expiring'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: 0 }}>
                {isUrgent ? 'Take action now!' : 'You\'ve been inactive for a while'}
              </p>
            </div>

            {/* Body */}
            <div style={{ padding: '20px' }}>

              {/* Countdown Ring */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <motion.div
                  style={{ width: '84px', height: '84px', borderRadius: '50%', background: isUrgent ? 'rgba(220,38,38,0.08)' : 'rgba(202,138,4,0.08)', border: `3px solid ${isUrgent ? '#DC2626' : '#CA8A04'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', transition: 'all 0.3s' }}
                  animate={{ borderColor: isUrgent ? ['#DC2626', '#FF6B6B', '#DC2626'] : '#CA8A04' }}
                  transition={{ duration: 0.8, repeat: isUrgent ? Infinity : 0 }}
                >
                  <div>
                    <p style={{ color: isUrgent ? '#DC2626' : '#CA8A04', fontSize: '26px', fontWeight: 'bold', margin: 0, lineHeight: 1, fontFamily: 'monospace' }}>
                      {minutes > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : seconds}
                    </p>
                    <p style={{ color: isUrgent ? '#DC2626' : '#CA8A04', fontSize: '10px', margin: 0, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {minutes > 0 ? 'min' : 'secs'}
                    </p>
                  </div>
                </motion.div>
                <p style={{ color: colors.textSecondary, fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                  {isUrgent
                    ? 'Your session will end immediately!'
                    : 'Tap "Stay Logged In" to continue your session'
                  }
                </p>
              </div>

              {/* Security Note */}
              <div style={{ background: colors.actionBg, borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', border: `1px solid ${colors.border}`, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Shield size={15} color="#1A73E8" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
                  For your security, PayEase logs you out after <strong style={{ color: colors.text }}>30 minutes</strong> of inactivity.
                </p>
              </div>

              {/* Buttons */}
              <motion.button
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 6px 20px rgba(26,115,232,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                whileTap={{ scale: 0.97 }} onClick={onStayLoggedIn}
              >
                ✓ Stay Logged In
              </motion.button>
              <motion.button
                style={{ width: '100%', padding: '13px', background: 'transparent', color: '#DC2626', border: '1.5px solid rgba(220,38,38,0.25)', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}
                whileTap={{ scale: 0.97 }} onClick={onLogout}
              >
                Logout Now
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}