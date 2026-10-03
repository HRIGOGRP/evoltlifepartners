"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BUSINESS_TZ,
  TZ_LABEL,
  SLOT_MINUTES,
  formatLong,
  formatSlot,
  isBookable,
  slotsForDay,
  upcomingBusinessDays,
  type DayOption,
} from "@/lib/schedule";

type Fields = { firstName: string; lastName: string; email: string; phone: string; company: string; title: string };
const NOTIFY_EMAIL = "10xfsm@gmail.com";
const EMPTY: Fields = { firstName: "", lastName: "", email: "", phone: "", company: "", title: "" };

const FIELD_META: { key: keyof Fields; label: string; type: string; auto: string; placeholder: string; half?: boolean }[] = [
  { key: "firstName", label: "First Name", type: "text", auto: "given-name", placeholder: "Jordan", half: true },
  { key: "lastName", label: "Last Name", type: "text", auto: "family-name", placeholder: "Ellis", half: true },
  { key: "email", label: "Email Address", type: "email", auto: "email", placeholder: "jordan@company.com", half: true },
  { key: "phone", label: "Phone Number", type: "tel", auto: "tel", placeholder: "(214) 555-0142", half: true },
  { key: "company", label: "Company / Organization", type: "text", auto: "organization", placeholder: "Company or organization", half: true },
  { key: "title", label: "Title", type: "text", auto: "organization-title", placeholder: "e.g. VP, Partnerships", half: true },
];

function formatPhone(v: string) {
  const d = v.replace(/\D/g, "");
  if (v.trim().startsWith("+") || d.length > 10) return v.replace(/[^\d+\s()-]/g, "");
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

function icsStamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function calendarLinks(start: Date, name: string) {
  const end = new Date(start.getTime() + SLOT_MINUTES * 60000);
  const title = "EVOLT Life Partnership Discovery Call";
  const details = `Partnership discovery call with the EVOLT Life team for ${name}. We'll reach out with call details before the meeting.`;
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${icsStamp(start)}/${icsStamp(end)}&details=${encodeURIComponent(details)}`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EVOLT Life//Partners//EN",
    "BEGIN:VEVENT",
    `UID:${icsStamp(start)}-${Math.random().toString(36).slice(2)}@evoltlife`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return { google, icsHref: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` };
}

export default function PartnerForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [days, setDays] = useState<DayOption[]>([]);
  const [dayKey, setDayKey] = useState<string>("");
  const [slot, setSlot] = useState<string>("");
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [formError, setFormError] = useState("");
  const [confirmed, setConfirmed] = useState<{ when: Date; name: string } | null>(null);
  const [visitorTz, setVisitorTz] = useState<string>(BUSINESS_TZ);
  const [website, setWebsite] = useState(""); // honeypot

  const loadBooked = async () => {
    try {
      const r = await fetch("/api/slots", { cache: "no-store" });
      const j = await r.json();
      setBooked(new Set<string>(j.booked || []));
    } catch {
      /* availability still enforced server-side */
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    const d = upcomingBusinessDays(10);
    setDays(d);
    if (d[0]) setDayKey(d[0].key);
    try {
      setVisitorTz(Intl.DateTimeFormat().resolvedOptions().timeZone || BUSINESS_TZ);
    } catch {}
    loadBooked();
  }, []);

  const activeDay = days.find((d) => d.key === dayKey);
  const slots = useMemo(() => (activeDay ? slotsForDay(activeDay.y, activeDay.m, activeDay.d) : []), [activeDay]);
  const showLocal = visitorTz !== BUSINESS_TZ && new Date().toLocaleString("en-US", { timeZone: visitorTz, hour: "numeric" }) !== new Date().toLocaleString("en-US", { timeZone: BUSINESS_TZ, hour: "numeric" });

  const errs: Partial<Record<keyof Fields | "appointment", string>> = {};
  if (!fields.firstName.trim()) errs.firstName = "Please enter your first name";
  if (!fields.lastName.trim()) errs.lastName = "Please enter your last name";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email.trim())) errs.email = "Please enter a valid email";
  if (fields.phone.replace(/\D/g, "").length < 7) errs.phone = "Please enter a valid phone number";
  if (!fields.company.trim()) errs.company = "Please enter your company or organization";
  if (!fields.title.trim()) errs.title = "Please enter your title";
  if (!slot) errs.appointment = "Please choose a meeting time";

  const fieldError = (k: keyof Fields) => (touched[k] ? errs[k] : undefined) || serverErrors[k];

  const set = (k: keyof Fields, v: string) => {
    setFields((f) => ({ ...f, [k]: k === "phone" ? formatPhone(v) : v }));
    if (serverErrors[k]) setServerErrors((s) => ({ ...s, [k]: "" }));
  };

  // Backup delivery: if the server could not hand the email off, send it from the visitor's browser
  // (FormSubmit's native path), then record that it went out. The submission is already saved in Supabase.
  function notifyFromBrowser(id: string, appointmentCentral: string) {
    const f = fields;
    fetch(`https://formsubmit.co/ajax/${NOTIFY_EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `New EVOLT Life Partner: ${f.firstName} ${f.lastName} (${f.company}) \u2014 ${appointmentCentral}`,
        _template: "table",
        _captcha: "false",
        _replyto: f.email,
        "First Name": f.firstName,
        "Last Name": f.lastName,
        "Email Address": f.email,
        "Phone Number": f.phone,
        "Company / Organization": f.company,
        Title: f.title,
        "Appointment (Central Time)": appointmentCentral,
        "Submitted (Central Time)": formatLong(new Date()),
        Reference: id,
      }),
    })
      .then((r) => r.json())
      .then((r) => {
        if (String(r?.success) === "true") fetch("/api/email-sent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      })
      .catch(() => {});
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setTouched({ firstName: true, lastName: true, email: true, phone: true, company: true, title: true });
    if (Object.keys(errs).length) {
      setFormError(errs.appointment && Object.keys(errs).length === 1 ? "Please choose a meeting time." : "Please complete the highlighted fields.");
      const first = document.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    setStatus("submitting");
    try {
      const r = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, appointment: slot, website, source: typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("src") || "landing" : "landing" }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setServerErrors(j.fields || {});
        setFormError(j.error || "Something went wrong. Please try again.");
        if (j.slotTaken) {
          setSlot("");
          loadBooked();
        }
        setStatus("idle");
        return;
      }
      if (!j.emailed && j.id) notifyFromBrowser(j.id, j.appointmentCentral || formatLong(new Date(slot)));
      setConfirmed({ when: new Date(slot), name: `${fields.firstName} ${fields.lastName}`.trim() });
      setStatus("done");
      document.getElementById("partner")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setFormError("Network error. Please check your connection and try again.");
      setStatus("idle");
    }
  }

  if (status === "done" && confirmed) {
    const cal = calendarLinks(confirmed.when, confirmed.name);
    return (
      <div className="confirm" role="status" aria-live="polite">
        <div className="confirm-seal" aria-hidden="true">
          <svg viewBox="0 0 48 48" width="40" height="40"><path d="M14 25l7 7 14-15" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <p className="eyebrow">You&rsquo;re confirmed</p>
        <h3 className="confirm-title">Welcome to the conversation, {fields.firstName}.</h3>
        <p className="confirm-when">{formatLong(confirmed.when)}</p>
        {showLocal && <p className="confirm-local">Your time: {formatLong(confirmed.when, visitorTz)}</p>}
        <p className="confirm-copy">
          Our partnerships team has your details and will reach out to <strong>{fields.email}</strong> before the call with everything you need.
        </p>
        <div className="confirm-actions">
          <a className="btn btn-gold" href={cal.google} target="_blank" rel="noopener noreferrer">Add to Google Calendar</a>
          <a className="btn btn-ghost" href={cal.icsHref} download="evolt-life-discovery-call.ics">Download .ics</a>
        </div>
      </div>
    );
  }

  return (
    <form className="pform" onSubmit={onSubmit} noValidate>
      <div className="pform-step">
        <div className="step-head">
          <span className="step-num">01</span>
          <div>
            <h3>Tell us about you</h3>
            <p>All fields are required.</p>
          </div>
        </div>
        <div className="grid-fields">
          {FIELD_META.map((f) => {
            const err = fieldError(f.key);
            return (
              <label key={f.key} className={`field ${f.half ? "half" : ""} ${err ? "has-error" : ""}`}>
                <span className="field-label">{f.label}</span>
                <input
                  name={f.key}
                  type={f.type}
                  autoComplete={f.auto}
                  inputMode={f.type === "tel" ? "tel" : f.type === "email" ? "email" : undefined}
                  placeholder={f.placeholder}
                  value={fields[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, [f.key]: true }))}
                  aria-invalid={err ? "true" : "false"}
                  aria-describedby={err ? `${f.key}-err` : undefined}
                  required
                  maxLength={f.key === "email" ? 254 : 160}
                />
                {err && <span id={`${f.key}-err`} className="field-error">{err}</span>}
              </label>
            );
          })}
          <label className="hp" aria-hidden="true">
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" />
          </label>
        </div>
      </div>

      <div className="pform-step">
        <div className="step-head">
          <span className="step-num">02</span>
          <div>
            <h3>Book your discovery call</h3>
            <p>{SLOT_MINUTES}-minute call · Monday–Friday · times shown in {TZ_LABEL}</p>
          </div>
        </div>

        <div className="days" role="tablist" aria-label="Choose a date">
          {days.map((d) => (
            <button
              type="button"
              key={d.key}
              role="tab"
              aria-selected={d.key === dayKey}
              className={`day ${d.key === dayKey ? "active" : ""}`}
              onClick={() => {
                setDayKey(d.key);
                setSlot("");
              }}
            >
              <span className="day-wk">{d.weekday}</span>
              <span className="day-num">{d.dayNum}</span>
              <span className="day-mo">{d.monthShort}</span>
            </button>
          ))}
        </div>

        <div className={`slots ${loadingSlots ? "loading" : ""}`} role="radiogroup" aria-label="Choose a time" aria-invalid={serverErrors.appointment || (formError && errs.appointment) ? "true" : "false"}>
          {slots.map((s) => {
            const iso = s.toISOString();
            const taken = booked.has(iso);
            const past = !isBookable(s);
            const disabled = taken || past;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={slot === iso}
                key={iso}
                disabled={disabled}
                className={`slot ${slot === iso ? "active" : ""} ${taken ? "taken" : ""}`}
                onClick={() => {
                  setSlot(iso);
                  setServerErrors((e) => ({ ...e, appointment: "" }));
                }}
                title={taken ? "Already booked" : undefined}
              >
                {formatSlot(s)}
              </button>
            );
          })}
        </div>
        {serverErrors.appointment && <p className="field-error block">{serverErrors.appointment}</p>}

        <div className={`selection ${slot ? "on" : ""}`} aria-live="polite">
          {slot ? (
            <>
              <span className="sel-dot" aria-hidden="true" />
              <span>
                <strong>{formatLong(new Date(slot))}</strong>
                {showLocal && <em> · your time {formatSlot(new Date(slot), visitorTz, { weekday: "short", timeZoneName: "short" })}</em>}
              </span>
            </>
          ) : (
            <span className="muted">Select a date and time above</span>
          )}
        </div>
      </div>

      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

      <button className="btn btn-gold btn-submit" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? (
          <>
            <span className="spinner" aria-hidden="true" /> Confirming…
          </>
        ) : (
          <>Submit &amp; Confirm My Call</>
        )}
      </button>
      <p className="fine">Your information goes only to the EVOLT Life partnerships team. We never sell or share it.</p>
    </form>
  );
}
