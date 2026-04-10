import { useEffect, useState } from 'react';
import {
  adminFetchConfig,
  adminFetchBookings,
  adminCancelBooking,
  adminFetchBlocks,
  adminCreateBlock,
  adminDeleteBlock,
} from '../lib/api.js';

const STORAGE_KEY = 'ronnycutz_admin_token';

export default function AdminPage() {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [authed, setAuthed] = useState(false);
  const [authChecking, setAuthChecking] = useState(Boolean(token));
  const [authError, setAuthError] = useState(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setAuthChecking(false);
      return;
    }
    let cancelled = false;
    adminFetchConfig(token)
      .then(() => !cancelled && setAuthed(true))
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem(STORAGE_KEY);
        setToken('');
        setAuthError('Session expired. Please sign in again.');
      })
      .finally(() => !cancelled && setAuthChecking(false));
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleLogin(e) {
    e.preventDefault();
    if (!loginPassword.trim()) return;
    setLoginSubmitting(true);
    setAuthError(null);
    try {
      await adminFetchConfig(loginPassword.trim());
      localStorage.setItem(STORAGE_KEY, loginPassword.trim());
      setToken(loginPassword.trim());
      setAuthed(true);
      setLoginPassword('');
    } catch {
      setAuthError('Incorrect password.');
    } finally {
      setLoginSubmitting(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken('');
    setAuthed(false);
  }

  if (authChecking) {
    return (
      <Wrapper>
        <p className="text-text-subtle">Checking session…</p>
      </Wrapper>
    );
  }

  if (!authed) {
    return (
      <Wrapper>
        <div className="max-w-sm mx-auto mt-20">
          <h1 className="font-display text-4xl text-brass text-center mb-2">RonnyCutz</h1>
          <p className="text-text-subtle text-center text-xs uppercase tracking-[0.3em] mb-10">
            Admin Access
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              required
              autoFocus
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full bg-charcoal-2 border border-charcoal-3 text-cream px-4 py-4 text-lg focus:border-brass focus:outline-none placeholder:text-text-subtle"
            />
            {authError && (
              <p className="text-red-400 text-sm text-center">{authError}</p>
            )}
            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full py-4 bg-brass text-charcoal font-semibold text-lg hover:bg-brass-2 transition disabled:opacity-40"
            >
              {loginSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </Wrapper>
    );
  }

  return <AdminDashboard token={token} onLogout={handleLogout} />;
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
      const [cfg, b1, b2] = await Promise.all([
        adminFetchConfig(token),
        adminFetchBookings(token),
        adminFetchBlocks(token),
      ]);
      setConfig(cfg);
      setBookings(b1.bookings || []);
      setBlocks(b2.blocks || []);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function copyWebcal() {
    if (!config?.calendar_feed_url_webcal) return;
    navigator.clipboard.writeText(config.calendar_feed_url_webcal);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function handleCancel(id) {
    if (!confirm('Cancel this booking?')) return;
    await adminCancelBooking(id, token);
    reload();
  }

  async function handleBlock(e) {
    e.preventDefault();
    if (!blockForm.start || !blockForm.end) return;
    await adminCreateBlock(
      {
        start_iso: new Date(blockForm.start).toISOString(),
        end_iso: new Date(blockForm.end).toISOString(),
        reason: blockForm.reason,
      },
      token
    );
    setBlockForm({ start: '', end: '', reason: '' });
    reload();
  }

  async function handleUnblock(id) {
    await adminDeleteBlock(id, token);
    reload();
  }

  if (loading) return <Wrapper><p className="text-text-subtle">Loading…</p></Wrapper>;
  if (error) return <Wrapper><p className="text-red-400">Error: {error}</p></Wrapper>;

  return (
    <Wrapper>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-brass mb-2">Admin</h1>
          <p className="text-text-subtle text-sm">Manage upcoming bookings and block off time.</p>
        </div>
        <button
          onClick={onLogout}
          className="text-text-subtle hover:text-brass text-xs uppercase tracking-widest border border-charcoal-3 hover:border-brass px-3 py-2 transition"
        >
          Sign out
        </button>
      </div>

      <section className="mb-14">
        <h2 className="font-display text-2xl text-cream mb-4">Apple Calendar Subscription</h2>
        <div className="p-5 bg-charcoal-2 border border-brass/30">
          {config?.feed_configured ? (
            <>
              <p className="text-cream/80 text-sm mb-4">
                Subscribe once on your iPhone or Mac to get every booking automatically.
                New appointments appear within 5 minutes; cancelled ones disappear on next refresh.
              </p>
              <div className="bg-charcoal border border-charcoal-3 p-3 font-mono text-xs text-brass break-all mb-3">
                {config.calendar_feed_url_webcal}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyWebcal}
                  className="px-4 py-2 bg-brass text-charcoal font-semibold text-xs uppercase tracking-widest hover:bg-brass-2"
                >
                  {copied ? 'Copied ✓' : 'Copy URL'}
                </button>
                <a
                  href={config.calendar_feed_url_webcal}
                  className="px-4 py-2 border border-brass text-brass text-xs uppercase tracking-widest hover:bg-brass hover:text-charcoal transition"
                >
                  Open in Calendar.app
                </a>
                <a
                  href={config.calendar_feed_url_https}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-charcoal-3 text-text-subtle text-xs uppercase tracking-widest hover:border-brass hover:text-brass"
                >
                  Raw .ics
                </a>
              </div>
              <details className="mt-4 text-text-subtle text-xs">
                <summary className="cursor-pointer hover:text-brass">How to subscribe</summary>
                <div className="mt-3 space-y-2 leading-relaxed">
                  <p><strong className="text-cream">iPhone:</strong> Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar → paste the URL (strip the <code>webcal://</code> prefix).</p>
                  <p><strong className="text-cream">Mac:</strong> Click "Open in Calendar.app" above, or open Calendar → File → New Calendar Subscription → paste URL.</p>
                  <p>Set auto-refresh to 5 minutes for the freshest view.</p>
                </div>
              </details>
            </>
          ) : (
            <p className="text-red-400 text-sm">
              CALENDAR_FEED_TOKEN is not set in the server environment — the feed is disabled.
            </p>
          )}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="font-display text-2xl text-cream mb-4">
          Upcoming Bookings ({bookings.filter((b) => b.status === 'confirmed').length})
        </h2>
        {bookings.length === 0 ? (
          <p className="text-text-subtle italic">None yet.</p>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <div
                key={b.id}
                className={`p-4 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                  b.status === 'cancelled'
                    ? 'border-charcoal-3 opacity-40'
                    : 'border-brass/30 bg-charcoal-2'
                }`}
              >
                <div>
                  <div className="font-display text-lg text-cream">
                    {b.service_name} — {b.client_name}
                  </div>
                  <div className="text-text-subtle text-sm">
                    {new Date(b.start_iso).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}{' '}
                    · {b.duration_min}min · ${b.service_price}
                  </div>
                  <div className="text-text-subtle text-xs mt-1">
                    {b.client_phone} · {b.client_email}
                  </div>
                  {b.notes && <div className="text-cream/70 text-xs mt-1">Notes: {b.notes}</div>}
                </div>
                {b.status === 'confirmed' && (
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="shrink-0 px-4 py-2 border border-red-900/60 text-red-400 text-xs uppercase tracking-widest hover:bg-red-900/20"
                  >
                    Cancel
                  </button>
                )}
                {b.status === 'cancelled' && (
                  <span className="text-xs uppercase tracking-widest text-text-subtle">Cancelled</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl text-cream mb-4">Blocked Time ({blocks.length})</h2>

        <form onSubmit={handleBlock} className="p-4 bg-charcoal-2 border border-charcoal-3 mb-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-text-subtle text-xs uppercase tracking-widest">Start</span>
              <input
                required
                type="datetime-local"
                value={blockForm.start}
                onChange={(e) => setBlockForm({ ...blockForm, start: e.target.value })}
                className="mt-1 w-full bg-charcoal border border-charcoal-3 text-cream px-3 py-2 focus:border-brass focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-text-subtle text-xs uppercase tracking-widest">End</span>
              <input
                required
                type="datetime-local"
                value={blockForm.end}
                onChange={(e) => setBlockForm({ ...blockForm, end: e.target.value })}
                className="mt-1 w-full bg-charcoal border border-charcoal-3 text-cream px-3 py-2 focus:border-brass focus:outline-none"
              />
            </label>
          </div>
          <input
            placeholder="Reason (optional)"
            value={blockForm.reason}
            onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
            className="w-full bg-charcoal border border-charcoal-3 text-cream px-3 py-2 focus:border-brass focus:outline-none"
          />
          <button type="submit" className="px-5 py-2 bg-brass text-charcoal font-semibold text-sm uppercase tracking-widest hover:bg-brass-2">
            Block Time
          </button>
        </form>

        {blocks.length === 0 ? (
          <p className="text-text-subtle italic">None.</p>
        ) : (
          <div className="space-y-2">
            {blocks.map((b) => (
              <div key={b.id} className="p-3 bg-charcoal-2 border border-charcoal-3 flex justify-between items-center">
                <div className="text-cream text-sm">
                  {new Date(b.start_iso).toLocaleString()} → {new Date(b.end_iso).toLocaleString()}
                  {b.reason && <span className="text-text-subtle ml-2">({b.reason})</span>}
                </div>
                <button
                  onClick={() => handleUnblock(b.id)}
                  className="text-red-400 text-xs uppercase tracking-widest hover:underline"
                >
                  Remove
                </button>
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
    <div className="min-h-screen bg-charcoal text-cream px-6 py-16">
      <div className="max-w-4xl mx-auto">{children}</div>
    </div>
  );
}
