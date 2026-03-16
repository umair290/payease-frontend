import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { billService } from '../services/api';
import {
  ArrowLeft, Zap, Wind, Wifi, Phone,
  ChevronRight, CheckCircle
} from 'lucide-react';

export default function Bills() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [providers, setProviders] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ amount: '', reference: '', pin: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadProviders(); }, []);

  const loadProviders = async () => {
    try {
      const res = await billService.getProviders();
      setProviders(res.data.providers || {});
    } catch (err) { console.error(err); }
  };

  const categoryIcons = {
    electricity: { icon: <Zap size={24} color="#FFB300" />, bg: 'rgba(255,179,0,0.1)', color: '#FFB300' },
    gas: { icon: <Wind size={24} color="#FF6B35" />, bg: 'rgba(255,107,53,0.1)', color: '#FF6B35' },
    internet: { icon: <Wifi size={24} color="#1A73E8" />, bg: 'rgba(26,115,232,0.1)', color: '#1A73E8' },
    topup: { icon: <Phone size={24} color="#00C853" />, bg: 'rgba(0,200,83,0.1)', color: '#00C853' },
  };

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      await billService.payBill({
        bill_type: selectedCategory,
        provider: selectedProvider,
        amount: parseFloat(form.amount),
        reference: form.reference,
        pin: form.pin,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
    }
    setLoading(false);
  };

  if (success) return (
    <div style={{ ...styles.container, background: colors.bg }}>
      <div style={styles.successContainer}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={styles.successIcon}
        >
          <CheckCircle size={64} color="#00C853" />
        </motion.div>
        <motion.h2
          style={{ ...styles.successTitle, color: colors.text }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Payment Successful!
        </motion.h2>
        <motion.p
          style={{ ...styles.successSub, color: colors.textSecondary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your {selectedProvider} bill has been paid successfully
        </motion.p>
        <motion.div
          style={{ ...styles.receiptCard, background: colors.card }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div style={styles.receiptRow}>
            <span style={{ color: colors.textSecondary }}>Provider</span>
            <span style={{ color: colors.text, fontWeight: '600' }}>{selectedProvider}</span>
          </div>
          <div style={styles.receiptRow}>
            <span style={{ color: colors.textSecondary }}>Amount</span>
            <span style={{ color: '#1A73E8', fontWeight: '700' }}>PKR {parseFloat(form.amount).toLocaleString()}</span>
          </div>
          <div style={styles.receiptRow}>
            <span style={{ color: colors.textSecondary }}>Reference</span>
            <span style={{ color: colors.text, fontWeight: '600' }}>{form.reference}</span>
          </div>
        </motion.div>
        <motion.button
          style={styles.doneBtn}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/dashboard')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Back to Dashboard
        </motion.button>
      </div>
    </div>
  );

  return (
    <div style={{ ...styles.container, background: colors.bg }}>
      {/* Header */}
      <div style={{ ...styles.header, background: colors.card, borderBottomColor: colors.border }}>
        <motion.div
          style={styles.backBtn}
          whileTap={{ scale: 0.9 }}
          onClick={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)}
        >
          <ArrowLeft size={22} color={colors.text} />
        </motion.div>
        <h2 style={{ ...styles.headerTitle, color: colors.text }}>Pay Bills</h2>
        <div style={{ width: 36 }} />
      </div>

      {/* Step 1 - Select Category */}
      {step === 1 && (
        <motion.div
          style={styles.content}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p style={{ ...styles.stepDesc, color: colors.textSecondary }}>
            Select bill category
          </p>
          {Object.keys(providers).map((category, i) => {
            const cat = categoryIcons[category] || { icon: <Zap size={24} color="#888" />, bg: 'rgba(136,136,136,0.1)', color: '#888' };
            return (
              <motion.div
                key={category}
                style={{ ...styles.categoryCard, background: colors.card }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { setSelectedCategory(category); setStep(2); }}
              >
                <div style={{ ...styles.categoryIcon, background: cat.bg }}>
                  {cat.icon}
                </div>
                <div style={styles.categoryInfo}>
                  <p style={{ ...styles.categoryName, color: colors.text }}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </p>
                  <p style={{ ...styles.categorySub, color: colors.textSecondary }}>
                    {providers[category].length} providers
                  </p>
                </div>
                <ChevronRight size={18} color={colors.textSecondary} />
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Step 2 - Select Provider */}
      {step === 2 && (
        <motion.div
          style={styles.content}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p style={{ ...styles.stepDesc, color: colors.textSecondary }}>
            Select provider
          </p>
          {(providers[selectedCategory] || []).map((provider, i) => {
            const cat = categoryIcons[selectedCategory] || {};
            return (
              <motion.div
                key={provider}
                style={{ ...styles.categoryCard, background: colors.card }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { setSelectedProvider(provider); setStep(3); }}
              >
                <div style={{ ...styles.categoryIcon, background: cat.bg }}>
                  <span style={{ color: cat.color, fontSize: '18px', fontWeight: 'bold' }}>
                    {provider.charAt(0)}
                  </span>
                </div>
                <div style={styles.categoryInfo}>
                  <p style={{ ...styles.categoryName, color: colors.text }}>{provider}</p>
                  <p style={{ ...styles.categorySub, color: colors.textSecondary }}>
                    {selectedCategory?.charAt(0).toUpperCase() + selectedCategory?.slice(1)} Provider
                  </p>
                </div>
                <ChevronRight size={18} color={colors.textSecondary} />
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Step 3 - Enter Details */}
      {step === 3 && (
        <motion.div
          style={styles.content}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Summary Card */}
          <div style={{ ...styles.summaryCard, background: colors.card }}>
            <div style={{ ...styles.categoryIcon, background: categoryIcons[selectedCategory]?.bg, margin: '0 auto 12px' }}>
              {categoryIcons[selectedCategory]?.icon}
            </div>
            <p style={{ ...styles.summaryProvider, color: colors.text }}>{selectedProvider}</p>
            <p style={{ ...styles.summaryCat, color: colors.textSecondary }}>
              {selectedCategory?.charAt(0).toUpperCase() + selectedCategory?.slice(1)}
            </p>
          </div>

          {/* Form */}
          {[
            { label: 'Reference / Account Number', key: 'reference', placeholder: 'Enter reference number', type: 'text' },
            { label: 'Amount (PKR)', key: 'amount', placeholder: 'Enter amount', type: 'number' },
            { label: '4-Digit PIN', key: 'pin', placeholder: 'Enter your PIN', type: 'password', maxLength: 4 },
          ].map((field) => (
            <div key={field.key} style={styles.fieldGroup}>
              <p style={{ ...styles.fieldLabel, color: colors.textSecondary }}>{field.label}</p>
              <input
                style={{ ...styles.input, background: colors.inputBg, color: colors.text, borderColor: colors.border }}
                type={field.type}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              />
            </div>
          ))}

          {error && (
            <motion.p
              style={styles.errorText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            style={styles.payBtn}
            whileTap={{ scale: 0.97 }}
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Pay PKR ${form.amount || '0'}`}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    maxWidth: '480px',
    margin: '0 auto',
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
  content: {
    padding: '16px',
  },
  stepDesc: {
    fontSize: '13px',
    margin: '0 0 16px 4px',
    fontWeight: '500',
  },
  categoryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    borderRadius: '14px',
    marginBottom: '10px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  categoryIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  categoryInfo: { flex: 1 },
  categoryName: {
    fontSize: '15px',
    fontWeight: '600',
    margin: '0 0 3px 0',
  },
  categorySub: {
    fontSize: '12px',
    margin: 0,
  },
  summaryCard: {
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  summaryProvider: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 4px 0',
  },
  summaryCat: {
    fontSize: '13px',
    margin: 0,
  },
  fieldGroup: { marginBottom: '14px' },
  fieldLabel: {
    fontSize: '12px',
    fontWeight: '600',
    margin: '0 0 6px 0',
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    border: '1.5px solid',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  errorText: {
    color: '#FF4444',
    fontSize: '13px',
    margin: '0 0 12px 0',
    textAlign: 'center',
  },
  payBtn: {
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
    marginTop: '8px',
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '32px',
  },
  successIcon: { marginBottom: '20px' },
  successTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    textAlign: 'center',
  },
  successSub: {
    fontSize: '14px',
    margin: '0 0 24px 0',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  receiptCard: {
    width: '100%',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #F0F4FF',
    fontSize: '14px',
  },
  doneBtn: {
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
  },
};