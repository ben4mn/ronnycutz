import { useEffect, useState } from 'react';
import {
  adminFetchConfig, adminFetchBookings, adminApproveBooking,
  adminDenyBooking, adminCancelBooking, adminFetchBlocks,
  adminCreateBlock, adminDeleteBlock,
} from '../lib/api.js';

const STORAGE_KEY = 'ronnycutz_admin_token';

const s = {
  wrap: { minHeight: '100vh', background: '#FFF9F0', fontFamily: 'Inter,system-ui,sans-serif', paddingBottom: '80px' },
  inner: { maxWidth: '680px', margin: '0 auto', padding: '0 16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#fff', borderBottom: '3px solid #111', position: 'sticky', top: 0, zIndex: 10 },
  logo: { fontSize: '20px', fontWeight: 900 },
  signout: { background: '#fff', border: '2px solid #111', borderRadius: '50px', padding: '6px 14px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' },
  section: { marginBottom: '28px', paddingTop: '20px' },
  sectionTitle: { fontSize: '17px', fontWeight: 900, marginBottom: '12px', color: '#111', display: 'flex', alignItems: 'center', gap: '8px' },
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

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' });
}

function fmtDay(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'America/Chicago' });
}

function WeekCalendar({ bookings }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const startOfWeek = new Date(today);
  const dow = today.getDay();
  startOfWeek.setDate(today.getDate() - dow + weekOffset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const workDays = days.filter(d => d.getDay() >= 1 && d.getDay() <= 4);

  const weekStart = new Date(startOfWeek);
  const weekEnd = new Date(startOfWeek);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekBookings = bookings.filter(b => {
    const bt = new Date(b.start_iso);
    return bt >= weekStart && bt < weekEnd && (b.status === 'confirmed' || b.status === 'pending');
  });

  const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' - ' + new Date(weekEnd.getTime() - 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div style={{ background: '#fff', border: '2.5px solid #111', borderRadius: '14px', overflow: 'hidden', boxShadow: '3px 3px 0 #111', marginBottom: '24px' }}>
      <div style={{ background: '#111', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setWeekOffset(w => w - 1)}
          style={{ background: 'none', border: '2px solid #fff', borderRadius: '50px', color: '#fff', padding: '4px 12px', fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}>
          &lt;
        </button>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: '14px' }}>{weekLabel}</span>
        <button onClick={() => setWeekOffset(w => w + 1)}
          style={{ background: 'none', border: '2px solid #fff', borderRadius: '50px', color: '#fff', padding: '4px 12px', fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}>
          &gt;
        </button>
      </div>

      <div style={{ padding: '12px' }}>
        {workDays.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>No work days this week</p>
        ) : (
          workDays.map(day => {
            const dayBookings = weekBookings.filter(b => {
              const bd = new Date(b.start_iso).toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
              const dd = day.toLocaleDateString('en-CA');
              return bd === dd;
            });
            const isToday = day.toDateString() === today.toDateString();

            return (
              <div key={day.toISOString()} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: isToday ? '#E03A2F' : '#111' }}>
                    {day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    {isToday && <span style={{ marginLeft: '6px', background: '#E03A2F', color: '#fff', fontSize: '10px', padding: '1px 7px', borderRadius: '50px', fontWeight: 800 }}>TODAY</span>}
                  </div>
                  <div style={{ flex: 1, height: '1px', background: '#eee' }} />
                  <span style={{ fontSize: '11px', color: '#888', fontWeight: 700 }}>{dayBookings.length} cut{dayBookings.length !== 1 ? 's' : ''}</span>
                </div>

                {dayBookings.length === 0 ? (
                  <div style={{ padding: '10px 12px', background: '#f9f9f9', borderRadius: '8px', fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>
                    No bookings
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {dayBookings.sort((a, b) => new Date(a.start_iso) - new Date(b.start_iso)).map(b => (
                      <div key={b.id} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: b.status === 'pending' ? '#FFF9F0' : '#EEF4FF',
                        border: b.status === 'pending' ? '2px solid #E03A2F' : '2px solid #4A7FD4',
                        borderRadius: '10px', padding: '10px 12px'
                      }}>
                        <div style={{ background: b.status === 'pending' ? '#E03A2F' : '#4A7FD4', color: '#fff', borderRadius: '8px', padding: '6px 10px', fontWeight: 900, fontSize: '13px', whiteSpace: 'nowrap', minWidth: '70px', textAlign: 'center' }}>
                          {fmtTime(b.start_iso)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '14px', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.client_name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{b.service_name} - {b.duration_min}min</div>
                        </div>
                        {b.status === 'pending' && (
                          <span style={{ background: '#E03A2F', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '50px', whiteSpace: 'nowrap' }}>PENDING</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
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

  if (authChecking) return <div style={s.loginWrap}><p style={{ color: '#666' }}>Checking session...</p></div>;

  if (!authed) return (
    <div style={s.loginWrap}>
      <div style={s.loginBox}>
        <div style={{ fontSize: '28px', fontWeight: 900, marginBottom: '4px' }}>
          <span style={{ color: '#4A7FD4' }}>Ronny</span><span style={{ color: '#E03A2F' }}>Cutz</span>
        </div>
        <p style={{ color: '#666', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '28px' }}>Admin</p>
        <form onSubmit={handleLogin}>
          <input type="password" required autoFocus placeholder="Password" value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)} style={s.loginInput} />
          {authError && <p style={{ color: '#E03A2F', fontSize: '14px', marginBottom: '10px' }}>{authError}</p>}
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
  const [activeTab, setActiveTab] = useState('calendar');

  async function reload() {
    try {
      const [b1, b2] = await Promise.all([adminFetchBookings(token), adminFetchBlocks(token)]);
      setBookings(b1.bookings || []); setBlocks(b2.blocks || []); setError(null);
    } catch (e) { setError(e.message); }
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

  if (loading) return <div style={s.loginWrap}><p style={{ color: '#666' }}>Loading...</p></div>;

  const tabStyle = (name) => ({
    flex: 1, padding: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', textAlign: 'center',
    background: activeTab === name ? '#111' : '#fff',
    color: activeTab === name ? '#fff' : '#111',
    border: 'none', borderBottom: activeTab === name ? 'none' : '2px solid #111',
    transition: 'all 0.15s'
  });

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.logo}>
          <span style={{ color: '#4A7FD4' }}>Ronny</span><span style={{ color: '#E03A2F' }}>Cutz</span>
          <span style={{ fontSize: '12px', color: '#666', fontWeight: 600, marginLeft: '6px' }}>Admin</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {pending.length > 0 && <span style={{ background: '#E03A2F', color: '#fff', fontWeight: 800, fontSize: '11px', padding: '3px 8px', borderRadius: '50px', border: '1.5px solid #111' }}>{pending.length} pending</span>}
          <button onClick={onLogout} style={s.signout}>Sign out</button>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '2px solid #111', background: '#fff', position: 'sticky', top: '57px', zIndex: 9 }}>
        <button style={tabStyle('calendar')} onClick={() => setActiveTab('calendar')}>Calendar</button>
        <button style={tabStyle('requests')} onClick={() => setActiveTab('requests')}>
          Requests {pending.length > 0 ? '(' + pending.length + ')' : ''}
        </button>
        <button style={tabStyle('all')} onClick={() => setActiveTab('all')}>All Bookings</button>
        <button style={tabStyle('settings')} onClick={() => setActiveTab('settings')}>Settings</button>
      </div>

      <div style={s.inner}>

        {error && <p style={{ color: '#E03A2F', padding: '16px 0' }}>{error}</p>}

        {activeTab === 'calendar' && (
          <div style={s.section}>
            <WeekCalendar bookings={bookings} />
            <p style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#E03A2F', borderRadius: '2px', marginRight: '4px' }}></span>Pending
              <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#4A7FD4', borderRadius: '2px', marginRight: '4px', marginLeft: '12px' }}></span>Confirmed
            </p>
          </div>
        )}

        {activeTab === 'requests' && (
          <div style={s.section}>
            <div style={s.sectionTitle}>
              Pending Approval
              {pending.length > 0 && <span style={s.badge}>{pending.length}</span>}
            </div>
            {pending.length === 0 ? <p style={s.emptyText}>No pending requests.</p> : pending.map(b => (
              <div key={b.id} style={s.pendingCard}>
                <div style={s.cardName}>
                  {b.client_name}
                  {b.after_hours ? <span style={{ marginLeft: '8px', background: '#FAEEDA', color: '#633806', border: '1.5px solid #EF9F27', fontWeight: 800, fontSize: '11px', padding: '2px 8px', borderRadius: '50px' }}>After-hours +$30</span> : null}
                </div>
                <div style={s.cardSub}>{b.service_name} - {fmt(b.start_iso)} - ${b.service_price}</div>
                <div style={s.cardPhone}>{b.client_phone} - {b.client_email}</div>
                {b.notes && <div style={{ fontSize: '12px', color: '#555', marginTop: '6px' }}>Notes: {b.notes}</div>}
                <div style={s.btnRow}>
                  <button onClick={() => handleApprove(b.id)} style={s.approveBtn}>Approve</button>
                  <button onClick={() => handleDeny(b.id)} style={s.denyBtn}>Deny</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'all' && (
          <div style={s.section}>
            <div style={s.sectionTitle}>Confirmed ({confirmed.length})</div>
            {confirmed.length === 0 ? <p style={s.emptyText}>None yet.</p> : confirmed.map(b => (
              <div key={b.id} style={s.confirmedCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <div style={s.cardName}>{b.client_name}</div>
                    <div style={s.cardSub}>{b.service_name} - {fmt(b.start_iso)}</div>
                    <div style={s.cardPhone}>{b.client_phone}</div>
                  </div>
                  <button onClick={() => handleCancel(b.id)} style={s.cancelBtn}>Cancel</button>
                </div>
              </div>
            ))}
            {cancelled.length > 0 && (
              <>
                <div style={{ ...s.sectionTitle, marginTop: '20px', opacity: 0.6 }}>Cancelled ({cancelled.length})</div>
                {cancelled.map(b => (
                  <div key={b.id} style={s.cancelledCard}>
                    <div style={s.cardName}>{b.client_name}</div>
                    <div style={s.cardSub}>{b.service_name} - {fmt(b.start_iso)}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={s.section}>
            <div style={s.sectionTitle}>Block Time Off</div>
            <form onSubmit={handleBlock} style={s.blockForm}>
              <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Start</label>
              <input required type="datetime-local" value={blockForm.start} onChange={e => setBlockForm({ ...blockForm, start: e.target.value })} style={s.blockInput} />
              <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>End</label>
              <input required type="datetime-local" value={blockForm.end} onChange={e => setBlockForm({ ...blockForm, end: e.target.value })} style={s.blockInput} />
              <input placeholder="Reason (optional)" value={blockForm.reason} onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })} style={s.blockInput} />
              <button type="submit" style={s.blockBtn}>Block Time</button>
            </form>
            {blocks.length > 0 && blocks.map(b => (
              <div key={b.id} style={{ ...s.confirmedCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>
                  {new Date(b.start_iso).toLocaleString()} - {new Date(b.end_iso).toLocaleString()}
                  {b.reason && <span style={{ color: '#888', marginLeft: '6px' }}>({b.reason})</span>}
                </div>
                <button onClick={() => adminDeleteBlock(b.id, token).then(reload)} style={{ color: '#E03A2F', background: 'none', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Remove</button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}