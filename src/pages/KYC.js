import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  ArrowLeft, CheckCircle, Clock, XCircle,
  Upload, Camera, CreditCard, User,
  AlertCircle, Shield, FileText
} from 'lucide-react';

export default function KYC() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [fullNameOnCard, setFullNameOnCard] = useState('');
  const [dob, setDob] = useState('');
  const [cnic, setCnic] = useState('');
  const [cnicFront, setCnicFront] = useState(null);
  const [cnicBack, setCnicBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    if (!cnic || !cnicFront || !cnicBack || !selfie) {
      setError('Please complete all steps!'); return;
    }
    setSubmitting(true); setError('');
    try {
      const formData = new FormData();
      formData.append('cnic_number', cnic);
      formData.append('full_name_on_card', fullNameOnCard);
      formData.append('date_of_birth', dob);
      formData.append('cnic_front', cnicFront);
      formData.append('cnic_back', cnicBack);
      formData.append('selfie', selfie);
      await api.post('/api/kyc/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      checkKycStatus();
    } catch (err) {
      setError(err.response?.data?.error || 'KYC submission failed');
    }
    setSubmitting(false);
  };

  const steps = [
    { num: 1, label: 'Details', icon: <CreditCard size={14} /> },
    { num: 2, label: 'Front', icon: <Upload size={14} /> },
    { num: 3, label: 'Back', icon: <Upload size={14} /> },
    { num: 4, label: 'Selfie', icon: <User size={14} /> },
  ];

  // ── UPLOAD CARD ──
  const UploadCard = ({ file, onFile, accept, capture, title, subtitle }) => (
    <label style={{ display: 'block', cursor: 'pointer' }}>
      <motion.div
        style={{ border: `2px dashed ${file ? '#16A34A' : colors.border}`, borderRadius: '16px', padding: '32px 20px', textAlign: 'center', background: file ? 'rgba(22,163,74,0.04)' : colors.actionBg, transition: 'all 0.2s', marginBottom: '16px' }}
        whileTap={{ scale: 0.99 }}
      >
        {file ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <CheckCircle size={28} color="#16A34A" />
            </div>
            <p style={{ color: '#16A34A', fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0' }}>Photo Selected ✓</p>
            <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
              {file.name}
            </p>
            <p style={{ color: '#16A34A', fontSize: '11px', margin: '6px 0 0 0', fontWeight: '600' }}>Tap to change</p>
          </motion.div>
        ) : (
          <div>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: colors.card, border: `1.5px dashed ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Camera size={24} color={colors.textSecondary} />
            </div>
            <p style={{ color: colors.text, fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' }}>{title}</p>
            <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, lineHeight: '1.5' }}>{subtitle}</p>
          </div>
        )}
      </motion.div>
      <input type="file" accept={accept} capture={capture} style={{ display: 'none' }} onChange={onFile} />
    </label>
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: '40px', height: '40px', border: `3px solid ${colors.border}`, borderTop: '3px solid #1A73E8', borderRadius: '50%' }} />
    </div>
  );

  // ── STATUS SCREEN ──
  const StatusScreen = ({ icon, iconBg, title, subtitle, badge, badgeColor, badgeBg, extra, primaryBtn, primaryAction, secondaryBtn, secondaryAction }) => (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: colors.card, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <motion.div style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.actionBg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          whileTap={{ scale: 0.9 }} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} color={colors.text} />
        </motion.div>
        <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>KYC Verification</h2>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
          style={{ width: '88px', height: '88px', borderRadius: '28px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        >
          {icon}
        </motion.div>

        <motion.div
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: badgeBg, borderRadius: '20px', padding: '5px 14px', marginBottom: '14px' }}
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
        >
          <span style={{ color: badgeColor, fontSize: '12px', fontWeight: '700' }}>{badge}</span>
        </motion.div>

        <motion.h2 style={{ color: colors.text, fontSize: '22px', fontWeight: 'bold', margin: '0 0 8px 0', textAlign: 'center' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {title}
        </motion.h2>
        <motion.p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: '1.6', textAlign: 'center', margin: '0 0 24px 0', maxWidth: '300px' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {subtitle}
        </motion.p>

        {extra && (
          <motion.div style={{ width: '100%', marginBottom: '20px' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            {extra}
          </motion.div>
        )}

        <motion.button
          style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,115,232,0.3)', marginBottom: '10px' }}
          whileTap={{ scale: 0.97 }} onClick={primaryAction}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          {primaryBtn}
        </motion.button>

        {secondaryBtn && (
          <motion.button
            style={{ width: '100%', padding: '14px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}
            whileTap={{ scale: 0.97 }} onClick={secondaryAction}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          >
            {secondaryBtn}
          </motion.button>
        )}
      </div>
    </div>
  );

  // Approved
  if (kycStatus?.status === 'approved') return (
    <StatusScreen
      icon={<CheckCircle size={44} color="#16A34A" />}
      iconBg="rgba(22,163,74,0.1)"
      badge="✓ Verified"
      badgeColor="#16A34A"
      badgeBg="rgba(22,163,74,0.1)"
      title="Identity Verified!"
      subtitle="Your identity has been successfully verified. You can now use all PayEase features including transfers."
      extra={
        <div style={{ background: colors.card, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
          {[
            { label: 'Status', value: '✓ Approved', color: '#16A34A' },
            { label: 'ID Number', value: kycStatus.cnic_number },
            { label: 'Full Name', value: kycStatus.full_name_on_card || 'N/A' },
          ].map((row, i, arr) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
              <span style={{ color: colors.textSecondary, fontSize: '13px' }}>{row.label}</span>
              <span style={{ color: row.color || colors.text, fontWeight: '600', fontSize: '13px' }}>{row.value}</span>
            </div>
          ))}
        </div>
      }
      primaryBtn="Back to Dashboard"
      primaryAction={() => navigate('/dashboard')}
    />
  );

  // Pending
  if (kycStatus?.status === 'pending') return (
    <StatusScreen
      icon={
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
          <Clock size={44} color="#CA8A04" />
        </motion.div>
      }
      iconBg="rgba(202,138,4,0.1)"
      badge="⏳ Under Review"
      badgeColor="#CA8A04"
      badgeBg="rgba(202,138,4,0.1)"
      title="Documents Under Review"
      subtitle="Our team is reviewing your documents. This usually takes up to 24 hours. We'll notify you once done."
      extra={
        <div style={{ background: colors.card, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
          {[
            { label: 'Status', value: 'Pending Review', color: '#CA8A04' },
            { label: 'ID Number', value: kycStatus.cnic_number },
            { label: 'Submitted', value: kycStatus.submitted_at ? new Date(kycStatus.submitted_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A' },
          ].map((row, i, arr) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
              <span style={{ color: colors.textSecondary, fontSize: '13px' }}>{row.label}</span>
              <span style={{ color: row.color || colors.text, fontWeight: '600', fontSize: '13px' }}>{row.value}</span>
            </div>
          ))}
        </div>
      }
      primaryBtn="Back to Dashboard"
      primaryAction={() => navigate('/dashboard')}
    />
  );

  // Rejected
  if (kycStatus?.status === 'rejected') return (
    <StatusScreen
      icon={<XCircle size={44} color="#DC2626" />}
      iconBg="rgba(220,38,38,0.1)"
      badge="✗ Rejected"
      badgeColor="#DC2626"
      badgeBg="rgba(220,38,38,0.1)"
      title="KYC Not Approved"
      subtitle="Your KYC application was rejected. Please review the reason below and resubmit with correct documents."
      extra={kycStatus.rejection_reason && (
        <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertCircle size={16} color="#DC2626" />
            <span style={{ color: '#DC2626', fontSize: '13px', fontWeight: '700' }}>Rejection Reason</span>
          </div>
          <p style={{ color: '#DC2626', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{kycStatus.rejection_reason}</p>
        </div>
      )}
      primaryBtn="Resubmit KYC"
      primaryAction={() => { setKycStatus(null); setStep(1); }}
      secondaryBtn="Back to Dashboard"
      secondaryAction={() => navigate('/dashboard')}
    />
  );

  // Success
  if (success) return (
    <StatusScreen
      icon={<CheckCircle size={44} color="#16A34A" />}
      iconBg="rgba(22,163,74,0.1)"
      badge="✓ Submitted"
      badgeColor="#16A34A"
      badgeBg="rgba(22,163,74,0.1)"
      title="Documents Submitted!"
      subtitle="Your KYC documents have been submitted successfully. Our team will review them within 24 hours."
      primaryBtn="Back to Dashboard"
      primaryAction={() => navigate('/dashboard')}
    />
  );

  // ── KYC FORM ──
  return (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: colors.card, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <motion.div
          style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.actionBg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)}
        >
          <ArrowLeft size={20} color={colors.text} />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>KYC Verification</h2>
          <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>Step {step} of 4</p>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Progress Bar */}
      <div style={{ background: colors.card, padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
        {/* Progress Line */}
        <div style={{ background: colors.border, borderRadius: '4px', height: '4px', marginBottom: '12px', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #1A73E8, #0052CC)' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>

        {/* Step Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {steps.map((s) => (
            <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <motion.div
                style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step > s.num ? '#16A34A' : step === s.num ? '#1A73E8' : colors.actionBg, border: step >= s.num ? 'none' : `1.5px solid ${colors.border}` }}
                animate={{ scale: step === s.num ? 1.1 : 1 }}
              >
                {step > s.num
                  ? <CheckCircle size={14} color="#fff" />
                  : <span style={{ color: step >= s.num ? '#fff' : colors.textSecondary, fontSize: '11px', fontWeight: '700' }}>{s.num}</span>
                }
              </motion.div>
              <span style={{ color: step >= s.num ? colors.text : colors.textSecondary, fontSize: '10px', fontWeight: step === s.num ? '600' : '400' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div style={{ padding: '16px' }}>
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Details ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

              {/* Info Banner */}
              <div style={{ background: 'rgba(26,115,232,0.06)', border: '1px solid rgba(26,115,232,0.15)', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '12px' }}>
                <Shield size={18} color="#1A73E8" style={{ flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <p style={{ color: '#1A73E8', fontSize: '13px', fontWeight: '600', margin: '0 0 3px 0' }}>Why do we need this?</p>
                  <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
                    KYC verification is required by law to prevent fraud and enable higher transfer limits.
                  </p>
                </div>
              </div>

              <div style={{ background: colors.card, borderRadius: '20px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CreditCard size={22} color="#1A73E8" />
                  </div>
                  <div>
                    <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', margin: '0 0 2px 0' }}>Identity Card Details</h3>
                    <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>Enter details exactly as on your CNIC</p>
                  </div>
                </div>

                {/* Full Name */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Full Name on Card</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${fullNameOnCard ? '#1A73E8' : colors.border}`, borderRadius: '12px', padding: '0 14px', background: colors.inputBg, transition: 'all 0.2s', boxShadow: fullNameOnCard ? '0 0 0 3px rgba(26,115,232,0.08)' : 'none' }}>
                    <User size={15} color={fullNameOnCard ? '#1A73E8' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '10px' }} />
                    <input
                      style={{ flex: 1, padding: '13px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none' }}
                      placeholder="e.g. Muhammad Ali Khan"
                      value={fullNameOnCard}
                      onChange={(e) => setFullNameOnCard(e.target.value)}
                    />
                  </div>
                </div>

                {/* CNIC */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Identity Card Number (13 digits)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ width: '100%', padding: '16px', border: `2px solid ${cnic.length === 13 ? '#16A34A' : cnic.length > 0 ? '#1A73E8' : colors.border}`, borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', letterSpacing: '6px', textAlign: 'center', outline: 'none', boxSizing: 'border-box', background: colors.inputBg, color: colors.text, transition: 'all 0.2s', boxShadow: cnic.length === 13 ? '0 0 0 3px rgba(22,163,74,0.1)' : cnic.length > 0 ? '0 0 0 3px rgba(26,115,232,0.08)' : 'none' }}
                      placeholder="0000000000000"
                      maxLength="13"
                      value={cnic}
                      inputMode="numeric"
                      onChange={(e) => setCnic(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ color: colors.textSecondary, fontSize: '11px' }}>{cnic.length}/13 digits</span>
                    {cnic.length === 13 && (
                      <motion.span style={{ color: '#16A34A', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <CheckCircle size={11} color="#16A34A" /> Valid format
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* DOB */}
                <div style={{ marginBottom: '4px' }}>
                  <label style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Date of Birth</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${dob ? '#1A73E8' : colors.border}`, borderRadius: '12px', padding: '0 14px', background: colors.inputBg, transition: 'all 0.2s' }}>
                    <FileText size={15} color={dob ? '#1A73E8' : colors.textSecondary} style={{ flexShrink: 0, marginRight: '10px' }} />
                    <input
                      style={{ flex: 1, padding: '13px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none' }}
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <motion.div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '12px 14px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <AlertCircle size={15} color="#DC2626" />
                  <span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span>
                </motion.div>
              )}

              <motion.button
                style={{ width: '100%', padding: '15px', background: fullNameOnCard && cnic.length === 13 && dob ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : '#E5E7EB', color: fullNameOnCard && cnic.length === 13 && dob ? '#fff' : '#9CA3AF', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '16px', boxShadow: fullNameOnCard && cnic.length === 13 && dob ? '0 6px 20px rgba(26,115,232,0.3)' : 'none', transition: 'all 0.25s' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (!fullNameOnCard.trim()) { setError('Please enter your full name'); return; }
                  if (cnic.length !== 13) { setError('Identity card number must be 13 digits'); return; }
                  if (!dob) { setError('Please enter your date of birth'); return; }
                  setError(''); setStep(2);
                }}
              >
                Continue →
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP 2: Front ── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <div style={{ background: colors.card, borderRadius: '20px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Upload size={22} color="#1A73E8" />
                  </div>
                  <div>
                    <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', margin: '0 0 2px 0' }}>CNIC Front Side</h3>
                    <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>Photo of the front of your identity card</p>
                  </div>
                </div>

                <UploadCard
                  file={cnicFront}
                  onFile={handleFileChange(setCnicFront)}
                  accept="image/*"
                  capture="environment"
                  title="Tap to capture front"
                  subtitle="Make sure text is clearly visible"
                />

                <div style={{ background: colors.actionBg, borderRadius: '12px', padding: '12px 14px', border: `1px solid ${colors.border}`, display: 'flex', gap: '10px' }}>
                  <AlertCircle size={15} color="#CA8A04" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
                    Ensure the card is flat, well-lit, and all 4 corners are visible. Avoid glare.
                  </p>
                </div>
              </div>

              {error && (
                <motion.div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <AlertCircle size={15} color="#DC2626" />
                  <span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span>
                </motion.div>
              )}

              <motion.button
                style={{ width: '100%', padding: '15px', background: cnicFront ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : '#E5E7EB', color: cnicFront ? '#fff' : '#9CA3AF', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: cnicFront ? '0 6px 20px rgba(26,115,232,0.3)' : 'none', transition: 'all 0.25s' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { if (!cnicFront) { setError('Please upload identity card front'); return; } setError(''); setStep(3); }}
              >
                Continue →
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP 3: Back ── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <div style={{ background: colors.card, borderRadius: '20px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(156,39,176,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Upload size={22} color="#9C27B0" />
                  </div>
                  <div>
                    <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', margin: '0 0 2px 0' }}>CNIC Back Side</h3>
                    <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>Photo of the back of your identity card</p>
                  </div>
                </div>

                <UploadCard
                  file={cnicBack}
                  onFile={handleFileChange(setCnicBack)}
                  accept="image/*"
                  capture="environment"
                  title="Tap to capture back"
                  subtitle="Make sure text is clearly visible"
                />

                <div style={{ background: colors.actionBg, borderRadius: '12px', padding: '12px 14px', border: `1px solid ${colors.border}`, display: 'flex', gap: '10px' }}>
                  <AlertCircle size={15} color="#CA8A04" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
                    The back side contains your address and other important information needed for verification.
                  </p>
                </div>
              </div>

              {error && (
                <motion.div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <AlertCircle size={15} color="#DC2626" />
                  <span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span>
                </motion.div>
              )}

              <motion.button
                style={{ width: '100%', padding: '15px', background: cnicBack ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : '#E5E7EB', color: cnicBack ? '#fff' : '#9CA3AF', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: cnicBack ? '0 6px 20px rgba(26,115,232,0.3)' : 'none', transition: 'all 0.25s' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { if (!cnicBack) { setError('Please upload identity card back'); return; } setError(''); setStep(4); }}
              >
                Continue →
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP 4: Selfie ── */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <div style={{ background: colors.card, borderRadius: '20px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={22} color="#16A34A" />
                  </div>
                  <div>
                    <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', margin: '0 0 2px 0' }}>Face Verification</h3>
                    <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>Take a selfie for identity confirmation</p>
                  </div>
                </div>

                <UploadCard
                  file={selfie}
                  onFile={handleFileChange(setSelfie)}
                  accept="image/*"
                  capture="user"
                  title="Take a selfie"
                  subtitle="Use front camera in good lighting"
                />

                <div style={{ background: colors.actionBg, borderRadius: '12px', padding: '12px 14px', border: `1px solid ${colors.border}`, display: 'flex', gap: '10px' }}>
                  <AlertCircle size={15} color="#CA8A04" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
                    Look directly at the camera. Make sure your face is clearly visible and well-lit.
                  </p>
                </div>
              </div>

              {/* Review Summary */}
              <div style={{ background: colors.card, borderRadius: '16px', padding: '16px', border: `1px solid ${colors.border}`, marginBottom: '14px' }}>
                <p style={{ color: colors.text, fontSize: '13px', fontWeight: '700', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Review Submission</p>
                {[
                  { label: 'Full Name', value: fullNameOnCard, done: !!fullNameOnCard },
                  { label: 'CNIC Number', value: cnic, done: cnic.length === 13 },
                  { label: 'Date of Birth', value: dob, done: !!dob },
                  { label: 'CNIC Front', value: cnicFront?.name, done: !!cnicFront },
                  { label: 'CNIC Back', value: cnicBack?.name, done: !!cnicBack },
                  { label: 'Selfie', value: selfie?.name, done: !!selfie },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 5 ? `1px solid ${colors.border}` : 'none' }}>
                    <span style={{ color: colors.textSecondary, fontSize: '12px' }}>{row.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {row.done
                        ? <CheckCircle size={13} color="#16A34A" />
                        : <AlertCircle size={13} color="#DC2626" />
                      }
                      <span style={{ color: row.done ? colors.text : '#DC2626', fontSize: '12px', fontWeight: '500', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.value || 'Missing'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <motion.div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <AlertCircle size={15} color="#DC2626" />
                  <span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span>
                </motion.div>
              )}

              <motion.button
                style={{ width: '100%', padding: '15px', background: selfie && !submitting ? 'linear-gradient(135deg, #1A73E8, #0052CC)' : '#E5E7EB', color: selfie && !submitting ? '#fff' : '#9CA3AF', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: selfie ? '0 6px 20px rgba(26,115,232,0.3)' : 'none', transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>Submitting documents...</motion.span>
                  : <><Shield size={16} color={selfie ? '#fff' : '#9CA3AF'} /> Submit KYC Documents</>
                }
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

