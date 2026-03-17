import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Shield, Zap, CreditCard, ArrowRight, Check } from 'lucide-react';

const SLIDES = [
  {
    id:       1,
    icon:     <Zap size={40} color="#1A73E8" />,
    iconBg:   'rgba(26,115,232,0.1)',
    accent:   '#1A73E8',
    title:    'Fast and Secure Transfers',
    subtitle: 'Send money instantly to anyone, anywhere in Pakistan. Real-time transfers with full transaction history and confirmation receipts.',
    features: [
      'Instant wallet-to-wallet transfers',
      'Transfer up to PKR 50,000 per transaction',
      'Full transaction history and PDF statements',
    ],
  },
  {
    id:       2,
    icon:     <Shield size={40} color="#16A34A" />,
    iconBg:   'rgba(22,163,74,0.1)',
    accent:   '#16A34A',
    title:    'Bank-Grade Security',
    subtitle: 'Your account is protected with PIN verification, KYC identity checks, OTP confirmation, and real-time fraud monitoring.',
    features: [
      '4-digit PIN required for every transaction',
      'KYC identity verification with CNIC',
      'Fraud detection alerts via email',
    ],
  },
  {
    id:       3,
    icon:     <CreditCard size={40} color="#7C3AED" />,
    iconBg:   'rgba(124,58,237,0.1)',
    accent:   '#7C3AED',
    title:    'All-in-One Wallet',
    subtitle: 'Pay utility bills, top up mobile balance, scan QR codes, track your spending insights, and manage a virtual card.',
    features: [
      'Pay electricity, gas and internet bills',
      'QR code payments and scanning',
      'Spending insights and analytics dashboard',
    ],
  },
];

export default function Onboarding() {
  const { colors }              = useTheme();
  const navigate                = useNavigate();
  const [current, setCurrent]   = useState(0);
  const [direction, setDirection] = useState(1);

  // Auto advance every 4 seconds
  useEffect(() => {
    if (current < SLIDES.length - 1) {
      const timer = setTimeout(() => {
        setDirection(1);
        setCurrent(c => c + 1);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [current]);

  const goTo = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      setDirection(1);
      setCurrent(c => c + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    localStorage.setItem('payease_onboarded', 'true');
    navigate('/login');
  };

  const slide = SLIDES[current];

  const variants = {
    enter:  (dir) => ({ x: dir > 0 ? 60  : -60,  opacity: 0 }),
    center: ()    => ({ x: 0,               opacity: 1 }),
    exit:   (dir) => ({ x: dir > 0 ? -60 : 60,   opacity: 0 }),
  };

  return (
    <div style={{ minHeight: '100vh', maxWidth: '480px', margin: '0 auto', background: colors.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Skip button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 24px 0' }}>
        <motion.button
          style={{ background: 'transparent', border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '6px 16px', color: colors.textSecondary, fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
          whileTap={{ scale: 0.95 }} onClick={finish}
        >
          Skip
        </motion.button>
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 32px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            {/* Icon */}
            <motion.div
              style={{ width: '120px', height: '120px', borderRadius: '32px', background: slide.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', position: 'relative' }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              {/* Outer ring */}
              <div style={{ position: 'absolute', inset: '-12px', borderRadius: '40px', border: `2px solid ${slide.accent}`, opacity: 0.15 }} />
              {slide.icon}
            </motion.div>

            {/* Title */}
            <motion.h1
              style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold', margin: '0 0 12px 0', textAlign: 'center', letterSpacing: '-0.5px', lineHeight: 1.3 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {slide.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              style={{ color: colors.textSecondary, fontSize: '14px', textAlign: 'center', margin: '0 0 28px 0', lineHeight: 1.7, maxWidth: '320px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {slide.subtitle}
            </motion.p>

            {/* Feature list */}
            <motion.div
              style={{ width: '100%', background: colors.card, borderRadius: '16px', padding: '4px 16px', border: `1px solid ${colors.border}` }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              {slide.features.map((feature, i) => (
                <motion.div
                  key={i}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < slide.features.length - 1 ? `1px solid ${colors.border}` : 'none' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                >
                  <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: slide.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={14} color={slide.accent} strokeWidth={2.5} />
                  </div>
                  <span style={{ color: colors.text, fontSize: '13px', fontWeight: '500', lineHeight: 1.4 }}>{feature}</span>
                </motion.div>
              ))}
            </motion.div>

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <div style={{ padding: '20px 32px 48px' }}>

        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              style={{ height: '4px', borderRadius: '2px', background: i === current ? slide.accent : colors.border, cursor: 'pointer' }}
              animate={{ width: i === current ? '24px' : '8px' }}
              transition={{ duration: 0.3 }}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* Next / Get Started button */}
        <motion.button
          style={{ width: '100%', padding: '15px', background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}CC)`, color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `0 8px 24px ${slide.accent}33`, marginBottom: '14px', letterSpacing: '0.2px' }}
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
        >
          {current === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          <ArrowRight size={17} color="#fff" />
        </motion.button>

        {/* Sign in link on last slide */}
        <AnimatePresence>
          {current === SLIDES.length - 1 && (
            <motion.p
              style={{ textAlign: 'center', color: colors.textSecondary, fontSize: '13px', margin: 0 }}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            >
              Already have an account?{' '}
              <span
                style={{ color: slide.accent, fontWeight: '600', cursor: 'pointer' }}
                onClick={finish}
              >
                Sign In
              </span>
            </motion.p>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
