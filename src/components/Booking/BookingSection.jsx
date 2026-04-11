import { useState, useEffect, useMemo } from 'react';
import services from '../../data/services.json';
import { fetchAvailability, createBooking } from '../../lib/api.js';
import { SectionHeader } from '../Services.jsx';

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nextDays(count) {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push(d);
  }
  return out;
}

function formatSlotTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function BookingSection() {
  const [serviceId, setServiceId] = useState(services[0].id);
  const [selectedDate, setSelectedDate] = useState(ymd(new Date()));
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const days = useMemo(() => nextDays(30), []);
  const service = services.find((s) => s.id === serviceId);

  useEffect(() => {
    let cancel = false;
    setLoadingSlots(true);
    setSelectedSlot(null);
    fetchAvailability(selectedDate, serviceId)
      .then((data) => { if (!cancel) setSlots(data.slots || []); })
      .catch(() => { if (!cancel) setSlots([]); })
      .finally(() => !cancel && setLoadingSlots(false));
    return () => { cancel = true; };
  }, [selectedDate, serviceId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedSlot) { setError('Pick a time slot first.'); return; }
    setError(null);
    setSubmitting(true);
    try {
      const booking = await createBooking({
        service_id: serviceId, start_iso: selectedSlot,
        client_name: form.name, client_phone: form.phone,
        client_email: form.email, notes: form.notes,
      });
      setResult(booking);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  if (result) {
    return (
      <section id="book" style={{ padding: '44px 28px', background: '#EEF4FF', borderBottom: '3px solid #111' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '8px' }}><span className="section-pill-blue">Confirmed</span></div>
          <h2 style={{ fontSize: '30px', fontWeight: 900, marginBottom: '24px' }}>You're Booked! Ã¢ÂÂ</h2>
          <div style={{ background: '#fff', border: '2.5px solid #111', borderRadius: '14px', padding: '28px', boxShadow: '4px 4px 0 #111', marginBottom: '20px' }}>
            <p style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{result.service_name}</p>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              {new Date(result.start_iso).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </p>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>Request sent! You'll get a confirmation email once Ronny approves.</p>
            <a href={result.ics_url} style={{ display: 'inline-block', background: '#4A7FD4', color: '#fff', padding: '10px 24px', borderRadius: '50px', fontWeight: 800, fontSize: '14px', textDecoration: 'none', border: '2px solid #111', boxShadow: '3px 3px 0 #111' }}>
              Add to Calendar
            </a>
          </div>
          <button type="button" onClick={() => { setResult(null); setForm({ name: '', phone: '', email: '', notes: '' }); setSelectedSlot(null); }}
            style={{ background: 'none', border: 'none', color: '#4A7FD4', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
            Book another Ã¢ÂÂ
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="book" style={{ padding: '44px 28px', background: '#FFF9F0', borderBottom: '3px solid #111' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ marginBottom: '8px' }}><span className="section-pill-red">Reserve</span></div>
        <h2 style={{ fontSize: '30px', fontWeight: 900, marginBottom: '32px' }}>Book Your Cut</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Step 1 - Service */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E03A2F', marginBottom: '12px' }}>1. Choose a service</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {services.map((s) => (
                <button key={s.id} type="button" onClick={() => setServiceId(s.id)}
                  style={{ background: serviceId === s.id ? '#EEF4FF' : '#fff', border: serviceId === s.id ? '2.5px solid #4A7FD4' : '2.5px solid #111', borderRadius: '12px', padding: '16px', textAlign: 'left', cursor: 'pointer', boxShadow: serviceId === s.id ? '3px 3px 0 #4A7FD4' : '3px 3px 0 #111' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800 }}>{s.name}</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#E03A2F' }}>${s.price}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>{s.duration_min} min</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 - Day */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E03A2F', marginBottom: '12px' }}>2. Pick a day</div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
              {days.map((d) => {
                const key = ymd(d);
                const active = key === selectedDate;
                return (
                  <button key={key} type="button" onClick={() => setSelectedDate(key)}
                    style={{ flexShrink: 0, minWidth: '56px', padding: '10px 6px', border: active ? '2.5px solid #4A7FD4' : '2.5px solid #111', borderRadius: '10px', background: active ? '#EEF4FF' : '#fff', cursor: 'pointer', textAlign: 'center', boxShadow: active ? '2px 2px 0 #4A7FD4' : '2px 2px 0 #111' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: active ? '#4A7FD4' : '#666' }}>
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: active ? '#4A7FD4' : '#111' }}>{d.getDate()}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3 - Time */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E03A2F', marginBottom: '12px' }}>3. Select a time</div>
            {loadingSlots ? (
              <p style={{ color: '#888', fontSize: '14px' }}>LoadingÃ¢ÂÂ¦</p>
            ) : slots.length === 0 ? (
              <p style={{ color: '#888', fontSize: '14px', fontStyle: 'italic' }}>No availability on this day - try another.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {slots.map((slot) => {
                  const active = slot === selectedSlot;
                  return (
                    <button key={slot} type="button" onClick={() => setSelectedSlot(slot)}
                      style={{ padding: '10px', border: active ? '2px solid #4A7FD4' : '2px solid #111', borderRadius: '8px', background: active ? '#EEF4FF' : '#fff', fontWeight: 700, fontSize: '13px', color: active ? '#4A7FD4' : '#111', cursor: 'pointer', boxShadow: active ? '2px 2px 0 #4A7FD4' : '2px 2px 0 #111' }}>
                      {formatSlotTime(slot)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 4 - Details */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E03A2F', marginBottom: '12px' }}>4. Your details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input required placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                style={{ padding: '12px 16px', border: '2.5px solid #111', borderRadius: '10px', fontSize: '15px', fontFamily: 'inherit', outline: 'none' }} />
              <input required type="tel" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                style={{ padding: '12px 16px', border: '2.5px solid #111', borderRadius: '10px', fontSize: '15px', fontFamily: 'inherit', outline: 'none' }} />
              <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ padding: '12px 16px', border: '2.5px solid #111', borderRadius: '10px', fontSize: '15px', fontFamily: 'inherit', outline: 'none', gridColumn: 'span 2' }} />
              <textarea placeholder="Notes (optional - style, fade length, etc.)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                style={{ padding: '12px 16px', border: '2.5px solid #111', borderRadius: '10px', fontSize: '15px', fontFamily: 'inherit', outline: 'none', gridColumn: 'span 2', resize: 'vertical' }} />
            </div>
          </div>

          
          <div style={{ background: "#FFF9F0", border: "2.5px solid #111", borderRadius: "12px", padding: "16px 20px", boxShadow: "3px 3px 0 #111" }}>
            <p style={{ fontWeight: 800, fontSize: "13px", color: "#E03A2F", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>ð Booking Policy</p>
            <ul style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li style={{ fontSize: "13px", color: "#444", fontWeight: 600 }}>Please arrive <strong>5â10 minutes early</strong> so we can start right on time.</li>
              <li style={{ fontSize: "13px", color: "#444", fontWeight: 600 }}>If you are <strong>more than 15 minutes late</strong>, your spot may be given to the next client.</li>
              <li style={{ fontSize: "13px", color: "#444", fontWeight: 600 }}>Cancellations require <strong>at least 24 hours notice</strong>. Late cancellations may result in being blocked from future bookings.</li>
            </ul>
          </div>

          {error && <p style={{ color: '#E03A2F', fontSize: '14px', fontWeight: 700 }}>{error}</p>}

          <button type="submit" disabled={submitting || !selectedSlot}
            style={{ width: '100%', padding: '15px', background: submitting || !selectedSlot ? '#ccc' : '#E03A2F', color: '#fff', border: '2.5px solid #111', borderRadius: '50px', fontWeight: 800, fontSize: '16px', cursor: submitting || !selectedSlot ? 'not-allowed' : 'pointer', boxShadow: '4px 4px 0 #111' }}>
            {submitting ? 'Sending requestÃ¢ÂÂ¦' : selectedSlot ? `Request Ã¢ÂÂ ${service.name} $${service.price}` : 'Choose a time to continue'}
          </button>

        </form>
      </div>
    </section>
  );
}