import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  ArrowLeft, CheckCircle, Clock, XCircle,
  Upload, Camera, CreditCard, User,
  AlertCircle, Shield, FileText, RefreshCw,
  ArrowUp, ArrowDown, Eye, Smile,
  ChevronLeft, ChevronRight
} from 'lucide-react';

// ── Compress image using canvas ──────────────────────────────
const compressImage = (file, maxWidth = 1200, quality = 0.82) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        }, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

// ── Liveness challenge config ────────────────────────────────
const CHALLENGES = [
  { id: 'straight', label: 'Look straight at camera',  icon: <Eye size={28} color="#fff" />,              grad: 'linear-gradient(135deg,#1A73E8,#0052CC)', duration: 3 },
  { id: 'left',     label: 'Turn your head LEFT',       icon: <ChevronLeft size={28} color="#fff" />,      grad: 'linear-gradient(135deg,#7C3AED,#5B21B6)', duration: 3 },
  { id: 'right',    label: 'Turn your head RIGHT',      icon: <ChevronRight size={28} color="#fff" />,     grad: 'linear-gradient(135deg,#EA580C,#C2410C)', duration: 3 },
  { id: 'up',       label: 'Look UP',                   icon: <ArrowUp size={28} color="#fff" />,          grad: 'linear-gradient(135deg,#0891B2,#0E7490)', duration: 3 },
  { id: 'blink',    label: 'Blink your eyes twice',     icon: <Eye size={28} color="#fff" />,              grad: 'linear-gradient(135deg,#CA8A04,#92400E)', duration: 4 },
  { id: 'smile',    label: 'Smile naturally',           icon: <Smile size={28} color="#fff" />,            grad: 'linear-gradient(135deg,#16A34A,#15803D)', duration: 3 },
];

// ── Live Selfie Component ────────────────────────────────────
function LiveSelfie({ onCapture, onCancel, isDark }) {
  const videoRef       = useRef(null);
  const canvasRef      = useRef(null);
  const streamRef      = useRef(null);
  const timerRef       = useRef(null);
  const countdownRef   = useRef(null);

  const [challengeIdx,  setChallengeIdx]  = useState(0);
  const [countdown,     setCountdown]     = useState(CHALLENGES[0].duration);
  const [phase,         setPhase]         = useState('intro');   // intro | challenge | capturing | done | error
  const [cameraReady,   setCameraReady]   = useState(false);
  const [completedIds,  setCompletedIds]  = useState([]);
  const [capturedBlob,  setCapturedBlob]  = useState(null);
  const [cameraError,   setCameraError]   = useState('');

  // ── Start camera ──
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraReady(true);
        };
      }
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera access and try again.');
      setPhase('error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    clearInterval(timerRef.current);
    clearInterval(countdownRef.current);
  };

  // ── Capture frame from video ──
  const captureFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    // Mirror the image (front camera)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    return canvas;
  }, []);

  // ── Run challenge sequence ──
  const startChallenges = useCallback(() => {
    setPhase('challenge');
    setChallengeIdx(0);
    setCompletedIds([]);
    runChallenge(0);
  }, []);

  const runChallenge = useCallback((idx) => {
    if (idx >= CHALLENGES.length) {
      // All challenges done — capture final frame
      setPhase('capturing');
      setTimeout(() => {
        const canvas = captureFrame();
        if (canvas) {
          canvas.toBlob((blob) => {
            const file = new File([blob], 'live-selfie.jpg', { type: 'image/jpeg' });
            setCapturedBlob(file);
            setPhase('done');
            stopCamera();
          }, 'image/jpeg', 0.9);
        }
      }, 500);
      return;
    }

    const challenge = CHALLENGES[idx];
    setChallengeIdx(idx);
    setCountdown(challenge.duration);

    // Countdown timer
    let remaining = challenge.duration;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(countdownRef.current);
        setCompletedIds(prev => [...prev, challenge.id]);
        runChallenge(idx + 1);
      }
    }, 1000);
  }, [captureFrame]);

  const handleConfirm = () => {
    if (capturedBlob) onCapture(capturedBlob);
  };

  const handleRetry = () => {
    setCapturedBlob(null);
    setCompletedIds([]);
    setChallengeIdx(0);
    setPhase('intro');
    if (!streamRef.current) startCamera();
  };

  const bg      = isDark ? '#0A0F1E' : '#F0F4FF';
  const text    = isDark ? '#F0F6FC' : '#0F172A';
  const textSec = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8';
  const border  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const currentChallenge = CHALLENGES[challengeIdx];
  const progress = (completedIds.length / CHALLENGES.length) * 100;

  return (
    <motion.div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 9000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', maxWidth: '480px', margin: '0 auto' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── CAMERA VIEW ── */}
      <div style={{ position: 'relative', width: '100%', flex: 1, overflow: 'hidden', maxHeight: '65vh' }}>
        <video
          ref={videoRef}
          autoPlay playsInline muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: phase === 'done' ? 'none' : 'block' }}
        />

        {/* Face oval overlay */}
        {phase !== 'done' && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: '200px', height: '260px', borderRadius: '50%', border: `3px solid ${phase === 'challenge' ? '#4ADE80' : 'rgba(255,255,255,0.5)'}`, boxShadow: `0 0 0 9999px rgba(0,0,0,0.55), 0 0 30px ${phase === 'challenge' ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.1)'}`, transition: 'border-color 0.3s, box-shadow 0.3s' }} />
          </div>
        )}

        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px 16px 12px', background: 'linear-gradient(180deg,rgba(0,0,0,0.7) 0%,transparent 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <motion.div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} whileTap={{ scale: 0.88 }} onClick={() => { stopCamera(); onCancel(); }}>
              <ArrowLeft size={18} color="#fff" />
            </motion.div>
            <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '20px', padding: '6px 14px', backdropFilter: 'blur(8px)' }}>
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>Live Selfie Verification</span>
            </div>
            <div style={{ width: '36px' }} />
          </div>

          {/* Progress bar */}
          {phase === 'challenge' && (
            <div style={{ marginTop: '10px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
              <motion.div style={{ height: '100%', background: 'linear-gradient(90deg,#4ADE80,#22C55E)', borderRadius: '2px' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
            </div>
          )}
        </div>

        {/* Captured preview */}
        {phase === 'done' && capturedBlob && (
          <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={URL.createObjectURL(capturedBlob)} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            <div style={{ position: 'absolute', top: '20px', left: '16px' }}>
              <motion.div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} whileTap={{ scale: 0.88 }} onClick={() => { stopCamera(); onCancel(); }}>
                <ArrowLeft size={18} color="#fff" />
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM PANEL ── */}
      <div style={{ width: '100%', background: isDark ? '#0F1629' : '#fff', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', boxSizing: 'border-box', flex: 1 }}>

        {/* ERROR */}
        {phase === 'error' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <XCircle size={30} color="#DC2626" />
              </div>
              <h3 style={{ color: text, fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0' }}>Camera Required</h3>
              <p style={{ color: textSec, fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{cameraError}</p>
            </div>
            <motion.button style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }} whileTap={{ scale: 0.97 }} onClick={() => { stopCamera(); onCancel(); }}>Go Back</motion.button>
          </motion.div>
        )}

        {/* INTRO */}
        {phase === 'intro' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h3 style={{ color: text, fontSize: '18px', fontWeight: '800', margin: '0 0 6px 0' }}>Liveness Check</h3>
            <p style={{ color: textSec, fontSize: '13px', margin: '0 0 16px 0', lineHeight: 1.6 }}>We'll ask you to perform {CHALLENGES.length} quick actions to prove you're a real person.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {CHALLENGES.map((c, i) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', borderRadius: '12px', border: `1px solid ${border}` }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: c.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontSize: '11px', fontWeight: '800' }}>{i + 1}</span>
                  </div>
                  <span style={{ color: text, fontSize: '13px', fontWeight: '600' }}>{c.label}</span>
                  <span style={{ color: textSec, fontSize: '11px', marginLeft: 'auto' }}>{c.duration}s</span>
                </div>
              ))}
            </div>
            <motion.button
              style={{ width: '100%', padding: '16px', background: cameraReady ? 'linear-gradient(135deg,#16A34A,#15803D)' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: cameraReady ? '#fff' : textSec, border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: cameraReady ? 'pointer' : 'not-allowed', boxShadow: cameraReady ? '0 8px 24px rgba(22,163,74,0.4)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              whileTap={cameraReady ? { scale: 0.97 } : {}}
              onClick={() => cameraReady && startChallenges()}
            >
              {cameraReady ? <><Camera size={16} color="#fff" /> Start Liveness Check</> : <><RefreshCw size={16} color={textSec} /> Starting camera...</>}
            </motion.button>
          </motion.div>
        )}

        {/* CHALLENGE in progress */}
        {phase === 'challenge' && (
          <motion.div key={`ch-${challengeIdx}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <motion.div
                style={{ width: '56px', height: '56px', borderRadius: '18px', background: currentChallenge.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}
                animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1, repeat: Infinity }}
              >
                {currentChallenge.icon}
              </motion.div>
              <div style={{ flex: 1 }}>
                <p style={{ color: textSec, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px 0' }}>Step {challengeIdx + 1} of {CHALLENGES.length}</p>
                <h3 style={{ color: text, fontSize: '17px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>{currentChallenge.label}</h3>
              </div>
              {/* Countdown ring */}
              <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="24" cy="24" r="20" fill="none" stroke={isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'} strokeWidth="4" />
                  <motion.circle cx="24" cy="24" r="20" fill="none" stroke="#4ADE80" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - countdown / currentChallenge.duration) }}
                    transition={{ duration: 0.3 }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: text, fontSize: '14px', fontWeight: '800' }}>{countdown}</div>
              </div>
            </div>

            {/* Completed steps */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {CHALLENGES.map((c, i) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: completedIds.includes(c.id) ? 'rgba(22,163,74,0.1)' : i === challengeIdx ? 'rgba(26,115,232,0.1)' : isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9', borderRadius: '20px', border: `1px solid ${completedIds.includes(c.id) ? 'rgba(22,163,74,0.3)' : i === challengeIdx ? 'rgba(26,115,232,0.3)' : 'transparent'}` }}>
                  {completedIds.includes(c.id) ? <CheckCircle size={10} color="#16A34A" /> : null}
                  <span style={{ fontSize: '10px', fontWeight: '700', color: completedIds.includes(c.id) ? '#16A34A' : i === challengeIdx ? '#1A73E8' : textSec }}>{c.id}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CAPTURING */}
        {phase === 'capturing' && (
          <motion.div style={{ textAlign: 'center', padding: '16px 0' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg,#16A34A,#15803D)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
              <Camera size={26} color="#fff" />
            </motion.div>
            <h3 style={{ color: text, fontSize: '17px', fontWeight: '800', margin: '0 0 6px 0' }}>Capturing...</h3>
            <p style={{ color: textSec, fontSize: '13px', margin: 0 }}>Hold still for a moment</p>
          </motion.div>
        )}

        {/* DONE - confirm or retry */}
        {phase === 'done' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={28} color="#16A34A" />
              </div>
              <div>
                <h3 style={{ color: text, fontSize: '17px', fontWeight: '800', margin: '0 0 3px 0' }}>Liveness Verified!</h3>
                <p style={{ color: textSec, fontSize: '13px', margin: 0 }}>All {CHALLENGES.length} challenges completed</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.button style={{ flex: 1, padding: '14px', background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }} whileTap={{ scale: 0.97 }} onClick={handleRetry}>Retake</motion.button>
              <motion.button style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 6px 20px rgba(22,163,74,0.4)' }} whileTap={{ scale: 0.97 }} onClick={handleConfirm}>
                <CheckCircle size={15} color="#fff" style={{ marginRight: '6px', verticalAlign: 'middle' }} />Use This Selfie
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ── Upload card with compression ─────────────────────────────
function UploadCard({ file, onFile, accept, capture, title, subtitle, color = '#1A73E8', isDark }) {
  const text    = isDark ? '#F0F6FC' : '#0F172A';
  const textSec = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8';
  const actionBg= isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9';
  return (
    <label style={{ display: 'block', cursor: 'pointer' }}>
      <motion.div
        style={{ border: `2px dashed ${file ? '#16A34A' : isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`, borderRadius: '18px', padding: '28px 20px', textAlign: 'center', background: file ? (isDark ? 'rgba(22,163,74,0.06)' : 'rgba(22,163,74,0.03)') : actionBg, transition: 'all 0.2s', marginBottom: '14px' }}
        whileTap={{ scale: 0.99 }}
        whileHover={{ borderColor: file ? '#16A34A' : color }}
      >
        {file ? (
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(22,163,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', border: '2px solid rgba(22,163,74,0.2)' }}>
              <CheckCircle size={28} color="#16A34A" />
            </div>
            <p style={{ color: '#16A34A', fontSize: '14px', fontWeight: '800', margin: '0 0 3px 0' }}>Photo Selected</p>
            <p style={{ color: textSec, fontSize: '11px', margin: '0 0 6px 0', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{file.name}</p>
            <p style={{ color: '#1A73E8', fontSize: '11px', margin: 0, fontWeight: '700' }}>Tap to change</p>
          </motion.div>
        ) : (
          <div>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9', border: `2px dashed ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Camera size={24} color={textSec} />
            </div>
            <p style={{ color: text, fontSize: '14px', fontWeight: '700', margin: '0 0 5px 0' }}>{title}</p>
            <p style={{ color: textSec, fontSize: '12px', margin: 0, lineHeight: '1.5' }}>{subtitle}</p>
            <p style={{ color: textSec, fontSize: '10px', margin: '6px 0 0 0', fontWeight: '600' }}>Auto-compressed before upload</p>
          </div>
        )}
      </motion.div>
      <input type="file" accept={accept} capture={capture} style={{ display: 'none' }} onChange={onFile} />
    </label>
  );
}

// ── Main KYC Component ───────────────────────────────────────
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
  const [showLiveSelfie, setShowLiveSelfie] = useState(false);
  const [compressing,    setCompressing]    = useState('');

  const bg       = isDark ? '#0A0F1E' : '#F0F4FF';
  const card     = isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
  const border   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const text     = isDark ? '#F0F6FC' : '#0F172A';
  const textSec  = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8';
  const inputBg  = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF';

  useEffect(() => { checkKycStatus(); }, []);

  const checkKycStatus = async () => {
    try {
      const res = await api.get('/api/kyc/status');
      setKycStatus(res.data);
    } catch { setKycStatus(null); }
    setLoading(false);
  };

  // ── Compress + set file ──
  const handleFileChange = (setter, label) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCompressing(label);
    try {
      const compressed = await compressImage(file);
      setter(compressed);
    } catch {
      setter(file); // fallback to original
    }
    setCompressing('');
  };

  // ── Live selfie captured ──
  const handleSelfieCapture = async (blob) => {
    setShowLiveSelfie(false);
    setCompressing('selfie');
    try {
      const compressed = await compressImage(blob, 800, 0.88);
      setSelfie(compressed);
    } catch {
      setSelfie(blob);
    }
    setCompressing('');
  };

  const handleSubmit = async () => {
    if (!cnic || !cnicFront || !cnicBack || !selfie) { setError('Please complete all steps!'); return; }
    setSubmitting(true); setError('');
    try {
      const formData = new FormData();
      formData.append('cnic_number',       cnic);
      formData.append('full_name_on_card', fullNameOnCard);
      formData.append('date_of_birth',     dob);
      formData.append('cnic_front',        cnicFront);
      formData.append('cnic_back',         cnicBack);
      formData.append('selfie',            selfie);
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

  const StatusScreen = ({ grad, icon, title, subtitle, badge, badgeColor, badgeBg, extra, primaryBtn, primaryAction, secondaryBtn, secondaryAction }) => (
    <div style={{ minHeight: '100vh', background: bg, maxWidth: '480px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ background: grad, padding: '60px 20px 40px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <motion.div style={{ position: 'absolute', top: '20px', left: '20px', width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', zIndex: 1 }} whileTap={{ scale: 0.88 }} onClick={() => navigate('/dashboard')}><ArrowLeft size={18} color="#fff" /></motion.div>
        <motion.div style={{ width: '88px', height: '88px', borderRadius: '28px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '2px solid rgba(255,255,255,0.3)', position: 'relative', zIndex: 1 }} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>{icon}</motion.div>
        <motion.div style={{ display: 'inline-flex', alignItems: 'center', background: badgeBg, borderRadius: '20px', padding: '5px 14px', marginBottom: '12px', border: `1px solid ${badgeColor}30`, position: 'relative', zIndex: 1 }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}><span style={{ color: badgeColor, fontSize: '12px', fontWeight: '800' }}>{badge}</span></motion.div>
        <motion.h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px', position: 'relative', zIndex: 1 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>{title}</motion.h2>
        <motion.p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', lineHeight: '1.7', margin: 0, maxWidth: '300px', display: 'inline-block', position: 'relative', zIndex: 1 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>{subtitle}</motion.p>
      </div>
      <div style={{ padding: '16px' }}>
        {extra && <motion.div style={{ marginBottom: '16px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>{extra}</motion.div>}
        <motion.button style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 28px rgba(26,115,232,0.4)', marginBottom: '10px' }} whileTap={{ scale: 0.97 }} onClick={primaryAction} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>{primaryBtn}</motion.button>
        {secondaryBtn && <motion.button style={{ width: '100%', padding: '14px', background: 'transparent', color: textSec, border: `1.5px solid ${border}`, borderRadius: '14px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }} whileTap={{ scale: 0.97 }} onClick={secondaryAction} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{secondaryBtn}</motion.button>}
      </div>
    </div>
  );

  const DetailRow = ({ label, value, color, last }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px', borderBottom: last ? 'none' : `1px solid ${border}` }}>
      <span style={{ color: textSec, fontSize: '12px', fontWeight: '600' }}>{label}</span>
      <span style={{ color: color || text, fontWeight: '700', fontSize: '13px' }}>{value}</span>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <motion.div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(26,115,232,0.4)' }} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><Shield size={28} color="#fff" /></motion.div>
      <div style={{ display: 'flex', gap: '6px' }}>{[0,1,2].map(i => <motion.div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1A73E8' }} animate={{ opacity: [0.3,1,0.3], scale: [0.8,1.2,0.8] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />)}</div>
    </div>
  );

  if (kycStatus?.status === 'approved') return (
    <StatusScreen grad="linear-gradient(160deg,#134E5E 0%,#16A34A 60%,#15803D 100%)" icon={<CheckCircle size={44} color="#fff" />} badge="Identity Verified" badgeColor="#4ADE80" badgeBg="rgba(74,222,128,0.15)" title="Identity Verified!" subtitle="Your identity has been successfully verified. You can now use all PayEase features."
      extra={<div style={{ background: card, borderRadius: '18px', overflow: 'hidden', border: `1px solid ${border}` }}><div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(22,163,74,0.06)' : 'rgba(22,163,74,0.04)' }}><div style={{ width: '24px', height: '24px', borderRadius: '8px', background: 'rgba(22,163,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={13} color="#16A34A" /></div><p style={{ color: '#16A34A', fontSize: '12px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verification Details</p></div><DetailRow label="Status" value="Approved" color="#16A34A" /><DetailRow label="ID Number" value={kycStatus.cnic_number} /><DetailRow label="Full Name" value={kycStatus.full_name_on_card || 'N/A'} last /></div>}
      primaryBtn="Back to Dashboard" primaryAction={() => navigate('/dashboard')}
    />
  );

  if (kycStatus?.status === 'pending') return (
    <StatusScreen grad="linear-gradient(160deg,#92400E 0%,#CA8A04 60%,#D97706 100%)" icon={<motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}><Clock size={44} color="#fff" /></motion.div>} badge="Under Review" badgeColor="#FCD34D" badgeBg="rgba(252,211,77,0.15)" title="Documents Under Review" subtitle="Our team is reviewing your documents. This usually takes up to 24 hours."
      extra={<div style={{ background: card, borderRadius: '18px', overflow: 'hidden', border: `1px solid ${border}` }}><div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}`, background: isDark ? 'rgba(202,138,4,0.06)' : 'rgba(202,138,4,0.04)', display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '24px', height: '24px', borderRadius: '8px', background: 'rgba(202,138,4,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={13} color="#CA8A04" /></div><p style={{ color: '#CA8A04', fontSize: '12px', fontWeight: '800', margin: 0 }}>Submission Details</p></div><DetailRow label="Status" value="Pending Review" color="#CA8A04" /><DetailRow label="ID Number" value={kycStatus.cnic_number} /><DetailRow label="Submitted" value={kycStatus.submitted_at ? new Date(kycStatus.submitted_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'} last /></div>}
      primaryBtn="Back to Dashboard" primaryAction={() => navigate('/dashboard')}
    />
  );

  if (kycStatus?.status === 'rejected') return (
    <StatusScreen grad="linear-gradient(160deg,#7F1D1D 0%,#DC2626 60%,#B91C1C 100%)" icon={<XCircle size={44} color="#fff" />} badge="Not Approved" badgeColor="#FCA5A5" badgeBg="rgba(252,165,165,0.15)" title="KYC Not Approved" subtitle="Your application was rejected. Please review the reason and resubmit."
      extra={kycStatus.rejection_reason && <div style={{ background: isDark ? 'rgba(220,38,38,0.08)' : 'rgba(220,38,38,0.05)', border: `1px solid rgba(220,38,38,0.2)`, borderRadius: '16px', padding: '16px 18px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(220,38,38,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertCircle size={14} color="#DC2626" /></div><span style={{ color: '#DC2626', fontSize: '13px', fontWeight: '800' }}>Rejection Reason</span></div><p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748B', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{kycStatus.rejection_reason}</p></div>}
      primaryBtn="Resubmit KYC" primaryAction={() => { setKycStatus(null); setStep(1); }}
      secondaryBtn="Back to Dashboard" secondaryAction={() => navigate('/dashboard')}
    />
  );

  if (success) return (
    <StatusScreen grad="linear-gradient(160deg,#134E5E 0%,#16A34A 60%,#15803D 100%)" icon={<CheckCircle size={44} color="#fff" />} badge="Submitted" badgeColor="#4ADE80" badgeBg="rgba(74,222,128,0.15)" title="Documents Submitted!" subtitle="Your KYC documents have been submitted. Our team will review them within 24 hours."
      primaryBtn="Back to Dashboard" primaryAction={() => navigate('/dashboard')}
    />
  );

  const stepData = steps[step - 1];

  return (
    <div style={{ minHeight: '100vh', background: bg, maxWidth: '480px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* ── LIVE SELFIE OVERLAY ── */}
      <AnimatePresence>
        {showLiveSelfie && (
          <LiveSelfie isDark={isDark} onCapture={handleSelfieCapture} onCancel={() => setShowLiveSelfie(false)} />
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <div style={{ background: stepData.grad, padding: '48px 20px 28px', position: 'relative', overflow: 'hidden', transition: 'background 0.4s' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <motion.div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '20px', position: 'relative', zIndex: 1 }} whileTap={{ scale: 0.88 }} onClick={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)}><ArrowLeft size={18} color="#fff" /></motion.div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}><Shield size={18} color="#fff" /></div>
            <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: 0 }}>KYC Verification</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: '0 0 20px 0', fontWeight: '500' }}>Step {step} of 4 — {stepData.label}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <motion.div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step > s.num ? 'rgba(74,222,128,0.3)' : step === s.num ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: step === s.num ? '2px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }} animate={{ scale: step === s.num ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                  {step > s.num ? <CheckCircle size={14} color="#4ADE80" /> : <span style={{ color: '#fff', fontSize: '11px', fontWeight: '800', opacity: step >= s.num ? 1 : 0.5 }}>{s.num}</span>}
                </motion.div>
                {i < 3 && <div style={{ flex: 1, height: '2px', borderRadius: '1px', background: step > s.num ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.15)', transition: 'background 0.3s' }} />}
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
              <motion.div style={{ background: isDark ? 'rgba(26,115,232,0.08)' : 'rgba(26,115,232,0.05)', border: `1px solid ${isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.12)'}`, borderRadius: '14px', padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '12px' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Shield size={17} color="#1A73E8" /></div>
                <div><p style={{ color: '#1A73E8', fontSize: '13px', fontWeight: '700', margin: '0 0 3px 0' }}>Why do we need this?</p><p style={{ color: textSec, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>KYC verification is required by law to prevent fraud and enable higher transfer limits.</p></div>
              </motion.div>
              <motion.div style={{ background: card, borderRadius: '20px', padding: '20px', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg,#1A73E8,#0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 16px rgba(26,115,232,0.35)' }}><CreditCard size={22} color="#fff" /></div>
                  <div><h3 style={{ color: text, fontSize: '16px', fontWeight: '800', margin: '0 0 2px 0' }}>Identity Card Details</h3><p style={{ color: textSec, fontSize: '12px', margin: 0 }}>Enter details exactly as on your CNIC</p></div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ color: textSec, fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Full Name on Card</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${fullNameOnCard ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '14px', padding: '0 16px', background: inputBg, transition: 'all 0.2s', boxShadow: fullNameOnCard ? '0 0 0 4px rgba(26,115,232,0.1)' : 'none' }}>
                    <User size={16} color={fullNameOnCard ? '#1A73E8' : textSec} style={{ flexShrink: 0, marginRight: '10px' }} />
                    <input style={{ flex: 1, padding: '14px 0', border: 'none', background: 'transparent', color: text, fontSize: '14px', outline: 'none', fontWeight: '500' }} placeholder="e.g. Muhammad Ali Khan" value={fullNameOnCard} onChange={(e) => setFullNameOnCard(e.target.value)} />
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ color: textSec, fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>CNIC Number (13 digits)</label>
                  <input style={{ width: '100%', padding: '16px', border: `2px solid ${cnic.length === 13 ? '#16A34A' : cnic.length > 0 ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '14px', fontSize: '20px', fontWeight: '800', letterSpacing: '6px', textAlign: 'center', outline: 'none', boxSizing: 'border-box', background: inputBg, color: text, transition: 'all 0.2s' }} placeholder="0000000000000" maxLength="13" value={cnic} inputMode="numeric" onChange={(e) => setCnic(e.target.value.replace(/\D/g, ''))} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ color: textSec, fontSize: '11px' }}>{cnic.length}/13 digits</span>
                    {cnic.length === 13 && <motion.span style={{ color: '#16A34A', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><CheckCircle size={11} color="#16A34A" /> Valid</motion.span>}
                  </div>
                </div>
                <div>
                  <label style={{ color: textSec, fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Date of Birth</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${dob ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '14px', padding: '0 16px', background: inputBg, transition: 'all 0.2s' }}>
                    <FileText size={16} color={dob ? '#1A73E8' : textSec} style={{ flexShrink: 0, marginRight: '10px' }} />
                    <input style={{ flex: 1, padding: '14px 0', border: 'none', background: 'transparent', color: text, fontSize: '14px', outline: 'none', fontWeight: '500' }} type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
              </motion.div>
              {error && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '12px', padding: '12px 14px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle size={14} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span></motion.div>}
              <motion.button style={{ width: '100%', padding: '16px', background: fullNameOnCard && cnic.length === 13 && dob ? 'linear-gradient(135deg,#1A73E8,#0052CC)' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: fullNameOnCard && cnic.length === 13 && dob ? '#fff' : textSec, border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', marginTop: '14px', boxShadow: fullNameOnCard && cnic.length === 13 && dob ? '0 8px 28px rgba(26,115,232,0.4)' : 'none', transition: 'all 0.25s' }} whileTap={{ scale: 0.97 }} onClick={() => { if (!fullNameOnCard.trim()) { setError('Please enter your full name'); return; } if (cnic.length !== 13) { setError('CNIC must be 13 digits'); return; } if (!dob) { setError('Please enter your date of birth'); return; } setError(''); setStep(2); }}>Continue →</motion.button>
            </motion.div>
          )}

          {/* ── STEPS 2 & 3: CNIC Photos ── */}
          {[
            { key: 's2', stepNum: 2, file: cnicFront, setter: setCnicFront, label: 'cnic_front', color: '#7C3AED', grad: 'linear-gradient(135deg,#7C3AED,#5B21B6)', shadow: 'rgba(124,58,237,0.35)', title: 'CNIC Front Side', subtitle: 'Photo of the front of your CNIC', tip: 'Ensure the card is flat, well-lit, and all 4 corners are visible. Image will be auto-compressed.', errMsg: 'Please upload CNIC front' },
            { key: 's3', stepNum: 3, file: cnicBack,  setter: setCnicBack,  label: 'cnic_back',  color: '#EA580C', grad: 'linear-gradient(135deg,#EA580C,#C2410C)', shadow: 'rgba(234,88,12,0.35)',   title: 'CNIC Back Side',  subtitle: 'Photo of the back of your CNIC',  tip: 'The back side contains your address. Image will be auto-compressed before upload.', errMsg: 'Please upload CNIC back' },
          ].map(({ key, stepNum, file, setter, label, color, grad, shadow, title, subtitle, tip, errMsg }) => (
            step === stepNum && (
              <motion.div key={key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <motion.div style={{ background: card, borderRadius: '20px', padding: '20px', border: `1px solid ${border}`, marginBottom: '14px', boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 6px 16px ${shadow}` }}><Upload size={22} color="#fff" /></div>
                    <div><h3 style={{ color: text, fontSize: '16px', fontWeight: '800', margin: '0 0 2px 0' }}>{title}</h3><p style={{ color: textSec, fontSize: '12px', margin: 0 }}>{subtitle}</p></div>
                  </div>
                  {compressing === label
                    ? <div style={{ border: `2px dashed ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`, borderRadius: '18px', padding: '32px 20px', textAlign: 'center', background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', marginBottom: '14px' }}>
                        <motion.div style={{ width: '48px', height: '48px', borderRadius: '14px', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }} animate={{ scale: [1,1.1,1] }} transition={{ duration: 0.8, repeat: Infinity }}><RefreshCw size={22} color="#fff" /></motion.div>
                        <p style={{ color: text, fontSize: '14px', fontWeight: '700', margin: 0 }}>Compressing image...</p>
                      </div>
                    : <UploadCard file={file} onFile={handleFileChange(setter, label)} accept="image/*" capture="environment" title={`Tap to capture ${stepNum === 2 ? 'front' : 'back'}`} subtitle="Make sure text is clearly visible" color={color} isDark={isDark} />
                  }
                  <div style={{ background: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.04)', borderRadius: '12px', padding: '12px 14px', border: `1px solid ${isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.12)'}`, display: 'flex', gap: '10px' }}>
                    <AlertCircle size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ color: textSec, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>{tip}</p>
                  </div>
                </motion.div>
                {error && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle size={14} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span></motion.div>}
                <motion.button style={{ width: '100%', padding: '16px', background: file ? grad : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: file ? '#fff' : textSec, border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: file ? `0 8px 28px ${shadow}` : 'none', transition: 'all 0.25s' }} whileTap={{ scale: 0.97 }} onClick={() => { if (!file) { setError(errMsg); return; } setError(''); setStep(stepNum + 1); }}>Continue →</motion.button>
              </motion.div>
            )
          ))}

          {/* ── STEP 4: Live Selfie ── */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <motion.div style={{ background: card, borderRadius: '20px', padding: '20px', border: `1px solid ${border}`, marginBottom: '14px', boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg,#16A34A,#15803D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 16px rgba(22,163,74,0.35)' }}><User size={22} color="#fff" /></div>
                  <div><h3 style={{ color: text, fontSize: '16px', fontWeight: '800', margin: '0 0 2px 0' }}>Live Selfie Verification</h3><p style={{ color: textSec, fontSize: '12px', margin: 0 }}>Proves you are a real person, not a photo</p></div>
                </div>

                {/* Selfie status */}
                {compressing === 'selfie'
                  ? <div style={{ border: `2px dashed rgba(22,163,74,0.3)`, borderRadius: '18px', padding: '32px 20px', textAlign: 'center', background: isDark ? 'rgba(22,163,74,0.06)' : 'rgba(22,163,74,0.03)', marginBottom: '14px' }}>
                      <motion.div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#16A34A,#15803D)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }} animate={{ scale: [1,1.1,1] }} transition={{ duration: 0.8, repeat: Infinity }}><RefreshCw size={22} color="#fff" /></motion.div>
                      <p style={{ color: text, fontSize: '14px', fontWeight: '700', margin: 0 }}>Processing selfie...</p>
                    </div>
                  : selfie
                    ? <motion.div style={{ border: '2px dashed #16A34A', borderRadius: '18px', padding: '20px', textAlign: 'center', background: isDark ? 'rgba(22,163,74,0.06)' : 'rgba(22,163,74,0.03)', marginBottom: '14px' }} initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 12px', border: '3px solid #16A34A', boxShadow: '0 0 0 4px rgba(22,163,74,0.2)' }}>
                          <img src={URL.createObjectURL(selfie)} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <p style={{ color: '#16A34A', fontSize: '14px', fontWeight: '800', margin: '0 0 3px 0' }}>Liveness Verified!</p>
                        <p style={{ color: textSec, fontSize: '11px', margin: '0 0 10px 0' }}>All 6 challenges completed</p>
                        <motion.div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 14px', background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: '10px', border: `1px solid ${border}` }} whileTap={{ scale: 0.95 }} onClick={() => setShowLiveSelfie(true)}>
                          <RefreshCw size={12} color={textSec} />
                          <span style={{ color: textSec, fontSize: '11px', fontWeight: '700' }}>Retake selfie</span>
                        </motion.div>
                      </motion.div>
                    : <motion.div style={{ border: `2px dashed ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`, borderRadius: '18px', padding: '32px 20px', textAlign: 'center', background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFF', marginBottom: '14px', cursor: 'pointer' }} whileTap={{ scale: 0.99 }} onClick={() => setShowLiveSelfie(true)}>
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: isDark ? 'rgba(22,163,74,0.1)' : 'rgba(22,163,74,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '2px dashed rgba(22,163,74,0.3)' }}>
                          <Camera size={30} color="#16A34A" />
                        </div>
                        <p style={{ color: text, fontSize: '15px', fontWeight: '800', margin: '0 0 6px 0' }}>Start Live Selfie</p>
                        <p style={{ color: textSec, fontSize: '12px', margin: '0 0 12px 0', lineHeight: 1.5 }}>You'll be asked to perform 6 actions to prove you're real</p>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg,#16A34A,#15803D)', borderRadius: '12px', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}>
                          <Camera size={13} color="#fff" />
                          <span style={{ color: '#fff', fontSize: '12px', fontWeight: '800' }}>Open Camera</span>
                        </div>
                      </motion.div>
                }

                {/* What to expect */}
                {!selfie && !compressing && (
                  <div style={{ background: isDark ? 'rgba(26,115,232,0.06)' : 'rgba(26,115,232,0.04)', borderRadius: '12px', padding: '12px 14px', border: `1px solid ${isDark ? 'rgba(26,115,232,0.15)' : 'rgba(26,115,232,0.1)'}`, display: 'flex', gap: '10px' }}>
                    <Shield size={14} color="#1A73E8" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ color: textSec, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
                      Liveness detection: look straight, turn left/right, look up, blink twice, smile. Takes about 20 seconds.
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Review summary */}
              <motion.div style={{ background: card, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${border}`, marginBottom: '14px', boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFF' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={13} color="#1A73E8" /></div>
                  <p style={{ color: text, fontSize: '12px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Review Submission</p>
                </div>
                {[
                  { label: 'Full Name',    value: fullNameOnCard, done: !!fullNameOnCard },
                  { label: 'CNIC Number',  value: cnic,           done: cnic.length === 13 },
                  { label: 'Date of Birth',value: dob,            done: !!dob },
                  { label: 'CNIC Front',   value: cnicFront?.name,done: !!cnicFront },
                  { label: 'CNIC Back',    value: cnicBack?.name, done: !!cnicBack },
                  { label: 'Live Selfie',  value: selfie ? 'Verified' : null, done: !!selfie },
                ].map((row, i, arr) => (
                  <motion.div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.04 }}>
                    <span style={{ color: textSec, fontSize: '12px', fontWeight: '600' }}>{row.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: row.done ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {row.done ? <CheckCircle size={12} color="#16A34A" /> : <AlertCircle size={12} color="#DC2626" />}
                      </div>
                      <span style={{ color: row.done ? text : '#DC2626', fontSize: '12px', fontWeight: '600', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value || 'Missing'}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {error && <motion.div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle size={14} color="#DC2626" /><span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span></motion.div>}

              <motion.button
                style={{ width: '100%', padding: '16px', background: selfie && !submitting ? 'linear-gradient(135deg,#16A34A,#15803D)' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: selfie && !submitting ? '#fff' : textSec, border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: selfie ? '0 8px 28px rgba(22,163,74,0.4)' : 'none', transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={submitting || !selfie}
              >
                {submitting ? <motion.span animate={{ opacity: [1,0.5,1] }} transition={{ duration: 1, repeat: Infinity }}>Submitting documents...</motion.span> : <><Shield size={16} color={selfie ? '#fff' : textSec} /> Submit KYC Documents</>}
              </motion.button>
              <div style={{ height: '40px' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
