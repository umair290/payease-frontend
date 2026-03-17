import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { adminService } from '../services/api';
import {
  ArrowLeft, ClipboardList, Calendar,
  CreditCard, User, CheckCircle, AlertCircle,
  ChevronRight, Send
} from 'lucide-react';

const FIELDS = [
  {
    id:          'date_of_birth',
    label:       'Date of Birth',
    icon:        <Calendar size={20} color="#FFB300" />,
    bg:          'rgba(255,179,0,0.1)',
    placeholder: 'e.g. 01-01-1995',
    desc:        'Request a correction to your registered date of birth',
  },
  {
    id:          'cnic_number',
    label:       'CNIC Number',
    icon:        <CreditCard size={20} color="#1A73E8" />,
    bg:          'rgba(26,115,232,0.1)',
    placeholder: 'e.g. 12345-1234567-1',
    desc:        'Request a correction to your national identity number',
  },
  {
    id:          'full_name_on_card',
    label:       'Name on CNIC',
    icon:        <User size={20} color="#7C3AED" />,
    bg:          'rgba(124,58,237,0.1)',
    placeholder: 'Name exactly as on your CNIC',
    desc:        'Request a correction to your name as it appears on your CNIC',
  },
];

export default function ChangeRequest() {
  const { colors } = useTheme();
  const navigate   = useNavigate();

  const [selectedField, setSelectedField] = useState(null);
  const [step,          setStep]          = useState(1);
  const [newValue,      setNewValue]      = useState('');
  const [reason,        setReason]        = useState('');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState(false);

  const field = FIELDS.find(f => f.id === selectedField);

  const handleSubmit = async () => {
    if (!newValue.trim()) { setError('Please enter the new value'); return; }
    if (!reason.trim())   { setError('Please explain the reason for this change'); return; }
    if (reason.trim().length < 10) { setError('Please provide a more detailed reason (at least 10 characters)'); return; }
    setLoading(true); setError('');
    try {
      await adminService.submitChangeRequest({
        field:  selectedField,
        value:  newValue.trim(),
        reason: reason.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
    }
    setLoading(false);
  };

  // ── SUCCESS ──
  if (success) return (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', padding: '60px 24px 40px', textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '3px solid rgba(255,255,255,0.4)' }}
        >
          <CheckCircle size={40} color="#fff" />
        </motion.div>
        <motion.h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', margin: '0 0 8px 0' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Request Submitted
        </motion.h2>
        <motion.p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', margin: 0, lineHeight: '1.6' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          Your change request has been sent to the admin team for review. You will be notified once it has been processed.
        </motion.p>
      </div>

      <div style={{ padding: '24px 16px' }}>
        <motion.div
          style={{ background: colors.card, borderRadius: '16px', padding: '20px', border: `1px solid ${colors.border}`, marginBottom: '16px' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        >
          <p style={{ color: colors.textSecondary, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px 0' }}>Request Summary</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${colors.border}` }}>
            <span style={{ color: colors.textSecondary, fontSize: '13px' }}>Field</span>
            <span style={{ color: colors.text, fontSize: '13px', fontWeight: '600' }}>{field?.label}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${colors.border}` }}>
            <span style={{ color: colors.textSecondary, fontSize: '13px' }}>Requested Value</span>
            <span style={{ color: colors.text, fontSize: '13px', fontWeight: '600' }}>{newValue}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
            <span style={{ color: colors.textSecondary, fontSize: '13px' }}>Status</span>
            <span style={{ background: 'rgba(202,138,4,0.1)', color: '#CA8A04', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>Pending Review</span>
          </div>
        </motion.div>

        <motion.div
          style={{ background: 'rgba(26,115,232,0.06)', border: '1px solid rgba(26,115,232,0.15)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          <p style={{ color: colors.textSecondary, fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
            The admin team typically reviews requests within 24-48 hours. You will receive an in-app notification and email confirmation once the request is approved or rejected.
          </p>
        </motion.div>

        <motion.button
          style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 6px 20px rgba(124,58,237,0.3)' }}
          whileTap={{ scale: 0.97 }} onClick={() => navigate('/profile')}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        >
          Back to Profile
        </motion.button>
        <motion.button
          style={{ width: '100%', padding: '14px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '14px', fontSize: '14px', cursor: 'pointer' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setSuccess(false); setStep(1); setSelectedField(null); setNewValue(''); setReason(''); }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        >
          Submit Another Request
        </motion.button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: colors.card, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <motion.div
          style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${colors.border}` }}
          whileTap={{ scale: 0.9 }}
          onClick={() => step === 1 ? navigate('/profile') : setStep(1)}
        >
          <ArrowLeft size={22} color={colors.text} />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Change Request</h2>
          <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>Request admin-only changes</p>
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ padding: '16px' }}>
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Select Field ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

              {/* Info Banner */}
              <motion.div
                style={{ background: 'rgba(26,115,232,0.06)', border: '1px solid rgba(26,115,232,0.15)', borderRadius: '14px', padding: '16px', marginBottom: '20px', display: 'flex', gap: '12px' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              >
                <ClipboardList size={20} color="#1A73E8" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>About Change Requests</p>
                  <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
                    Some information such as your date of birth and CNIC number can only be changed by an administrator. Submit a request with supporting details and the admin team will review it within 24-48 hours.
                  </p>
                </div>
              </motion.div>

              <p style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px 4px' }}>
                Select what you want to change
              </p>

              {FIELDS.map((f, i) => (
                <motion.div
                  key={f.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: colors.card, borderRadius: '16px', marginBottom: '10px', cursor: 'pointer', border: `1px solid ${colors.border}` }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  onClick={() => { setSelectedField(f.id); setStep(2); setError(''); }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: colors.text, fontSize: '15px', fontWeight: '600', margin: '0 0 3px 0' }}>{f.label}</p>
                    <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>{f.desc}</p>
                  </div>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={16} color={colors.textSecondary} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── STEP 2: Fill Details ── */}
          {step === 2 && field && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

              {/* Selected Field Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: colors.card, borderRadius: '14px', marginBottom: '20px', border: `1px solid ${colors.border}` }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: field.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {field.icon}
                </div>
                <div>
                  <p style={{ color: colors.text, fontSize: '14px', fontWeight: '600', margin: 0 }}>{field.label}</p>
                  <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>{field.desc}</p>
                </div>
              </div>

              {/* New Value */}
              <div style={{ background: colors.card, borderRadius: '16px', padding: '20px', border: `1px solid ${colors.border}`, marginBottom: '14px' }}>
                <p style={{ color: colors.textSecondary, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px 0' }}>Request Details</p>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: '0 0 8px 0' }}>New {field.label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${newValue ? '#7C3AED' : colors.border}`, borderRadius: '12px', padding: '0 14px', background: colors.inputBg, transition: 'all 0.2s', boxShadow: newValue ? '0 0 0 3px rgba(124,58,237,0.08)' : 'none' }}>
                    <div style={{ marginRight: '10px', flexShrink: 0 }}>{field.icon}</div>
                    <input
                      style={{ flex: 1, padding: '13px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none' }}
                      placeholder={field.placeholder} value={newValue}
                      onChange={(e) => { setNewValue(e.target.value); setError(''); }}
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: '0 0 8px 0' }}>Reason for Change</p>
                  <textarea
                    style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${reason ? '#7C3AED' : colors.border}`, borderRadius: '12px', background: colors.inputBg, color: colors.text, fontSize: '14px', outline: 'none', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5', boxSizing: 'border-box', transition: 'all 0.2s', boxShadow: reason ? '0 0 0 3px rgba(124,58,237,0.08)' : 'none' }}
                    placeholder="Explain why this information needs to be corrected. The more detail you provide, the faster the admin can process your request."
                    value={reason} onChange={(e) => { setReason(e.target.value); setError(''); }}
                  />
                  <p style={{ color: colors.textSecondary, fontSize: '11px', margin: '6px 0 0 2px' }}>
                    Minimum 10 characters required
                  </p>
                </div>
              </div>

              {/* Notice */}
              <div style={{ background: 'rgba(202,138,4,0.06)', border: '1px solid rgba(202,138,4,0.2)', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
                <p style={{ color: '#CA8A04', fontSize: '12px', fontWeight: '700', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Important</p>
                <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
                  Submitting a change request does not immediately update your information. The admin team will review and verify your request before approving or rejecting it.
                </p>
              </div>

              {error && (
                <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                  <AlertCircle size={14} color="#DC2626" />
                  <span style={{ color: '#DC2626', fontSize: '12px' }}>{error}</span>
                </motion.div>
              )}

              <motion.button
                style={{ width: '100%', padding: '15px', background: newValue && reason ? 'linear-gradient(135deg, #7C3AED, #5B21B6)' : colors.actionBg, color: newValue && reason ? '#fff' : colors.textSecondary, border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: newValue && reason ? 'pointer' : 'not-allowed', boxShadow: newValue && reason ? '0 6px 20px rgba(124,58,237,0.3)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                whileTap={newValue && reason ? { scale: 0.97 } : {}} onClick={handleSubmit} disabled={loading}
              >
                {loading
                  ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>Submitting...</motion.span>
                  : <><Send size={16} color={newValue && reason ? '#fff' : colors.textSecondary} /> Submit Request</>
                }
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}