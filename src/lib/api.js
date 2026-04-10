const BASE = '/api';

export async function fetchAvailability(date, serviceId) {
  const r = await fetch(`${BASE}/availability?date=${date}&service_id=${serviceId}`);
  if (!r.ok) throw new Error('Failed to load availability');
  return r.json();
}

export async function createBooking(payload) {
  const r = await fetch(`${BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Booking failed');
  return data;
}

export async function adminFetchConfig(token) {
  const r = await fetch(`${BASE}/admin/config?token=${encodeURIComponent(token)}`);
  if (!r.ok) throw new Error('Unauthorized');
  return r.json();
}

export async function adminFetchBookings(token) {
  const r = await fetch(`${BASE}/admin/bookings?token=${encodeURIComponent(token)}`);
  if (!r.ok) throw new Error('Unauthorized');
  return r.json();
}

export async function adminCancelBooking(id, token) {
  const r = await fetch(`${BASE}/admin/bookings/${id}/cancel?token=${encodeURIComponent(token)}`, {
    method: 'POST',
  });
  return r.json();
}

export async function adminFetchBlocks(token) {
  const r = await fetch(`${BASE}/admin/blocks?token=${encodeURIComponent(token)}`);
  if (!r.ok) throw new Error('Unauthorized');
  return r.json();
}

export async function adminCreateBlock(payload, token) {
  const r = await fetch(`${BASE}/admin/blocks?token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return r.json();
}

export async function adminDeleteBlock(id, token) {
  const r = await fetch(`${BASE}/admin/blocks/${id}?token=${encodeURIComponent(token)}`, {
    method: 'DELETE',
  });
  return r.json();
}
