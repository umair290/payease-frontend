import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { accountService } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ArrowLeft, Search, ArrowUpRight, ArrowDownLeft,
  CheckCircle, Clock, Download, Calendar,
  TrendingUp, TrendingDown, Filter, X,
  Printer, Share2, FileText, ChevronDown, Loader
} from 'lucide-react';

export default function History() {
  const { isDark }   = useTheme();
  const navigate     = useNavigate();

  // ── Transaction state ──
  const [transactions, setTransactions] = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [search,       setSearch]       = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTx,   setSelectedTx]   = useState(null);
  const [userInfo,     setUserInfo]     = useState(null);

  // ── Pagination state ──
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [hasNext,    setHasNext]    = useState(false);

  // ── Stats (computed from ALL loaded transactions) ──
  const [stats, setStats] = useState({ totalIn: 0, totalOut: 0, count: 0 });

  // ── Initial load ──
  useEffect(() => {
    loadPage(1, true);
    loadUserInfo();
  }, []);

  // ── Re-filter when search/filter changes ──
  useEffect(() => { applyFilters(); }, [transactions, search, activeFilter]);

  const loadUserInfo = async () => {
    try {
      const res = await accountService.getBalance();
      setUserInfo(res.data);
    } catch (err) { console.error(err); }
  };

  const loadPage = async (pageNum, replace = false) => {
    if (pageNum === 1) setLoading(true);
    else               setLoadingMore(true);

    try {
      // Build filters for backend
      const filters = {};
      if (activeFilter === 'credit')   filters.direction = 'credit';
      if (activeFilter === 'debit')    filters.direction = 'debit';
      if (activeFilter === 'deposit')  filters.type      = 'deposit';
      if (activeFilter === 'transfer') filters.type      = 'transfer';

      const res  = await accountService.getTransactions(pageNum, 20, filters);
      const data = res.data;

      setTransactions(prev => replace ? data.transactions : [...prev, ...data.transactions]);
      setPage(data.page);
      setTotalPages(data.total_pages);
      setTotal(data.total);
      setHasNext(data.has_next);

      // Recalculate stats from all loaded transactions
      const allTxs = replace ? data.transactions : [...transactions, ...data.transactions];
      const totalIn  = allTxs.filter(t => t.direction === 'credit').reduce((s, t) => s + t.amount, 0);
      const totalOut = allTxs.filter(t => t.direction === 'debit').reduce((s, t) => s + t.amount, 0);
      setStats({ totalIn, totalOut, count: data.total });

    } catch (err) { console.error(err); }
    finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ── Reload when filter tab changes ──
  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setTransactions([]);
    setPage(1);
  };

  useEffect(() => {
    if (!loading) loadPage(1, true);
  }, [activeFilter]);

  const applyFilters = () => {
    let result = [...transactions];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(tx =>
        tx.description?.toLowerCase().includes(q) ||
        tx.from_wallet?.toLowerCase().includes(q) ||
        tx.to_wallet?.toLowerCase().includes(q)   ||
        tx.amount?.toString().includes(q)
      );
    }
    setFiltered(result);
  };

  // ── For PDF export — fetch all ──
  const fetchAllForExport = async () => {
    try {
      const res = await accountService.getAllTransactions();
      return res.data.transactions || [];
    } catch { return transactions; }
  };

  const parseDate    = (d) => { if (!d) return null; try { return new Date(d.replace(' ','T')); } catch { return null; } };
  const formatTime   = (d) => { const dt = parseDate(d); if (!dt) return ''; return dt.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }); };
  const formatFullDate = (d) => { const dt = parseDate(d); if (!dt) return 'N/A'; return dt.toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };
  const formatFullTime = (d) => { const dt = parseDate(d); if (!dt) return 'N/A'; return dt.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); };

  const getGroupDate = (dateStr) => {
    const d = parseDate(dateStr);
    if (!d) return 'Unknown';
    const diff = Math.floor((new Date() - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getTxStyle = (tx) => {
    if (tx.direction === 'credit') return { color: '#16A34A', bg: 'rgba(22,163,74,0.12)',  border: 'rgba(22,163,74,0.2)',  grad: 'linear-gradient(135deg,#16A34A,#15803D)' };
    if (tx.type === 'deposit')     return { color: '#1A73E8', bg: 'rgba(26,115,232,0.12)', border: 'rgba(26,115,232,0.2)', grad: 'linear-gradient(135deg,#1A73E8,#0052CC)' };
    return                                { color: '#DC2626', bg: 'rgba(220,38,38,0.12)',  border: 'rgba(220,38,38,0.2)',  grad: 'linear-gradient(135deg,#DC2626,#B91C1C)' };
  };

  const getTxIcon  = (tx, size = 16) => { const { color } = getTxStyle(tx); return tx.direction === 'credit' ? <ArrowDownLeft size={size} color={color} /> : <ArrowUpRight size={size} color={color} />; };
  const getTxLabel = (tx) => { if (tx.type === 'deposit') return 'Deposit'; if (tx.type === 'electricity') return 'Electricity'; if (tx.type === 'gas') return 'Gas Bill'; if (tx.type === 'internet') return 'Internet'; if (tx.type === 'topup') return 'Top-up'; if (tx.direction === 'credit') return 'Received'; return 'Sent'; };

  const handlePrintTx = (tx) => {
    const html = `<html><head><title>PayEase Receipt</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,sans-serif;background:#f0f4ff;display:flex;justify-content:center;padding:40px 20px;}.r{background:#fff;border-radius:20px;width:100%;max-width:400px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.12);}.h{background:linear-gradient(135deg,#1A73E8,#7C3AED);padding:28px;text-align:center;}.logo{color:#fff;font-size:24px;font-weight:bold;margin-bottom:12px;}.status{color:#fff;font-size:17px;font-weight:bold;}.amt{color:#fff;font-size:32px;font-weight:bold;margin-top:10px;}.b{padding:22px;}.row{display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid #f0f4ff;}.row:last-child{border-bottom:none;}.l{color:#888;font-size:13px;}.v{font-weight:600;font-size:13px;color:#1A1A2E;}.f{background:#f8faff;border-top:1px solid #e0e6f0;padding:14px;text-align:center;}.f p{color:#888;font-size:11px;margin-bottom:3px;}@media print{body{background:white;}.r{box-shadow:none;}}</style></head>
    <body><div class="r"><div class="h"><div class="logo">PayEase</div><div class="status">${getTxLabel(tx)}</div><div class="amt">${tx.direction === 'credit' ? '+' : '-'} PKR ${tx.amount?.toLocaleString()}</div></div>
    <div class="b"><div class="row"><span class="l">Type</span><span class="v">${tx.type?.toUpperCase()}</span></div><div class="row"><span class="l">Description</span><span class="v">${tx.description || 'N/A'}</span></div><div class="row"><span class="l">From</span><span class="v">${tx.from_wallet || 'N/A'}</span></div><div class="row"><span class="l">To</span><span class="v">${tx.to_wallet || 'N/A'}</span></div><div class="row"><span class="l">Date</span><span class="v">${formatFullDate(tx.date)}</span></div><div class="row"><span class="l">Status</span><span class="v" style="color:#16A34A">✓ ${tx.status}</span></div></div>
    <div class="f"><p>Thank you for using PayEase</p><p style="color:#1A73E8;font-weight:bold">payease.space</p></div></div></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handleShareTx = (tx) => {
    const text = `PayEase Transaction\n\n${tx.direction === 'credit' ? '+' : '-'} PKR ${tx.amount?.toLocaleString()}\nType: ${tx.type}\nDate: ${formatFullDate(tx.date)}\nStatus: ${tx.status}\n\npayease.space`;
    if (navigator.share) navigator.share({ title: 'PayEase Receipt', text });
    else navigator.clipboard.writeText(text);
  };

  const downloadStatement = async () => {
    const allTxs   = await fetchAllForExport();
    const totalIn  = allTxs.filter(t => t.direction === 'credit').reduce((s, t) => s + t.amount, 0);
    const totalOut = allTxs.filter(t => t.direction === 'debit').reduce((s, t) => s + t.amount, 0);

    const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;

    doc.setFillColor(26, 31, 239); doc.rect(0, 0, pageW / 2, 44, 'F');
    doc.setFillColor(26, 115, 232); doc.rect(pageW / 2, 0, pageW / 2, 44, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(26); doc.setFont('helvetica', 'bold');
    doc.text('PayEase', margin, 16);
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 220, 255);
    doc.text('Digital Wallet & Payment Services', margin, 23);
    doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text('ACCOUNT STATEMENT', pageW - margin, 13, { align: 'right' });
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 220, 255);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageW - margin, 19, { align: 'right' });
    doc.text(`Ref: PE-${Date.now().toString().slice(-8)}`, pageW - margin, 24, { align: 'right' });
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text(`${userInfo?.full_name || 'N/A'}`, margin, 33);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 220, 255);
    doc.text(`Wallet: ${userInfo?.wallet_number || 'N/A'}`, margin, 38.5);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text(`Balance: PKR ${Number(userInfo?.balance || 0).toLocaleString('en-PK')}`, pageW - margin, 33, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 220, 255);
    doc.text('Period: All Transactions', pageW - margin, 38.5, { align: 'right' });

    let y = 52;
    doc.setFillColor(243, 246, 255); doc.setDrawColor(200, 215, 250); doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, pageW - margin * 2, 30, 2, 2, 'FD');
    doc.setTextColor(26, 115, 232); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
    doc.text('STATEMENT SUMMARY', margin + 4, y + 7);
    const c1 = margin + 4, c2 = pageW / 2 + 4, lw = 38;
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
    doc.text('Total Money In:', c1, y + 15); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 140, 60);
    doc.text(`PKR ${Number(totalIn).toLocaleString('en-PK')}`, c1 + lw, y + 15);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
    doc.text('Total Money Out:', c2, y + 15); doc.setFont('helvetica', 'bold'); doc.setTextColor(190, 70, 0);
    doc.text(`PKR ${Number(totalOut).toLocaleString('en-PK')}`, c2 + lw, y + 15);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
    doc.text(`Total Transactions: ${allTxs.length}`, c1, y + 24);
    const net = totalIn - totalOut;
    doc.text('Net Flow:', c2, y + 24); doc.setFont('helvetica', 'bold');
    doc.setTextColor(net >= 0 ? 0 : 190, net >= 0 ? 140 : 0, net >= 0 ? 60 : 0);
    doc.text(`PKR ${Number(Math.abs(net)).toLocaleString('en-PK')} ${net >= 0 ? '(+)' : '(-)'}`, c2 + 22, y + 24);
    y += 38;

    autoTable(doc, {
      startY: y, margin: { left: margin, right: margin },
      head: [['#', 'Date', 'Time', 'Description', 'Type', 'Debit (PKR)', 'Credit (PKR)', 'Status']],
      body: allTxs.map((tx, i) => {
        const d = parseDate(tx.date);
        return [
          i + 1,
          d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A',
          d ? d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
          tx.description || (tx.direction === 'credit' ? 'Money Received' : 'Money Sent'),
          tx.type ? tx.type.charAt(0).toUpperCase() + tx.type.slice(1) : 'N/A',
          tx.direction === 'debit'  ? Number(tx.amount).toLocaleString('en-PK') : '-',
          tx.direction === 'credit' ? Number(tx.amount).toLocaleString('en-PK') : '-',
          'Success',
        ];
      }),
      headStyles: { fillColor: [26, 31, 239], textColor: [255,255,255], fontSize: 7.5, fontStyle: 'bold', halign: 'center', cellPadding: { top: 4, bottom: 4, left: 2, right: 2 } },
      bodyStyles: { fontSize: 7.2, textColor: [40,40,40], cellPadding: { top: 3, bottom: 3, left: 2, right: 2 }, lineColor: [220,228,245], lineWidth: 0.1 },
      alternateRowStyles: { fillColor: [245,248,255] },
      columnStyles: { 0: { halign: 'center', cellWidth: 8 }, 1: { halign: 'center', cellWidth: 22 }, 2: { halign: 'center', cellWidth: 16 }, 3: { cellWidth: 'auto' }, 4: { halign: 'center', cellWidth: 18 }, 5: { halign: 'right', cellWidth: 24 }, 6: { halign: 'right', cellWidth: 24 }, 7: { halign: 'center', cellWidth: 16 } },
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (data.column.index === 5 && data.cell.raw !== '-') { data.cell.styles.textColor = [190,70,0]; data.cell.styles.fontStyle = 'bold'; }
          if (data.column.index === 6 && data.cell.raw !== '-') { data.cell.styles.textColor = [0,140,60]; data.cell.styles.fontStyle = 'bold'; }
          if (data.column.index === 7) { data.cell.styles.textColor = [0,140,60]; data.cell.styles.fontStyle = 'bold'; }
        }
      },
      showFoot: 'lastPage',
      foot: [['','','','','TOTALS', `PKR ${Number(totalOut).toLocaleString('en-PK')}`, `PKR ${Number(totalIn).toLocaleString('en-PK')}`, `${allTxs.length} Txns`]],
      footStyles: { fillColor: [26,31,239], textColor: [255,255,255], fontSize: 8, fontStyle: 'bold', halign: 'center', cellPadding: { top: 4, bottom: 4, left: 2, right: 2 } },
    });

    const totalPagesDoc = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPagesDoc; i++) {
      doc.setPage(i);
      doc.setFillColor(26, 31, 239);
      doc.rect(0, pageH - 14, pageW, 14, 'F');
      doc.setFontSize(8); doc.setTextColor(255,255,255); doc.setFont('helvetica', 'bold');
      doc.text('PayEase', margin, pageH - 5.5);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(200,220,255);
      doc.text('| Digital Wallet | System generated | Does not require signature', margin + 20, pageH - 5.5);
      doc.setTextColor(255,255,255);
      doc.text(`Page ${i} of ${totalPagesDoc}`, pageW - margin, pageH - 5.5, { align: 'right' });
    }
    doc.save(`PayEase_Statement_${(userInfo?.full_name || 'User').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const groupedTransactions = filtered.reduce((groups, tx) => {
    const date = getGroupDate(tx.date);
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
    return groups;
  }, {});

  const filterTabs = [
    { id: 'all',      label: 'All'       },
    { id: 'credit',   label: 'Money In'  },
    { id: 'debit',    label: 'Money Out' },
    { id: 'deposit',  label: 'Deposits'  },
    { id: 'transfer', label: 'Transfers' },
  ];

  // ── Theme shortcuts ──
  const bg        = isDark ? '#0A0F1E' : '#F0F4FF';
  const card      = isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
  const cardSolid = isDark ? '#0F1629' : '#FFFFFF';
  const border    = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const text      = isDark ? '#F0F6FC' : '#0F172A';
  const textSec   = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8';
  const inputBg   = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF';
  const actionBg  = isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9';

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <motion.div
        style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(26,115,232,0.4)' }}
        animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span style={{ color: '#fff', fontSize: '24px', fontWeight: '800' }}>P</span>
      </motion.div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[0,1,2].map(i => <motion.div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1A73E8' }} animate={{ opacity: [0.3,1,0.3], scale: [0.8,1.2,0.8] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />)}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: bg, maxWidth: '480px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* ── STICKY HEADER ── */}
      <div style={{ background: isDark ? 'rgba(10,15,30,0.95)' : 'rgba(240,244,255,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10, borderBottom: `1px solid ${border}` }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 12px' }}>
          <motion.div
            style={{ width: '40px', height: '40px', borderRadius: '13px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            whileTap={{ scale: 0.88 }} onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={20} color={isDark ? 'rgba(255,255,255,0.7)' : '#475569'} />
          </motion.div>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: text, fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>Transaction History</h2>
            <p style={{ color: textSec, fontSize: '11px', margin: 0, fontWeight: '500' }}>
              {filtered.length} shown · {total} total
            </p>
          </div>

          <motion.div
            style={{ width: '40px', height: '40px', borderRadius: '13px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,115,232,0.4)' }}
            whileTap={{ scale: 0.88 }} onClick={downloadStatement}
          >
            <Download size={18} color="#fff" />
          </motion.div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: inputBg, borderRadius: '14px', padding: '0 14px', border: `1.5px solid ${search ? '#1A73E8' : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, transition: 'all 0.2s', boxShadow: search ? '0 0 0 3px rgba(26,115,232,0.1)' : 'none' }}>
            <Search size={15} color={search ? '#1A73E8' : textSec} style={{ flexShrink: 0, marginRight: '10px' }} />
            <input
              style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: text, fontSize: '14px', outline: 'none', fontWeight: '500' }}
              placeholder="Search by name, wallet, amount..."
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => setSearch('')} style={{ cursor: 'pointer', width: '22px', height: '22px', borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={12} color={textSec} />
              </motion.div>
            )}
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '6px', padding: '0 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {filterTabs.map((f) => (
            <motion.button key={f.id}
              style={{ padding: '7px 16px', border: activeFilter === f.id ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: '20px', cursor: 'pointer', background: activeFilter === f.id ? 'linear-gradient(135deg,#1A73E8,#7C3AED)' : actionBg, color: activeFilter === f.id ? '#fff' : textSec, fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: activeFilter === f.id ? '0 4px 12px rgba(26,115,232,0.3)' : 'none', letterSpacing: '0.2px' }}
              whileTap={{ scale: 0.93 }} onClick={() => handleFilterChange(f.id)}
            >
              {f.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', padding: '16px 16px 0' }}>
        {[
          { label: 'Money In',  value: stats.totalIn,  color: '#16A34A', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.15)',   icon: <TrendingUp   size={13} color="#16A34A" /> },
          { label: 'Money Out', value: stats.totalOut, color: '#DC2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.15)',   icon: <TrendingDown size={13} color="#DC2626" /> },
          { label: 'Total',     value: stats.count,    color: '#7C3AED', bg: 'rgba(124,58,237,0.08)',  border: 'rgba(124,58,237,0.15)',  icon: <Filter       size={13} color="#7C3AED" />, isCount: true },
        ].map((stat, i) => (
          <motion.div key={i}
            style={{ background: card, borderRadius: '16px', padding: '14px 12px', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden', position: 'relative' }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
          >
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '50px', height: '50px', borderRadius: '50%', background: stat.bg, pointerEvents: 'none' }} />
            <div style={{ width: '28px', height: '28px', borderRadius: '9px', background: stat.bg, border: `1px solid ${stat.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
              {stat.icon}
            </div>
            <p style={{ color: stat.color, fontSize: stat.isCount ? '22px' : '12px', fontWeight: '800', margin: '0 0 3px 0' }}>
              {stat.isCount ? stat.value : stat.value.toLocaleString()}
            </p>
            {!stat.isCount && <p style={{ color: stat.color, fontSize: '9px', fontWeight: '700', margin: '0 0 3px 0', opacity: 0.7 }}>PKR</p>}
            <p style={{ color: textSec, fontSize: '10px', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── DOWNLOAD BANNER ── */}
      <motion.div
        style={{ margin: '14px 16px 0', background: isDark ? 'rgba(26,31,239,0.08)' : 'rgba(26,115,232,0.04)', borderRadius: '18px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.1)'}`, cursor: 'pointer' }}
        whileTap={{ scale: 0.98 }} onClick={downloadStatement}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '13px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,115,232,0.3)', flexShrink: 0 }}>
            <FileText size={18} color="#fff" />
          </div>
          <div>
            <p style={{ color: text, fontSize: '13px', fontWeight: '700', margin: 0 }}>Download Statement</p>
            <p style={{ color: textSec, fontSize: '11px', margin: 0 }}>PDF report · {total} total transactions</p>
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '6px 14px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(26,115,232,0.3)', whiteSpace: 'nowrap' }}>
          Export PDF
        </div>
      </motion.div>

      {/* ── TRANSACTIONS LIST ── */}
      <div style={{ padding: '14px 16px 100px' }}>
        {filtered.length === 0 ? (
          <motion.div
            style={{ textAlign: 'center', padding: '60px 20px', background: card, borderRadius: '20px', border: `1px solid ${border}` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <motion.div
              style={{ width: '72px', height: '72px', borderRadius: '22px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}
              animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}
            >
              <Clock size={32} color={isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1'} />
            </motion.div>
            <p style={{ color: text, fontSize: '16px', fontWeight: '800', margin: '0 0 6px 0' }}>No transactions found</p>
            <p style={{ color: textSec, fontSize: '13px', margin: 0 }}>
              {search ? 'Try a different search term' : 'Your transactions will appear here'}
            </p>
          </motion.div>
        ) : (
          <>
            {Object.entries(groupedTransactions).map(([date, txs], gi) => (
              <motion.div key={date} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.04 }}>

                {/* Date group header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '7px', background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={11} color={textSec} />
                    </div>
                    <span style={{ color: text, fontSize: '12px', fontWeight: '800' }}>{date}</span>
                  </div>
                  <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }} />
                  <span style={{ color: textSec, fontSize: '10px', fontWeight: '700', background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', padding: '3px 9px', borderRadius: '10px', border: `1px solid ${border}`, flexShrink: 0 }}>
                    {txs.length} txn{txs.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Cards */}
                <div style={{ background: card, borderRadius: '18px', overflow: 'hidden', border: `1px solid ${border}`, boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.05)' }}>
                  {txs.map((tx, i) => {
                    const { color, bg: txBg, border: txBorder } = getTxStyle(tx);
                    return (
                      <motion.div key={i}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: i < txs.length - 1 ? `1px solid ${border}` : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                        whileHover={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedTx(tx)}
                      >
                        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: txBg, border: `1px solid ${txBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {getTxIcon(tx)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: text, fontSize: '13px', fontWeight: '700', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tx.description || (tx.direction === 'credit' ? 'Money Received' : 'Money Sent')}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: txBg, color, border: `1px solid ${txBorder}` }}>
                              {getTxLabel(tx)}
                            </span>
                            <span style={{ color: textSec, fontSize: '10px', fontWeight: '500' }}>{formatTime(tx.date)}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 4px 0', color, letterSpacing: '-0.3px' }}>
                            {tx.direction === 'credit' ? '+' : '-'} {tx.amount?.toLocaleString()}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                            <CheckCircle size={10} color="#16A34A" />
                            <span style={{ color: '#16A34A', fontSize: '10px', fontWeight: '600' }}>Done</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            {/* ── LOAD MORE BUTTON ── */}
            {hasNext && (
              <motion.div
                style={{ margin: '20px 0 0', textAlign: 'center' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                <motion.button
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: isDark ? 'rgba(26,115,232,0.12)' : 'rgba(26,115,232,0.06)', color: '#1A73E8', border: '1px solid rgba(26,115,232,0.25)', borderRadius: '16px', fontSize: '13px', fontWeight: '700', cursor: loadingMore ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loadingMore ? 0.6 : 1 }}
                  whileTap={{ scale: loadingMore ? 1 : 0.97 }}
                  onClick={() => !loadingMore && loadPage(page + 1)}
                >
                  {loadingMore ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Loader size={14} color="#1A73E8" />
                      </motion.div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} color="#1A73E8" />
                      Load More Transactions
                    </>
                  )}
                </motion.button>
                <p style={{ color: textSec, fontSize: '11px', margin: '8px 0 0 0' }}>
                  Showing {filtered.length} of {total}
                </p>
              </motion.div>
            )}

            {/* ── END OF LIST ── */}
            {!hasNext && filtered.length > 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0 0' }}>
                <p style={{ color: textSec, fontSize: '12px', fontWeight: '600' }}>
                  All {total} transactions loaded
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── TRANSACTION DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setSelectedTx(null)} />
            <motion.div
              style={{ background: cardSolid, borderRadius: '28px 28px 0 0', width: '100%', maxWidth: '480px', boxSizing: 'border-box', position: 'relative', zIndex: 1, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.3)' }}
              initial={{ y: 500 }} animate={{ y: 0 }} exit={{ y: 500 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div style={{ background: (() => { const { grad } = getTxStyle(selectedTx); return grad; })(), padding: '28px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.25)', borderRadius: '2px', margin: '0 auto 20px' }} />
                <motion.div
                  style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '2px solid rgba(255,255,255,0.25)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
                  initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.05 }}
                >
                  {getTxIcon(selectedTx, 26)}
                </motion.div>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                  {getTxLabel(selectedTx)}
                </p>
                <motion.h2
                  style={{ color: '#fff', fontSize: '30px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px' }}
                  initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
                >
                  {selectedTx.direction === 'credit' ? '+' : '-'} PKR {selectedTx.amount?.toLocaleString()}
                </motion.h2>
                <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle size={11} color="#fff" /> {selectedTx.status}
                </span>
              </div>

              <div style={{ padding: '20px 20px 36px' }}>
                <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFF', borderRadius: '18px', overflow: 'hidden', border: `1px solid ${border}`, marginBottom: '16px' }}>
                  {[
                    { label: 'Type',        value: selectedTx.type?.toUpperCase() },
                    { label: 'Description', value: selectedTx.description || 'N/A' },
                    { label: 'From Wallet', value: selectedTx.from_wallet || 'N/A' },
                    { label: 'To Wallet',   value: selectedTx.to_wallet   || 'N/A' },
                    { label: 'Date',        value: formatFullDate(selectedTx.date) },
                    { label: 'Time',        value: formatFullTime(selectedTx.date) },
                    { label: 'Status',      value: '✓ ' + selectedTx.status, color: '#16A34A' },
                  ].map((row, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none', gap: '16px' }}>
                      <span style={{ color: textSec, fontSize: '12px', flexShrink: 0 }}>{row.label}</span>
                      <span style={{ color: row.color || text, fontWeight: '700', fontSize: '12px', textAlign: 'right', wordBreak: 'break-all' }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <motion.button
                    style={{ flex: 1, padding: '14px', background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', color: text, border: `1px solid ${border}`, borderRadius: '14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    whileTap={{ scale: 0.97 }} onClick={() => handlePrintTx(selectedTx)}
                  >
                    <Printer size={14} color={text} /> Print
                  </motion.button>
                  <motion.button
                    style={{ flex: 1, padding: '14px', background: 'rgba(26,115,232,0.08)', color: '#1A73E8', border: '1px solid rgba(26,115,232,0.15)', borderRadius: '14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    whileTap={{ scale: 0.97 }} onClick={() => handleShareTx(selectedTx)}
                  >
                    <Share2 size={14} color="#1A73E8" /> Share
                  </motion.button>
                </div>

                <motion.button
                  style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 24px rgba(26,115,232,0.35)' }}
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

