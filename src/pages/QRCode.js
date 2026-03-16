import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { accountService } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft, Copy, Share2, QrCode,
  Camera, CheckCircle, Download, Info
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRCodePage() {
  const { colors, isDark } = useTheme();
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
      setScannedWallet(null);
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
      qrbox: { width: 240, height: 240 },
      aspectRatio: 1.0,
    });
    scanner.render(
      (decodedText) => {
        setScannedWallet(decodedText);
        scanner.clear().catch(() => {});
        setScannerStarted(false);
      },
      () => {}
    );
    scannerRef.current = scanner;
    setScannerStarted(true);
  };

  const copyWallet = () => {
    navigator.clipboard.writeText(balance?.wallet_number || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWallet = () => {
    const text = `💳 Send money to ${balance?.full_name} on PayEase\n\nWallet ID: ${balance?.wallet_number}\n\npayease-frontend.vercel.app`;
    if (navigator.share) {
      navigator.share({ title: 'My PayEase Wallet', text });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: '40px', height: '40px', border: '3px solid #E0E6F0', borderTop: '3px solid #1A73E8', borderRadius: '50%' }}
      />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: colors.card, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <motion.div
          style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.actionBg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          whileTap={{ scale: 0.9 }} onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={20} color={colors.text} />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>QR Code</h2>
          <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>
            {activeTab === 'my-qr' ? 'Share to receive money' : 'Scan to send money'}
          </p>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Tab Switcher */}
      <div style={{ padding: '12px 16px', background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', background: colors.actionBg, borderRadius: '12px', padding: '4px', border: `1px solid ${colors.border}` }}>
          {[
            { id: 'my-qr', icon: <QrCode size={15} />, label: 'My QR Code' },
            { id: 'scanner', icon: <Camera size={15} />, label: 'Scan QR' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '10px', cursor: 'pointer', background: activeTab === tab.id ? '#1A73E8' : 'transparent', color: activeTab === tab.id ? '#fff' : colors.textSecondary, fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── MY QR TAB ── */}
        {activeTab === 'my-qr' && (
          <motion.div
            key="my-qr"
            style={{ padding: '20px 16px' }}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Main QR Card */}
            <motion.div
              style={{ background: colors.card, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${colors.border}`, marginBottom: '14px' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            >
              {/* Card Header */}
              <div style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: '0 0 3px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PayEase Wallet</p>
                  <p style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{balance?.full_name}</p>
                </div>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={22} color="#fff" />
                </div>
              </div>

              {/* QR Code Section */}
              <div style={{ padding: '28px 24px', textAlign: 'center' }}>
                <motion.div
                  style={{ display: 'inline-block', padding: '16px', background: '#fff', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: '20px', position: 'relative' }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  <QRCodeSVG
                    value={balance?.wallet_number || ''}
                    size={180}
                    level="H"
                    includeMargin={false}
                    fgColor="#1A1A2E"
                  />
                  {/* Center Logo */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(26,115,232,0.4)' }}>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>P</span>
                  </div>
                </motion.div>

                <p style={{ color: colors.textSecondary, fontSize: '12px', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                  Anyone can scan this code to send money to your wallet
                </p>

                {/* Wallet ID */}
                <div style={{ display: 'flex', alignItems: 'center', background: colors.actionBg, borderRadius: '14px', padding: '12px 16px', border: `1px solid ${colors.border}`, gap: '12px' }}>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={{ color: colors.textSecondary, fontSize: '10px', margin: '0 0 3px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Wallet ID</p>
                    <p style={{ color: colors.text, fontSize: '14px', fontWeight: '600', margin: 0, fontFamily: 'monospace', letterSpacing: '1px' }}>
                      {balance?.wallet_number}
                    </p>
                  </div>
                  <motion.div
                    style={{ width: '38px', height: '38px', borderRadius: '11px', background: copied ? '#00C853' : '#1A73E8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: `0 4px 12px ${copied ? 'rgba(0,200,83,0.3)' : 'rgba(26,115,232,0.3)'}`, transition: 'all 0.2s' }}
                    whileTap={{ scale: 0.9 }} onClick={copyWallet}
                  >
                    <AnimatePresence mode="wait">
                      {copied
                        ? <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><CheckCircle size={18} color="#fff" /></motion.div>
                        : <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy size={18} color="#fff" /></motion.div>
                      }
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', borderTop: `1px solid ${colors.border}` }}>
                <motion.button
                  style={{ flex: 1, padding: '14px', background: 'transparent', color: copied ? '#00C853' : '#1A73E8', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRight: `1px solid ${colors.border}` }}
                  whileTap={{ scale: 0.97 }} onClick={copyWallet}
                >
                  {copied ? <CheckCircle size={15} color="#00C853" /> : <Copy size={15} color="#1A73E8" />}
                  {copied ? 'Copied!' : 'Copy ID'}
                </motion.button>
                <motion.button
                  style={{ flex: 1, padding: '14px', background: 'transparent', color: '#1A73E8', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRight: `1px solid ${colors.border}` }}
                  whileTap={{ scale: 0.97 }} onClick={shareWallet}
                >
                  <Share2 size={15} color="#1A73E8" /> Share
                </motion.button>
                <motion.button
                  style={{ flex: 1, padding: '14px', background: 'transparent', color: '#1A73E8', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const svg = document.querySelector('#qr-svg svg');
                    if (svg) {
                      const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = 'payease-qr.svg';
                      a.click();
                    }
                  }}
                >
                  <Download size={15} color="#1A73E8" /> Save
                </motion.button>
              </div>
            </motion.div>

            {/* Info Card */}
            <motion.div
              style={{ background: 'rgba(26,115,232,0.06)', border: '1px solid rgba(26,115,232,0.15)', borderRadius: '16px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Info size={16} color="#1A73E8" />
              </div>
              <div>
                <p style={{ color: '#1A73E8', fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>How to receive money</p>
                <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
                  Share your QR code or Wallet ID. The sender scans it on their PayEase app and sends money directly to your wallet.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── SCANNER TAB ── */}
        {activeTab === 'scanner' && (
          <motion.div
            key="scanner"
            style={{ padding: '20px 16px' }}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {!scannedWallet ? (
              <>
                {/* Scanner Instructions */}
                <div style={{ background: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '14px', border: `1px solid ${colors.border}`, display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Camera size={20} color="#1A73E8" />
                  </div>
                  <div>
                    <p style={{ color: colors.text, fontSize: '14px', fontWeight: '600', margin: '0 0 2px 0' }}>Point camera at QR code</p>
                    <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>Hold steady for automatic scan detection</p>
                  </div>
                </div>

                {/* Scanner Box */}
                <div style={{ background: colors.card, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'relative' }}>
                  {/* Corner decorations */}
                  <div style={{ position: 'absolute', top: '60px', left: '60px', width: '32px', height: '32px', borderTop: '3px solid #1A73E8', borderLeft: '3px solid #1A73E8', borderRadius: '4px 0 0 0', zIndex: 2, pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: '60px', right: '60px', width: '32px', height: '32px', borderTop: '3px solid #1A73E8', borderRight: '3px solid #1A73E8', borderRadius: '0 4px 0 0', zIndex: 2, pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: '60px', left: '60px', width: '32px', height: '32px', borderBottom: '3px solid #1A73E8', borderLeft: '3px solid #1A73E8', borderRadius: '0 0 0 4px', zIndex: 2, pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: '60px', right: '60px', width: '32px', height: '32px', borderBottom: '3px solid #1A73E8', borderRight: '3px solid #1A73E8', borderRadius: '0 0 4px 0', zIndex: 2, pointerEvents: 'none' }} />

                  <div id="qr-reader" style={{ width: '100%' }} />
                </div>

                {/* Tip */}
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
                    Make sure the QR code is well-lit and within the frame for accurate scanning
                  </p>
                </div>
              </>
            ) : (
              /* Scanned Result */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {/* Success Header */}
                <div style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', borderRadius: '20px', padding: '28px 24px', textAlign: 'center', marginBottom: '14px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                  <motion.div
                    style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '3px solid rgba(255,255,255,0.4)' }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle size={32} color="#fff" />
                  </motion.div>
                  <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>QR Scanned!</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>Wallet ID detected successfully</p>
                </div>

                {/* Wallet Info */}
                <div style={{ background: colors.card, borderRadius: '16px', padding: '20px', border: `1px solid ${colors.border}`, marginBottom: '14px' }}>
                  <p style={{ color: colors.textSecondary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px 0' }}>Detected Wallet</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: colors.actionBg, borderRadius: '12px', padding: '14px', border: `1px solid ${colors.border}` }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <QrCode size={20} color="#1A73E8" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: colors.textSecondary, fontSize: '11px', margin: '0 0 2px 0', fontWeight: '600' }}>Wallet ID</p>
                      <p style={{ color: colors.text, fontSize: '14px', fontWeight: '600', margin: 0, fontFamily: 'monospace', letterSpacing: '1px' }}>
                        {scannedWallet}
                      </p>
                    </div>
                    <div style={{ background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.3)', borderRadius: '20px', padding: '4px 10px' }}>
                      <span style={{ color: '#00C853', fontSize: '11px', fontWeight: '700' }}>✓ Valid</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 6px 20px rgba(26,115,232,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/send?wallet=${scannedWallet}`)}
                >
                  <Share2 size={16} color="#fff" /> Send Money to this Wallet
                </motion.button>
                <motion.button
                  style={{ width: '100%', padding: '13px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setScannedWallet(null); setTimeout(() => startScanner(), 300); }}
                >
                  <Camera size={15} color={colors.textSecondary} /> Scan Again
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
