import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  ArrowLeft, CheckCircle, Clock, XCircle,
  Upload, Camera, CreditCard, User, AlertCircle
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
      setError('Please complete all steps!');
      return;
    }
    setSubmitting(true);
    setError('');
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
    { num: 1, label: 'Details' },
    { num: 2, label: 'Front' },
    { num: 3, label: 'Back' },
    { num: 4, label: 'Selfie' },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={styles.spinner}
      />
    </div>
  );

  const Header = ({ onBack }) => (
    <div style={{ ...styles.header, background: colors.card, borderBottomColor: colors.border }}>
      <motion.div style={styles.backBtn} whileTap={{ scale: 0.9 }} onClick={onBack}>
        <ArrowLeft size={22} color={colors.text} />
      </motion.div>
      <h2 style={{ ...styles.headerTitle, color: colors.text }}>KYC Verification</h2>
      <div style={{ width: 36 }} />
    </div>
  );

  // Approved
  if (kycStatus?.status === 'approved') return (
    <div style={{ ...styles.container, background: colors.bg }}>
      <Header onBack={() => navigate('/dashboard')} />
      <div style={styles.statusContainer}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{ ...styles.statusIconCircle, background: 'rgba(0,200,83,0.1)' }}
        >
          <CheckCircle size={48} color="#00C853" />
        </motion.div>
        <motion.h2 style={{ ...styles.statusTitle, color: colors.text }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          KYC Verified!
        </motion.h2>
        <motion.p style={{ ...styles.statusSub, color: colors.textSecondary }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          Your identity has been successfully verified. You can now use all PayEase features.
        </motion.p>
        <motion.div style={{ ...styles.infoCard, background: colors.card }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={styles.infoRow}>
            <span style={{ color: colors.textSecondary, fontSize: '13px' }}>Status</span>
            <span style={{ color: '#00C853', fontWeight: '600', fontSize: '13px' }}>✓ Approved</span>
          </div>
          <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
            <span style={{ color: colors.textSecondary, fontSize: '13px' }}>ID Number</span>
            <span style={{ color: colors.text, fontWeight: '600', fontSize: '13px' }}>{kycStatus.cnic_number}</span>
          </div>
        </motion.div>
        <motion.button style={styles.primaryBtn} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/dashboard')}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          Back to Dashboard
        </motion.button>
      </div>
    </div>
  );

  // Pending
  if (kycStatus?.status === 'pending') return (
    <div style={{ ...styles.container, background: colors.bg }}>
      <Header onBack={() => navigate('/dashboard')} />
      <div style={styles.statusContainer}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{ ...styles.statusIconCircle, background: 'rgba(255,179,0,0.1)' }}
        >
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
            <Clock size={48} color="#FFB300" />
          </motion.div>
        </motion.div>
        <motion.h2 style={{ ...styles.statusTitle, color: colors.text }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Under Review
        </motion.h2>
        <motion.p style={{ ...styles.statusSub, color: colors.textSecondary }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          Your documents are being reviewed by our team. This usually takes up to 24 hours.
        </motion.p>
        <motion.div style={{ ...styles.infoCard, background: colors.card }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={styles.infoRow}>
            <span style={{ color: colors.textSecondary, fontSize: '13px' }}>Status</span>
            <span style={{ color: '#FFB300', fontWeight: '600', fontSize: '13px' }}>⏳ Pending Review</span>
          </div>
          <div style={styles.infoRow}>
            <span style={{ color: colors.textSecondary, fontSize: '13px' }}>ID Number</span>
            <span style={{ color: colors.text, fontWeight: '600', fontSize: '13px' }}>{kycStatus.cnic_number}</span>
          </div>
          <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
            <span style={{ color: colors.textSecondary, fontSize: '13px' }}>Submitted</span>
            <span style={{ color: colors.text, fontWeight: '600', fontSize: '13px' }}>
              {kycStatus.submitted_at ? new Date(kycStatus.submitted_at).toLocaleDateString('en-PK', {
                day: 'numeric', month: 'short', year: 'numeric'
              }) : 'N/A'}
            </span>
          </div>
        </motion.div>
        <motion.button
          style={{ ...styles.outlineBtn, borderColor: colors.border, color: colors.textSecondary }}
          whileTap={{ scale: 0.97 }} onClick={() => navigate('/dashboard')}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          Back to Dashboard
        </motion.button>
      </div>
    </div>
  );

  // Rejected
  if (kycStatus?.status === 'rejected') return (
    <div style={{ ...styles.container, background: colors.bg }}>
      <Header onBack={() => navigate('/dashboard')} />
      <div style={styles.statusContainer}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{ ...styles.statusIconCircle, background: 'rgba(255,68,68,0.1)' }}
        >
          <XCircle size={48} color="#FF4444" />
        </motion.div>
        <motion.h2 style={{ ...styles.statusTitle, color: colors.text }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          KYC Rejected
        </motion.h2>
        <motion.p style={{ ...styles.statusSub, color: colors.textSecondary }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          Your KYC application was rejected. Please resubmit with correct documents.
        </motion.p>
        {kycStatus.rejection_reason && (
          <motion.div style={styles.rejectionBox}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div style={styles.rejectionHeader}>
              <AlertCircle size={16} color="#FF4444" />
              <span style={styles.rejectionLabel}>Rejection Reason</span>
            </div>
            <p style={styles.rejectionReason}>{kycStatus.rejection_reason}</p>
          </motion.div>
        )}
        <motion.button style={styles.primaryBtn} whileTap={{ scale: 0.97 }}
          onClick={() => { setKycStatus(null); setStep(1); }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          Resubmit KYC
        </motion.button>
      </div>
    </div>
  );

  // Success
  if (success) return (
    <div style={{ ...styles.container, background: colors.bg }}>
      <div style={styles.statusContainer}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{ ...styles.statusIconCircle, background: 'rgba(0,200,83,0.1)' }}
        >
          <CheckCircle size={48} color="#00C853" />
        </motion.div>
        <motion.h2 style={{ ...styles.statusTitle, color: colors.text }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Submitted!
        </motion.h2>
        <motion.p style={{ ...styles.statusSub, color: colors.textSecondary }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          Your documents have been submitted successfully. Our team will review them within 24 hours.
        </motion.p>
        <motion.button style={styles.primaryBtn} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/dashboard')}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          Back to Dashboard
        </motion.button>
      </div>
    </div>
  );

  // KYC Form
  return (
    <div style={{ ...styles.container, background: colors.bg }}>
      <Header onBack={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)} />

      {/* Progress Steps */}
      <div style={{ ...styles.stepsContainer, background: colors.card }}>
        <div style={styles.stepsRow}>
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div style={styles.stepItem}>
                <motion.div
                  style={{
                    ...styles.stepCircle,
                    background: step > s.num ? '#00C853' : step === s.num ? '#1A73E8' : colors.bg,
                    border: step >= s.num ? 'none' : `2px solid ${colors.border}`,
                  }}
                  animate={{ scale: step === s.num ? 1.1 : 1 }}
                >
                  {step > s.num
                    ? <CheckCircle size={14} color="#fff" />
                    : <span style={{ color: step >= s.num ? '#fff' : colors.textSecondary, fontSize: '12px', fontWeight: '600' }}>
                        {s.num}
                      </span>
                  }
                </motion.div>
                <span style={{
                  ...styles.stepLabel,
                  color: step >= s.num ? colors.text : colors.textSecondary,
                  fontWeight: step === s.num ? '600' : '400',
                }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  ...styles.stepLine,
                  background: step > s.num ? '#00C853' : colors.border,
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div style={styles.formContent}>
        <AnimatePresence mode="wait">

          {/* Step 1 - Identity Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <div style={{ ...styles.stepCard, background: colors.card }}>
                <div style={{ ...styles.stepIconCircle, background: 'rgba(26,115,232,0.1)' }}>
                  <CreditCard size={32} color="#1A73E8" />
                </div>
                <h3 style={{ ...styles.stepTitle, color: colors.text }}>Identity Card Details</h3>
                <p style={{ ...styles.stepDesc, color: colors.textSecondary }}>
                  Enter your details exactly as they appear on your National Identity Card
                </p>

                {/* Full Name on Card */}
                <div style={styles.fieldGroup}>
                  <p style={{ ...styles.fieldLabel, color: colors.textSecondary }}>
                    Full Name (as on Identity Card)
                  </p>
                  <div style={{
                    ...styles.inputBox,
                    borderColor: fullNameOnCard ? '#1A73E8' : colors.border,
                    background: colors.inputBg,
                  }}>
                    <input
                      style={{ ...styles.textInput, color: colors.text }}
                      placeholder="e.g. Muhammad Ali Khan"
                      value={fullNameOnCard}
                      onChange={(e) => setFullNameOnCard(e.target.value)}
                    />
                  </div>
                </div>

                {/* Identity Card Number */}
                <div style={styles.fieldGroup}>
                  <p style={{ ...styles.fieldLabel, color: colors.textSecondary }}>
                    Identity Card Number
                  </p>
                  <input
                    style={{
                      ...styles.cnicInput,
                      background: colors.inputBg,
                      color: colors.text,
                      borderColor: cnic.length === 13 ? '#00C853' : colors.border,
                    }}
                    placeholder="1234567890123"
                    maxLength="13"
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value.replace(/\D/g, ''))}
                  />
                  <div style={styles.cnicHintRow}>
                    <span style={{ color: colors.textSecondary, fontSize: '12px' }}>
                      {cnic.length}/13 digits
                    </span>
                    {cnic.length === 13 && (
                      <span style={{ color: '#00C853', fontSize: '12px', fontWeight: '600' }}>
                        ✓ Valid
                      </span>
                    )}
                  </div>
                </div>

                {/* Date of Birth */}
                <div style={styles.fieldGroup}>
                  <p style={{ ...styles.fieldLabel, color: colors.textSecondary }}>
                    Date of Birth
                  </p>
                  <div style={{
                    ...styles.inputBox,
                    borderColor: dob ? '#1A73E8' : colors.border,
                    background: colors.inputBg,
                  }}>
                    <input
                      style={{ ...styles.textInput, color: colors.text }}
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {error && <p style={styles.errorText}>{error}</p>}

                <motion.button
                  style={{
                    ...styles.primaryBtn,
                    opacity: fullNameOnCard && cnic.length === 13 && dob ? 1 : 0.5
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (!fullNameOnCard.trim()) { setError('Please enter your full name!'); return; }
                    if (cnic.length !== 13) { setError('Identity card number must be 13 digits!'); return; }
                    if (!dob) { setError('Please enter your date of birth!'); return; }
                    setError(''); setStep(2);
                  }}
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2 - Identity Card Front */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <div style={{ ...styles.stepCard, background: colors.card }}>
                <div style={{ ...styles.stepIconCircle, background: 'rgba(26,115,232,0.1)' }}>
                  <Upload size={32} color="#1A73E8" />
                </div>
                <h3 style={{ ...styles.stepTitle, color: colors.text }}>Identity Card Front</h3>
                <p style={{ ...styles.stepDesc, color: colors.textSecondary }}>
                  Take a clear photo of the front of your National Identity Card
                </p>
                <label style={{
                  ...styles.uploadArea,
                  borderColor: cnicFront ? '#00C853' : colors.border,
                  background: cnicFront ? 'rgba(0,200,83,0.05)' : colors.inputBg,
                }}>
                  {cnicFront ? (
                    <div style={styles.uploadedState}>
                      <CheckCircle size={36} color="#00C853" />
                      <p style={{ color: '#00C853', fontWeight: '600', margin: '10px 0 4px', fontSize: '15px' }}>
                        Photo Selected
                      </p>
                      <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>
                        {cnicFront.name}
                      </p>
                    </div>
                  ) : (
                    <div style={styles.uploadEmptyState}>
                      <Camera size={40} color={colors.textSecondary} />
                      <p style={{ color: colors.text, fontWeight: '600', margin: '12px 0 4px', fontSize: '15px' }}>
                        Tap to capture photo
                      </p>
                      <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>
                        JPG or PNG, max 16MB
                      </p>
                    </div>
                  )}
                  <input type="file" accept="image/*" capture="environment"
                    style={{ display: 'none' }} onChange={handleFileChange(setCnicFront)} />
                </label>
                {error && <p style={styles.errorText}>{error}</p>}
                <motion.button
                  style={{ ...styles.primaryBtn, opacity: cnicFront ? 1 : 0.5 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (!cnicFront) { setError('Please upload identity card front!'); return; }
                    setError(''); setStep(3);
                  }}
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3 - Identity Card Back */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <div style={{ ...styles.stepCard, background: colors.card }}>
                <div style={{ ...styles.stepIconCircle, background: 'rgba(156,39,176,0.1)' }}>
                  <Upload size={32} color="#9C27B0" />
                </div>
                <h3 style={{ ...styles.stepTitle, color: colors.text }}>Identity Card Back</h3>
                <p style={{ ...styles.stepDesc, color: colors.textSecondary }}>
                  Take a clear photo of the back of your National Identity Card
                </p>
                <label style={{
                  ...styles.uploadArea,
                  borderColor: cnicBack ? '#00C853' : colors.border,
                  background: cnicBack ? 'rgba(0,200,83,0.05)' : colors.inputBg,
                }}>
                  {cnicBack ? (
                    <div style={styles.uploadedState}>
                      <CheckCircle size={36} color="#00C853" />
                      <p style={{ color: '#00C853', fontWeight: '600', margin: '10px 0 4px', fontSize: '15px' }}>
                        Photo Selected
                      </p>
                      <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>
                        {cnicBack.name}
                      </p>
                    </div>
                  ) : (
                    <div style={styles.uploadEmptyState}>
                      <Camera size={40} color={colors.textSecondary} />
                      <p style={{ color: colors.text, fontWeight: '600', margin: '12px 0 4px', fontSize: '15px' }}>
                        Tap to capture photo
                      </p>
                      <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>
                        JPG or PNG, max 16MB
                      </p>
                    </div>
                  )}
                  <input type="file" accept="image/*" capture="environment"
                    style={{ display: 'none' }} onChange={handleFileChange(setCnicBack)} />
                </label>
                {error && <p style={styles.errorText}>{error}</p>}
                <motion.button
                  style={{ ...styles.primaryBtn, opacity: cnicBack ? 1 : 0.5 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (!cnicBack) { setError('Please upload identity card back!'); return; }
                    setError(''); setStep(4);
                  }}
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 4 - Selfie */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <div style={{ ...styles.stepCard, background: colors.card }}>
                <div style={{ ...styles.stepIconCircle, background: 'rgba(0,200,83,0.1)' }}>
                  <User size={32} color="#00C853" />
                </div>
                <h3 style={{ ...styles.stepTitle, color: colors.text }}>Take a Selfie</h3>
                <p style={{ ...styles.stepDesc, color: colors.textSecondary }}>
                  Take a clear selfie showing your face for identity verification
                </p>
                <label style={{
                  ...styles.uploadArea,
                  borderColor: selfie ? '#00C853' : colors.border,
                  background: selfie ? 'rgba(0,200,83,0.05)' : colors.inputBg,
                }}>
                  {selfie ? (
                    <div style={styles.uploadedState}>
                      <CheckCircle size={36} color="#00C853" />
                      <p style={{ color: '#00C853', fontWeight: '600', margin: '10px 0 4px', fontSize: '15px' }}>
                        Selfie Selected
                      </p>
                      <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>
                        {selfie.name}
                      </p>
                    </div>
                  ) : (
                    <div style={styles.uploadEmptyState}>
                      <Camera size={40} color={colors.textSecondary} />
                      <p style={{ color: colors.text, fontWeight: '600', margin: '12px 0 4px', fontSize: '15px' }}>
                        Tap to take selfie
                      </p>
                      <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>
                        Use front camera, good lighting
                      </p>
                    </div>
                  )}
                  <input type="file" accept="image/*" capture="user"
                    style={{ display: 'none' }} onChange={handleFileChange(setSelfie)} />
                </label>
                {error && <p style={styles.errorText}>{error}</p>}
                <motion.button
                  style={{ ...styles.primaryBtn, opacity: selfie && !submitting ? 1 : 0.5 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                      Submitting...
                    </motion.span>
                  ) : 'Submit KYC'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    maxWidth: '480px',
    margin: '0 auto',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E0E6F0',
    borderTop: '3px solid #1A73E8',
    borderRadius: '50%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  backBtn: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: '10px',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
  stepsContainer: {
    padding: '16px 20px',
    borderBottom: '1px solid #E0E6F0',
  },
  stepsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  stepCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: '10px',
  },
  stepLine: {
    flex: 1,
    height: '2px',
    margin: '0 4px',
    marginBottom: '18px',
    transition: 'background 0.3s',
  },
  formContent: {
    padding: '16px',
  },
  stepCard: {
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  stepIconCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: '13px',
    lineHeight: '1.6',
    textAlign: 'center',
    margin: '0 0 24px 0',
  },
  fieldGroup: { marginBottom: '16px' },
  fieldLabel: {
    fontSize: '12px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  inputBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid',
    borderRadius: '12px',
    padding: '0 16px',
    transition: 'border-color 0.2s',
  },
  textInput: {
    flex: 1,
    padding: '14px 0',
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    minWidth: 0,
  },
  cnicInput: {
    width: '100%',
    padding: '16px',
    border: '1.5px solid',
    borderRadius: '12px',
    fontSize: '20px',
    fontWeight: 'bold',
    letterSpacing: '4px',
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  cnicHintRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  uploadArea: {
    display: 'block',
    border: '2px dashed',
    borderRadius: '16px',
    padding: '36px 20px',
    marginBottom: '20px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  uploadedState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  uploadEmptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  primaryBtn: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #1A73E8, #0052CC)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(26,115,232,0.3)',
    boxSizing: 'border-box',
    transition: 'opacity 0.2s',
  },
  outlineBtn: {
    width: '100%',
    padding: '14px',
    background: 'transparent',
    border: '1.5px solid',
    borderRadius: '12px',
    fontSize: '15px',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  errorText: {
    color: '#FF4444',
    fontSize: '13px',
    textAlign: 'center',
    margin: '0 0 12px 0',
  },
  statusContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 24px',
  },
  statusIconCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  statusTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 12px 0',
    textAlign: 'center',
  },
  statusSub: {
    fontSize: '14px',
    lineHeight: '1.6',
    textAlign: 'center',
    margin: '0 0 24px 0',
    maxWidth: '320px',
  },
  infoCard: {
    width: '100%',
    borderRadius: '16px',
    padding: '4px 16px',
    marginBottom: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #F0F4FF',
  },
  rejectionBox: {
    width: '100%',
    background: 'rgba(255,68,68,0.08)',
    border: '1px solid rgba(255,68,68,0.3)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '24px',
  },
  rejectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  rejectionLabel: {
    color: '#FF4444',
    fontSize: '13px',
    fontWeight: '600',
  },
  rejectionReason: {
    color: '#FF4444',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.5',
  },
};