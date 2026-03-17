import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_MS = 25 * 60 * 1000; // warn at 25 minutes

export default function useSessionTimeout({ onWarning, onTimeout }) {
  const { token } = useAuth();
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);

  const resetTimers = useCallback(() => {
    if (!token) return;
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);

    warningRef.current = setTimeout(() => {
      onWarning && onWarning();
    }, WARNING_MS);

    timeoutRef.current = setTimeout(() => {
      onTimeout && onTimeout();
    }, TIMEOUT_MS);
  }, [token, onWarning, onTimeout]);

  useEffect(() => {
    if (!token) return;
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetTimers();
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));
    resetTimers();
    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
    };
  }, [token, resetTimers]);

  return { resetTimers };
}