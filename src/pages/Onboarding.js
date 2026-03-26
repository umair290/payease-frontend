import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Shield, Zap, CreditCard, ArrowRight, Check } from 'lucide-react';

const SLIDES = [
  {
    id:      1,
    grad:    'linear-gradient(160deg,#1A1FEF 0%,#1A73E8 50%,#0EA5E9 100%)',
    shadow:  'rgba(26,115,232,0.5)',
    iconBg:  'rgba(255,255,255,0.15)',
    accent:  '#1A73E8',
    emoji:   '⚡',
    title:   'Fast & Secure Transfers',
    subtitle:'Send money instantly to anyone in Pakistan with real-time confirmation and full transaction history.',
    features:[
      'Instant wallet-to-wallet transfers',
      'Transfer up to PKR 50,000 per transaction',
      'Full history and PDF statements',
    ],
  },
  {
    id:      2,
    grad:    'linear-gradient(160deg,#134E5E 0%,#16A34A 60%,#15803D 100%)',
    shadow:  'rgba(22,163,74,0.5)',
    iconBg:  'rgba(255,255,255,0.15)',
    accent:  '#16A34A',
    emoji:   '🛡️',
    title:   'Bank-Grade Security',
    subtitle:'Protected with PIN verification, KYC identity checks, OTP confirmation, and real-time fraud monitoring.',
    features:[
      '4-digit PIN for every transaction',
      'KYC identity verification with CNIC',
      'Fraud detection alerts via email',
    ],
  },
  {
    id:      3,
    grad:    'linear-gradient(160deg,#3B1F8C 0%,#7C3AED 60%,#EC4899 100%)',
    shadow:  'rgba(124,58,237,0.5)',
    iconBg:  'rgba(255,255,255,0.15)',
    accent:  '#7C3AED',
    emoji:   '💳',
    title:   'All-in-One Wallet',
    subtitle:'Pay bills, top up mobile balance, scan QR codes, track spending insights, and manage a virtual card.',
    features:[
      'Pay electricity, gas and internet bills',
      'QR code payments and scanning',
      'Spending insights and analytics',
    ],
  },
];

export default function Onboarding() {
  const { isDark }                = useTheme();
  const navigate                  = useNavigate();
  const [current,   setCurrent]   = useState(0);
  const [direction, setDirection] = useState(1);

  const text    = isDark ? '#F0F6FC' : '#0F172A';
  const textSec = isDark ? 'rgba(255,255,255,0.5)' : '#64748B';
  const card    = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.15)';
  const border  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.2)';

  useEffect(() => {
    if (current < SLIDES.length - 1) {
      const t = setTimeout(() => { setDirection(1); setCurrent(c => c + 1); }, 4500);
      return () => clearTimeout(t);
    }
  }, [current]);

  const goTo = (i) => { setDirection(i > current ? 1 : -1); setCurrent(i); };

  const goNext = () => {
    if (current < SLIDES.length - 1) { setDirection(1); setCurrent(c => c + 1); }
    else finish();
  };

  const finish = () => {
    const pendingEmail = localStorage.getItem('payease_pending_onboard_email');
    if (pendingEmail) {
      localStorage.setItem(`payease_onboarded_${pendingEmail}`, 'true');
      localStorage.removeItem('payease_pending_onboard_email');
    }
    const token = localStorage.getItem('token');
    navigate(token ? '/dashboard' : '/login');
  };

  const slide = SLIDES[current];

  const variants = {
    enter:  (d) => ({ x: d > 0 ?  60 : -60, opacity: 0 }),
    center: ()  => ({ x: 0,                  opacity: 1 }),
    exit:   (d) => ({ x: d > 0 ? -60 :  60, opacity: 0 }),
  };

  return (
    <div style={{ minHeight: '100vh', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', position: 'relative' }}>

      {/* ── FULL PAGE GRADIENT BACKGROUND ── */}
      <motion.div
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        animate={{ background: slide.grad }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />

      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)', zIndex: 1 }} />

      {/* ── SKIP BUTTON ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '52px 24px 0', position: 'relative', zIndex: 2 }}>
        <motion.button
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '7px 18px', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', opacity: 0.85 }}
          whileTap={{ scale: 0.92 }} onClick={finish}
        >
          Skip
        </motion.button>
      </div>

      {/* ── SLIDES ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 28px', position: 'relative', zIndex: 2 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={current} custom={direction} variants={variants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            {/* Emoji icon */}
            <motion.div
              style={{ width: '120px', height: '120px', borderRadius: '36px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', border: '1px solid rgba(255,255,255,0.25)', boxShadow: `0 20px 60px rgba(0,0,0,0.2)`, position: 'relative' }}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              {/* Outer ring */}
              <div style={{ position: 'absolute', inset: '-14px', borderRadius: '46px', border: '2px solid rgba(255,255,255,0.12)' }} />
              <span style={{ fontSize: '52px' }}>{slide.emoji}</span>
            </motion.div>

            <motion.h1
              style={{ color: '#fff', fontSize: '26px', fontWeight: '800', margin: '0 0 12px 0', textAlign: 'center', letterSpacing: '-0.5px', lineHeight: 1.25 }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            >
              {slide.title}
            </motion.h1>

            <motion.p
              style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', textAlign: 'center', margin: '0 0 28px 0', lineHeight: 1.7, maxWidth: '320px', fontWeight: '500' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            >
              {slide.subtitle}
            </motion.p>

            {/* Features card */}
            <motion.div
              style={{ width: '100%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '20px', padding: '4px 16px', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            >
              {slide.features.map((feature, i) => (
                <motion.div key={i}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 0', borderBottom: i < slide.features.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.07 }}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '9px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={14} color="#fff" strokeWidth={2.5} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '600', lineHeight: 1.4 }}>{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── BOTTOM ── */}
      <div style={{ padding: '0 28px 52px', position: 'relative', zIndex: 2 }}>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
          {SLIDES.map((_, i) => (
            <motion.div key={i}
              style={{ height: '4px', borderRadius: '2px', background: i === current ? '#fff' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
              animate={{ width: i === current ? '28px' : '8px' }}
              transition={{ duration: 0.3, type: 'spring' }}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* Next / Get Started button */}
        <motion.button
          style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px', letterSpacing: '0.2px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
          whileTap={{ scale: 0.97 }} onClick={goNext}
        >
          {current === SLIDES.length - 1 ? '🚀 Get Started' : 'Next'}
          {current < SLIDES.length - 1 && <ArrowRight size={17} color="#fff" />}
        </motion.button>

        {/* Sign in link on last slide */}
        <AnimatePresence>
          {current === SLIDES.length - 1 && (
            <motion.p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: 0, fontWeight: '500' }}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            >
              Already have an account?{' '}
              <span style={{ color: '#fff', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }} onClick={finish}>
                Sign In
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}