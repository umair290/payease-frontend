import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { notificationService } from '../services/api';
import {
  ArrowLeft, Bell, CheckCheck, Trash2,
  Send, Download, CreditCard, ShieldCheck,
  AlertCircle, Info, CheckCircle, RefreshCw
} from 'lucide-react';

const getIcon = (icon, type) => {
  const color = type === 'success' ? '#00C853' : type === 'error' ? '#FF4444' : type === 'warning' ? '#FFB300' : '#1A73E8';
  const size = 20;
  switch (icon) {
    case 'send': return <Send size={size} color={color} />;
    case 'receive': return <Download size={size} color={color} />;
    case 'deposit': return <CreditCard size={size} color={color} />;
    case 'bill': return <CheckCircle size={size} color={color} />;
    case 'shield': return <ShieldCheck size={size} color={color} />;
    case 'warning': return <AlertCircle size={size} color={color} />;
    default: return <Bell size={size} color={color} />;
  }
};

const getBg = (type) => {
  switch (type) {
    case 'success': return 'rgba(0,200,83,0.1)';
    case 'error': return 'rgba(255,68,68,0.1)';
    case 'warning': return 'rgba(255,179,0,0.1)';
    default: return 'rgba(26,115,232,0.1)';
  }
};

const timeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr + ' UTC');
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function Notifications() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unread_count || 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
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

  return (
    <div style={{ minHeight: '100vh', maxWidth: '480px', margin: '0 auto', background: colors.bg }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: colors.card, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <motion.div
          style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '10px', background: colors.actionBg, border: `1px solid ${colors.border}` }}
          whileTap={{ scale: 0.9 }} onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={20} color={colors.text} />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: colors.text }}>Notifications</h2>
          {unread > 0 && <p style={{ fontSize: '11px', color: '#1A73E8', margin: 0, fontWeight: '600' }}>{unread} unread</p>}
        </div>
        <motion.div
          style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '10px', background: colors.actionBg, border: `1px solid ${colors.border}` }}
          whileTap={{ scale: 0.9 }} onClick={loadNotifications}
        >
          <RefreshCw size={16} color={colors.text} />
        </motion.div>
      </div>

      {/* Action Buttons */}
      {notifications.length > 0 && (
        <motion.div
          style={{ display: 'flex', gap: '10px', padding: '12px 16px' }}
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        >
          {unread > 0 && (
            <motion.button
              style={{ flex: 1, padding: '10px', background: 'rgba(26,115,232,0.08)', border: '1px solid rgba(26,115,232,0.2)', borderRadius: '12px', color: '#1A73E8', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              whileTap={{ scale: 0.97 }} onClick={handleMarkAllRead}
            >
              <CheckCheck size={15} color="#1A73E8" /> Mark all read
            </motion.button>
          )}
          <motion.button
            style={{ flex: 1, padding: '10px', background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '12px', color: '#FF4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            whileTap={{ scale: 0.97 }} onClick={handleClear}
          >
            <Trash2 size={15} color="#FF4444" /> Clear all
          </motion.button>
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <RefreshCw size={24} color="#1A73E8" />
          </motion.div>
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          style={{ textAlign: 'center', padding: '60px 20px' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}
            animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
          >
            <Bell size={36} color="#1A73E8" />
          </motion.div>
          <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0' }}>All Caught Up!</h3>
          <p style={{ color: colors.textSecondary, fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
            No notifications yet. We'll notify you when something happens.
          </p>
        </motion.div>
      ) : (
        <div style={{ padding: '0 16px 100px' }}>
          <AnimatePresence>
            {notifications.map((notif, index) => (
              <motion.div
                key={notif.id}
                style={{ display: 'flex', gap: '12px', padding: '14px', background: notif.read ? colors.card : colors.actionBg, borderRadius: '16px', marginBottom: '8px', border: `1px solid ${notif.read ? colors.border : '#1A73E8'}`, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !notif.read && handleMarkRead(notif.id)}
              >
                {/* Unread indicator */}
                {!notif.read && (
                  <div style={{ position: 'absolute', top: '14px', right: '14px', width: '8px', height: '8px', borderRadius: '50%', background: '#1A73E8' }} />
                )}

                {/* Icon */}
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: getBg(notif.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getIcon(notif.icon, notif.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <p style={{ color: colors.text, fontSize: '14px', fontWeight: notif.read ? '500' : '700', margin: 0, paddingRight: '20px' }}>
                      {notif.title}
                    </p>
                  </div>
                  <p style={{ color: colors.textSecondary, fontSize: '12px', margin: '0 0 6px 0', lineHeight: '1.5' }}>
                    {notif.message}
                  </p>
                  <p style={{ color: '#1A73E8', fontSize: '11px', fontWeight: '600', margin: 0 }}>
                    {timeAgo(notif.created_at)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}