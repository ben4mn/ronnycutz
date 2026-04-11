import nodemailer from 'nodemailer';
import { buildSingleEvent } from './ics.js';

let transporter = null;

export function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[email] GMAIL_USER or GMAIL_APP_PASSWORD not set Ã¢ÂÂ emails disabled');
    return null;
  }
  transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
  transporter.verify((err) => {
    if (err) console.error('[email] transporter error:', err.message);
    else console.log('[email] ready to send');
  });
  return transporter;
}

function formatWhen(iso) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago',
  });
}

function baseStyle() {
  return 'font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#FFF9F0;padding:32px;border-radius:12px;border:3px solid #111';
}

export async function sendBookingEmails(booking, baseUrl) {
  const t = getTransporter();
  if (!t) return;
  const when = formatWhen(booking.start_iso);
  const adminUrl = baseUrl + '/admin';

  const clientHtml = `
    <div style="${baseStyle()}">
      <h1 style="color:#4A7FD4;margin:0 0 16px;font-size:28px;font-weight:900;">RonnyCutz Ã¢ÂÂ</h1>
      <p style="font-size:16px;">Hey ${booking.client_name}, your request is in! Aaron will confirm your appointment shortly.</p>
      <div style="background:#fff;border-left:4px solid #E03A2F;padding:16px 20px;margin:20px 0;border-radius:4px;border:2px solid #111;">
        <p style="margin:4px 0;"><strong>Service:</strong> ${booking.service_name}</p>
        <p style="margin:4px 0;"><strong>When:</strong> ${when}</p>
        <p style="margin:4px 0;"><strong>Price:</strong> $${booking.service_price}</p>
      </div>
      <p style="color:#666;font-size:14px;">You'll get another email once it's confirmed. Ã¢ÂÂ RonnyCutz</p>
    </div>`;

  const ownerHtml = `
    <div style="${baseStyle()}">
      <h1 style="color:#E03A2F;margin:0 0 8px;font-size:28px;font-weight:900;">New Booking Request</h1>
      <div style="background:#fff;border:2px solid #111;padding:16px 20px;margin:20px 0;border-radius:8px;">
        <p style="margin:4px 0;font-size:16px;font-weight:800;">${booking.service_name} Ã¢ÂÂ ${when}</p>
        <p style="margin:8px 0 4px 0;"><strong>Name:</strong> ${booking.client_name}</p>
        <p style="margin:4px 0;"><strong>Phone:</strong> ${booking.client_phone}</p>
        <p style="margin:4px 0;"><strong>Email:</strong> ${booking.client_email}</p>
        ${booking.notes ? '<p style="margin:4px 0;"><strong>Notes:</strong> ' + booking.notes + '</p>' : ''}
      </div>
      <a href="${adminUrl}" style="display:inline-block;background:#4A7FD4;color:#fff;padding:12px 28px;border-radius:50px;font-weight:800;font-size:15px;text-decoration:none;border:2.5px solid #111;box-shadow:3px 3px 0 #111;">
        Open Admin Page Ã¢ÂÂ
      </a>
    </div>`;

  try {
    await t.sendMail({ from: process.env.GMAIL_USER, to: booking.client_email, subject: 'RonnyCutz Ã¢ÂÂ Booking Request Received', html: clientHtml });
    const notifyEmail = process.env.NOTIFY_EMAIL || 'aaron.moreno1024@gmail.com';
    if (notifyEmail) {
      await t.sendMail({ from: process.env.GMAIL_USER, to: notifyEmail, subject: '[RonnyCutz] New booking Ã¢ÂÂ ' + booking.client_name + ' @ ' + when, html: ownerHtml });
    }
  } catch (err) { console.error('[email] send failed:', err.message); }
}

export async function sendApprovalEmail(booking, baseUrl) {
  const t = getTransporter();
  if (!t) return;
  const when = formatWhen(booking.start_iso);
  const ics = buildSingleEvent(booking, baseUrl);
  const cancelUrl = baseUrl + '/api/bookings/' + booking.id + '/cancel?token=' + booking.cancel_token;

  const html = `
    <div style="${baseStyle()}">
      <h1 style="color:#4A7FD4;margin:0 0 16px;font-size:28px;font-weight:900;">You're Confirmed! Ã¢ÂÂ</h1>
      <p style="font-size:16px;">Hey ${booking.client_name}, Aaron confirmed your appointment. See you soon!</p>
      <div style="background:#fff;border-left:4px solid #4A7FD4;padding:16px 20px;margin:20px 0;border-radius:4px;border:2px solid #111;">
        <p style="margin:4px 0;"><strong>Service:</strong> ${booking.service_name}</p>
        <p style="margin:4px 0;"><strong>When:</strong> ${when}</p>
        <p style="margin:4px 0;"><strong>Price:</strong> $${booking.service_price}</p>
        <p style="margin:4px 0;"><strong>Address:</strong> 6522 84th Street, Lubbock, TX</p>
      </div>
      <div style="background:#EEF4FF;border:2px solid #4A7FD4;border-radius:8px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;font-size:15px;font-weight:800;color:#111;">Ã°ÂÂÂ When you arrive:</p>
        <p style="margin:8px 0 0 0;font-size:15px;color:#111;">Text <strong>(915) 408-6981</strong> to let Aaron know you are outside and he'll come right out!</p>
      </div>
      <p style="font-size:14px;">Need to cancel? <a href="${cancelUrl}" style="color:#E03A2F;">Click here</a>.</p>
      <p style="color:#666;font-size:12px;margin-top:24px;">Ã¢ÂÂ RonnyCutz ÃÂ· 6522 84th St, Lubbock TX</p>
    </div>`;

  await t.sendMail({
    from: process.env.GMAIL_USER,
    to: booking.client_email,
    subject: 'RonnyCutz Ã¢ÂÂ Appointment Confirmed! ' + when,
    html,
    attachments: [{ filename: 'appointment.ics', content: ics, contentType: 'text/calendar; charset=utf-8; method=REQUEST' }],
  });
}

export async function sendDenialEmail(booking, baseUrl) {
  const t = getTransporter();
  if (!t) return;
  const when = formatWhen(booking.start_iso);

  const html = `
    <div style="${baseStyle()}">
      <h1 style="color:#E03A2F;margin:0 0 16px;font-size:28px;font-weight:900;">Booking Update</h1>
      <p style="font-size:16px;">Hey ${booking.client_name}, unfortunately Aaron is not available for your requested time.</p>
      <div style="background:#fff;border-left:4px solid #E03A2F;padding:16px 20px;margin:20px 0;border-radius:4px;border:2px solid #111;">
        <p style="margin:4px 0;"><strong>Service:</strong> ${booking.service_name}</p>
        <p style="margin:4px 0;"><strong>Requested:</strong> ${when}</p>
      </div>
      <a href="${baseUrl}/#book" style="display:inline-block;background:#E03A2F;color:#fff;padding:12px 28px;border-radius:50px;font-weight:800;font-size:14px;text-decoration:none;border:2.5px solid #111;box-shadow:3px 3px 0 #111;margin-top:8px;">
        Book Again Ã¢ÂÂ
      </a>
      <p style="color:#666;font-size:12px;margin-top:24px;">Ã¢ÂÂ RonnyCutz ÃÂ· 6522 84th St, Lubbock TX</p>
    </div>`;

  await t.sendMail({ from: process.env.GMAIL_USER, to: booking.client_email, subject: 'RonnyCutz Ã¢ÂÂ Booking Update', html });
}