import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { accountService } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft, Copy, Share2, QrCode,
  Camera, CheckCircle, Download, Info,
  Send, Scan, Zap
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRCodePage() {
  const { isDark } = useTheme();
  const navigate   = useNavigate();

  const [activeTab,     setActiveTab]     = useState('my-qr');
  const [balance,       setBalance]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [copied,        setCopied]        = useState(false);
  const [scannedWallet, setScannedWallet] = useState(null);
  const [scannerStarted,setScannerStarted]= useState(false);
  const [toast,         setToast]         = useState('');
  const scannerRef = useRef(null);

  const bg      = isDark ? '#0A0F1E' : '#F0F4FF';
  const card    = isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
  const cardSolid = isDark ? '#0F1629' : '#FFFFFF';
  const border  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const text    = isDark ? '#F0F6FC' : '#0F172A';
  const textSec = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8';

  useEffect(() => {
    loadBalance();
    return () => { if (scannerRef.current) scannerRef.current.clear().catch(() => {}); };
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
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 });
    scanner.render(
      (decoded) => { setScannedWallet(decoded); scanner.clear().catch(() => {}); setScannerStarted(false); },
      () => {}
    );
    scannerRef.current = scanner;
    setScannerStarted(true);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const copyWallet = () => {
    navigator.clipboard.writeText(balance?.wallet_number || '');
    setCopied(true);
    showToast('Wallet ID copied!');
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWallet = () => {
    const txt = `Send money to ${balance?.full_name} on PayEase\n\nWallet ID: ${balance?.wallet_number}\n\npayease-frontend.vercel.app`;
    if (navigator.share) navigator.share({ title: 'My PayEase Wallet', text: txt });
    else { navigator.clipboard.writeText(txt); showToast('Copied to clipboard!'); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <motion.div
        style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(26,115,232,0.4)' }}
        animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
      >
        <QrCode size={28} color="#fff" />
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

  return (
    <div style={{ minHeight: '100vh', background: bg, maxWidth: '480px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', padding: '12px 20px', borderRadius: '14px', zIndex: 9999, fontSize: '13px', fontWeight: '600', boxShadow: '0 8px 32px rgba(22,163,74,0.4)', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
            initial={{ opacity: 0, y: -40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <CheckCircle size={14} color="#fff" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO HEADER ── */}
      <div style={{ background: activeTab === 'my-qr' ? 'linear-gradient(160deg,#1A1FEF 0%,#1A73E8 50%,#7C3AED 100%)' : 'linear-gradient(160deg,#0891B2 0%,#0E7490 50%,#134E5E 100%)', padding: '48px 20px 28px', position: 'relative', overflow: 'hidden', transition: 'background 0.4s' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />

        {/* Back */}
        <motion.div
          style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '20px', position: 'relative', zIndex: 1 }}
          whileTap={{ scale: 0.88 }} onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={18} color="#fff" />
        </motion.div>

        {/* Title */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              {activeTab === 'my-qr' ? <QrCode size={18} color="#fff" /> : <Camera size={18} color="#fff" />}
            </div>
            <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
              {activeTab === 'my-qr' ? 'My QR Code' : 'Scan QR Code'}
            </h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: '0 0 20px 0', fontWeight: '500' }}>
            {activeTab === 'my-qr' ? 'Share to receive payments instantly' : 'Point camera at a PayEase QR code'}
          </p>

          {/* Tab toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '14px', padding: '4px', border: '1px solid rgba(255,255,255,0.15)', gap: '4px' }}>
            {[
              { id: 'my-qr',   icon: <QrCode size={14} />,  label: 'My QR Code' },
              { id: 'scanner', icon: <Camera size={14} />,  label: 'Scan QR' },
            ].map(tab => (
              <motion.button key={tab.id}
                style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '11px', cursor: 'pointer', background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'transparent', color: '#fff', fontSize: '13px', fontWeight: activeTab === tab.id ? '800' : '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s', opacity: activeTab === tab.id ? 1 : 0.65, backdropFilter: activeTab === tab.id ? 'blur(4px)' : 'none', boxShadow: activeTab === tab.id ? '0 2px 12px rgba(0,0,0,0.15)' : 'none' }}
                whileTap={{ scale: 0.96 }} onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── MY QR TAB ── */}
        {activeTab === 'my-qr' && (
          <motion.div key="my-qr" style={{ padding: '16px' }}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* QR Card */}
            <motion.div
              style={{ background: card, borderRadius: '24px', overflow: 'hidden', border: `1px solid ${border}`, marginBottom: '14px', boxShadow: isDark ? 'none' : '0 8px 40px rgba(0,0,0,0.08)' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            >
              {/* Card header */}
              <div style={{ background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', margin: '0 0 3px 0', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>PayEase Wallet</p>
                  <p style={{ color: '#fff', fontSize: '17px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>{balance?.full_name}</p>
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', position: 'relative', zIndex: 1 }}>
                  <QrCode size={22} color="#fff" />
                </div>
              </div>

              {/* QR section */}
              <div style={{ padding: '28px 24px 20px', textAlign: 'center' }}>
                <motion.div
                  id="qr-svg"
                  style={{ display: 'inline-block', padding: '18px', background: '#fff', borderRadius: '24px', boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.12)', marginBottom: '20px', position: 'relative' }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <QRCodeSVG
                    value={balance?.wallet_number || ''}
                    size={190}
                    level="H"
                    includeMargin={false}
                    fgColor="#0F172A"
                  />
                  {/* Center logo */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(26,115,232,0.5)', border: '2px solid #fff' }}>
                    <span style={{ color: '#fff', fontSize: '16px', fontWeight: '800' }}>P</span>
                  </div>
                </motion.div>

                <p style={{ color: textSec, fontSize: '12px', margin: '0 0 16px 0', lineHeight: '1.6', fontWeight: '500' }}>
                  Anyone with PayEase can scan this to send you money instantly
                </p>

                {/* Wallet ID row */}
                <motion.div
                  style={{ display: 'flex', alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', borderRadius: '16px', padding: '14px 16px', border: `1px solid ${border}`, gap: '12px' }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={{ color: textSec, fontSize: '10px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Wallet ID</p>
                    <p style={{ color: text, fontSize: '13px', fontWeight: '700', margin: 0, fontFamily: 'monospace', letterSpacing: '1px' }}>
                      {balance?.wallet_number}
                    </p>
                  </div>
                  <motion.div
                    style={{ width: '40px', height: '40px', borderRadius: '12px', background: copied ? 'linear-gradient(135deg,#16A34A,#15803D)' : 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: copied ? '0 4px 14px rgba(22,163,74,0.4)' : '0 4px 14px rgba(26,115,232,0.4)', transition: 'all 0.25s' }}
                    whileTap={{ scale: 0.88 }} onClick={copyWallet}
                  >
                    <AnimatePresence mode="wait">
                      {copied
                        ? <motion.div key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}><CheckCircle size={18} color="#fff" /></motion.div>
                        : <motion.div key="copy"  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy size={18} color="#fff" /></motion.div>
                      }
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', borderTop: `1px solid ${border}` }}>
                {[
                  { label: copied ? 'Copied!' : 'Copy ID', icon: copied ? <CheckCircle size={14} color={copied ? '#16A34A' : '#1A73E8'} /> : <Copy size={14} color="#1A73E8" />, color: copied ? '#16A34A' : '#1A73E8', action: copyWallet, brd: true },
                  { label: 'Share',    icon: <Share2 size={14} color="#7C3AED" />,    color: '#7C3AED',  action: shareWallet,   brd: true },
                  { label: 'Save',     icon: <Download size={14} color="#0891B2" />,  color: '#0891B2',  action: () => {
                    const svg = document.querySelector('#qr-svg svg');
                    if (svg) { const b = new Blob([svg.outerHTML], { type: 'image/svg+xml' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'payease-qr.svg'; a.click(); }
                  }, brd: false },
                ].map((btn, i) => (
                  <motion.button key={i}
                    style={{ flex: 1, padding: '14px', background: 'transparent', color: btn.color, border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', borderRight: btn.brd ? `1px solid ${border}` : 'none' }}
                    whileTap={{ scale: 0.97 }} onClick={btn.action}
                  >
                    {btn.icon} {btn.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Info card */}
            <motion.div
              style={{ background: isDark ? 'rgba(26,115,232,0.06)' : 'rgba(26,115,232,0.04)', border: `1px solid ${isDark ? 'rgba(26,115,232,0.15)' : 'rgba(26,115,232,0.1)'}`, borderRadius: '16px', padding: '16px', display: 'flex', gap: '12px' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Info size={16} color="#1A73E8" />
              </div>
              <div>
                <p style={{ color: '#1A73E8', fontSize: '13px', fontWeight: '700', margin: '0 0 4px 0' }}>How to receive money</p>
                <p style={{ color: textSec, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
                  Share your QR code or Wallet ID. The sender scans it on their PayEase app and sends money directly to your wallet instantly.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── SCANNER TAB ── */}
        {activeTab === 'scanner' && (
          <motion.div key="scanner" style={{ padding: '16px' }}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {!scannedWallet ? (
              <>
                {/* Instruction card */}
                <motion.div
                  style={{ background: card, borderRadius: '16px', padding: '14px 16px', marginBottom: '14px', border: `1px solid ${border}`, display: 'flex', gap: '12px', alignItems: 'center', boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)' }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg,#0891B2,#0E7490)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(8,145,178,0.35)' }}>
                    <Camera size={20} color="#fff" />
                  </div>
                  <div>
                    <p style={{ color: text, fontSize: '14px', fontWeight: '700', margin: '0 0 2px 0' }}>Point camera at QR code</p>
                    <p style={{ color: textSec, fontSize: '12px', margin: 0 }}>Hold steady for automatic detection</p>
                  </div>
                </motion.div>

                {/* Scanner box */}
                <motion.div
                  style={{ background: card, borderRadius: '22px', overflow: 'hidden', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.08)', position: 'relative', marginBottom: '14px' }}
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                >
                  {/* Animated scan line */}
                  <motion.div
                    style={{ position: 'absolute', top: '60px', left: '60px', right: '60px', height: '2px', background: 'linear-gradient(90deg,transparent,#1A73E8,transparent)', zIndex: 3, pointerEvents: 'none', borderRadius: '1px' }}
                    animate={{ top: ['60px', '260px', '60px'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  {/* Corner brackets */}
                  {[
                    { top: '52px',  left: '52px',  bT: true,  bL: true,  bR: false, bB: false, rTL: '4px 0 0 0' },
                    { top: '52px',  right: '52px', bT: true,  bL: false, bR: true,  bB: false, rTL: '0 4px 0 0' },
                    { bottom: '52px', left: '52px',  bT: false, bL: true,  bR: false, bB: true,  rTL: '0 0 0 4px' },
                    { bottom: '52px', right: '52px', bT: false, bL: false, bR: true,  bB: true,  rTL: '0 0 4px 0' },
                  ].map((c, i) => (
                    <div key={i} style={{ position: 'absolute', top: c.top, bottom: c.bottom, left: c.left, right: c.right, width: '32px', height: '32px', borderTop: c.bT ? '3px solid #1A73E8' : 'none', borderLeft: c.bL ? '3px solid #1A73E8' : 'none', borderRight: c.bR ? '3px solid #1A73E8' : 'none', borderBottom: c.bB ? '3px solid #1A73E8' : 'none', borderRadius: c.rTL, zIndex: 2, pointerEvents: 'none' }} />
                  ))}

                  {/* Override html5-qrcode styles */}
                  <style>{`
                    #qr-reader { border: none !important; }
                    #qr-reader video { border-radius: 16px !important; }
                    #qr-reader__scan_region { border: none !important; background: transparent !important; }
                    #qr-reader__dashboard { background: transparent !important; border: none !important; padding: 12px !important; }
                    #qr-reader__dashboard_section_swaplink { display: none !important; }
                    #qr-reader__status_span { color: ${textSec} !important; font-size: 12px !important; font-family: -apple-system, sans-serif !important; }
                    select#qr-reader__camera_selection { background: ${isDark ? '#0F1629' : '#F8FAFF'} !important; color: ${text} !important; border: 1px solid ${border} !important; border-radius: 10px !important; padding: 8px 12px !important; font-size: 12px !important; }
                    #html5-qrcode-button-camera-start, #html5-qrcode-button-camera-stop { background: linear-gradient(135deg,#1A73E8,#7C3AED) !important; color: #fff !important; border: none !important; border-radius: 12px !important; padding: 10px 20px !important; font-weight: 700 !important; cursor: pointer !important; font-size: 13px !important; }
                  `}</style>

                  <div id="qr-reader" style={{ width: '100%' }} />
                </motion.div>

                <p style={{ color: textSec, fontSize: '12px', textAlign: 'center', margin: 0, lineHeight: '1.6', fontWeight: '500' }}>
                  Make sure the QR code is well-lit and within the frame
                </p>
              </>
            ) : (
              /* ── SCANNED RESULT ── */
              <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>

                {/* Success card */}
                <motion.div
                  style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)', borderRadius: '22px', padding: '28px 24px', textAlign: 'center', marginBottom: '14px', position: 'relative', overflow: 'hidden', boxShadow: '0 16px 48px rgba(22,163,74,0.4)' }}
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                >
                  <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)' }} />

                  <motion.div
                    style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '3px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                    initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  >
                    <CheckCircle size={34} color="#fff" />
                  </motion.div>
                  <h3 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>QR Scanned!</h3>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', margin: 0 }}>Wallet ID detected successfully</p>
                </motion.div>

                {/* Wallet info */}
                <motion.div
                  style={{ background: card, borderRadius: '20px', padding: '18px', border: `1px solid ${border}`, marginBottom: '14px', boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                >
                  <p style={{ color: textSec, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 12px 0' }}>Detected Wallet</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', borderRadius: '14px', padding: '14px 16px', border: `1px solid ${border}` }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(26,115,232,0.35)' }}>
                      <QrCode size={20} color="#fff" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: textSec, fontSize: '10px', margin: '0 0 4px 0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Wallet ID</p>
                      <p style={{ color: text, fontSize: '13px', fontWeight: '700', margin: 0, fontFamily: 'monospace', letterSpacing: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {scannedWallet}
                      </p>
                    </div>
                    <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '20px', padding: '5px 12px', flexShrink: 0 }}>
                      <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: '800' }}>✓ Valid</span>
                    </div>
                  </div>
                </motion.div>

                <motion.button
                  style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 8px 28px rgba(26,115,232,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '0.2px' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/send?wallet=${scannedWallet}`)}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                >
                  <Send size={16} color="#fff" /> Send Money to this Wallet
                </motion.button>
                <motion.button
                  style={{ width: '100%', padding: '14px', background: 'transparent', color: textSec, border: `1.5px solid ${border}`, borderRadius: '14px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setScannedWallet(null); setTimeout(() => startScanner(), 300); }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                >
                  <Camera size={15} color={textSec} /> Scan Another
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: '40px' }} />
    </div>
  );
}
