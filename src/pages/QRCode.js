import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { accountService } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Copy, Share2, QrCode, Camera, CheckCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRCodePage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-qr');
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [scannedWallet, setScannedWallet] = useState(null);
  const [scannerStarted, setScannerStarted] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    loadBalance();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'scanner' && !scannerStarted) {
      setTimeout(() => startScanner(), 500);
    } else if (activeTab !== 'scanner' && scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      setScannerStarted(false);
    }
  }, [activeTab]);

  const loadBalance = async () => {
    try {
      const res = await accountService.getBalance();
      setBalance(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    });

    scanner.render(
      (decodedText) => {
        setScannedWallet(decodedText);
        scanner.clear().catch(() => {});
        setScannerStarted(false);
      },
      (error) => {}
    );

    scannerRef.current = scanner;
    setScannerStarted(true);
  };

  const copyWallet = () => {
    navigator.clipboard.writeText(balance?.wallet_number || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: '40px', height: '40px', border: '3px solid #E0E6F0', borderTop: '3px solid #1A73E8', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
        <motion.div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          whileTap={{ scale: 0.9 }} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={22} color={colors.text} />
        </motion.div>
        <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>QR Code</h2>
        <div style={{ width: 36 }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: colors.card, padding: '8px 16px', gap: '8px', borderBottom: `1px solid ${colors.border}` }}>
        {[
          { id: 'my-qr', icon: <QrCode size={16} />, label: 'My QR' },
          { id: 'scanner', icon: <Camera size={16} />, label: 'Scan QR' },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer',
              background: activeTab === tab.id ? '#1A73E8' : colors.cardAlt,
              color: activeTab === tab.id ? '#fff' : colors.textSecondary,
              fontSize: '13px', fontWeight: '600',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </motion.button>
        ))}
      </div>

      {/* My QR Tab */}
      {activeTab === 'my-qr' && (
        <motion.div
          style={{ padding: '24px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* QR Card */}
          <div style={{ background: colors.card, borderRadius: '24px', padding: '32px 24px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${colors.border}` }}>
            <p style={{ color: colors.textSecondary, fontSize: '13px', margin: '0 0 24px 0' }}>
              Scan this QR code to send money to
            </p>
            <p style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: '0 0 24px 0' }}>
              {balance?.full_name}
            </p>

            {/* QR Code */}
            <motion.div
              style={{ display: 'inline-block', padding: '16px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: '24px' }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <QRCodeSVG
                value={balance?.wallet_number || ''}
                size={200}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: '',
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </motion.div>

            {/* Wallet Number */}
            <div style={{ background: colors.cardAlt, borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: colors.textSecondary, fontSize: '11px', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wallet ID</p>
                <p style={{ color: colors.text, fontSize: '14px', fontWeight: '600', margin: 0, fontFamily: 'monospace' }}>
                  {balance?.wallet_number}
                </p>
              </div>
              <motion.div
                style={{ width: '36px', height: '36px', borderRadius: '10px', background: copied ? '#00C853' : '#1A73E8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                whileTap={{ scale: 0.9 }}
                onClick={copyWallet}
              >
                {copied ? <CheckCircle size={18} color="#fff" /> : <Copy size={18} color="#fff" />}
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.button
                style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                whileTap={{ scale: 0.97 }}
                onClick={copyWallet}
              >
                <Copy size={16} color="#fff" />
                {copied ? 'Copied!' : 'Copy ID'}
              </motion.button>
              <motion.button
                style={{ flex: 1, padding: '13px', background: colors.cardAlt, color: colors.text, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'PayEase Wallet',
                      text: `Send money to ${balance?.full_name} using wallet ID: ${balance?.wallet_number}`,
                    });
                  }
                }}
              >
                <Share2 size={16} color={colors.text} />
                Share
              </motion.button>
            </div>
          </div>

          {/* Info Card */}
          <div style={{ background: 'rgba(26,115,232,0.08)', border: '1px solid rgba(26,115,232,0.2)', borderRadius: '14px', padding: '14px 16px', marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <QrCode size={20} color="#1A73E8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ color: '#1A73E8', fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>How it works</p>
              <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
                Share this QR code with anyone to receive money instantly. They can scan it using the PayEase app.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Scanner Tab */}
      {activeTab === 'scanner' && (
        <motion.div
          style={{ padding: '24px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {!scannedWallet ? (
            <div>
              <p style={{ color: colors.textSecondary, fontSize: '14px', textAlign: 'center', margin: '0 0 16px 0' }}>
                Point your camera at a PayEase QR code
              </p>
              <div style={{ background: colors.card, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                <div id="qr-reader" style={{ width: '100%' }} />
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div style={{ background: colors.card, borderRadius: '20px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: `1px solid ${colors.border}`, marginBottom: '16px' }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(0,200,83,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}
                >
                  <CheckCircle size={32} color="#00C853" />
                </motion.div>
                <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  QR Code Scanned!
                </h3>
                <p style={{ color: colors.textSecondary, fontSize: '13px', margin: '0 0 16px 0' }}>
                  Wallet ID detected
                </p>
                <div style={{ background: colors.cardAlt, borderRadius: '12px', padding: '12px 16px', marginBottom: '20px' }}>
                  <p style={{ color: colors.text, fontSize: '14px', fontWeight: '600', margin: 0, fontFamily: 'monospace' }}>
                    {scannedWallet}
                  </p>
                </div>
                <motion.button
                  style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 6px 20px rgba(26,115,232,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/send?wallet=${scannedWallet}`)}
                >
                  Send Money to this Wallet
                </motion.button>
                <motion.button
                  style={{ width: '100%', padding: '13px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setScannedWallet(null)}
                >
                  Scan Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}