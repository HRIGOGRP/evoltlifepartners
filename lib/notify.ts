// Sends each partner submission to the notification inbox.
// Primary path: Resend (if RESEND_API_KEY is set in Vercel).
// Default path: FormSubmit.co (no account needed; one-time activation click by the inbox owner).
export const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "10xfsm@gmail.com";
const SITE_URL = process.env.SITE_URL || "https://evolt-life-partners.vercel.app";

export type Submission = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  appointmentCentral: string;
  appointmentISO: string;
  submittedCentral: string;
};

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function htmlEmail(s: Submission) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:10px 14px;color:#8a8fa8;font:600 12px/1.4 Arial;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid #eee;width:180px">${k}</td><td style="padding:10px 14px;color:#0f1433;font:15px/1.5 Arial;border-bottom:1px solid #eee">${v}</td></tr>`;
  return `<!doctype html><html><body style="margin:0;background:#f4f2ec;padding:24px">
  <table role="presentation" style="max-width:620px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border-collapse:collapse">
    <tr><td style="background:#0f1433;padding:24px 28px;color:#d4af37;font:700 13px Arial;letter-spacing:.2em">EVOLT LIFE · NEW PARTNER INQUIRY</td></tr>
    <tr><td style="padding:24px 28px 8px;font:700 22px Georgia;color:#0f1433">${esc(s.firstName)} ${esc(s.lastName)} — ${esc(s.company)}</td></tr>
    <tr><td style="padding:0 28px 16px;font:15px Arial;color:#444">Discovery call booked for <b>${esc(s.appointmentCentral)}</b></td></tr>
    <tr><td style="padding:0 14px 20px"><table role="presentation" style="width:100%;border-collapse:collapse">
      ${row("First Name", esc(s.firstName))}
      ${row("Last Name", esc(s.lastName))}
      ${row("Email", `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>`)}
      ${row("Phone", `<a href="tel:${esc(s.phone.replace(/[^\d+]/g, ""))}">${esc(s.phone)}</a>`)}
      ${row("Company / Organization", esc(s.company))}
      ${row("Title", esc(s.title))}
      ${row("Appointment", esc(s.appointmentCentral))}
      ${row("Submitted", esc(s.submittedCentral))}
      ${row("Reference", esc(s.id))}
    </table></td></tr>
  </table></body></html>`;
}

export async function sendNotification(s: Submission): Promise<{ ok: boolean; via: string; detail?: string }> {
  const subject = `New EVOLT Life Partner: ${s.firstName} ${s.lastName} (${s.company}) — ${s.appointmentCentral}`;

  if (process.env.RESEND_API_KEY) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "EVOLT Life Partners <onboarding@resend.dev>",
          to: [NOTIFY_EMAIL],
          reply_to: s.email,
          subject,
          html: htmlEmail(s),
        }),
      });
      if (r.ok) return { ok: true, via: "resend" };
      console.error("Resend failed", r.status, await r.text());
    } catch (e) {
      console.error("Resend error", e);
    }
  }

  try {
    const r = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(NOTIFY_EMAIL)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: SITE_URL,
        Referer: `${SITE_URL}/`,
      },
      body: JSON.stringify({
        _subject: subject,
        _template: "table",
        _captcha: "false",
        _replyto: s.email,
        "First Name": s.firstName,
        "Last Name": s.lastName,
        "Email Address": s.email,
        "Phone Number": s.phone,
        "Company / Organization": s.company,
        Title: s.title,
        "Appointment (Central Time)": s.appointmentCentral,
        "Submitted (Central Time)": s.submittedCentral,
        Reference: s.id,
      }),
    });
    const body = await r.text();
    let parsed: { success?: string | boolean; message?: string } = {};
    try {
      parsed = JSON.parse(body);
    } catch {}
    const ok = r.ok && String(parsed.success) === "true";
    if (!ok) console.error("FormSubmit response", r.status, body.slice(0, 500));
    return { ok, via: "formsubmit", detail: parsed.message };
  } catch (e) {
    console.error("FormSubmit error", e);
    return { ok: false, via: "formsubmit", detail: String(e) };
  }
}
