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
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
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
      .then((data) => {
        if (!cancel) setSlots(data.slots || []);
      })
      .catch(() => {
        if (!cancel) setSlots([]);
      })
      .finally(() => !cancel && setLoadingSlots(false));
    return () => {
      cancel = true;
    };
  }, [selectedDate, serviceId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Pick a time slot first.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const booking = await createBooking({
        service_id: serviceId,
        start_iso: selectedSlot,
        client_name: form.name,
        client_phone: form.phone,
        client_email: form.email,
        notes: form.notes,
      });
      setResult(booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <section id="book" className="py-24 px-6 bg-charcoal">
        <div className="max-w-xl mx-auto text-center">
          <SectionHeader eyebrow="Confirmed" title="You're Booked" />
          <div className="mt-10 p-8 bg-charcoal-2 border border-brass/40">
            <p className="text-cream/80 mb-2">
              {result.service_name} â{' '}
              {new Date(result.start_iso).toLocaleString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
            <p className="text-text-subtle text-sm mb-6">
              Confirmation email on its way. Save the date to your calendar:
            </p>
            <a
              href={result.ics_url}
              className="inline-block px-6 py-3 bg-brass text-charcoal font-semibold hover:bg-brass-2 transition"
            >
              Add to Calendar (.ics)
            </a>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setForm({ name: '', phone: '', email: '', notes: '' });
                  setSelectedSlot(null);
                }}
                className="text-text-subtle text-sm hover:text-brass transition"
              >
                Book another â
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="book" className="py-24 px-6 bg-charcoal">
      <div className="max-w-4xl mx-auto">
        <SectionHeader eyebrow="Reserve" title="Book Your Cut" />

        <form onSubmit={handleSubmit} className="mt-14 space-y-10">
          <div>
            <Label>1. Choose a service</Label>
            <div className="grid sm:grid-cols-2 gap-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setServiceId(s.id)}
                  className={`p-4 text-left border transition-all ${
                    serviceId === s.id
                      ? 'border-brass bg-charcoal-2 shadow-brass'
                      : 'border-charcoal-3 bg-charcoal-2/50 hover:border-brass/40'
                  }`}
                >
                  <div className="flex justify-between items-baseline">
                    <span className="font-display text-lg text-cream">{s.name}</span>
                    <span className="text-brass">${s.price}</span>
                  </div>
                  <div className="text-text-subtle text-xs uppercase tracking-widest mt-1">
                    {s.duration_min} min
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>2. Pick a day</Label>
            <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 snap-x">
              {days.map((d) => {
                const key = ymd(d);
                const active = key === selectedDate;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(key)}
                    className={`snap-start shrink-0 w-16 py-3 border text-center transition-all ${
                      active
                        ? 'border-brass bg-brass text-charcoal'
                        : 'border-charcoal-3 bg-charcoal-2 text-cream hover:border-brass/40'
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-widest">
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-2xl font-display mt-1">{d.getDate()}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>3. Select a time</Label>
            {loadingSlots ? (
              <p className="text-text-subtle text-sm">Loadingâ¦</p>
            ) : slots.length === 0 ? (
              <p className="text-text-subtle text-sm italic">
                No availability on this day. Try another.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {slots.map((slot) => {
                  const active = slot === selectedSlot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 text-sm border transition-all ${
                        active
                          ? 'border-brass bg-brass text-charcoal font-semibold'
                          : 'border-charcoal-3 bg-charcoal-2 text-cream hover:border-brass/40'
                      }`}
                    >
                      {formatSlotTime(slot)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <Label>4. Your details</Label>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <Input
                required
                type="tel"
                placeholder="Phone"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
              <Input
                required
                type="email"
                placeholder="Email"
                className="sm:col-span-2"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
              <textarea
                placeholder="Notes (optional â specific style, allergies, etc.)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="sm:col-span-2 bg-charcoal-2 border border-charcoal-3 text-cream px-4 py-3 focus:border-brass focus:outline-none placeholder:text-text-subtle"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !selectedSlot}
            className="w-full py-4 bg-brass text-charcoal font-semibold text-lg hover:bg-brass-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting
              ? 'Bookingâ¦'
              : selectedSlot
              ? `Confirm â ${service.name} $${service.price}`
              : 'Choose a time to continue'}
          </button>
        </form>
      </div>
    </section>
  );
}

function Label({ children }) {
  return (
    <label className="block text-brass uppercase tracking-[0.2em] text-xs mb-4">
      {children}
    </label>
  );
}

function Input({ className = '', onChange, ...props }) {
  return (
    <input
      {...props}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-charcoal-2 border border-charcoal-3 text-cream px-4 py-3 focus:border-brass focus:outline-none placeholder:text-text-subtle ${className}`}
    />
  );
}
