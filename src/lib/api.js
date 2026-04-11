const BASE = '/api';

export async function fetchAvailability(date, serviceId) {
  const r = await fetch(`${BASE}/availability?date=${date}&service_id=${serviceId}`);
  if (!r.ok) throw new Error('Failed to load availability');
  return r.json();
}

export async function createBooking(payload) {
  const r = await fetch(`${BASE}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Booking failed');
  return data;
}

function adminHeaders(token) {
  return { 'Content-Type': 'application/json', 'x-admin-token': token };
}

export async function adminFetchConfig(token) {
  const r = await fetch(`${BASE}/admin/config`, { headers: adminHeaders(token) });
  if (r.status === 401) throw new Error('Unauthorized');
  if (!r.ok) throw new Error('Request failed');
  return r.json();
}

export async function adminFetchBookings(token) {
  const r = await fetch(`${BASE}/admin/bookings`, { headers: adminHeaders(token) });
  if (!r.ok) throw new Error('Unauthorized');
  return r.json();
}

export async function adminApproveBooking(id, token) {
  const r = await fetch(`${BASE}/admin/bookings/${id}/approve`, { method: 'POST', headers: adminHeaders(token) });
  return r.json();
}

export async function adminDenyBooking(id, token) {
  const r = await fetch(`${BASE}/admin/bookings/${id}/deny`, { method: 'POST', headers: adminHeaders(token) });
  return r.json();
}

export async function adminCancelBooking(id, token) {
  const r = await fetch(`${BASE}/admin/bookings/${id}/cancel`, { method: 'POST', headers: adminHeaders(token) });
  return r.json();
}

export async function adminFetchBlocks(token) {
  const r = await fetch(`${BASE}/admin/blocks`, { headers: adminHeaders(token) });
  if (!r.ok) throw new Error('Unauthorized');
  return r.json();
}

export async function adminCreateBlock(payload, token) {
  const r = await fetch(`${BASE}/admin/blocks`, { method: 'POST', headers: adminHeaders(token), body: JSON.stringify(payload) });
  return r.json();
}

export async function adminDeleteBlock(id, token) {
  const r = await fetch(`${BASE}/admin/blocks/${id}`, { method: 'DELETE', headers: adminHeaders(token) });
  return r.json();
}