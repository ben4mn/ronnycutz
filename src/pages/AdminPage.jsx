import { useEffect, useState } from 'react';
import {
  adminFetchConfig, adminFetchBookings, adminApproveBooking,
  adminDenyBooking, adminCancelBooking, adminFetchBlocks,
  adminCreateBlock, adminDeleteBlock,
} from '../lib/api.js';

const STORAGE_KEY = 'ronnycutz_admin_token';

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

  if (authChecking) return <Wrapper><p style={{color:'#666'}}>Checking session…</p></Wrapper>;

  if (!authed) return (
    <Wrapper>
      <div style={{maxWidth:'380px',margin:'60px auto',textAlign:'center'}}>
        <div style={{fontSize:'32px',fontWeight:900,marginBottom:'4px'}}>
          <span style={{color:'#4A7FD4'}}>Ronny</span><span style={{color:'#E03A2F'}}>Cutz</span>
        </div>
        <p style={{color:'#666',fontSize:'12px',letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:'32px'}}>Admin Access</p>
        <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          <input type="password" required autoFocus placeholder="Password" value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            style={{padding:'14px 16px',fontSize:'16px',border:'2.5px solid #111',borderRadius:'8px',outline:'none'}} />
          {authError && <p style={{color:'#E03A2F',fontSize:'14px'}}>{authError}</p>}
          <button type="submit" disabled={loginSubmitting}
            style={{background:'#E03A2F',color:'#fff',padding:'14px',borderRadius:'50px',fontWeight:800,fontSize:'15px',border:'2.5px solid #111',boxShadow:'3px 3px 0 #111',cursor:'pointer'}}>
            {loginSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </Wrapper>
  );

  return <AdminDashboard token={token} onLogout={() => { localStorage.removeItem(STORAGE_KEY); setToken(''); setAuthed(false); }} />;
}

function AdminDashboard({ token, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [blockForm, setBlockForm] = useState({ start: '', end: '', reason: '' });

  async function reload() {
    try {
      const [cfg, b1, b2] = await Promise.all([adminFetchConfig(token), adminFetchBookings(token), adminFetchBlocks(token)]);
      setConfig(cfg); setBookings(b1.bookings || []); setBlocks(b2.blocks || []); setError(null);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { reload(); }, []);

  async function handleApprove(id) {
    await adminApproveBooking(id, token);
    reload();
  }

  async function handleDeny(id) {
    if (!confirm('Deny this booking? The client will be notified.')) return;
    await adminDenyBooking(id, token);
    reload();
  }

  async function handleCancel(id) {
    if (!confirm('Cancel this booking?')) return;
    await adminCancelBooking(id, token);
    reload();
  }

  async function handleBlock(e) {
    e.preventDefault();
    if (!blockForm.start || !blockForm.end) return;
    await adminCreateBlock({ start_iso: new Date(blockForm.start).toISOString(), end_iso: new Date(blockForm.end).toISOString(), reason: blockForm.reason }, token);
    setBlockForm({ start: '', end: '', reason: '' }); reload();
  }

  const pending = bookings.filter(b => b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  if (loading) return <Wrapper><p style={{color:'#666'}}>Loading…</p></Wrapper>;
  if (error) return <Wrapper><p style={{color:'#E03A2F'}}>Error: {error}</p></Wrapper>;

  return (
    <Wrapper>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
        <div style={{fontSize:'28px',fontWeight:900}}>
          <span style={{color:'#4A7FD4'}}>Ronny</span><span style={{color:'#E03A2F'}}>Cutz</span>
          <span style={{fontSize:'14px',fontWeight:600,color:'#666',marginLeft:'10px'}}>Admin</span>
        </div>
        <button onClick={onLogout} style={{background:'#fff',border:'2px solid #111',borderRadius:'50px',padding:'6px 16px',fontWeight:700,fontSize:'12px',cursor:'pointer'}}>Sign out</button>
      </div>

      {/* PENDING */}
      {pending.length > 0 && (
        <section style={{marginBottom:'40px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
            <h2 style={{fontSize:'22px',fontWeight:900,margin:0}}>Pending Approval</h2>
            <span style={{background:'#E03A2F',color:'#fff',fontWeight:800,fontSize:'12px',padding:'3px 10px',borderRadius:'50px',border:'2px solid #111'}}>{pending.length}</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {pending.map(b => (
              <div key={b.id} style={{background:'#FFF9F0',border:'2.5px solid #111',borderRadius:'12px',padding:'18px',boxShadow:'3px 3px 0 #111',display:'flex',flexDirection:'column',gap:'10px'}}>
                <div>
                  <div style={{fontSize:'17px',fontWeight:800}}>{b.service_name} — {b.client_name}</div>
                  <div style={{fontSize:'13px',color:'#666',marginTop:'3px'}}>
                    {new Date(b.start_iso).toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})} · {b.duration_min}min · ${b.service_price}
                  </div>
                  <div style={{fontSize:'12px',color:'#888',marginTop:'3px'}}>{b.client_phone} · {b.client_email}</div>
                  {b.notes && <div style={{fontSize:'12px',color:'#555',marginTop:'4px'}}>Notes: {b.notes}</div>}
                </div>
                <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
                  <button onClick={() => handleApprove(b.id)}
                    style={{background:'#4A7FD4',color:'#fff',border:'2px solid #111',borderRadius:'50px',padding:'8px 20px',fontWeight:800,fontSize:'13px',cursor:'pointer',boxShadow:'2px 2px 0 #111'}}>
                    ✓ Approve
                  </button>
                  <button onClick={() => handleDeny(b.id)}
                    style={{background:'#E03A2F',color:'#fff',border:'2px solid #111',borderRadius:'50px',padding:'8px 20px',fontWeight:800,fontSize:'13px',cursor:'pointer',boxShadow:'2px 2px 0 #111'}}>
                    ✗ Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CONFIRMED */}
      <section style={{marginBottom:'40px'}}>
        <h2 style={{fontSize:'22px',fontWeight:900,marginBottom:'16px'}}>Confirmed ({confirmed.length})</h2>
        {confirmed.length === 0 ? <p style={{color:'#888',fontStyle:'italic'}}>None yet.</p> : (
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {confirmed.map(b => (
              <div key={b.id} style={{background:'#EEF4FF',border:'2px solid #111',borderRadius:'10px',padding:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
                <div>
                  <div style={{fontWeight:800}}>{b.service_name} — {b.client_name}</div>
                  <div style={{fontSize:'13px',color:'#666'}}>
                    {new Date(b.start_iso).toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})} · ${b.service_price}
                  </div>
                  <div style={{fontSize:'12px',color:'#888'}}>{b.client_phone} · {b.client_email}</div>
                </div>
                <button onClick={() => handleCancel(b.id)}
                  style={{background:'#fff',color:'#E03A2F',border:'2px solid #E03A2F',borderRadius:'50px',padding:'6px 16px',fontWeight:700,fontSize:'12px',cursor:'pointer'}}>
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CANCELLED */}
      {cancelled.length > 0 && (
        <section style={{marginBottom:'40px',opacity:0.5}}>
          <h2 style={{fontSize:'18px',fontWeight:900,marginBottom:'12px'}}>Cancelled ({cancelled.length})</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {cancelled.map(b => (
              <div key={b.id} style={{background:'#f5f5f5',border:'1.5px solid #ccc',borderRadius:'8px',padding:'12px'}}>
                <div style={{fontWeight:700,fontSize:'14px'}}>{b.service_name} — {b.client_name}</div>
                <div style={{fontSize:'12px',color:'#888'}}>
                  {new Date(b.start_iso).toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BLOCK TIME */}
      <section style={{marginBottom:'40px'}}>
        <h2 style={{fontSize:'22px',fontWeight:900,marginBottom:'16px'}}>Block Time Off</h2>
        <form onSubmit={handleBlock} style={{background:'#F5F8FF',border:'2px solid #111',borderRadius:'12px',padding:'20px',display:'flex',flexDirection:'column',gap:'12px',marginBottom:'16px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
            <label style={{display:'flex',flexDirection:'column',gap:'4px',fontSize:'12px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em'}}>
              Start
              <input required type="datetime-local" value={blockForm.start} onChange={e => setBlockForm({...blockForm,start:e.target.value})}
                style={{padding:'8px 12px',border:'2px solid #111',borderRadius:'6px',fontSize:'14px'}} />
            </label>
            <label style={{display:'flex',flexDirection:'column',gap:'4px',fontSize:'12px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em'}}>
              End
              <input required type="datetime-local" value={blockForm.end} onChange={e => setBlockForm({...blockForm,end:e.target.value})}
                style={{padding:'8px 12px',border:'2px solid #111',borderRadius:'6px',fontSize:'14px'}} />
            </label>
          </div>
          <input placeholder="Reason (optional)" value={blockForm.reason} onChange={e => setBlockForm({...blockForm,reason:e.target.value})}
            style={{padding:'8px 12px',border:'2px solid #111',borderRadius:'6px',fontSize:'14px'}} />
          <button type="submit" style={{background:'#111',color:'#fff',border:'2px solid #111',borderRadius:'50px',padding:'10px 24px',fontWeight:800,fontSize:'13px',cursor:'pointer',alignSelf:'flex-start'}}>
            Block Time
          </button>
        </form>
        {blocks.length > 0 && (
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {blocks.map(b => (
              <div key={b.id} style={{background:'#fff',border:'2px solid #111',borderRadius:'8px',padding:'12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{fontSize:'13px',fontWeight:600}}>
                  {new Date(b.start_iso).toLocaleString()} → {new Date(b.end_iso).toLocaleString()}
                  {b.reason && <span style={{color:'#888',marginLeft:'8px'}}>({b.reason})</span>}
                </div>
                <button onClick={() => adminDeleteBlock(b.id, token).then(reload)}
                  style={{color:'#E03A2F',background:'none',border:'none',fontWeight:700,fontSize:'13px',cursor:'pointer'}}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </Wrapper>
  );
}

function Wrapper({ children }) {
  return (
    <div style={{minHeight:'100vh',background:'#FFF9F0',padding:'32px 24px',fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{maxWidth:'720px',margin:'0 auto'}}>{children}</div>
    </div>
  );
}