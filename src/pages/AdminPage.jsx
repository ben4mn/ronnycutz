import { useEffect, useState } from 'react';
import {
  adminFetchConfig, adminFetchBookings, adminApproveBooking,
  adminDenyBooking, adminCancelBooking, adminFetchBlocks,
  adminCreateBlock, adminDeleteBlock,
} from '../lib/api.js';

const STORAGE_KEY = 'ronnycutz_admin_token';

const s = {
  wrap: { minHeight: '100vh', background: '#FFF9F0', fontFamily: 'Inter,system-ui,sans-serif', padding: '0 0 80px' },
  inner: { maxWidth: '680px', margin: '0 auto', padding: '0 16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px', background: '#fff', borderBottom: '3px solid #111', position: 'sticky', top: 0, zIndex: 10 },
  logo: { fontSize: '20px', fontWeight: 900 },
  signout: { background: '#fff', border: '2px solid #111', borderRadius: '50px', padding: '6px 14px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' },
  section: { marginBottom: '32px', paddingTop: '24px' },
  sectionTitle: { fontSize: '18px', fontWeight: 900, marginBottom: '14px', color: '#111', display: 'flex', alignItems: 'center', gap: '8px' },
  badge: { background: '#E03A2F', color: '#fff', fontWeight: 800, fontSize: '11px', padding: '2px 8px', borderRadius: '50px', border: '1.5px solid #111' },
  pendingCard: { background: '#FFF9F0', border: '2.5px solid #111', borderRadius: '14px', padding: '16px', boxShadow: '3px 3px 0 #111', marginBottom: '12px' },
  confirmedCard: { background: '#EEF4FF', border: '2px solid #111', borderRadius: '12px', padding: '14px', marginBottom: '10px' },
  cancelledCard: { background: '#f5f5f5', border: '1.5px solid #ccc', borderRadius: '10px', padding: '12px', marginBottom: '8px', opacity: 0.6 },
  cardName: { fontSize: '16px', fontWeight: 800, color: '#111', marginBottom: '3px' },
  cardSub: { fontSize: '13px', color: '#666', marginBottom: '3px' },
  cardPhone: { fontSize: '12px', color: '#888' },
  btnRow: { display: 'flex', gap: '10px', marginTop: '14px' },
  approveBtn: { flex: 1, background: '#4A7FD4', color: '#fff', border: '2px solid #111', borderRadius: '50px', padding: '12px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '2px 2px 0 #111' },
  denyBtn: { flex: 1, background: '#E03A2F', color: '#fff', border: '2px solid #111', borderRadius: '50px', padding: '12px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '2px 2px 0 #111' },
  cancelBtn: { background: '#fff', color: '#E03A2F', border: '2px solid #E03A2F', borderRadius: '50px', padding: '8px 16px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' },
  emptyText: { color: '#888', fontStyle: 'italic', fontSize: '14px' },
  loginWrap: { minHeight: '100vh', background: '#FFF9F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter,system-ui,sans-serif' },
  loginBox: { maxWidth: '340px', width: '100%', textAlign: 'center' },
  loginInput: { width: '100%', padding: '14px 16px', fontSize: '16px', border: '2.5px solid #111', borderRadius: '12px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', fontFamily: 'inherit' },
  loginBtn: { width: '100%', background: '#E03A2F', color: '#fff', padding: '14px', borderRadius: '50px', fontWeight: 800, fontSize: '15px', border: '2.5px solid #111', boxShadow: '3px 3px 0 #111', cursor: 'pointer' },
  blockForm: { background: '#F5F8FF', border: '2px solid #111', borderRadius: '12px', padding: '16px', marginBottom: '12px' },
  blockInput: { width: '100%', padding: '10px 12px', border: '2px solid #111', borderRadius: '8px', fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box', fontFamily: 'inherit' },
  blockBtn: { background: '#111', color: '#fff', border: '2px solid #111', borderRadius: '50px', padding: '10px 20px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' },
};

function fmt(iso) {
  return new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' });
}

export default function AdminPage() {
  const [token, setToken] = useState(() => { try { return localStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; } });
  const [authed, setAuthed] = useState(false);
  const [authChecking, setAuthChecking] = useState(Boolean(token));
  const [authError, setAuthError] = useState(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setAuthChecking(false); return; }
    let cancelled = false;
    adminFetchConfig(token)
      .then(() => !cancelled && setAuthed(true))
      .catch(() => { if (cancelled) return; localStorage.removeItem(STORAGE_KEY); setToken(''); setAuthError('Session expired.'); })
      .finally(() => !cancelled && setAuthChecking(false));
    return () => { cancelled = true; };
  }, [token]);

  async function handleLogin(e) {
    e.preventDefault();
    if (!loginPassword.trim()) return;
    setLoginSubmitting(true); setAuthError(null);
    try {
      await adminFetchConfig(loginPassword.trim());
      localStorage.setItem(STORAGE_KEY, loginPassword.trim());
      setToken(loginPassword.trim()); setAuthed(true); setLoginPassword('');
    } catch { setAuthError('Incorrect password.'); }
    finally { setLoginSubmitting(false); }
  }

  if (authChecking) return <div style={s.loginWrap}><p style={{color:'#666'}}>Checking session...</p></div>;

  if (!authed) return (
    <div style={s.loginWrap}>
      <div style={s.loginBox}>
        <div style={{fontSize:'28px', fontWeight:900, marginBottom:'4px'}}>
          <span style={{color:'#4A7FD4'}}>Ronny</span><span style={{color:'#E03A2F'}}>Cutz</span>
        </div>
        <p style={{color:'#666', fontSize:'12px', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'28px'}}>Admin</p>
        <form onSubmit={handleLogin}>
          <input type="password" required autoFocus placeholder="Password" value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)} style={s.loginInput} />
          {authError && <p style={{color:'#E03A2F', fontSize:'14px', marginBottom:'10px'}}>{authError}</p>}
          <button type="submit" disabled={loginSubmitting} style={s.loginBtn}>
            {loginSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );

  return <AdminDashboard token={token} onLogout={() => { localStorage.removeItem(STORAGE_KEY); setToken(''); setAuthed(false); }} />;
}

function AdminDashboard({ token, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blockForm, setBlockForm] = useState({ start: '', end: '', reason: '' });
  const [showBlocks, setShowBlocks] = useState(false);

  async function reload() {
    try {
      const [b1, b2] = await Promise.all([adminFetchBookings(token), adminFetchBlocks(token)]);
      setBookings(b1.bookings || []); setBlocks(b2.blocks || []); setError(null);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { reload(); }, []);

  async function handleApprove(id) { await adminApproveBooking(id, token); reload(); }
  async function handleDeny(id) { if (!confirm('Deny this booking?')) return; await adminDenyBooking(id, token); reload(); }
  async function handleCancel(id) { if (!confirm('Cancel this booking?')) return; await adminCancelBooking(id, token); reload(); }
  async function handleBlock(e) {
    e.preventDefault();
    await adminCreateBlock({ start_iso: new Date(blockForm.start).toISOString(), end_iso: new Date(blockForm.end).toISOString(), reason: blockForm.reason }, token);
    setBlockForm({ start: '', end: '', reason: '' }); reload();
  }

  const pending = bookings.filter(b => b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  if (loading) return <div style={s.loginWrap}><p style={{color:'#666'}}>Loading...</p></div>;

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.logo}>
          <span style={{color:'#4A7FD4'}}>Ronny</span><span style={{color:'#E03A2F'}}>Cutz</span>
          <span style={{fontSize:'12px', color:'#666', fontWeight:600, marginLeft:'6px'}}>Admin</span>
        </span>
        <button onClick={onLogout} style={s.signout}>Sign out</button>
      </div>

      <div style={s.inner}>

        {error && <p style={{color:'#E03A2F', padding:'16px 0'}}>{error}</p>}

        {/* PENDING */}
        <div style={s.section}>
          <div style={s.sectionTitle}>
            Pending Approval
            {pending.length > 0 && <span style={s.badge}>{pending.length}</span>}
          </div>
          {pending.length === 0 ? <p style={s.emptyText}>No pending requests.</p> : pending.map(b => (
            <div key={b.id} style={s.pendingCard}>
              <div style={s.cardName}>{b.client_name}</div>
              <div style={s.cardSub}>{b.service_name} - {fmt(b.start_iso)}</div>
              <div style={s.cardPhone}>{b.client_phone} - {b.client_email}</div>
              {b.notes && <div style={{fontSize:'12px', color:'#555', marginTop:'6px'}}>Notes: {b.notes}</div>}
              <div style={s.btnRow}>
                <button onClick={() => handleApprove(b.id)} style={s.approveBtn}>Approve</button>
                <button onClick={() => handleDeny(b.id)} style={s.denyBtn}>Deny</button>
              </div>
            </div>
          ))}
        </div>

        {/* CONFIRMED */}
        <div style={s.section}>
          <div style={s.sectionTitle}>Confirmed ({confirmed.length})</div>
          {confirmed.length === 0 ? <p style={s.emptyText}>None yet.</p> : confirmed.map(b => (
            <div key={b.id} style={s.confirmedCard}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'10px'}}>
                <div>
                  <div style={s.cardName}>{b.client_name}</div>
                  <div style={s.cardSub}>{b.service_name} - {fmt(b.start_iso)}</div>
                  <div style={s.cardPhone}>{b.client_phone}</div>
                </div>
                <button onClick={() => handleCancel(b.id)} style={s.cancelBtn}>Cancel</button>
              </div>
            </div>
          ))}
        </div>

        {/* CANCELLED */}
        {cancelled.length > 0 && (
          <div style={{...s.section, opacity: 0.6}}>
            <div style={s.sectionTitle}>Cancelled ({cancelled.length})</div>
            {cancelled.map(b => (
              <div key={b.id} style={s.cancelledCard}>
                <div style={s.cardName}>{b.client_name}</div>
                <div style={s.cardSub}>{b.service_name} - {fmt(b.start_iso)}</div>
              </div>
            ))}
          </div>
        )}

        {/* BLOCK TIME */}
        <div style={s.section}>
          <div style={{...s.sectionTitle, cursor:'pointer'}} onClick={() => setShowBlocks(!showBlocks)}>
            Block Time Off {showBlocks ? '-' : '+'}
          </div>
          {showBlocks && (
            <>
              <form onSubmit={handleBlock} style={s.blockForm}>
                <label style={{fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:'4px'}}>Start</label>
                <input required type="datetime-local" value={blockForm.start} onChange={e => setBlockForm({...blockForm, start:e.target.value})} style={s.blockInput} />
                <label style={{fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:'4px'}}>End</label>
                <input required type="datetime-local" value={blockForm.end} onChange={e => setBlockForm({...blockForm, end:e.target.value})} style={s.blockInput} />
                <input placeholder="Reason (optional)" value={blockForm.reason} onChange={e => setBlockForm({...blockForm, reason:e.target.value})} style={s.blockInput} />
                <button type="submit" style={s.blockBtn}>Block Time</button>
              </form>
              {blocks.map(b => (
                <div key={b.id} style={{...s.confirmedCard, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{fontSize:'13px', fontWeight:600}}>
                    {new Date(b.start_iso).toLocaleString()} - {new Date(b.end_iso).toLocaleString()}
                    {b.reason && <span style={{color:'#888', marginLeft:'6px'}}>({b.reason})</span>}
                  </div>
                  <button onClick={() => adminDeleteBlock(b.id, token).then(reload)} style={{color:'#E03A2F', background:'none', border:'none', fontWeight:700, fontSize:'13px', cursor:'pointer'}}>Remove</button>
                </div>
              ))}
            </>
          )}
        </div>

      </div>
    </div>
  );
}