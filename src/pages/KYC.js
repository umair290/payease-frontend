import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  ArrowLeft, CheckCircle, Clock, XCircle,
  Upload, Camera, CreditCard, User,
  AlertCircle, Shield, FileText, Sparkles
} from 'lucide-react';

export default function KYC() {
  const { isDark } = useTheme();
  const navigate   = useNavigate();

  const [kycStatus,      setKycStatus]      = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [step,           setStep]           = useState(1);
  const [fullNameOnCard, setFullNameOnCard] = useState('');
  const [dob,            setDob]            = useState('');
  const [cnic,           setCnic]           = useState('');
  const [cnicFront,      setCnicFront]      = useState(null);
  const [cnicBack,       setCnicBack]       = useState(null);
  const [selfie,         setSelfie]         = useState(null);
  const [submitting,     setSubmitting]     = useState(false);
  const [error,          setError]          = useState('');
  const [success,        setSuccess]        = useState(false);

  const bg       = isDark ? '#0A0F1E' : '#F0F4FF';
  const card     = isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
  const border   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const text     = isDark ? '#F0F6FC' : '#0F172A';
  const textSec  = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8';
  const inputBg  = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF';
  const actionBg = isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9';

  useEffect(() => { checkKycStatus(); }, []);

  const checkKycStatus = async () => {
    try {
      const res = await api.get('/api/kyc/status');
      setKycStatus(res.data);
    } catch (err) { setKycStatus(null); }
    setLoading(false);
  };

  const handleFileChange = (setter) => (e) => {
    const file = e.target.files[0];
    if (file) setter(file);
  };

  const handleSubmit = async () => {
    if (!cnic || !cnicFront || !cnicBack || !selfie) { setError('Please complete all steps!'); return; }
    setSubmitting(true); setError('');
    try {
      const formData = new FormData();
      formData.append('cnic_number',      cnic);
      formData.append('full_name_on_card', fullNameOnCard);
      formData.append('date_of_birth',    dob);
      formData.append('cnic_front',       cnicFront);
      formData.append('cnic_back',        cnicBack);
      formData.append('selfie',           selfie);
      await api.post('/api/kyc/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
      checkKycStatus();
    } catch (err) {
      setError(err.response?.data?.error || 'KYC submission failed');
    }
    setSubmitting(false);
  };

  const steps = [
    { num: 1, label: 'Details', grad: 'linear-gradient(135deg,#1A73E8,#0052CC)', shadow: 'rgba(26,115,232,0.4)' },
    { num: 2, label: 'Front',   grad: 'linear-gradient(135deg,#7C3AED,#5B21B6)', shadow: 'rgba(124,58,237,0.4)' },
    { num: 3, label: 'Back',    grad: 'linear-gradient(135deg,#EA580C,#C2410C)', shadow: 'rgba(234,88,12,0.4)' },
    { num: 4, label: 'Selfie',  grad: 'linear-gradient(135deg,#16A34A,#15803D)', shadow: 'rgba(22,163,74,0.4)' },
  ];

  // ── Upload Card ──
  const UploadCard = ({ file, onFile, accept, capture, title, subtitle, color = '#1A73E8', shadow = 'rgba(26,115,232,0.35)' }) => (
    <label style={{ display: 'block', cursor: 'pointer' }}>
      <motion.div
        style={{ border: `2px dashed ${file ? '#16A34A' : isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`, borderRadius: '18px', padding: '32px 20px', textAlign: 'center', background: file ? (isDark ? 'rgba(22,163,74,0.06)' : 'rgba(22,163,74,0.03)') : actionBg, transition: 'all 0.2s', marginBottom: '14px' }}
        whileTap={{ scale: 0.99 }}
        whileHover={{ borderColor: file ? '#16A34A' : color }}
      >
        {file ? (
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(22,163,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '2px solid rgba(22,163,74,0.2)' }}>
              <CheckCircle size={30} color="#16A34A" />
            </div>
            <p style={{ color: '#16A34A', fontSize: '15px', fontWeight: '800', margin: '0 0 4px 0' }}>Photo Selected ✓</p>
            <p style={{ color: textSec, fontSize: '11px', margin: '0 0 6px 0', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
              {file.name}
            </p>
            <p style={{ color: '#1A73E8', fontSize: '11px', margin: 0, fontWeight: '700' }}>Tap to change</p>
          </motion.div>
        ) : (
          <div>
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9', border: `2px dashed ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Camera size={26} color={textSec} />
            </div>
            <p style={{ color: text, fontSize: '15px', fontWeight: '700', margin: '0 0 5px 0' }}>{title}</p>
            <p style={{ color: textSec, fontSize: '12px', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>{subtitle}</p>
          </div>
        )}
      </motion.div>
      <input type="file" accept={accept} capture={capture} style={{ display: 'none' }} onChange={onFile} />
    </label>
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <motion.div
        style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(26,115,232,0.4)' }}
        animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Shield size={28} color="#fff" />
      </motion.div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[0,1,2].map(i => (
          <motion.div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1A73E8' }}
            animate={{ opacity: [0.3,1,0.3], scale: [0.8,1.2,0.8] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );

  // ── STATUS SCREEN ──
  const StatusScreen = ({ grad, icon, title, subtitle, badge, badgeColor, badgeBg, extra, primaryBtn, primaryAction, secondaryBtn, secondaryAction }) => (
    <div style={{ minHeight: '100vh', background: bg, maxWidth: '480px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Hero */}
      <div style={{ background: grad, padding: '60px 20px 40px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />

        <motion.div style={{ position: 'absolute', top: '20px', left: '20px', width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', zIndex: 1 }}
          whileTap={{ scale: 0.88 }} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} color="#fff" />
        </motion.div>

        <motion.div
          style={{ width: '88px', height: '88px', borderRadius: '28px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '2px solid rgba(255,255,255,0.3)', position: 'relative', zIndex: 1 }}
          initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        >
          {icon}
        </motion.div>

        <motion.div
          style={{ display: 'inline-flex', alignItems: 'center', background: badgeBg, borderRadius: '20px', padding: '5px 14px', marginBottom: '12px', border: `1px solid ${badgeColor}30`, position: 'relative', zIndex: 1 }}
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
        >
          <span style={{ color: badgeColor, fontSize: '12px', fontWeight: '800' }}>{badge}</span>
        </motion.div>

        <motion.h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px', position: 'relative', zIndex: 1 }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          {title}
        </motion.h2>
        <motion.p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', lineHeight: '1.7', margin: 0, maxWidth: '300px', display: 'inline-block', position: 'relative', zIndex: 1 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {subtitle}
        </motion.p>
      </div>

      <div style={{ padding: '16px' }}>
        {extra && (
          <motion.div style={{ marginBottom: '16px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            {extra}
          </motion.div>
        )}

        <motion.button
          style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 28px rgba(26,115,232,0.4)', marginBottom: '10px', letterSpacing: '0.2px' }}
          whileTap={{ scale: 0.97 }} onClick={primaryAction}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
        >
          {primaryBtn}
        </motion.button>

        {secondaryBtn && (
          <motion.button
            style={{ width: '100%', padding: '14px', background: 'transparent', color: textSec, border: `1.5px solid ${border}`, borderRadius: '14px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}
            whileTap={{ scale: 0.97 }} onClick={secondaryAction}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          >
            {secondaryBtn}
          </motion.button>
        )}
      </div>
    </div>
  );

  // ── Detail row helper ──
  const DetailRow = ({ label, value, color, last }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px', borderBottom: last ? 'none' : `1px solid ${border}` }}>
      <span style={{ color: textSec, fontSize: '12px', fontWeight: '600' }}>{label}</span>
      <span style={{ color: color || text, fontWeight: '700', fontSize: '13px' }}>{value}</span>
    </div>
  );

  // ── APPROVED ──
  if (kycStatus?.status === 'approved') return (
    <StatusScreen
      grad="linear-gradient(160deg,#134E5E 0%,#16A34A 60%,#15803D 100%)"
      icon={<CheckCircle size={44} color="#fff" />}
      badge="✓ Identity Verified"
      badgeColor="#4ADE80"
      badgeBg="rgba(74,222,128,0.15)"
      title="Identity Verified!"
      subtitle="Your identity has been successfully verified. You can now use all PayEase features including transfers and higher limits."
      extra={
        <div style={{ background: card, borderRadius: '18px', overflow: 'hidden', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(22,163,74,0.06)' : 'rgba(22,163,74,0.04)' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: 'rgba(22,163,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={13} color="#16A34A" />
            </div>
            <p style={{ color: '#16A34A', fontSize: '12px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verification Details</p>
          </div>
          <DetailRow label="Status"    value="✓ Approved"               color="#16A34A" />
          <DetailRow label="ID Number" value={kycStatus.cnic_number} />
          <DetailRow label="Full Name" value={kycStatus.full_name_on_card || 'N/A'} last />
        </div>
      }
      primaryBtn="Back to Dashboard"
      primaryAction={() => navigate('/dashboard')}
    />
  );

  // ── PENDING ──
  if (kycStatus?.status === 'pending') return (
    <StatusScreen
      grad="linear-gradient(160deg,#92400E 0%,#CA8A04 60%,#D97706 100%)"
      icon={
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
          <Clock size={44} color="#fff" />
        </motion.div>
      }
      badge="⏳ Under Review"
      badgeColor="#FCD34D"
      badgeBg="rgba(252,211,77,0.15)"
      title="Documents Under Review"
      subtitle="Our team is reviewing your documents. This usually takes up to 24 hours. We will notify you by email once done."
      extra={
        <div style={{ background: card, borderRadius: '18px', overflow: 'hidden', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}`, background: isDark ? 'rgba(202,138,4,0.06)' : 'rgba(202,138,4,0.04)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: 'rgba(202,138,4,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={13} color="#CA8A04" />
            </div>
            <p style={{ color: '#CA8A04', fontSize: '12px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Submission Details</p>
          </div>
          <DetailRow label="Status"    value="Pending Review"                color="#CA8A04" />
          <DetailRow label="ID Number" value={kycStatus.cnic_number} />
          <DetailRow label="Submitted" value={kycStatus.submitted_at ? new Date(kycStatus.submitted_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'} last />
        </div>
      }
      primaryBtn="Back to Dashboard"
      primaryAction={() => navigate('/dashboard')}
    />
  );

  // ── REJECTED ──
  if (kycStatus?.status === 'rejected') return (
    <StatusScreen
      grad="linear-gradient(160deg,#7F1D1D 0%,#DC2626 60%,#B91C1C 100%)"
      icon={<XCircle size={44} color="#fff" />}
      badge="✗ Not Approved"
      badgeColor="#FCA5A5"
      badgeBg="rgba(252,165,165,0.15)"
      title="KYC Not Approved"
      subtitle="Your application was rejected. Please review the reason and resubmit with correct documents."
      extra={kycStatus.rejection_reason && (
        <div style={{ background: isDark ? 'rgba(220,38,38,0.08)' : 'rgba(220,38,38,0.05)', border: `1px solid ${isDark ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.15)'}`, borderRadius: '16px', padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(220,38,38,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={14} color="#DC2626" />
            </div>
            <span style={{ color: '#DC2626', fontSize: '13px', fontWeight: '800' }}>Rejection Reason</span>
          </div>
          <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748B', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{kycStatus.rejection_reason}</p>
        </div>
      )}
      primaryBtn="Resubmit KYC"
      primaryAction={() => { setKycStatus(null); setStep(1); }}
      secondaryBtn="Back to Dashboard"
      secondaryAction={() => navigate('/dashboard')}
    />
  );

  // ── SUCCESS ──
  if (success) return (
    <StatusScreen
      grad="linear-gradient(160deg,#134E5E 0%,#16A34A 60%,#15803D 100%)"
      icon={<CheckCircle size={44} color="#fff" />}
      badge="✓ Submitted"
      badgeColor="#4ADE80"
      badgeBg="rgba(74,222,128,0.15)"
      title="Documents Submitted!"
      subtitle="Your KYC documents have been submitted. Our team will review them within 24 hours and notify you by email."
      primaryBtn="Back to Dashboard"
      primaryAction={() => navigate('/dashboard')}
    />
  );

  // ── KYC FORM ──
  const stepData = steps[step - 1];

  return (
    <div style={{ minHeight: '100vh', background: bg, maxWidth: '480px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* ── HERO HEADER ── */}
      <div style={{ background: stepData.grad, padding: '48px 20px 28px', position: 'relative', overflow: 'hidden', transition: 'background 0.4s' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />

        {/* Back */}
        <motion.div
          style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '20px', position: 'relative', zIndex: 1 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)}
        >
          <ArrowLeft size={18} color="#fff" />
        </motion.div>

        {/* Title */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Shield size={18} color="#fff" />
            </div>
            <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>KYC Verification</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: '0 0 20px 0', fontWeight: '500' }}>
            Step {step} of 4 — {stepData.label}
          </p>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <motion.div
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: step > s.num ? 'rgba(74,222,128,0.3)' : step === s.num ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: step === s.num ? '2px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', boxShadow: step === s.num ? '0 4px 14px rgba(0,0,0,0.2)' : 'none' }}
                  animate={{ scale: step === s.num ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {step > s.num
                    ? <CheckCircle size={14} color="#4ADE80" />
                    : <span style={{ color: '#fff', fontSize: '11px', fontWeight: '800', opacity: step >= s.num ? 1 : 0.5 }}>{s.num}</span>
                  }
                </motion.div>
                {i < 3 && (
                  <div style={{ flex: 1, height: '2px', borderRadius: '1px', background: step > s.num ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.15)', transition: 'background 0.3s' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Details ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

              {/* Info banner */}
              <motion.div
                style={{ background: isDark ? 'rgba(26,115,232,0.08)' : 'rgba(26,115,232,0.05)', border: `1px solid ${isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.12)'}`, borderRadius: '14px', padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '12px' }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield size={17} color="#1A73E8" />
                </div>
                <div>
                  <p style={{ color: '#1A73E8', fontSize: '13px', fontWeight: '700', margin: '0 0 3px 0' }}>Why do we need this?</p>
                  <p style={{ color: textSec, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
                    KYC verification is required by law to prevent fraud and enable higher transfer limits.
                  </p>
                </div>
              </motion.div>

              {/* Form card */}
              <motion.div
                style={{ background: card, borderRadius: '20px', padding: '20px', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg,#1A73E8,#0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 16px rgba(26,115,232,0.35)' }}>
                    <CreditCard size={22} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ color: text, fontSize: '16px', fontWeight: '800', margin: '0 0 2px 0', letterSpacing: '-0.3px' }}>Identity Card Details</h3>
                    <p style={{ color: textSec, fontSize: '12px', margin: 0, fontWeight: '500' }}>Enter details exactly as on your CNIC</p>
                  </div>
                </div>

                {/* Full name */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ color: textSec, fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Full Name on Card</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${fullNameOnCard ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '14px', padding: '0 16px', background: inputBg, transition: 'all 0.2s', boxShadow: fullNameOnCard ? '0 0 0 4px rgba(26,115,232,0.1)' : 'none' }}>
                    <User size={16} color={fullNameOnCard ? '#1A73E8' : textSec} style={{ flexShrink: 0, marginRight: '10px' }} />
                    <input
                      style={{ flex: 1, padding: '14px 0', border: 'none', background: 'transparent', color: text, fontSize: '14px', outline: 'none', fontWeight: '500' }}
                      placeholder="e.g. Muhammad Ali Khan"
                      value={fullNameOnCard}
                      onChange={(e) => setFullNameOnCard(e.target.value)}
                    />
                  </div>
                </div>

                {/* CNIC */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ color: textSec, fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Identity Card Number (13 digits)</label>
                  <input
                    style={{ width: '100%', padding: '16px', border: `2px solid ${cnic.length === 13 ? '#16A34A' : cnic.length > 0 ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '14px', fontSize: '20px', fontWeight: '800', letterSpacing: '6px', textAlign: 'center', outline: 'none', boxSizing: 'border-box', background: inputBg, color: text, transition: 'all 0.2s', boxShadow: cnic.length === 13 ? '0 0 0 4px rgba(22,163,74,0.1)' : cnic.length > 0 ? '0 0 0 4px rgba(26,115,232,0.1)' : 'none' }}
                    placeholder="0000000000000"
                    maxLength="13"
                    value={cnic}
                    inputMode="numeric"
                    onChange={(e) => setCnic(e.target.value.replace(/\D/g, ''))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ color: textSec, fontSize: '11px', fontWeight: '500' }}>{cnic.length}/13 digits</span>
                    {cnic.length === 13 && (
                      <motion.span style={{ color: '#16A34A', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <CheckCircle size={11} color="#16A34A" /> Valid format
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* DOB */}
                <div>
                  <label style={{ color: textSec, fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Date of Birth</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${dob ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '14px', padding: '0 16px', background: inputBg, transition: 'all 0.2s', boxShadow: dob ? '0 0 0 4px rgba(26,115,232,0.1)' : 'none' }}>
                    <FileText size={16} color={dob ? '#1A73E8' : textSec} style={{ flexShrink: 0, marginRight: '10px' }} />
                    <input
                      style={{ flex: 1, padding: '14px 0', border: 'none', background: 'transparent', color: text, fontSize: '14px', outline: 'none', fontWeight: '500' }}
                      type="date" value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </motion.div>

              {error && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '12px', padding: '12px 14px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle size={14} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span></motion.div>}

              <motion.button
                style={{ width: '100%', padding: '16px', background: fullNameOnCard && cnic.length === 13 && dob ? 'linear-gradient(135deg,#1A73E8,#0052CC)' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: fullNameOnCard && cnic.length === 13 && dob ? '#fff' : textSec, border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', marginTop: '14px', boxShadow: fullNameOnCard && cnic.length === 13 && dob ? '0 8px 28px rgba(26,115,232,0.4)' : 'none', transition: 'all 0.25s', letterSpacing: '0.2px' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (!fullNameOnCard.trim()) { setError('Please enter your full name'); return; }
                  if (cnic.length !== 13)     { setError('Identity card number must be 13 digits'); return; }
                  if (!dob)                   { setError('Please enter your date of birth'); return; }
                  setError(''); setStep(2);
                }}
              >
                Continue →
              </motion.button>
            </motion.div>
          )}

          {/* ── STEPS 2, 3, 4 ── */}
          {[
            { key: 's2', stepNum: 2, file: cnicFront, setter: setCnicFront, color: '#7C3AED', grad: 'linear-gradient(135deg,#7C3AED,#5B21B6)', shadow: 'rgba(124,58,237,0.35)', title: 'CNIC Front Side', subtitle: 'Photo of the front of your identity card', uploadTitle: 'Tap to capture front', uploadSub: 'Make sure text is clearly visible', tip: 'Ensure the card is flat, well-lit, and all 4 corners are visible. Avoid glare.', errMsg: 'Please upload identity card front' },
            { key: 's3', stepNum: 3, file: cnicBack,  setter: setCnicBack,  color: '#EA580C', grad: 'linear-gradient(135deg,#EA580C,#C2410C)', shadow: 'rgba(234,88,12,0.35)',   title: 'CNIC Back Side',  subtitle: 'Photo of the back of your identity card',  uploadTitle: 'Tap to capture back',  uploadSub: 'Make sure text is clearly visible', tip: 'The back side contains your address and important information needed for verification.', errMsg: 'Please upload identity card back' },
          ].map(({ key, stepNum, file, setter, color, grad, shadow, title, subtitle, uploadTitle, uploadSub, tip, errMsg }) => (
            step === stepNum && (
              <motion.div key={key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <motion.div
                  style={{ background: card, borderRadius: '20px', padding: '20px', border: `1px solid ${border}`, marginBottom: '14px', boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 6px 16px ${shadow}` }}>
                      <Upload size={22} color="#fff" />
                    </div>
                    <div>
                      <h3 style={{ color: text, fontSize: '16px', fontWeight: '800', margin: '0 0 2px 0', letterSpacing: '-0.3px' }}>{title}</h3>
                      <p style={{ color: textSec, fontSize: '12px', margin: 0, fontWeight: '500' }}>{subtitle}</p>
                    </div>
                  </div>

                  <UploadCard file={file} onFile={handleFileChange(setter)} accept="image/*" capture="environment" title={uploadTitle} subtitle={uploadSub} color={color} shadow={shadow} />

                  <div style={{ background: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.04)', borderRadius: '12px', padding: '12px 14px', border: `1px solid ${isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.12)'}`, display: 'flex', gap: '10px' }}>
                    <AlertCircle size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ color: textSec, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>{tip}</p>
                  </div>
                </motion.div>

                {error && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle size={14} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span></motion.div>}

                <motion.button
                  style={{ width: '100%', padding: '16px', background: file ? grad : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: file ? '#fff' : textSec, border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: file ? `0 8px 28px ${shadow}` : 'none', transition: 'all 0.25s', letterSpacing: '0.2px' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { if (!file) { setError(errMsg); return; } setError(''); setStep(stepNum + 1); }}
                >
                  Continue →
                </motion.button>
              </motion.div>
            )
          ))}

          {/* ── STEP 4: Selfie ── */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

              {/* Selfie upload */}
              <motion.div
                style={{ background: card, borderRadius: '20px', padding: '20px', border: `1px solid ${border}`, marginBottom: '14px', boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg,#16A34A,#15803D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 16px rgba(22,163,74,0.35)' }}>
                    <User size={22} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ color: text, fontSize: '16px', fontWeight: '800', margin: '0 0 2px 0', letterSpacing: '-0.3px' }}>Face Verification</h3>
                    <p style={{ color: textSec, fontSize: '12px', margin: 0, fontWeight: '500' }}>Take a selfie for identity confirmation</p>
                  </div>
                </div>

                <UploadCard file={selfie} onFile={handleFileChange(setSelfie)} accept="image/*" capture="user" title="Take a selfie" subtitle="Use front camera in good lighting" color="#16A34A" shadow="rgba(22,163,74,0.35)" />

                <div style={{ background: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.04)', borderRadius: '12px', padding: '12px 14px', border: `1px solid ${isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.12)'}`, display: 'flex', gap: '10px' }}>
                  <AlertCircle size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ color: textSec, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>Look directly at the camera. Make sure your face is clearly visible and well-lit.</p>
                </div>
              </motion.div>

              {/* Review summary */}
              <motion.div
                style={{ background: card, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${border}`, marginBottom: '14px', boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              >
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFF' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={13} color="#1A73E8" />
                  </div>
                  <p style={{ color: text, fontSize: '12px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Review Submission</p>
                </div>
                {[
                  { label: 'Full Name',   value: fullNameOnCard,   done: !!fullNameOnCard },
                  { label: 'CNIC Number', value: cnic,             done: cnic.length === 13 },
                  { label: 'Date of Birth',value: dob,             done: !!dob },
                  { label: 'CNIC Front',  value: cnicFront?.name,  done: !!cnicFront },
                  { label: 'CNIC Back',   value: cnicBack?.name,   done: !!cnicBack },
                  { label: 'Selfie',      value: selfie?.name,     done: !!selfie },
                ].map((row, i, arr) => (
                  <motion.div key={i}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.04 }}
                  >
                    <span style={{ color: textSec, fontSize: '12px', fontWeight: '600' }}>{row.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: row.done ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {row.done ? <CheckCircle size={12} color="#16A34A" /> : <AlertCircle size={12} color="#DC2626" />}
                      </div>
                      <span style={{ color: row.done ? text : '#DC2626', fontSize: '12px', fontWeight: '600', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.value || 'Missing'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {error && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle size={14} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span></motion.div>}

              <motion.button
                style={{ width: '100%', padding: '16px', background: selfie && !submitting ? 'linear-gradient(135deg,#16A34A,#15803D)' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: selfie && !submitting ? '#fff' : textSec, border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: selfie ? '0 8px 28px rgba(22,163,74,0.4)' : 'none', transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '0.2px' }}
                whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={submitting}
              >
                {submitting
                  ? <motion.span animate={{ opacity: [1,0.5,1] }} transition={{ duration: 1, repeat: Infinity }}>Submitting documents...</motion.span>
                  : <><Shield size={16} color={selfie ? '#fff' : textSec} /> Submit KYC Documents</>
                }
              </motion.button>

              <div style={{ height: '40px' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
