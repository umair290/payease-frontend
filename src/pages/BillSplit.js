import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { splitService, accountService } from '../services/api';
import {
  ArrowLeft, Plus, Users, CheckCircle, Clock,
  AlertCircle, RefreshCw, ChevronRight, Trash2,
  Bell, X, Shield, Search, DollarSign, Send,
  SplitSquareHorizontal, UserPlus, Eye, Crown
} from 'lucide-react';

const PinInput = ({ value, onChange }) => (
  <div style={{ position: 'relative' }}>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '16px', border: `2px solid ${value.length === 4 ? '#1A73E8' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', background: 'rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
      {[0,1,2,3].map(i => (
        <motion.div key={i} style={{ width: '44px', height: '44px', borderRadius: '13px', border: `2px solid ${i < value.length ? '#1A73E8' : 'rgba(255,255,255,0.15)'}`, background: i < value.length ? 'rgba(26,115,232,0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} animate={{ scale: i === value.length - 1 ? [1,1.12,1] : 1 }} transition={{ duration: 0.15 }}>
          <motion.div style={{ width: '10px', height: '10px', borderRadius: '50%', background: i < value.length ? '#1A73E8' : 'rgba(255,255,255,0.2)' }} animate={{ scale: i < value.length ? 1 : 0.4 }} />
        </motion.div>
      ))}
    </div>
    <input style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'text', zIndex: 1 }} type="tel" inputMode="numeric" maxLength={4} value={value} onChange={(e) => onChange(e.target.value.slice(0,4).replace(/\D/g,''))} autoFocus />
  </div>
);

const Avatar = ({ src, name, size = 40 }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.12)' }}>
    {src ? <img src={src} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ color:'#fff', fontSize: size*0.38, fontWeight:'800' }}>{name?.charAt(0)?.toUpperCase()||'?'}</span>}
  </div>
);

const ProgressBar = ({ paid, total }) => {
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
        <span style={{ fontSize:'10px', fontWeight:'700', color: pct === 100 ? '#16A34A' : '#CA8A04' }}>{pct}% collected</span>
        <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)' }}>{paid}/{total} paid</span>
      </div>
      <div style={{ height:'6px', background:'rgba(255,255,255,0.08)', borderRadius:'3px', overflow:'hidden' }}>
        <motion.div style={{ height:'100%', background: pct===100 ? 'linear-gradient(90deg,#16A34A,#22C55E)' : 'linear-gradient(90deg,#CA8A04,#FBBF24)', borderRadius:'3px' }} initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.6 }} />
      </div>
    </div>
  );
};

export default function BillSplit() {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const { isDark } = useTheme();

  const [tab,           setTab]           = useState('list');
  const [activeList,    setActiveList]    = useState('created');
  const [splits,        setSplits]        = useState({ created: [], member: [] });
  const [loading,       setLoading]       = useState(true);
  const [userInfo,      setUserInfo]      = useState(null);
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [toast,         setToast]         = useState(null);

  const [title,         setTitle]         = useState('');
  const [description,   setDescription]   = useState('');
  const [totalAmount,   setTotalAmount]   = useState('');
  const [splitType,     setSplitType]     = useState('equal');
  const [creatorShare,  setCreatorShare]  = useState('');
  const [members,       setMembers]       = useState([]);
  const [lookupInput,   setLookupInput]   = useState('');
  const [lookupMode,    setLookupMode]    = useState('wallet');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError,   setLookupError]   = useState('');
  const [creating,      setCreating]      = useState(false);
  const [createError,   setCreateError]   = useState('');

  const [payModal, setPayModal] = useState(null);
  const [pin,      setPin]      = useState('');
  const [paying,   setPaying]   = useState(false);
  const [payError, setPayError] = useState('');

  const bg      = '#0A0F1E';
  const card    = 'rgba(255,255,255,0.04)';
  const border  = 'rgba(255,255,255,0.08)';
  const text    = '#F0F6FC';
  const textSec = 'rgba(255,255,255,0.45)';

  useEffect(() => { loadData(); }, []);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const loadData = async () => {
    setLoading(true);
    try {
      const [splitRes, balRes] = await Promise.all([splitService.list(), accountService.getBalance()]);
      setSplits(splitRes.data);
      setUserInfo(balRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleLookup = async () => {
    const val = lookupInput.trim();
    if (!val) return;
    setLookupLoading(true); setLookupError('');
    try {
      let res;
      if (lookupMode === 'wallet') {
        res = await (await import('../services/api')).accountService.lookupWallet(val.toUpperCase());
      } else {
        res = await (await import('../services/api')).accountService.lookupPhone(val);
      }
      const found = res.data;
      if (found.wallet_number === userInfo?.wallet_number) { setLookupError('That is your own wallet — you are already the creator'); setLookupLoading(false); return; }
      if (members.find(m => m.wallet_number === found.wallet_number)) { setLookupError('Already added'); setLookupLoading(false); return; }
      setMembers(prev => [...prev, { ...found, share_amount: '' }]);
      setLookupInput('');
    } catch (err) { setLookupError(err.response?.data?.error || 'Not found'); }
    setLookupLoading(false);
  };

  const removeMember = (wallet) => setMembers(prev => prev.filter(m => m.wallet_number !== wallet));

  // +1 for creator
  const getEqualShare = () => {
    const amt = parseFloat(totalAmount);
    if (!amt || members.length === 0) return 0;
    return (amt / (members.length + 1)).toFixed(2);
  };

  const getCustomRemaining = () => {
    const total  = parseFloat(totalAmount) || 0;
    const others = members.reduce((s, m) => s + parseFloat(m.share_amount || 0), 0);
    const mine   = parseFloat(creatorShare || 0);
    return Math.max(0, total - others - mine);
  };

  const handleCreate = async () => {
    if (!title.trim())                               { setCreateError('Title is required'); return; }
    if (!totalAmount || parseFloat(totalAmount) <= 0){ setCreateError('Enter a valid total amount'); return; }
    if (members.length === 0)                        { setCreateError('Add at least 1 member'); return; }
    if (splitType === 'custom') {
      const allShares = members.reduce((s,m) => s + parseFloat(m.share_amount || 0), 0) + parseFloat(creatorShare || 0);
      if (Math.abs(allShares - parseFloat(totalAmount)) > 1) {
        setCreateError(`All shares including yours (PKR ${allShares.toFixed(0)}) must equal total (PKR ${parseFloat(totalAmount).toFixed(0)})`);
        return;
      }
    }
    setCreating(true); setCreateError('');
    try {
      const equalShare = parseFloat(getEqualShare());
      await splitService.create({
        title, description,
        total_amount:         parseFloat(totalAmount),
        split_type:           splitType,
        creator_share_amount: splitType === 'custom' ? parseFloat(creatorShare || 0) : equalShare,
        members: members.map(m => ({
          wallet_number: m.wallet_number,
          share_amount:  splitType === 'custom' ? parseFloat(m.share_amount || 0) : equalShare,
        })),
      });
      showToast('Bill split created!');
      setTab('list');
      setTitle(''); setDescription(''); setTotalAmount(''); setMembers([]);
      setSplitType('equal'); setCreatorShare('');
      loadData();
    } catch (err) { setCreateError(err.response?.data?.error || 'Failed to create split'); }
    setCreating(false);
  };

  const handlePay = async () => {
    if (!pin || pin.length !== 4) { setPayError('Enter your 4-digit PIN'); return; }
    setPaying(true); setPayError('');
    try {
      const res = await splitService.pay({ group_id: payModal.group.id, pin });
      showToast('Payment successful!');
      setPayModal(null); setPin('');
      loadData();
      if (selectedSplit?.id === payModal.group.id) setSelectedSplit(res.data.group);
    } catch (err) { setPayError(err.response?.data?.error || 'Payment failed'); }
    setPaying(false);
  };

  const handleRemind = async (group) => {
    try { const res = await splitService.remind({ group_id: group.id }); showToast(res.data.message); }
    catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const handleSettle = async (group) => {
    try { await splitService.settle({ group_id: group.id }); showToast('Split marked as settled'); loadData(); setSelectedSplit(null); setTab('list'); }
    catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const handleDelete = async (group) => {
    try { await splitService.delete(group.id); showToast('Split deleted'); loadData(); setSelectedSplit(null); setTab('list'); }
    catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const openDetail = async (group) => {
    try { const res = await splitService.get(group.id); setSelectedSplit(res.data.group); setTab('detail'); }
    catch { setSelectedSplit(group); setTab('detail'); }
  };

  const myMembership = (group) => group?.members?.find(m => m.wallet_number === userInfo?.wallet_number);
  const isCreatorOf  = (group) => splits.created.some(g => g.id === group.id);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'20px', fontFamily:'-apple-system,sans-serif' }}>
      <motion.div style={{ width:'56px', height:'56px', borderRadius:'18px', background:'linear-gradient(135deg,#1A73E8,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center' }} animate={{ scale:[1,1.08,1] }} transition={{ duration:1.5, repeat:Infinity }}>
        <SplitSquareHorizontal size={26} color="#fff" />
      </motion.div>
      <div style={{ display:'flex', gap:'6px' }}>
        {[0,1,2].map(i => <motion.div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#1A73E8' }} animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:1, repeat:Infinity, delay:i*0.2 }} />)}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:bg, maxWidth:'480px', margin:'0 auto', fontFamily:'-apple-system,BlinkMacSystemFont,sans-serif', color:text }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
            style={{ position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', background:toast.type==='error'?'#DC2626':'#16A34A', color:'#fff', padding:'10px 18px', borderRadius:'12px', zIndex:99999, fontSize:'13px', fontWeight:'700', display:'flex', alignItems:'center', gap:'7px', boxShadow:'0 8px 24px rgba(0,0,0,0.3)', whiteSpace:'nowrap', border:'1px solid rgba(255,255,255,0.15)' }}>
            <CheckCircle size={14} color="#fff" /> {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {payModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:9999 }}
            onClick={() => { if (!paying) { setPayModal(null); setPin(''); setPayError(''); } }}>
            <motion.div initial={{ y:400 }} animate={{ y:0 }} exit={{ y:400 }} transition={{ type:'spring', damping:28, stiffness:280 }}
              style={{ background:'#0F1629', borderRadius:'28px 28px 0 0', width:'100%', maxWidth:'480px', padding:'28px 20px 48px', boxSizing:'border-box' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ width:'40px', height:'4px', background:'rgba(255,255,255,0.2)', borderRadius:'2px', margin:'0 auto 24px' }} />
              <div style={{ textAlign:'center', marginBottom:'24px' }}>
                <div style={{ width:'64px', height:'64px', borderRadius:'20px', background:'linear-gradient(135deg,#1A73E8,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', boxShadow:'0 8px 24px rgba(26,115,232,0.4)' }}><DollarSign size={28} color="#fff" /></div>
                <p style={{ color:text, fontSize:'20px', fontWeight:'800', margin:'0 0 4px 0' }}>Pay PKR {Number(payModal.member?.share_amount).toLocaleString()}</p>
                <p style={{ color:textSec, fontSize:'13px', margin:0 }}>For <strong style={{ color:text }}>{payModal.group?.title}</strong></p>
              </div>
              <div style={{ marginBottom:'16px' }}>
                <p style={{ color:textSec, fontSize:'11px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.8px', margin:'0 0 10px 0', textAlign:'center' }}>Enter your PIN</p>
                <PinInput value={pin} onChange={setPin} />
              </div>
              {payError && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.2)', borderRadius:'12px', padding:'10px 14px', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <AlertCircle size={13} color="#DC2626" /><span style={{ color:'#DC2626', fontSize:'13px' }}>{payError}</span>
                </motion.div>
              )}
              <motion.button style={{ width:'100%', padding:'16px', background:pin.length===4&&!paying?'linear-gradient(135deg,#16A34A,#15803D)':'rgba(255,255,255,0.06)', color:pin.length===4&&!paying?'#fff':textSec, border:'none', borderRadius:'16px', fontSize:'15px', fontWeight:'800', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:pin.length===4?'0 8px 24px rgba(22,163,74,0.4)':'none' }}
                whileTap={{ scale:0.97 }} onClick={handlePay} disabled={paying||pin.length!==4}>
                {paying ? <><RefreshCw size={15} color="#fff" style={{ animation:'spin 1s linear infinite' }} /> Paying...</> : <><CheckCircle size={15} /> Confirm Payment</>}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ background:'linear-gradient(160deg,#0F0C29 0%,#1A73E8 50%,#7C3AED 100%)', padding:'48px 20px 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'160px', height:'160px', borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', position:'relative', zIndex:1 }}>
          <motion.div style={{ width:'38px', height:'38px', borderRadius:'12px', background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'1px solid rgba(255,255,255,0.15)' }} whileTap={{ scale:0.88 }}
            onClick={() => { if (tab==='detail'||tab==='create') { setTab('list'); setSelectedSplit(null); } else navigate('/dashboard'); }}>
            <ArrowLeft size={18} color="#fff" />
          </motion.div>
          <div style={{ textAlign:'center' }}>
            <h1 style={{ color:'#fff', fontSize:'18px', fontWeight:'800', margin:0 }}>{tab==='create'?'New Split':tab==='detail'?'Split Details':'Bill Splitting'}</h1>
            {tab==='list' && <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'11px', margin:0 }}>Split bills with friends</p>}
          </div>
          {tab==='list' ? (
            <motion.div style={{ width:'38px', height:'38px', borderRadius:'12px', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'1px solid rgba(255,255,255,0.2)' }} whileTap={{ scale:0.88 }} onClick={() => { setTab('create'); setCreateError(''); }}>
              <Plus size={18} color="#fff" />
            </motion.div>
          ) : <div style={{ width:'38px' }} />}
        </div>
        {tab==='list' && (
          <div style={{ display:'flex', gap:'8px', position:'relative', zIndex:1 }}>
            {[
              { label:'Created',   value:splits.created.length, color:'#A5B4FC' },
              { label:'Member Of', value:splits.member.length,  color:'#86EFAC' },
              { label:'Pending',   value:splits.member.filter(g => myMembership(g)?.status==='pending').length, color:'#FCD34D' },
            ].map((s,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.12)', borderRadius:'20px', padding:'6px 12px', border:'1px solid rgba(255,255,255,0.15)', backdropFilter:'blur(8px)' }}>
                <span style={{ color:s.color, fontSize:'11px', fontWeight:'700' }}>{s.value} </span>
                <span style={{ color:'rgba(255,255,255,0.55)', fontSize:'11px' }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding:'16px' }}>
        <AnimatePresence mode="wait">

          {tab==='list' && (
            <motion.div key="list" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.22 }}>
              <div style={{ display:'flex', gap:'6px', marginBottom:'16px', background:card, borderRadius:'14px', padding:'5px', border:`1px solid ${border}` }}>
                {[{ id:'created', label:'Created by Me', icon:<Users size={13}/> }, { id:'member', label:'I Owe', icon:<DollarSign size={13}/> }].map(t => (
                  <motion.button key={t.id} style={{ flex:1, padding:'9px 4px', background:activeList===t.id?'linear-gradient(135deg,#1A73E8,#7C3AED)':'transparent', border:'none', borderRadius:'10px', color:activeList===t.id?'#fff':textSec, fontSize:'11px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', transition:'all 0.2s', boxShadow:activeList===t.id?'0 4px 12px rgba(26,115,232,0.35)':'none' }}
                    whileTap={{ scale:0.95 }} onClick={() => setActiveList(t.id)}>{t.icon}{t.label}</motion.button>
                ))}
              </div>

              {activeList==='created' && (
                splits.created.length===0 ? (
                  <motion.div style={{ textAlign:'center', padding:'60px 20px', background:card, borderRadius:'20px', border:`1px solid ${border}` }} initial={{ opacity:0 }} animate={{ opacity:1 }}>
                    <motion.div style={{ width:'72px', height:'72px', borderRadius:'22px', background:'rgba(26,115,232,0.08)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', border:'1px solid rgba(26,115,232,0.15)' }} animate={{ y:[0,-6,0] }} transition={{ duration:3, repeat:Infinity }}>
                      <SplitSquareHorizontal size={32} color="#1A73E8" />
                    </motion.div>
                    <p style={{ color:text, fontSize:'16px', fontWeight:'800', margin:'0 0 6px 0' }}>No splits yet</p>
                    <p style={{ color:textSec, fontSize:'13px', margin:'0 0 20px 0' }}>Create a bill split to share expenses</p>
                    <motion.button style={{ padding:'12px 24px', background:'linear-gradient(135deg,#1A73E8,#7C3AED)', color:'#fff', border:'none', borderRadius:'14px', fontSize:'13px', fontWeight:'700', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'6px', boxShadow:'0 6px 20px rgba(26,115,232,0.4)' }} whileTap={{ scale:0.97 }} onClick={() => setTab('create')}>
                      <Plus size={14} /> Create Split
                    </motion.button>
                  </motion.div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {splits.created.map((group,i) => (
                      <motion.div key={group.id} style={{ background:card, borderRadius:'18px', border:`1px solid ${border}`, overflow:'hidden', cursor:'pointer' }} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }} whileTap={{ scale:0.99 }} onClick={() => openDetail(group)}>
                        <div style={{ padding:'14px 16px' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ color:text, fontSize:'14px', fontWeight:'800', margin:'0 0 4px 0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{group.title}</p>
                              <p style={{ color:textSec, fontSize:'11px', margin:0 }}>{group.member_count} participant{group.member_count!==1?'s':''} · PKR {Number(group.total_amount).toLocaleString()}</p>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0, marginLeft:'12px' }}>
                              <span style={{ fontSize:'10px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', background:group.status==='settled'?'rgba(22,163,74,0.15)':'rgba(202,138,4,0.15)', color:group.status==='settled'?'#16A34A':'#CA8A04', border:`1px solid ${group.status==='settled'?'rgba(22,163,74,0.3)':'rgba(202,138,4,0.3)'}` }}>{group.status==='settled'?'Settled':'Open'}</span>
                              <ChevronRight size={14} color={textSec} />
                            </div>
                          </div>
                          <ProgressBar paid={group.paid_count} total={group.member_count} />
                        </div>
                        <div style={{ padding:'10px 16px', borderTop:`1px solid ${border}`, display:'flex', alignItems:'center', gap:'6px' }}>
                          <div style={{ display:'flex' }}>
                            {(group.members||[]).slice(0,5).map((m,j) => (
                              <div key={j} style={{ marginLeft:j>0?'-8px':0, zIndex:5-j }}><Avatar src={m.avatar_url} name={m.full_name} size={26} /></div>
                            ))}
                          </div>
                          {group.member_count>5 && <span style={{ color:textSec, fontSize:'10px', fontWeight:'700' }}>+{group.member_count-5}</span>}
                          <span style={{ color:textSec, fontSize:'10px', marginLeft:'auto' }}>PKR {Number(group.paid_amount||0).toLocaleString()} / {Number(group.total_amount).toLocaleString()} collected</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              )}

              {activeList==='member' && (
                splits.member.length===0 ? (
                  <motion.div style={{ textAlign:'center', padding:'60px 20px', background:card, borderRadius:'20px', border:`1px solid ${border}` }} initial={{ opacity:0 }} animate={{ opacity:1 }}>
                    <div style={{ width:'72px', height:'72px', borderRadius:'22px', background:'rgba(22,163,74,0.08)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', border:'1px solid rgba(22,163,74,0.15)' }}><CheckCircle size={32} color="#16A34A" /></div>
                    <p style={{ color:text, fontSize:'16px', fontWeight:'800', margin:'0 0 6px 0' }}>Nothing to pay</p>
                    <p style={{ color:textSec, fontSize:'13px', margin:0 }}>You have no pending split payments</p>
                  </motion.div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {splits.member.map((group,i) => {
                      const myShare = group.my_share;
                      const isPaid  = myShare?.status==='paid';
                      const creatorMember = group.members?.find(m => m.user_id === group.created_by);
                      return (
                        <motion.div key={group.id} style={{ background:card, borderRadius:'18px', border:`1px solid ${isPaid?'rgba(22,163,74,0.2)':border}`, overflow:'hidden' }} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}>
                          <div style={{ padding:'14px 16px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                              <div style={{ flex:1 }}>
                                <p style={{ color:text, fontSize:'14px', fontWeight:'800', margin:'0 0 3px 0' }}>{group.title}</p>
                                <p style={{ color:textSec, fontSize:'11px', margin:0 }}>Created by {creatorMember?.full_name||'someone'}</p>
                              </div>
                              <div style={{ textAlign:'right', flexShrink:0, marginLeft:'12px' }}>
                                <p style={{ color:isPaid?'#16A34A':'#FBBF24', fontSize:'15px', fontWeight:'800', margin:'0 0 2px 0' }}>PKR {Number(myShare?.share_amount||0).toLocaleString()}</p>
                                <span style={{ fontSize:'10px', fontWeight:'700', color:isPaid?'#16A34A':'#CA8A04' }}>{isPaid?'✓ Paid':'Pending'}</span>
                              </div>
                            </div>
                            {!isPaid && group.status!=='settled' && (
                              <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
                                <motion.button style={{ flex:1, padding:'10px', background:'linear-gradient(135deg,#16A34A,#15803D)', color:'#fff', border:'none', borderRadius:'12px', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', boxShadow:'0 4px 12px rgba(22,163,74,0.3)' }} whileTap={{ scale:0.97 }} onClick={() => { setPayModal({ group, member:myShare }); setPin(''); setPayError(''); }}>
                                  <Send size={12} /> Pay My Share
                                </motion.button>
                                <motion.button style={{ padding:'10px 14px', background:card, color:textSec, border:`1px solid ${border}`, borderRadius:'12px', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px' }} whileTap={{ scale:0.97 }} onClick={() => openDetail(group)}>
                                  <Eye size={12} /> View
                                </motion.button>
                              </div>
                            )}
                            {isPaid && (
                              <div style={{ marginTop:'8px', background:'rgba(22,163,74,0.06)', borderRadius:'10px', padding:'8px 12px', display:'flex', alignItems:'center', gap:'6px', border:'1px solid rgba(22,163,74,0.15)' }}>
                                <CheckCircle size={12} color="#16A34A" />
                                <span style={{ color:'#16A34A', fontSize:'11px', fontWeight:'600' }}>Paid on {myShare.paid_at ? new Date(myShare.paid_at).toLocaleDateString('en-PK',{day:'numeric',month:'short'}) : '—'}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )
              )}
            </motion.div>
          )}

          {tab==='create' && (
            <motion.div key="create" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.22 }}>

              <div style={{ background:card, borderRadius:'18px', padding:'16px', border:`1px solid ${border}`, marginBottom:'12px' }}>
                <p style={{ color:textSec, fontSize:'10px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.8px', margin:'0 0 10px 0' }}>Bill Details</p>
                <input style={{ width:'100%', padding:'12px 14px', border:`2px solid ${title?'#1A73E8':border}`, borderRadius:'12px', background:'rgba(255,255,255,0.04)', color:text, fontSize:'14px', fontWeight:'600', outline:'none', boxSizing:'border-box', transition:'all 0.2s', marginBottom:'8px' }}
                  placeholder="Title (e.g. Dinner at Pizza Palace)" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
                <input style={{ width:'100%', padding:'12px 14px', border:`2px solid ${description?'rgba(255,255,255,0.2)':border}`, borderRadius:'12px', background:'rgba(255,255,255,0.04)', color:text, fontSize:'13px', outline:'none', boxSizing:'border-box', transition:'all 0.2s' }}
                  placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} />
              </div>

              <div style={{ background:card, borderRadius:'18px', padding:'16px', border:`1px solid ${border}`, marginBottom:'12px' }}>
                <p style={{ color:textSec, fontSize:'10px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.8px', margin:'0 0 10px 0' }}>Total Amount</p>
                <div style={{ display:'flex', alignItems:'center', border:`2px solid ${totalAmount?'#1A73E8':border}`, borderRadius:'14px', padding:'0 16px', background:'rgba(255,255,255,0.03)', boxShadow:totalAmount?'0 0 0 4px rgba(26,115,232,0.1)':'none', transition:'all 0.2s' }}>
                  <span style={{ color:textSec, fontSize:'16px', fontWeight:'600', marginRight:'10px' }}>PKR</span>
                  <input style={{ flex:1, padding:'16px 0', border:'none', background:'transparent', color:text, fontSize:'24px', fontWeight:'800', outline:'none', letterSpacing:'-0.5px', width:'100%' }}
                    type="number" inputMode="decimal" placeholder="0" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
                </div>
              </div>

              <div style={{ background:card, borderRadius:'18px', padding:'16px', border:`1px solid ${border}`, marginBottom:'12px' }}>
                <p style={{ color:textSec, fontSize:'10px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.8px', margin:'0 0 10px 0' }}>Split Type</p>
                <div style={{ display:'flex', gap:'6px' }}>
                  {[{ id:'equal', label:'Equal Split', desc:'Everyone pays the same' }, { id:'custom', label:'Custom Split', desc:'Set individual amounts' }].map(t => (
                    <motion.button key={t.id} style={{ flex:1, padding:'12px', background:splitType===t.id?'linear-gradient(135deg,#1A73E8,#7C3AED)':'rgba(255,255,255,0.04)', border:`1px solid ${splitType===t.id?'transparent':border}`, borderRadius:'12px', cursor:'pointer', textAlign:'left', transition:'all 0.2s', boxShadow:splitType===t.id?'0 4px 14px rgba(26,115,232,0.3)':'none' }}
                      whileTap={{ scale:0.97 }} onClick={() => { setSplitType(t.id); setCreatorShare(''); }}>
                      <p style={{ color:splitType===t.id?'#fff':text, fontSize:'12px', fontWeight:'700', margin:'0 0 2px 0' }}>{t.label}</p>
                      <p style={{ color:splitType===t.id?'rgba(255,255,255,0.65)':textSec, fontSize:'10px', margin:0 }}>{t.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* YOUR SHARE — creator */}
              <div style={{ background:'rgba(26,115,232,0.06)', borderRadius:'18px', padding:'16px', border:'1px solid rgba(26,115,232,0.2)', marginBottom:'12px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                  <div style={{ width:'24px', height:'24px', borderRadius:'8px', background:'linear-gradient(135deg,#CA8A04,#92400E)', display:'flex', alignItems:'center', justifyContent:'center' }}><Crown size={13} color="#fff" /></div>
                  <p style={{ color:'#FCD34D', fontSize:'11px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.8px', margin:0 }}>Your Share (Creator)</p>
                </div>
                {splitType==='equal' ? (
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', background:'rgba(255,255,255,0.04)', borderRadius:'12px', border:`1px solid ${border}` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <Avatar src={userInfo?.avatar_url} name={userInfo?.full_name} size={36} />
                      <div>
                        <p style={{ color:text, fontSize:'13px', fontWeight:'700', margin:'0 0 1px 0' }}>{userInfo?.full_name}</p>
                        <p style={{ color:textSec, fontSize:'10px', margin:0, fontFamily:'monospace' }}>{userInfo?.wallet_number}</p>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ color:'#1A73E8', fontSize:'13px', fontWeight:'800', margin:0 }}>PKR {totalAmount && members.length > 0 ? getEqualShare() : '—'}</p>
                      <p style={{ color:textSec, fontSize:'10px', margin:'2px 0 0 0' }}>auto-calculated</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', background:'rgba(255,255,255,0.04)', borderRadius:'12px', border:`1px solid ${creatorShare?'rgba(26,115,232,0.4)':border}` }}>
                    <Avatar src={userInfo?.avatar_url} name={userInfo?.full_name} size={36} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ color:text, fontSize:'13px', fontWeight:'700', margin:'0 0 1px 0' }}>{userInfo?.full_name}</p>
                      <p style={{ color:textSec, fontSize:'10px', margin:0, fontFamily:'monospace' }}>{userInfo?.wallet_number}</p>
                    </div>
                    <input style={{ width:'90px', padding:'8px 10px', border:`2px solid ${creatorShare?'#1A73E8':border}`, borderRadius:'10px', background:'rgba(255,255,255,0.06)', color:text, fontSize:'13px', fontWeight:'700', outline:'none', textAlign:'right', transition:'all 0.2s' }}
                      type="number" placeholder="0" value={creatorShare} onChange={(e) => setCreatorShare(e.target.value)} />
                  </div>
                )}
                {splitType==='custom' && totalAmount && (
                  <div style={{ marginTop:'8px', padding:'8px 12px', background:'rgba(255,255,255,0.03)', borderRadius:'10px', display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:textSec, fontSize:'11px' }}>Remaining to assign</span>
                    <span style={{ color: getCustomRemaining() < 0.01 ? '#16A34A' : '#FBBF24', fontSize:'11px', fontWeight:'700' }}>PKR {getCustomRemaining().toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* ADD MEMBERS */}
              <div style={{ background:card, borderRadius:'18px', padding:'16px', border:`1px solid ${border}`, marginBottom:'12px' }}>
                <p style={{ color:textSec, fontSize:'10px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.8px', margin:'0 0 10px 0' }}>Add Other Members</p>
                <div style={{ display:'flex', gap:'4px', marginBottom:'10px', background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'3px' }}>
                  {[{ id:'wallet', label:'Wallet ID' }, { id:'phone', label:'Phone' }].map(m => (
                    <button key={m.id} style={{ flex:1, padding:'7px', background:lookupMode===m.id?'rgba(26,115,232,0.2)':'transparent', border:'none', borderRadius:'8px', color:lookupMode===m.id?'#60A5FA':textSec, fontSize:'11px', fontWeight:'700', cursor:'pointer', transition:'all 0.15s' }}
                      onClick={() => { setLookupMode(m.id); setLookupInput(''); setLookupError(''); }}>{m.label}</button>
                  ))}
                </div>
                <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
                  <div style={{ flex:1, display:'flex', alignItems:'center', border:`2px solid ${lookupInput?'#1A73E8':border}`, borderRadius:'12px', padding:'0 12px', background:'rgba(255,255,255,0.04)', transition:'all 0.2s' }}>
                    <Search size={14} color={lookupInput?'#1A73E8':textSec} style={{ flexShrink:0, marginRight:'8px' }} />
                    <input style={{ flex:1, padding:'11px 0', border:'none', background:'transparent', color:text, fontSize:'13px', outline:'none' }}
                      placeholder={lookupMode==='wallet'?'Wallet ID (e.g. PKAB123...)':'Phone number'}
                      value={lookupInput} onChange={(e) => setLookupInput(e.target.value)}
                      onKeyPress={(e) => e.key==='Enter' && handleLookup()} />
                    {lookupInput && <motion.div whileTap={{ scale:0.9 }} onClick={() => { setLookupInput(''); setLookupError(''); }} style={{ cursor:'pointer' }}><X size={13} color={textSec} /></motion.div>}
                  </div>
                  <motion.button style={{ padding:'11px 16px', background:'linear-gradient(135deg,#1A73E8,#7C3AED)', border:'none', borderRadius:'12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', color:'#fff', fontSize:'12px', fontWeight:'700', boxShadow:'0 4px 12px rgba(26,115,232,0.3)', opacity:lookupLoading?0.7:1 }}
                    whileTap={{ scale:0.97 }} onClick={handleLookup} disabled={lookupLoading}>
                    {lookupLoading ? <RefreshCw size={14} color="#fff" style={{ animation:'spin 1s linear infinite' }} /> : <UserPlus size={14} color="#fff" />}
                    Add
                  </motion.button>
                </div>
                {lookupError && <p style={{ color:'#DC2626', fontSize:'12px', margin:'0 0 8px 0', display:'flex', alignItems:'center', gap:'5px' }}><AlertCircle size={12} color="#DC2626" /> {lookupError}</p>}

                {members.length > 0 && (
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginTop:'8px' }}>
                    {members.map((m,i) => (
                      <motion.div key={m.wallet_number} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                        style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', background:'rgba(255,255,255,0.04)', borderRadius:'12px', border:`1px solid ${border}` }}>
                        <Avatar src={m.avatar_url} name={m.full_name} size={36} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ color:text, fontSize:'13px', fontWeight:'700', margin:'0 0 1px 0' }}>{m.full_name}</p>
                          <p style={{ color:textSec, fontSize:'10px', margin:0, fontFamily:'monospace' }}>{m.wallet_number}</p>
                        </div>
                        {splitType==='equal' ? (
                          <span style={{ color:'#1A73E8', fontSize:'12px', fontWeight:'700', flexShrink:0 }}>PKR {totalAmount ? getEqualShare() : '—'}</span>
                        ) : (
                          <input style={{ width:'80px', padding:'6px 8px', border:`1.5px solid ${m.share_amount?'#1A73E8':border}`, borderRadius:'8px', background:'rgba(255,255,255,0.06)', color:text, fontSize:'12px', fontWeight:'700', outline:'none', textAlign:'right' }}
                            type="number" placeholder="0" value={m.share_amount}
                            onChange={(e) => setMembers(prev => prev.map(mb => mb.wallet_number===m.wallet_number ? {...mb, share_amount:e.target.value} : mb))} />
                        )}
                        <motion.button style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }} whileTap={{ scale:0.9 }} onClick={() => removeMember(m.wallet_number)}>
                          <X size={12} color="#DC2626" />
                        </motion.button>
                      </motion.div>
                    ))}
                    {splitType==='equal' && totalAmount && members.length > 0 && (
                      <div style={{ padding:'10px 12px', background:'rgba(26,115,232,0.06)', borderRadius:'10px', border:'1px solid rgba(26,115,232,0.15)', display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'4px' }}>
                        <span style={{ color:textSec, fontSize:'11px' }}>Each person (incl. you)</span>
                        <span style={{ color:'#1A73E8', fontSize:'13px', fontWeight:'800' }}>PKR {getEqualShare()}</span>
                      </div>
                    )}
                    {splitType==='custom' && totalAmount && (
                      <div style={{ padding:'10px 12px', background:'rgba(255,255,255,0.04)', borderRadius:'10px', border:`1px solid ${border}`, display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'4px' }}>
                        <span style={{ color:textSec, fontSize:'11px' }}>Assigned / Total</span>
                        <span style={{ color: Math.abs(members.reduce((s,m)=>s+parseFloat(m.share_amount||0),0)+parseFloat(creatorShare||0)-parseFloat(totalAmount))<1?'#16A34A':'#DC2626', fontSize:'13px', fontWeight:'800' }}>
                          PKR {(members.reduce((s,m)=>s+parseFloat(m.share_amount||0),0)+parseFloat(creatorShare||0)).toFixed(0)} / {parseFloat(totalAmount).toFixed(0)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {createError && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.2)', borderRadius:'12px', padding:'12px 14px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <AlertCircle size={13} color="#DC2626" /><span style={{ color:'#DC2626', fontSize:'13px' }}>{createError}</span>
                </motion.div>
              )}

              <motion.button
                style={{ width:'100%', padding:'16px', background:title&&totalAmount&&members.length>0&&!creating?'linear-gradient(135deg,#1A73E8,#7C3AED)':'rgba(255,255,255,0.06)', color:title&&totalAmount&&members.length>0&&!creating?'#fff':textSec, border:'none', borderRadius:'16px', fontSize:'15px', fontWeight:'800', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:title&&totalAmount&&members.length>0?'0 8px 28px rgba(26,115,232,0.4)':'none' }}
                whileTap={{ scale:0.97 }} onClick={handleCreate} disabled={creating}>
                {creating ? <><RefreshCw size={15} color="#fff" style={{ animation:'spin 1s linear infinite' }} /> Creating...</> : <><SplitSquareHorizontal size={15} /> Create Split</>}
              </motion.button>
              <div style={{ height:'40px' }} />
            </motion.div>
          )}

          {tab==='detail' && selectedSplit && (
            <motion.div key="detail" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.22 }}>

              <div style={{ background:'linear-gradient(135deg,rgba(26,115,232,0.12),rgba(124,58,237,0.12))', borderRadius:'20px', padding:'20px', border:'1px solid rgba(26,115,232,0.2)', marginBottom:'14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
                  <div>
                    <p style={{ color:text, fontSize:'18px', fontWeight:'800', margin:'0 0 4px 0' }}>{selectedSplit.title}</p>
                    {selectedSplit.description && <p style={{ color:textSec, fontSize:'12px', margin:'0 0 8px 0' }}>{selectedSplit.description}</p>}
                    <p style={{ color:'#60A5FA', fontSize:'22px', fontWeight:'800', margin:0 }}>PKR {Number(selectedSplit.total_amount).toLocaleString()}</p>
                  </div>
                  <span style={{ fontSize:'11px', fontWeight:'700', padding:'4px 12px', borderRadius:'20px', background:selectedSplit.status==='settled'?'rgba(22,163,74,0.2)':'rgba(202,138,4,0.2)', color:selectedSplit.status==='settled'?'#4ADE80':'#FCD34D', border:`1px solid ${selectedSplit.status==='settled'?'rgba(22,163,74,0.3)':'rgba(202,138,4,0.3)'}`, flexShrink:0 }}>
                    {selectedSplit.status==='settled'?'Settled':'Open'}
                  </span>
                </div>
                <ProgressBar paid={selectedSplit.paid_count} total={selectedSplit.member_count} />
                <p style={{ color:textSec, fontSize:'11px', margin:'8px 0 0 0' }}>PKR {Number(selectedSplit.paid_amount||0).toLocaleString()} collected of PKR {Number(selectedSplit.total_amount).toLocaleString()}</p>
              </div>

              <div style={{ background:card, borderRadius:'18px', overflow:'hidden', border:`1px solid ${border}`, marginBottom:'12px' }}>
                <div style={{ padding:'12px 16px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:'8px' }}>
                  <Users size={14} color={textSec} />
                  <p style={{ color:text, fontSize:'12px', fontWeight:'700', margin:0, textTransform:'uppercase', letterSpacing:'0.5px' }}>Participants ({selectedSplit.member_count})</p>
                </div>
                {(selectedSplit.members||[]).map((m,i,arr) => {
                  const isMe      = m.wallet_number === userInfo?.wallet_number;
                  const isCreator = m.user_id === selectedSplit.created_by;
                  return (
                    <div key={m.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'13px 16px', borderBottom:i<arr.length-1?`1px solid ${border}`:'none', background:isMe?'rgba(26,115,232,0.04)':'transparent' }}>
                      <div style={{ position:'relative' }}>
                        <Avatar src={m.avatar_url} name={m.full_name} size={40} />
                        {isCreator && (
                          <div style={{ position:'absolute', bottom:'-2px', right:'-2px', width:'16px', height:'16px', borderRadius:'50%', background:'linear-gradient(135deg,#CA8A04,#92400E)', display:'flex', alignItems:'center', justifyContent:'center', border:'1.5px solid #0A0F1E' }}>
                            <Crown size={8} color="#fff" />
                          </div>
                        )}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'5px', flexWrap:'wrap' }}>
                          <p style={{ color:text, fontSize:'13px', fontWeight:'700', margin:0 }}>{m.full_name}</p>
                          {isMe && <span style={{ fontSize:'9px', fontWeight:'700', color:'#60A5FA', background:'rgba(26,115,232,0.15)', padding:'2px 6px', borderRadius:'10px' }}>You</span>}
                          {isCreator && <span style={{ fontSize:'9px', fontWeight:'700', color:'#FCD34D', background:'rgba(202,138,4,0.15)', padding:'2px 6px', borderRadius:'10px' }}>Creator</span>}
                        </div>
                        <p style={{ color:textSec, fontSize:'10px', margin:0, fontFamily:'monospace' }}>{m.wallet_number}</p>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p style={{ color:m.status==='paid'?'#16A34A':'#FBBF24', fontSize:'13px', fontWeight:'800', margin:'0 0 2px 0' }}>PKR {Number(m.share_amount).toLocaleString()}</p>
                        <div style={{ display:'flex', alignItems:'center', gap:'4px', justifyContent:'flex-end' }}>
                          {m.status==='paid'
                            ? <><CheckCircle size={11} color="#16A34A" /><span style={{ color:'#16A34A', fontSize:'10px', fontWeight:'600' }}>Paid</span></>
                            : <><Clock size={11} color="#CA8A04" /><span style={{ color:'#CA8A04', fontSize:'10px', fontWeight:'600' }}>Pending</span></>
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {(() => {
                const myShare   = myMembership(selectedSplit);
                const amCreator = isCreatorOf(selectedSplit);
                if (myShare && myShare.status==='pending' && selectedSplit.status!=='settled' && !amCreator) {
                  return (
                    <motion.button style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#16A34A,#15803D)', color:'#fff', border:'none', borderRadius:'16px', fontSize:'14px', fontWeight:'800', cursor:'pointer', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:'0 6px 20px rgba(22,163,74,0.4)' }}
                      whileTap={{ scale:0.97 }} onClick={() => { setPayModal({ group:selectedSplit, member:myShare }); setPin(''); setPayError(''); }}>
                      <Send size={14} /> Pay My Share — PKR {Number(myShare.share_amount).toLocaleString()}
                    </motion.button>
                  );
                }
                return null;
              })()}

              {isCreatorOf(selectedSplit) && (
                <div style={{ display:'flex', gap:'8px', marginBottom:'10px' }}>
                  {selectedSplit.status==='open' && (
                    <>
                      <motion.button style={{ flex:1, padding:'12px', background:card, color:textSec, border:`1px solid ${border}`, borderRadius:'14px', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }} whileTap={{ scale:0.97 }} onClick={() => handleRemind(selectedSplit)}>
                        <Bell size={13} /> Remind All
                      </motion.button>
                      <motion.button style={{ flex:1, padding:'12px', background:'rgba(22,163,74,0.1)', color:'#16A34A', border:'1px solid rgba(22,163,74,0.2)', borderRadius:'14px', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }} whileTap={{ scale:0.97 }} onClick={() => handleSettle(selectedSplit)}>
                        <CheckCircle size={13} /> Mark Settled
                      </motion.button>
                    </>
                  )}
                  <motion.button style={{ flex:selectedSplit.status==='settled'?2:1, padding:'12px', background:'rgba(220,38,38,0.1)', color:'#DC2626', border:'1px solid rgba(220,38,38,0.2)', borderRadius:'14px', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }} whileTap={{ scale:0.97 }} onClick={() => handleDelete(selectedSplit)}>
                    <Trash2 size={13} /> Delete
                  </motion.button>
                </div>
              )}

              <div style={{ height:'40px' }} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}