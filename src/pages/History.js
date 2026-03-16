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
  TrendingUp, TrendingDown, Wallet, X,
  Printer, Share2, Filter
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
      const totalIn = txs.filter(t => t.direction === 'credit').reduce((s, t) => s + t.amount, 0);
      const totalOut = txs.filter(t => t.direction === 'debit').reduce((s, t) => s + t.amount, 0);
      setStats({ totalIn, totalOut, count: txs.length });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const applyFilters = () => {
    let result = [...transactions];
    if (search) result = result.filter(tx =>
      tx.description?.toLowerCase().includes(search.toLowerCase()) ||
      tx.from_wallet?.toLowerCase().includes(search.toLowerCase()) ||
      tx.to_wallet?.toLowerCase().includes(search.toLowerCase()) ||
      tx.amount?.toString().includes(search)
    );
    if (activeFilter === 'credit') result = result.filter(tx => tx.direction === 'credit');
    else if (activeFilter === 'debit') result = result.filter(tx => tx.direction === 'debit');
    else if (activeFilter === 'deposit') result = result.filter(tx => tx.type === 'deposit');
    else if (activeFilter === 'transfer') result = result.filter(tx => tx.type === 'transfer');
    setFiltered(result);
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try { return new Date(dateStr.replace(' ', 'T')); } catch { return null; }
  };

  const formatTime = (dateStr) => {
    const d = parseDate(dateStr);
    if (!d) return '';
    return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const d = parseDate(dateStr);
    if (!d) return '';
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    if (diff < 2880) return 'Yesterday';
    return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  };

  const formatFullDate = (dateStr) => {
    const d = parseDate(dateStr);
    if (!d) return 'N/A';
    return d.toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatFullTime = (dateStr) => {
    const d = parseDate(dateStr);
    if (!d) return 'N/A';
    return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getGroupDate = (dateStr) => {
    const d = parseDate(dateStr);
    if (!d) return 'Unknown';
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getTxColor = (tx) => {
    if (tx.direction === 'credit') return '#16A34A';
    if (tx.type === 'deposit') return '#1A73E8';
    return '#DC2626';
  };

  const getTxBg = (tx) => {
    if (tx.direction === 'credit') return 'rgba(22,163,74,0.1)';
    if (tx.type === 'deposit') return 'rgba(26,115,232,0.1)';
    return 'rgba(220,38,38,0.1)';
  };

  const getTxIcon = (tx) => {
    const color = getTxColor(tx);
    if (tx.direction === 'credit') return <ArrowDownLeft size={18} color={color} />;
    if (tx.type === 'deposit') return <Wallet size={18} color={color} />;
    return <ArrowUpRight size={18} color={color} />;
  };

  const getTxLabel = (tx) => {
    if (tx.type === 'deposit') return 'Deposit';
    if (tx.direction === 'credit') return 'Received';
    return 'Sent';
  };

  const handlePrintTx = (tx) => {
    const html = `
      <html><head><title>PayEase Receipt</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:-apple-system,BlinkMacSystemFont,sans-serif; background:#f0f4ff; display:flex; justify-content:center; padding:40px 20px; }
        .receipt { background:#fff; border-radius:20px; width:100%; max-width:400px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.12); }
        .header { background:linear-gradient(135deg,#1A73E8,#0052CC); padding:28px; text-align:center; }
        .logo { color:#fff; font-size:22px; font-weight:bold; margin-bottom:14px; }
        .check { width:56px; height:56px; border-radius:50%; background:rgba(255,255,255,0.2); display:inline-flex; align-items:center; justify-content:center; font-size:24px; margin-bottom:10px; }
        .status { color:#fff; font-size:17px; font-weight:bold; }
        .amount { color:#fff; font-size:32px; font-weight:bold; margin-top:10px; }
        .body { padding:22px; }
        .row { display:flex; justify-content:space-between; padding:11px 0; border-bottom:1px solid #f0f4ff; }
        .row:last-child { border-bottom:none; }
        .label { color:#888; font-size:13px; }
        .value { font-weight:600; font-size:13px; color:#1A1A2E; text-align:right; max-width:60%; }
        .footer { background:#f8faff; border-top:1px solid #e0e6f0; padding:16px; text-align:center; }
        .footer p { color:#888; font-size:11px; margin-bottom:3px; }
        @media print { body { background:white; } .receipt { box-shadow:none; } }
      </style></head>
      <body><div class="receipt">
        <div class="header">
          <div class="logo">PayEase</div>
          <div class="check">✓</div>
          <div class="status">${tx.direction === 'credit' ? 'Money Received' : tx.type === 'deposit' ? 'Deposit' : 'Money Sent'}</div>
          <div class="amount">${tx.direction === 'credit' ? '+' : '-'} PKR ${tx.amount?.toLocaleString()}</div>
        </div>
        <div class="body">
          <div class="row"><span class="label">Type</span><span class="value">${tx.type?.toUpperCase()}</span></div>
          <div class="row"><span class="label">Description</span><span class="value">${tx.description || 'N/A'}</span></div>
          <div class="row"><span class="label">From</span><span class="value">${tx.from_wallet || 'N/A'}</span></div>
          <div class="row"><span class="label">To</span><span class="value">${tx.to_wallet || 'N/A'}</span></div>
          <div class="row"><span class="label">Date</span><span class="value">${formatFullDate(tx.date)}</span></div>
          <div class="row"><span class="label">Time</span><span class="value">${formatFullTime(tx.date)}</span></div>
          <div class="row"><span class="label">Status</span><span class="value" style="color:#00C853">✓ ${tx.status}</span></div>
        </div>
        <div class="footer">
          <p>Thank you for using PayEase</p>
          <p style="color:#1A73E8;font-weight:bold">payease-frontend.vercel.app</p>
        </div>
      </div></body></html>
    `;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handleShareTx = (tx) => {
    const text = `PayEase Transaction\n\n${tx.direction === 'credit' ? '+' : '-'} PKR ${tx.amount?.toLocaleString()}\nType: ${tx.type}\nDescription: ${tx.description || 'N/A'}\nDate: ${formatFullDate(tx.date)}\nStatus: ${tx.status}\n\npayease-frontend.vercel.app`;
    if (navigator.share) navigator.share({ title: 'PayEase Receipt', text });
    else navigator.clipboard.writeText(text);
  };

  const downloadStatement = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;

    doc.setFillColor(26, 115, 232);
    doc.rect(0, 0, pageW, 42, 'F');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 7, 10, 10, 1.5, 1.5, 'F');
    doc.setTextColor(26, 115, 232);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('PE', margin + 1.8, 13.5);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('PayEase', margin + 13, 14);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Digital Wallet & Payment Services', margin + 13, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ACCOUNT STATEMENT', pageW - margin, 12, { align: 'right' });
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageW - margin, 18, { align: 'right' });
    doc.text(`Ref: PE-${Date.now().toString().slice(-8)}`, pageW - margin, 23, { align: 'right' });
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.2);
    doc.line(margin, 27, pageW - margin, 27);
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
    doc.setFillColor(243, 246, 255);
    doc.setDrawColor(200, 215, 250);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, pageW - margin * 2, 30, 2, 2, 'FD');
    doc.setTextColor(26, 115, 232);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('STATEMENT SUMMARY', margin + 4, y + 7);
    const c1 = margin + 4, c2 = pageW / 2 + 4, lw = 38;
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
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Total Transactions: ${stats.count}`, c1, y + 24);
    const net = stats.totalIn - stats.totalOut;
    doc.text('Net Flow:', c2, y + 24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(net >= 0 ? 0 : 190, net >= 0 ? 140 : 0, net >= 0 ? 60 : 0);
    doc.text(`PKR ${Number(Math.abs(net)).toLocaleString('en-PK')} ${net >= 0 ? '(+)' : '(-)'} `, c2 + 22, y + 24);

    y += 38;
    doc.setTextColor(26, 115, 232);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSACTION DETAILS', margin, y);
    doc.setDrawColor(26, 115, 232);
    doc.setLineWidth(0.4);
    doc.line(margin, y + 2, margin + 58, y + 2);
    y += 7;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['#', 'Date', 'Time', 'Description', 'Type', 'Debit (PKR)', 'Credit (PKR)', 'Status']],
      body: filtered.map((tx, i) => {
        const d = parseDate(tx.date);
        const dateStr = d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
        const timeStr = d ? d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        return [
          i + 1, dateStr, timeStr,
          tx.description || (tx.direction === 'credit' ? 'Money Received' : 'Money Sent'),
          tx.type ? tx.type.charAt(0).toUpperCase() + tx.type.slice(1) : 'N/A',
          tx.direction === 'debit' ? Number(tx.amount).toLocaleString('en-PK') : '-',
          tx.direction === 'credit' ? Number(tx.amount).toLocaleString('en-PK') : '-',
          'Success',
        ];
      }),
      headStyles: { fillColor: [26, 115, 232], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold', halign: 'center', cellPadding: { top: 4, bottom: 4, left: 2, right: 2 } },
      bodyStyles: { fontSize: 7.2, textColor: [40, 40, 40], cellPadding: { top: 3, bottom: 3, left: 2, right: 2 }, lineColor: [220, 228, 245], lineWidth: 0.1 },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: { 0: { halign: 'center', cellWidth: 8 }, 1: { halign: 'center', cellWidth: 22 }, 2: { halign: 'center', cellWidth: 16 }, 3: { cellWidth: 'auto' }, 4: { halign: 'center', cellWidth: 18 }, 5: { halign: 'right', cellWidth: 24 }, 6: { halign: 'right', cellWidth: 24 }, 7: { halign: 'center', cellWidth: 16 } },
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (data.column.index === 5 && data.cell.raw !== '-') { data.cell.styles.textColor = [190, 70, 0]; data.cell.styles.fontStyle = 'bold'; }
          if (data.column.index === 6 && data.cell.raw !== '-') { data.cell.styles.textColor = [0, 140, 60]; data.cell.styles.fontStyle = 'bold'; }
          if (data.column.index === 7) { data.cell.styles.textColor = [0, 140, 60]; data.cell.styles.fontStyle = 'bold'; }
        }
      },
      showFoot: 'lastPage',
      foot: [['', '', '', '', 'TOTALS', `PKR ${Number(stats.totalOut).toLocaleString('en-PK')}`, `PKR ${Number(stats.totalIn).toLocaleString('en-PK')}`, `${stats.count} Txns`]],
      footStyles: { fillColor: [20, 90, 180], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold', halign: 'center', cellPadding: { top: 4, bottom: 4, left: 2, right: 2 } },
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(26, 115, 232);
      doc.rect(0, pageH - 14, pageW, 14, 'F');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.text('PayEase Digital Wallet | System generated statement | Does not require signature', margin, pageH - 6);
      doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 6, { align: 'right' });
    }

    doc.save(`PayEase_Statement_${(userInfo?.full_name || 'User').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

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

  if (loading) return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: '40px', height: '40px', border: `3px solid ${colors.border}`, borderTop: '3px solid #1A73E8', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, maxWidth: '480px', margin: '0 auto' }}>

      {/* Sticky Header */}
      <div style={{ background: colors.card, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 12px' }}>
          <motion.div
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.actionBg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            whileTap={{ scale: 0.9 }} onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={20} color={colors.text} />
          </motion.div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>History</h2>
            <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>{transactions.length} transactions</p>
          </div>
          <motion.div
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1A73E8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}
            whileTap={{ scale: 0.9 }} onClick={downloadStatement}
          >
            <Download size={18} color="#fff" />
          </motion.div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0 16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: colors.actionBg, borderRadius: '12px', padding: '0 14px', border: `1px solid ${colors.border}`, transition: 'border-color 0.2s' }}>
            <Search size={15} color={colors.textSecondary} style={{ flexShrink: 0, marginRight: '10px' }} />
            <input
              style={{ flex: 1, padding: '11px 0', border: 'none', background: 'transparent', color: colors.text, fontSize: '14px', outline: 'none' }}
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => setSearch('')} style={{ cursor: 'pointer', display: 'flex' }}>
                <X size={15} color={colors.textSecondary} />
              </motion.div>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', padding: '0 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {filters.map((f) => (
            <motion.button
              key={f.id}
              style={{ padding: '6px 14px', border: activeFilter === f.id ? 'none' : `1px solid ${colors.border}`, borderRadius: '20px', cursor: 'pointer', background: activeFilter === f.id ? '#1A73E8' : colors.actionBg, color: activeFilter === f.id ? '#fff' : colors.textSecondary, fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
              whileTap={{ scale: 0.95 }} onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', padding: '14px 16px 10px' }}>
        {[
          { label: 'Money In', value: stats.totalIn, color: '#16A34A', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.2)', icon: <TrendingUp size={14} color="#16A34A" /> },
          { label: 'Money Out', value: stats.totalOut, color: '#DC2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.2)', icon: <TrendingDown size={14} color="#DC2626" /> },
          { label: 'Total', value: stats.count, color: '#1A73E8', bg: 'rgba(26,115,232,0.08)', border: 'rgba(26,115,232,0.2)', isCount: true, icon: <Filter size={14} color="#1A73E8" /> },
        ].map((stat, i) => (
          <motion.div
            key={i}
            style={{ background: stat.bg, borderRadius: '14px', padding: '12px', border: `1px solid ${stat.border}` }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
              {stat.icon}
              <span style={{ color: stat.color, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{stat.label}</span>
            </div>
            <p style={{ color: stat.color, fontSize: stat.isCount ? '20px' : '13px', fontWeight: 'bold', margin: 0 }}>
              {stat.isCount ? stat.value : `PKR ${stat.value.toLocaleString()}`}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Download Banner */}
      <motion.div
        style={{ margin: '0 16px 12px', background: colors.card, borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${colors.border}`, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        whileTap={{ scale: 0.98 }} onClick={downloadStatement}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Download size={17} color="#1A73E8" />
          </div>
          <div>
            <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: 0 }}>Download Statement</p>
            <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>PDF · {filtered.length} transactions</p>
          </div>
        </div>
        <span style={{ color: '#1A73E8', fontSize: '12px', fontWeight: '700', background: 'rgba(26,115,232,0.08)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(26,115,232,0.15)' }}>
          Download
        </span>
      </motion.div>

      {/* Transactions */}
      <div style={{ padding: '0 16px 100px' }}>
        {filtered.length === 0 ? (
          <motion.div
            style={{ textAlign: 'center', padding: '60px 20px', background: colors.card, borderRadius: '20px', border: `1px solid ${colors.border}` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: colors.actionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Clock size={28} color={colors.textSecondary} />
            </div>
            <p style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: '0 0 6px 0' }}>No transactions found</p>
            <p style={{ color: colors.textSecondary, fontSize: '13px', margin: 0 }}>
              {search ? 'Try a different search term' : 'Your transactions will appear here'}
            </p>
          </motion.div>
        ) : (
          Object.entries(groupedTransactions).map(([date, txs], gi) => (
            <motion.div key={date} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.04 }}>
              {/* Date Group Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={12} color={colors.textSecondary} />
                  <span style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600' }}>{date}</span>
                </div>
                <div style={{ flex: 1, height: '1px', background: colors.border }} />
                <span style={{ color: colors.textSecondary, fontSize: '11px', background: colors.actionBg, padding: '2px 8px', borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                  {txs.length}
                </span>
              </div>

              {/* Transaction Cards */}
              <div style={{ background: colors.card, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${colors.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                {txs.map((tx, i) => (
                  <motion.div
                    key={i}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: i < txs.length - 1 ? `1px solid ${colors.border}` : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedTx(tx)}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: getTxBg(tx), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {getTxIcon(tx)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: colors.text, fontSize: '14px', fontWeight: '600', margin: '0 0 3px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tx.description || (tx.direction === 'credit' ? 'Money Received' : 'Money Sent')}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '600', padding: '1px 7px', borderRadius: '10px', background: getTxBg(tx), color: getTxColor(tx) }}>
                          {getTxLabel(tx)}
                        </span>
                        <span style={{ color: colors.textSecondary, fontSize: '11px' }}>{formatTime(tx.date)}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 3px 0', color: getTxColor(tx) }}>
                        {tx.direction === 'credit' ? '+' : '-'} PKR {tx.amount?.toLocaleString()}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                        <CheckCircle size={10} color="#16A34A" />
                        <span style={{ color: '#16A34A', fontSize: '10px', fontWeight: '600' }}>Done</span>
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
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: colors.overlay, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setSelectedTx(null)} />
            <motion.div
              style={{ background: colors.card, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', boxSizing: 'border-box', position: 'relative', zIndex: 1, maxHeight: '90vh', overflowY: 'auto' }}
              initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div style={{ background: 'linear-gradient(135deg, #1A73E8, #0052CC)', padding: '24px', textAlign: 'center', position: 'relative' }}>
                <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', margin: '0 auto 20px' }} />
                <motion.div
                  style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '2px solid rgba(255,255,255,0.3)' }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                >
                  {selectedTx.direction === 'credit'
                    ? <ArrowDownLeft size={24} color="#fff" />
                    : selectedTx.type === 'deposit'
                    ? <Wallet size={24} color="#fff" />
                    : <ArrowUpRight size={24} color="#fff" />
                  }
                </motion.div>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {getTxLabel(selectedTx)}
                </p>
                <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  {selectedTx.direction === 'credit' ? '+' : '-'} PKR {selectedTx.amount?.toLocaleString()}
                </h2>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '12px', fontWeight: '600', padding: '4px 14px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle size={12} color="#fff" /> {selectedTx.status}
                </span>
              </div>

              <div style={{ padding: '20px' }}>
                {/* Transaction Details */}
                <div style={{ background: colors.actionBg, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${colors.border}`, marginBottom: '16px' }}>
                  {[
                    { label: 'Transaction Type', value: selectedTx.type?.toUpperCase() },
                    { label: 'Description', value: selectedTx.description || 'N/A' },
                    { label: 'From Wallet', value: selectedTx.from_wallet || 'N/A' },
                    { label: 'To Wallet', value: selectedTx.to_wallet || 'N/A' },
                    { label: 'Date', value: formatFullDate(selectedTx.date) },
                    { label: 'Time', value: formatFullTime(selectedTx.date) },
                    { label: 'Status', value: '✓ ' + selectedTx.status, color: '#16A34A' },
                  ].map((row, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none', gap: '16px' }}>
                      <span style={{ color: colors.textSecondary, fontSize: '13px', flexShrink: 0 }}>{row.label}</span>
                      <span style={{ color: row.color || colors.text, fontWeight: '600', fontSize: '13px', textAlign: 'right', wordBreak: 'break-all' }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <motion.button
                    style={{ flex: 1, padding: '13px', background: colors.actionBg, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    whileTap={{ scale: 0.97 }} onClick={() => handlePrintTx(selectedTx)}
                  >
                    <Printer size={14} color={colors.text} /> Print
                  </motion.button>
                  <motion.button
                    style={{ flex: 1, padding: '13px', background: 'rgba(26,115,232,0.08)', color: '#1A73E8', border: '1px solid rgba(26,115,232,0.2)', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    whileTap={{ scale: 0.97 }} onClick={() => handleShareTx(selectedTx)}
                  >
                    <Share2 size={14} color="#1A73E8" /> Share
                  </motion.button>
                </div>

                <motion.button
                  style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 16px rgba(26,115,232,0.3)' }}
                  whileTap={{ scale: 0.97 }} onClick={() => setSelectedTx(null)}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
