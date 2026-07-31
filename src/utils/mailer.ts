import nodemailer, { Transporter } from 'nodemailer';

/**
 * Lead-notification mailer.
 *
 * Sends an email whenever a new contact-form lead arrives, so nothing is missed.
 * It is deliberately fail-safe: if SMTP isn't configured or sending fails, it logs
 * and returns false — the caller has already persisted the lead to the database,
 * so a mail problem never loses a lead or breaks the request.
 *
 * Configure via env:
 *   SMTP_HOST      e.g. mail.sanket-jagtap.in
 *   SMTP_PORT      465 (SSL) or 587 (STARTTLS)   [default 465]
 *   SMTP_SECURE    "true" | "false"              [default: true when port 465]
 *   SMTP_USER      e.g. contact@sanket-jagtap.in
 *   SMTP_PASS      the mailbox password
 *   SMTP_FROM      from address                  [default: SMTP_USER]
 *   LEAD_NOTIFY_TO where notifications go        [default: SMTP_USER]
 */

let transporter: Transporter | null = null;
let warnedMissing = false;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    if (!warnedMissing) {
      console.warn(
        '[mailer] SMTP not fully configured (need SMTP_HOST, SMTP_USER, SMTP_PASS). ' +
        'Lead emails are disabled — leads are still saved to the database and visible in the admin panel.'
      );
      warnedMissing = true;
    }
    return null;
  }

  if (!transporter) {
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const secure = process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === 'true'
      : port === 465;
    transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  }
  return transporter;
}

export interface Lead {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}

export async function sendLeadNotification(lead: Lead): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;

  const to = process.env.LEAD_NOTIFY_TO || process.env.SMTP_USER!;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const subjectLine = `New lead: ${lead.name}${lead.subject ? ' — ' + lead.subject : ''}`;

  const text =
    `New enquiry from your portfolio contact form.\n\n` +
    `Name:    ${lead.name}\n` +
    `Email:   ${lead.email}\n` +
    `Subject: ${lead.subject || '—'}\n` +
    `Time:    ${when}\n\n` +
    `Message:\n${lead.message}\n\n` +
    `Reply to this email to respond directly to ${lead.name}.`;

  const esc = (s: string) => String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string));
  const html =
    `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:560px;margin:auto;color:#111">` +
    `<h2 style="margin:0 0 4px">New lead 🎯</h2>` +
    `<p style="color:#666;margin:0 0 16px">From your portfolio contact form · ${esc(when)}</p>` +
    `<table style="width:100%;border-collapse:collapse;font-size:14px">` +
    `<tr><td style="padding:6px 0;color:#666;width:80px">Name</td><td style="padding:6px 0"><strong>${esc(lead.name)}</strong></td></tr>` +
    `<tr><td style="padding:6px 0;color:#666">Email</td><td style="padding:6px 0"><a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a></td></tr>` +
    `<tr><td style="padding:6px 0;color:#666">Subject</td><td style="padding:6px 0">${esc(lead.subject || '—')}</td></tr>` +
    `</table>` +
    `<div style="margin-top:16px;padding:16px;background:#f6f6f6;border-radius:8px;white-space:pre-wrap;font-size:14px">${esc(lead.message)}</div>` +
    `<p style="color:#666;font-size:13px;margin-top:16px">Just hit reply to respond directly to ${esc(lead.name)}.</p>` +
    `</div>`;

  try {
    await t.sendMail({
      from: `"Portfolio Leads" <${from}>`,
      to,
      replyTo: `"${lead.name}" <${lead.email}>`,
      subject: subjectLine,
      text,
      html,
    });
    console.log('[mailer] lead notification sent to', to);
    return true;
  } catch (err) {
    console.error('[mailer] failed to send lead notification:', (err as Error).message);
    return false;
  }
}
