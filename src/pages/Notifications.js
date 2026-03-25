import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { notificationService } from '../services/api';
import {
  ArrowLeft, Bell, CheckCheck, Trash2,
  Send, Download, CreditCard, ShieldCheck,
  AlertCircle, Info, CheckCircle, RefreshCw,
  Zap, ArrowDownLeft, ArrowUpRight, Shield,
  Sparkles, Filter
} from 'lucide-react';

// ── Icon resolver ──
const getNotifStyle = (icon, type) => {
  const styles = {
    send:    { grad: 'linear-gradient(135deg,#1A73E8,#0052CC)', shadow: 'rgba(26,115,232,0.35)',  icon: <ArrowUpRight size={18} color="#fff" /> },
    receive: { grad: 'linear-gradient(135deg,#16A34A,#15803D)', shadow: 'rgba(22,163,74,0.35)',   icon: <ArrowDownLeft size={18} color="#fff" /> },
    deposit: { grad: 'linear-gradient(135deg,#16A34A,#15803D)', shadow: 'rgba(22,163,74,0.35)',   icon: <Download size={18} color="#fff" /> },
    bill:    { grad: 'linear-gradient(135deg,#EA580C,#C2410C)', shadow: 'rgba(234,88,12,0.35)',   icon: <Zap size={18} color="#fff" /> },
    security:{ grad: 'linear-gradient(135deg,#DC2626,#B91C1C)', shadow: 'rgba(220,38,38,0.35)',   icon: <Shield size={18} color="#fff" /> },
    shield:  { grad: 'linear-gradient(135deg,#DC2626,#B91C1C)', shadow: 'rgba(220,38,38,0.35)',   icon: <ShieldCheck size={18} color="#fff" /> },
    warning: { grad: 'linear-gradient(135deg,#F59E0B,#D97706)', shadow: 'rgba(245,158,11,0.35)',  icon: <AlertCircle size={18} color="#fff" /> },
    success: { grad: 'linear-gradient(135deg,#16A34A,#15803D)', shadow: 'rgba(22,163,74,0.35)',   icon: <CheckCircle size={18} color="#fff" /> },
    info:    { grad: 'linear-gradient(135deg,#0891B2,#0E7490)', shadow: 'rgba(8,145,178,0.35)',   icon: <Info size={18} color="#fff" /> },
    default: { grad: 'linear-gradient(135deg,#7C3AED,#5B21B6)', shadow: 'rgba(124,58,237,0.35)',  icon: <Bell size={18} color="#fff" /> },
  };

  // Icon key takes priority, then type
  return styles[icon] || styles[type] || styles.default;
};

const timeAgo = (dateStr) => {
  try {
    const now  = new Date();
    const date = new Date(dateStr + (dateStr.includes('T') ? '' : ' UTC'));
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)    return 'Just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800)return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  } catch { return ''; }
};

const FILTERS = ['All', 'Unread', 'Security', 'Transactions'];

export default function Notifications() {
  const { isDark } = useTheme();
  const navigate   = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [unread,        setUnread]        = useState(0);
  const [activeFilter,  setActiveFilter]  = useState('All');
  const [refreshing,    setRefreshing]    = useState(false);

  // shared vars
  const bg       = isDark ? '#0A0F1E' : '#F0F4FF';
  const card     = isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
  const border   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const text     = isDark ? '#F0F6FC' : '#0F172A';
  const textSec  = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8';

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unread_count || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch (err) { console.error(err); }
  };

  const handleClear = async () => {
    try {
      await notificationService.clear();
      setNotifications([]);
      setUnread(0);
    } catch (err) { console.error(err); }
  };

  // ── Filter logic ──
  const filtered = notifications.filter(n => {
    if (activeFilter === 'All')          return true;
    if (activeFilter === 'Unread')       return !n.read;
    if (activeFilter === 'Security')     return n.icon === 'security' || n.icon === 'shield' || n.type === 'warning' || n.title?.toLowerCase().includes('security') || n.title?.toLowerCase().includes('fraud') || n.title?.toLowerCase().includes('alert');
    if (activeFilter === 'Transactions') return n.icon === 'send' || n.icon === 'receive' || n.icon === 'deposit' || n.icon === 'bill';
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', maxWidth: '480px', margin: '0 auto', background: bg, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* ── HERO HEADER ── */}
      <div style={{ background: 'linear-gradient(160deg,#1A1FEF 0%,#1A73E8 50%,#7C3AED 100%)', padding: '48px 20px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />

        {/* Back + refresh */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
          <motion.div
            style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)' }}
            whileTap={{ scale: 0.88 }} onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={18} color="#fff" />
          </motion.div>

          <motion.div
            style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)' }}
            whileTap={{ scale: 0.88 }} onClick={handleRefresh}
            animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : {}}
          >
            <RefreshCw size={16} color="#fff" />
          </motion.div>
        </div>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Bell size={18} color="#fff" />
              </div>
              <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>Notifications</h1>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: 0, fontWeight: '500' }}>
              {unread > 0 ? `${unread} unread message${unread > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>

          {/* Unread badge */}
          {unread > 0 && (
            <motion.div
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '14px', padding: '8px 14px', border: '1px solid rgba(255,255,255,0.2)' }}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span style={{ color: '#fff', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>{unread}</span>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', margin: 0, fontWeight: '600', textAlign: 'center' }}>Unread</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      {notifications.length > 0 && (
        <motion.div
          style={{ display: 'flex', gap: '10px', padding: '16px 16px 0' }}
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          {unread > 0 && (
            <motion.button
              style={{ flex: 1, padding: '11px 14px', background: isDark ? 'rgba(26,115,232,0.1)' : 'rgba(26,115,232,0.07)', border: `1px solid ${isDark ? 'rgba(26,115,232,0.25)' : 'rgba(26,115,232,0.15)'}`, borderRadius: '13px', color: '#1A73E8', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              whileTap={{ scale: 0.96 }} onClick={handleMarkAllRead}
            >
              <CheckCheck size={14} color="#1A73E8" /> Mark all read
            </motion.button>
          )}
          <motion.button
            style={{ flex: 1, padding: '11px 14px', background: isDark ? 'rgba(220,38,38,0.08)' : 'rgba(220,38,38,0.05)', border: `1px solid ${isDark ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.12)'}`, borderRadius: '13px', color: '#DC2626', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            whileTap={{ scale: 0.96 }} onClick={handleClear}
          >
            <Trash2 size={14} color="#DC2626" /> Clear all
          </motion.button>
        </motion.div>
      )}

      {/* ── FILTER TABS ── */}
      {notifications.length > 0 && (
        <motion.div
          style={{ padding: '12px 16px 4px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            const count = filter === 'All' ? notifications.length
              : filter === 'Unread' ? notifications.filter(n => !n.read).length
              : filter === 'Security' ? notifications.filter(n => n.icon === 'security' || n.icon === 'shield' || n.type === 'warning' || n.title?.toLowerCase().includes('security') || n.title?.toLowerCase().includes('fraud') || n.title?.toLowerCase().includes('alert')).length
              : notifications.filter(n => n.icon === 'send' || n.icon === 'receive' || n.icon === 'deposit' || n.icon === 'bill').length;

            return (
              <motion.button key={filter}
                style={{ padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', background: isActive ? 'linear-gradient(135deg,#1A73E8,#7C3AED)' : isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', color: isActive ? '#fff' : textSec, boxShadow: isActive ? '0 4px 14px rgba(26,115,232,0.35)' : 'none', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
                {count > 0 && (
                  <span style={{ background: isActive ? 'rgba(255,255,255,0.2)' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', borderRadius: '20px', padding: '1px 6px', fontSize: '10px', fontWeight: '800' }}>
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* ── CONTENT ── */}
      <div style={{ padding: '12px 16px 100px' }}>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '16px' }}>
            <motion.div
              style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(26,115,232,0.35)' }}
              animate={{ scale: [1, 1.08, 1], opacity: [1, 0.8, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Bell size={24} color="#fff" />
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[0,1,2].map(i => (
                <motion.div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1A73E8' }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <motion.div
            style={{ textAlign: 'center', padding: '60px 20px' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              style={{ width: '88px', height: '88px', borderRadius: '26px', background: 'linear-gradient(135deg,rgba(26,115,232,0.15),rgba(124,58,237,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: `1px solid ${isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.12)'}` }}
              animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
            >
              <Bell size={38} color="#1A73E8" />
            </motion.div>
            <h3 style={{ color: text, fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>All Caught Up!</h3>
            <p style={{ color: textSec, fontSize: '13px', margin: '0 0 24px 0', lineHeight: '1.7' }}>
              No notifications yet. We'll notify you when something important happens.
            </p>
            <motion.button
              style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,115,232,0.35)' }}
              whileTap={{ scale: 0.97 }} onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </motion.button>
          </motion.div>
        )}

        {/* Empty filter state */}
        {!loading && notifications.length > 0 && filtered.length === 0 && (
          <motion.div
            style={{ textAlign: 'center', padding: '40px 20px' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Filter size={28} color={textSec} />
            </div>
            <p style={{ color: text, fontSize: '15px', fontWeight: '700', margin: '0 0 6px 0' }}>No {activeFilter} notifications</p>
            <p style={{ color: textSec, fontSize: '12px', margin: 0 }}>Try a different filter</p>
          </motion.div>
        )}

        {/* Notification list */}
        {!loading && filtered.length > 0 && (
          <AnimatePresence>
            {filtered.map((notif, index) => {
              const style = getNotifStyle(notif.icon, notif.type);
              const isUnread = !notif.read;
              return (
                <motion.div key={notif.id}
                  style={{ marginBottom: '10px', position: 'relative' }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 28 }}
                >
                  <motion.div
                    style={{ display: 'flex', gap: '14px', padding: '16px', background: isUnread ? (isDark ? 'rgba(26,115,232,0.06)' : 'rgba(26,115,232,0.03)') : card, borderRadius: '18px', border: `1px solid ${isUnread ? (isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.12)') : border}`, cursor: isUnread ? 'pointer' : 'default', position: 'relative', overflow: 'hidden', boxShadow: isUnread ? (isDark ? 'none' : '0 2px 16px rgba(26,115,232,0.06)') : 'none', transition: 'background 0.15s' }}
                    whileHover={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#FAFBFF' }}
                    whileTap={isUnread ? { scale: 0.99 } : {}}
                    onClick={() => isUnread && handleMarkRead(notif.id)}
                  >
                    {/* Left accent for unread */}
                    {isUnread && (
                      <div style={{ position: 'absolute', left: 0, top: '16px', bottom: '16px', width: '3px', borderRadius: '0 2px 2px 0', background: 'linear-gradient(180deg,#1A73E8,#7C3AED)' }} />
                    )}

                    {/* Icon */}
                    <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: style.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 14px ${style.shadow}` }}>
                      {style.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <p style={{ color: text, fontSize: '13px', fontWeight: isUnread ? '700' : '600', margin: 0, paddingRight: '8px', lineHeight: '1.4' }}>
                          {notif.title}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          {isUnread && (
                            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#1A73E8', boxShadow: '0 0 6px rgba(26,115,232,0.6)', flexShrink: 0 }} />
                          )}
                          <span style={{ color: textSec, fontSize: '10px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {timeAgo(notif.created_at)}
                          </span>
                        </div>
                      </div>
                      <p style={{ color: textSec, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
                        {notif.message}
                      </p>

                      {/* Tags */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                        <span style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          {notif.type || 'info'}
                        </span>
                        {isUnread && (
                          <span style={{ background: 'rgba(26,115,232,0.1)', color: '#1A73E8', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' }}>
                            Tap to mark read
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
