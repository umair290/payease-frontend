import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { accountService } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ArrowLeft, Search, ArrowUpRight, ArrowDownLeft,
  CheckCircle, Clock, Download, Calendar,
  TrendingUp, TrendingDown, Wallet, X
} from 'lucide-react';

export default function History() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState(null);
  const [stats, setStats] = useState({ totalIn: 0, totalOut: 0, count: 0 });
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => { loadTransactions(); }, []);
  useEffect(() => { applyFilters(); }, [transactions, search, activeFilter]);

  const loadTransactions = async () => {
    try {
      const [txRes, balRes] = await Promise.all([
        accountService.getTransactions(),
        accountService.getBalance(),
      ]);
      const txs = txRes.data.transactions || [];
      setTransactions(txs);
      setUserInfo(balRes.data);
      const totalIn = txs.filter(t => t.direction === 'credit').reduce((sum, t) => sum + t.amount, 0);
      const totalOut = txs.filter(t => t.direction === 'debit').reduce((sum, t) => sum + t.amount, 0);
      setStats({ totalIn, totalOut, count: txs.length });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const applyFilters = () => {
    let result = [...transactions];
    if (search) {
      result = result.filter(tx =>
        tx.description?.toLowerCase().includes(search.toLowerCase()) ||
        tx.from_wallet?.toLowerCase().includes(search.toLowerCase()) ||
        tx.to_wallet?.toLowerCase().includes(search.toLowerCase()) ||
        tx.amount?.toString().includes(search)
      );
    }
    if (activeFilter === 'credit') result = result.filter(tx => tx.direction === 'credit');
    else if (activeFilter === 'debit') result = result.filter(tx => tx.direction === 'debit');
    else if (activeFilter === 'deposit') result = result.filter(tx => tx.type === 'deposit');
    else if (activeFilter === 'transfer') result = result.filter(tx => tx.type === 'transfer');
    setFiltered(result);
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      // Handle "2026-03-15 04:14:53.687227" format
      return new Date(dateStr.replace(' ', 'T'));
    } catch { return null; }
  };

  const formatTime = (dateStr) => {
    const date = parseDate(dateStr);
    if (!date) return '';
    return date.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const date = parseDate(dateStr);
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    if (diff < 2880) return 'Yesterday';
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatFullDate = (dateStr) => {
    const date = parseDate(dateStr);
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-PK', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const formatFullTime = (dateStr) => {
    const date = parseDate(dateStr);
    if (!date) return 'N/A';
    return date.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatStatementDate = (dateStr) => {
    const date = parseDate(dateStr);
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-PK', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getGroupDate = (dateStr) => {
    const date = parseDate(dateStr);
    if (!date) return 'Unknown';
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
  };

const downloadStatement = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;

    // ── HEADER ──
    doc.setFillColor(26, 115, 232);
    doc.rect(0, 0, pageW, 42, 'F');

    // Logo box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 7, 10, 10, 1.5, 1.5, 'F');
    doc.setTextColor(26, 115, 232);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('PE', margin + 1.8, 13.5);

    // App name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PayEase', margin + 13, 14);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Digital Wallet & Payment Services', margin + 13, 20);

    // Statement title right side
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ACCOUNT STATEMENT', pageW - margin, 12, { align: 'right' });
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const genDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    doc.text(`Generated: ${genDate}`, pageW - margin, 18, { align: 'right' });
    doc.text(`Ref: PE-${Date.now().toString().slice(-8)}`, pageW - margin, 23, { align: 'right' });

    // Divider
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.2);
    doc.line(margin, 27, pageW - margin, 27);

    // Account info row
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`${userInfo?.full_name || 'N/A'}`, margin, 33);
    doc.setFont('helvetica', 'normal');
    doc.text(`Wallet: ${userInfo?.wallet_number || 'N/A'}`, margin, 38.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Balance: PKR ${Number(userInfo?.balance || 0).toLocaleString('en-PK')}`, pageW - margin, 33, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text('Period: All Transactions', pageW - margin, 38.5, { align: 'right' });

    let y = 50;

    // ── SUMMARY BOX ──
    doc.setFillColor(243, 246, 255);
    doc.setDrawColor(200, 215, 250);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, pageW - margin * 2, 30, 2, 2, 'FD');

    doc.setTextColor(26, 115, 232);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('STATEMENT SUMMARY', margin + 4, y + 7);

    // Row 1
    const c1 = margin + 4;
    const c2 = pageW / 2 + 4;
    const lw = 38;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Total Money In:', c1, y + 15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 140, 60);
    doc.text(`PKR ${Number(stats.totalIn).toLocaleString('en-PK')}`, c1 + lw, y + 15);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Total Money Out:', c2, y + 15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(190, 70, 0);
    doc.text(`PKR ${Number(stats.totalOut).toLocaleString('en-PK')}`, c2 + lw, y + 15);

    // Row 2
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Total Transactions: ${stats.count}`, c1, y + 24);

    const net = stats.totalIn - stats.totalOut;
    doc.text('Net Flow:', c2, y + 24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(net >= 0 ? 0 : 190, net >= 0 ? 140 : 0, net >= 0 ? 60 : 0);
    const netStr = `PKR ${Number(Math.abs(net)).toLocaleString('en-PK')} ${net >= 0 ? '(+)' : '(-)'}`;
    doc.text(netStr, c2 + 22, y + 24);

    y += 38;

    // ── TABLE TITLE ──
    doc.setTextColor(26, 115, 232);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSACTION DETAILS', margin, y);
    doc.setDrawColor(26, 115, 232);
    doc.setLineWidth(0.4);
    doc.line(margin, y + 2, margin + 58, y + 2);
    y += 7;

    // ── TABLE ──
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['#', 'Date', 'Time', 'Description', 'Type', 'Debit (PKR)', 'Credit (PKR)', 'Status']],
      body: filtered.map((tx, i) => {
        const d = parseDate(tx.date);
        const dateStr = d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
        const timeStr = d ? d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        const desc = tx.description || (tx.direction === 'credit' ? 'Money Received' : 'Money Sent');
        const type = tx.type ? tx.type.charAt(0).toUpperCase() + tx.type.slice(1) : 'N/A';
        const debit = tx.direction === 'debit' ? Number(tx.amount).toLocaleString('en-PK') : '-';
        const credit = tx.direction === 'credit' ? Number(tx.amount).toLocaleString('en-PK') : '-';
        return [i + 1, dateStr, timeStr, desc, type, debit, credit, 'Success'];
      }),
      headStyles: {
        fillColor: [26, 115, 232],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: { top: 4, bottom: 4, left: 2, right: 2 },
      },
      bodyStyles: {
        fontSize: 7.2,
        textColor: [40, 40, 40],
        cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
        lineColor: [220, 228, 245],
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: [245, 248, 255],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { halign: 'center', cellWidth: 22 },
        2: { halign: 'center', cellWidth: 16 },
        3: { cellWidth: 'auto' },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'right', cellWidth: 24 },
        6: { halign: 'right', cellWidth: 24 },
        7: { halign: 'center', cellWidth: 16 },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (data.column.index === 5 && data.cell.raw !== '-') {
            data.cell.styles.textColor = [190, 70, 0];
            data.cell.styles.fontStyle = 'bold';
          }
          if (data.column.index === 6 && data.cell.raw !== '-') {
            data.cell.styles.textColor = [0, 140, 60];
            data.cell.styles.fontStyle = 'bold';
          }
          if (data.column.index === 7) {
            data.cell.styles.textColor = [0, 140, 60];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      showFoot: 'lastPage',
      foot: [[
        '', '', '', '', 'TOTALS',
        `PKR ${Number(stats.totalOut).toLocaleString('en-PK')}`,
        `PKR ${Number(stats.totalIn).toLocaleString('en-PK')}`,
        `${stats.count} Txns`,
      ]],
      footStyles: {
        fillColor: [20, 90, 180],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: { top: 4, bottom: 4, left: 2, right: 2 },
      },
    });

    // ── FOOTER ──
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(26, 115, 232);
      doc.rect(0, pageH - 14, pageW, 14, 'F');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'PayEase Digital Wallet | System generated statement | Does not require signature',
        margin, pageH - 6
      );
      doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 6, { align: 'right' });
    }

    const fileName = `PayEase_Statement_${(userInfo?.full_name || 'User').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  // Group transactions by date
  const groupedTransactions = filtered.reduce((groups, tx) => {
    const date = getGroupDate(tx.date);
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
    return groups;
  }, {});

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'credit', label: 'Money In' },
    { id: 'debit', label: 'Money Out' },
    { id: 'deposit', label: 'Deposits' },
    { id: 'transfer', label: 'Transfers' },
  ];

  const getTxIcon = (tx) => {
    if (tx.direction === 'credit') return <ArrowDownLeft size={20} color="#00C853" />;
    if (tx.type === 'deposit') return <Wallet size={20} color="#1A73E8" />;
    return <ArrowUpRight size={20} color="#FF6B35" />;
  };

  const getTxBg = (tx) => {
    if (tx.direction === 'credit') return 'rgba(0,200,83,0.1)';
    if (tx.type === 'deposit') return 'rgba(26,115,232,0.1)';
    return 'rgba(255,107,53,0.1)';
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
      <div style={{ background: colors.card, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 12px' }}>
          <motion.div
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${colors.border}` }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={22} color={colors.text} />
          </motion.div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Transaction History</h2>
            <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>{transactions.length} total transactions</p>
          </div>
          <motion.div
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}
            whileTap={{ scale: 0.9 }}
            onClick={downloadStatement}
          >
            <Download size={18} color="#fff" />
          </motion.div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: colors.actionBg, borderRadius: '12px', padding: '0 14px', border: `1px solid ${colors.border}` }}>
            <Search size={16} color={colors.textSecondary} style={{ flexShrink: 0, marginRight: '10px' }} />
            <input
              style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none' }}
              placeholder="Search by amount, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => setSearch('')} style={{ cursor: 'pointer' }}>
                <X size={16} color={colors.textSecondary} />
              </motion.div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', padding: '0 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {filters.map((f) => (
            <motion.button
              key={f.id}
              style={{
                padding: '7px 14px', border: activeFilter === f.id ? 'none' : `1px solid ${colors.border}`,
                borderRadius: '20px', cursor: 'pointer',
                background: activeFilter === f.id ? '#1A73E8' : colors.actionBg,
                color: activeFilter === f.id ? '#fff' : colors.textSecondary,
                fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px 16px 8px' }}>
        <motion.div
          style={{ background: 'rgba(0,200,83,0.08)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(0,200,83,0.2)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(0,200,83,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#00C853" />
            </div>
            <span style={{ color: '#00C853', fontSize: '12px', fontWeight: '600' }}>Money In</span>
          </div>
          <p style={{ color: '#00C853', fontSize: '18px', fontWeight: 'bold', margin: '0 0 2px 0' }}>
            PKR {stats.totalIn.toLocaleString()}
          </p>
          <p style={{ color: '#00C853', fontSize: '11px', margin: 0, opacity: 0.7 }}>
            {transactions.filter(t => t.direction === 'credit').length} transactions
          </p>
        </motion.div>

        <motion.div
          style={{ background: 'rgba(255,107,53,0.08)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,107,53,0.2)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,107,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={16} color="#FF6B35" />
            </div>
            <span style={{ color: '#FF6B35', fontSize: '12px', fontWeight: '600' }}>Money Out</span>
          </div>
          <p style={{ color: '#FF6B35', fontSize: '18px', fontWeight: 'bold', margin: '0 0 2px 0' }}>
            PKR {stats.totalOut.toLocaleString()}
          </p>
          <p style={{ color: '#FF6B35', fontSize: '11px', margin: 0, opacity: 0.7 }}>
            {transactions.filter(t => t.direction === 'debit').length} transactions
          </p>
        </motion.div>
      </div>

      {/* Download Banner */}
      <motion.div
        style={{ margin: '0 16px 8px', background: `linear-gradient(135deg, rgba(26,115,232,0.08), rgba(0,82,204,0.08))`, borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(26,115,232,0.2)', cursor: 'pointer' }}
        whileTap={{ scale: 0.98 }}
        onClick={downloadStatement}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Download size={18} color="#1A73E8" />
          </div>
          <div>
            <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: 0 }}>Download Bank Statement</p>
            <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>PDF • {filtered.length} transactions included</p>
          </div>
        </div>
        <span style={{ color: '#1A73E8', fontSize: '12px', fontWeight: '700', background: 'rgba(26,115,232,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
          PDF ↓
        </span>
      </motion.div>

      {/* Transactions List */}
      <div style={{ padding: '0 16px 100px' }}>
        {filtered.length === 0 ? (
          <motion.div
            style={{ textAlign: 'center', padding: '60px 20px', background: colors.card, borderRadius: '20px', border: `1px solid ${colors.border}`, marginTop: '16px' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Clock size={32} color={colors.textSecondary} />
            </div>
            <p style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>No transactions found</p>
            <p style={{ color: colors.textSecondary, fontSize: '13px', margin: 0 }}>
              {search ? 'Try a different search term' : 'Your transactions will appear here'}
            </p>
          </motion.div>
        ) : (
          Object.entries(groupedTransactions).map(([date, txs], groupIndex) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.05 }}
            >
              {/* Date Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} color={colors.textSecondary} />
                  <span style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600' }}>{date}</span>
                </div>
                <div style={{ flex: 1, height: '1px', background: colors.border }} />
                <span style={{ color: colors.textSecondary, fontSize: '11px' }}>{txs.length} txns</span>
              </div>

              {/* Transaction Cards */}
              <div style={{ background: colors.card, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${colors.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {txs.map((tx, i) => (
                  <motion.div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px',
                      borderBottom: i < txs.length - 1 ? `1px solid ${colors.border}` : 'none',
                      cursor: 'pointer',
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTx(tx)}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: getTxBg(tx), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {getTxIcon(tx)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: colors.text, fontSize: '14px', fontWeight: '600', margin: '0 0 3px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tx.description || (tx.direction === 'credit' ? 'Money Received' : 'Money Sent')}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px',
                          background: tx.type === 'deposit' ? 'rgba(26,115,232,0.1)' : tx.direction === 'credit' ? 'rgba(0,200,83,0.1)' : 'rgba(255,107,53,0.1)',
                          color: tx.type === 'deposit' ? '#1A73E8' : tx.direction === 'credit' ? '#00C853' : '#FF6B35',
                        }}>
                          {tx.type === 'deposit' ? 'Deposit' : tx.direction === 'credit' ? 'Received' : 'Sent'}
                        </span>
                        <span style={{ color: colors.textSecondary, fontSize: '11px' }}>
                          {formatTime(tx.date)}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 3px 0', color: tx.direction === 'credit' ? '#00C853' : '#FF6B35' }}>
                        {tx.direction === 'credit' ? '+' : '-'} PKR {tx.amount?.toLocaleString()}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                        <CheckCircle size={10} color="#00C853" />
                        <span style={{ color: '#00C853', fontSize: '10px', fontWeight: '600' }}>{tx.status}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedTx(null)}
          >
            <motion.div
              style={{ background: colors.card, borderRadius: '24px 24px 0 0', padding: '24px 24px 48px', width: '100%', maxWidth: '480px', boxSizing: 'border-box' }}
              initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ width: '40px', height: '4px', background: colors.border, borderRadius: '2px', margin: '0 auto 24px' }} />

              {/* Amount Header */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <motion.div
                  style={{ width: '64px', height: '64px', borderRadius: '20px', background: getTxBg(selectedTx), display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                >
                  {getTxIcon(selectedTx)}
                </motion.div>
                <p style={{ color: colors.textSecondary, fontSize: '13px', margin: '0 0 4px 0' }}>
                  {selectedTx.direction === 'credit' ? 'Money Received' : selectedTx.type === 'deposit' ? 'Deposit' : 'Money Sent'}
                </p>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', color: selectedTx.direction === 'credit' ? '#00C853' : '#FF6B35' }}>
                  {selectedTx.direction === 'credit' ? '+' : '-'} PKR {selectedTx.amount?.toLocaleString()}
                </h2>
                <span style={{ background: 'rgba(0,200,83,0.1)', color: '#00C853', fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={12} color="#00C853" /> {selectedTx.status}
                </span>
              </div>

              {/* Details */}
              <div style={{ background: colors.actionBg, borderRadius: '16px', padding: '4px 16px', marginBottom: '20px', border: `1px solid ${colors.border}` }}>
                {[
                  { label: 'Transaction Type', value: selectedTx.type?.toUpperCase() },
                  { label: 'Description', value: selectedTx.description || 'N/A' },
                  { label: 'From Wallet', value: selectedTx.from_wallet || 'N/A' },
                  { label: 'To Wallet', value: selectedTx.to_wallet || 'N/A' },
                  { label: 'Date', value: formatFullDate(selectedTx.date) },
                  { label: 'Time', value: formatFullTime(selectedTx.date) },
                  { label: 'Status', value: selectedTx.status?.toUpperCase(), color: '#00C853' },
                ].map((row, i, arr) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none', gap: '16px' }}>
                    <span style={{ color: colors.textSecondary, fontSize: '13px', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ color: row.color || colors.text, fontWeight: '600', fontSize: '13px', textAlign: 'right', wordBreak: 'break-all' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <motion.button
                style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,115,232,0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedTx(null)}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}