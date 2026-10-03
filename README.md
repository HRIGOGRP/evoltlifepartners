# Partner With EVOLT Life

One-page partnership landing page with lead capture and a built-in discovery-call scheduler.

- **Stack:** Next.js 14 (App Router) · Supabase (Postgres) · Vercel
- **Live:** https://evolt-life-partners.vercel.app
- **QR code target:** https://evolt-life-partners.vercel.app/?src=qr#partner

## How a submission flows
1. Visitor fills First/Last Name, Email, Phone, Company/Organization, Title and picks a 30-min slot (Mon–Fri, 9:00 AM–4:30 PM Central).
2. `POST /api/submit` validates, then calls `golf.submit_partner_inquiry` in Supabase (prevents double-booking).
3. An email with every field is sent to `NOTIFY_EMAIL` (default `10xfsm@gmail.com`).
   - Uses **Resend** if `RESEND_API_KEY` is set in Vercel; otherwise **FormSubmit.co** (needs a one-time "Activate Form" click from the inbox).
4. Visitor sees a confirmation with Google Calendar / .ics links.

## Environment variables (Vercel → Settings → Environment Variables)
| Key | Purpose |
| --- | --- |
| `NOTIFY_EMAIL` | Where submissions are emailed (default 10xfsm@gmail.com) |
| `SITE_URL` | Public URL of the site |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` | Supabase project + publishable key |
| `RESEND_API_KEY` *(optional)* | Switch email delivery to Resend |

## Viewing submissions
Supabase dashboard → Table Editor → schema `golf` → `partner_inquiries`.
