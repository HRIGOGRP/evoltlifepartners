import { NextResponse } from "next/server";
import { rpc } from "@/lib/supabase";
import { sendNotification } from "@/lib/notify";
import { formatLong, isBookable, slotsForDay, BUSINESS_TZ } from "@/lib/schedule";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const SLOT_ERRORS: Record<string, string> = {
  SLOT_TAKEN: "That time was just booked by someone else. Please choose another time.",
  SLOT_TOO_SOON: "That time is too soon to confirm. Please choose a later time.",
  SLOT_TOO_FAR: "Please choose a time within the next few weeks.",
  SLOT_INVALID: "Please choose one of the available times.",
};

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never fill this hidden field.
  if (clean(body.website, 200)) return NextResponse.json({ ok: true, id: "ok" });

  const firstName = clean(body.firstName, 80);
  const lastName = clean(body.lastName, 80);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 30);
  const company = clean(body.company, 160);
  const title = clean(body.title, 120);
  const appointment = clean(body.appointment, 40);

  const errors: Record<string, string> = {};
  if (!firstName) errors.firstName = "Required";
  if (!lastName) errors.lastName = "Required";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email";
  if (phone.replace(/\D/g, "").length < 7) errors.phone = "Enter a valid phone number";
  if (!company) errors.company = "Required";
  if (!title) errors.title = "Required";

  const when = new Date(appointment);
  if (isNaN(when.getTime())) {
    errors.appointment = "Choose a date and time";
  } else {
    const local = new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TZ, year: "numeric", month: "numeric", day: "numeric" })
      .formatToParts(when)
      .reduce<Record<string, number>>((a, p) => (p.type !== "literal" ? { ...a, [p.type]: Number(p.value) } : a), {});
    const valid = slotsForDay(local.year, local.month, local.day).some((s) => s.getTime() === when.getTime());
    if (!valid || !isBookable(when)) errors.appointment = "Choose one of the available times";
  }
  if (Object.keys(errors).length) return NextResponse.json({ error: "Please review the highlighted fields.", fields: errors }, { status: 422 });

  const { data: id, error } = await rpc<string>("submit_partner_inquiry", {
    p_first_name: firstName,
    p_last_name: lastName,
    p_email: email,
    p_phone: phone,
    p_company: company,
    p_title: title,
    p_appointment_at: when.toISOString(),
    p_source: clean(body.source, 200) || null,
  });

  if (error || !id) {
    const code = Object.keys(SLOT_ERRORS).find((k) => error?.includes(k));
    if (code) return NextResponse.json({ error: SLOT_ERRORS[code], fields: { appointment: SLOT_ERRORS[code] }, slotTaken: code === "SLOT_TAKEN" }, { status: 409 });
    console.error("Supabase insert failed", error);
    return NextResponse.json({ error: "We couldn't save your request. Please try again in a moment." }, { status: 500 });
  }

  const sent = await sendNotification({
    id,
    firstName,
    lastName,
    email,
    phone,
    company,
    title,
    appointmentCentral: formatLong(when),
    appointmentISO: when.toISOString(),
    submittedCentral: formatLong(new Date()),
  });
  if (sent.ok) await rpc("mark_partner_email_sent", { p_id: id });

  return NextResponse.json({
    ok: true,
    id,
    appointment: when.toISOString(),
    appointmentCentral: formatLong(when),
    emailed: sent.ok,
    emailVia: sent.via,
    emailDetail: sent.ok ? undefined : sent.detail,
  });
}
