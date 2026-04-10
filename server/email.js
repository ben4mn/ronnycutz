import nodemailer from 'nodemailer';
import { buildSingleEvent } from './ics.js';

let transporter = null;

export function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[email] GMAIL_USER or GMAIL_APP_PASSWORD not set — emails disabled');
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  transporter.verify((err) => {
    if (err) console.error('[email] transporter error:', err.message);
    else console.log('[email] ready to send');
  });
  return transporter;
}

function formatWhen(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  });
}

export async function sendBookingEmails(booking, baseUrl) {
  const t = getTransporter();
  if (!t) return;

  const ics = buildSingleEvent(booking, baseUrl);
  const when = formatWhen(booking.start_iso);
  const cancelUrl = `${baseUrl}/api/bookings/${booking.id}/cancel?token=${booking.cancel_token}`;

  const clientHtml = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0a; color: #f5f0e6; padding: 32px; border-radius: 12px;">
      <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #c9a449; margin: 0 0 16px;">Booking Confirmed</h1>
      <p style="font-size: 16px;">Hey ${booking.client_name}, your appointment with RonnyCutz is locked in.</p>
      <div style="background: #141414; border-left: 3px solid #c9a449; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Service:</strong> ${booking.service_name}</p>
        <p style="margin: 4px 0;"><strong>When:</strong> ${when}</p>
        <p style="margin: 4px 0;"><strong>Price:</strong> $${booking.service_price}</p>
      </div>
      <p>Need to cancel? <a href="${cancelUrl}" style="color: #c9a449;">Click here</a>.</p>
      <p style="color: #8a8278; font-size: 12px; margin-top: 24px;">See you soon. — RonnyCutz</p>
    </div>
  `;

  const ownerHtml = `
    <div style="font-family: Inter, Arial, sans-serif;">
      <h2>New Booking</h2>
      <p><strong>${booking.service_name}</strong> — ${when}</p>
      <p>${booking.client_name} · ${booking.client_phone} · ${booking.client_email}</p>
      ${booking.notes ? `<p>Notes: ${booking.notes}</p>` : ''}
    </div>
  `;

  const attachments = [
    {
      filename: 'appointment.ics',
      content: ics,
      contentType: 'text/calendar; charset=utf-8; method=REQUEST',
    },
  ];

  try {
    await t.sendMail({
      from: process.env.GMAIL_USER,
      to: booking.client_email,
      subject: `Your RonnyCutz appointment — ${when}`,
      html: clientHtml,
      attachments,
    });
    if (process.env.NOTIFY_EMAIL) {
      await t.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.NOTIFY_EMAIL,
        subject: `[RonnyCutz] New booking — ${booking.client_name} @ ${when}`,
        html: ownerHtml,
        attachments,
      });
    }
  } catch (err) {
    console.error('[email] send failed:', err.message);
  }
}
