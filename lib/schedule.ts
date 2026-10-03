// Scheduling rules — single source of truth for client + server.
// The database function golf.submit_partner_inquiry enforces the same rules.
export const BUSINESS_TZ = "America/Chicago";
export const TZ_LABEL = "Central Time";
export const SLOT_MINUTES = 30;
export const DAY_START = { h: 9, m: 0 }; // 9:00 AM CT
export const DAY_END = { h: 16, m: 30 }; // last slot starts 4:30 PM CT
export const MIN_LEAD_HOURS = 2;
export const BOOKING_WINDOW_DAYS = 45;

/** Offset (ms) of a time zone from UTC at a given instant. */
function tzOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p: Record<string, number> = {};
  for (const part of dtf.formatToParts(date)) {
    if (part.type !== "literal") p[part.type] = Number(part.value);
  }
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second);
  return asUTC - date.getTime();
}

/** Convert a wall-clock time in BUSINESS_TZ to a UTC Date. */
export function zonedToUtc(y: number, mo: number, d: number, h: number, mi: number): Date {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const off1 = tzOffsetMs(new Date(guess), BUSINESS_TZ);
  let ts = guess - off1;
  const off2 = tzOffsetMs(new Date(ts), BUSINESS_TZ);
  if (off2 !== off1) ts = guess - off2;
  return new Date(ts);
}

export type DayOption = { key: string; y: number; m: number; d: number; weekday: string; monthShort: string; dayNum: number };

/** Upcoming business days (Mon–Fri) in BUSINESS_TZ. */
export function upcomingBusinessDays(count: number, now = new Date()): DayOption[] {
  const out: DayOption[] = [];
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: BUSINESS_TZ, year: "numeric", month: "numeric", day: "numeric" });
  const parts = Object.fromEntries(fmt.formatToParts(now).filter((p) => p.type !== "literal").map((p) => [p.type, Number(p.value)]));
  // Walk calendar days using a UTC-noon anchor so DST never shifts the date.
  let cursor = Date.UTC(parts.year, parts.month - 1, parts.day, 12);
  for (let i = 0; out.length < count && i < BOOKING_WINDOW_DAYS; i++, cursor += 86400000) {
    const dt = new Date(cursor);
    const dow = dt.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate();
    const slots = slotsForDay(y, m, d).filter((s) => isBookable(s, now));
    if (slots.length === 0) continue;
    out.push({
      key: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      y, m, d,
      weekday: dt.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      monthShort: dt.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      dayNum: d,
    });
  }
  return out;
}

export function slotsForDay(y: number, m: number, d: number): Date[] {
  const slots: Date[] = [];
  for (let mins = DAY_START.h * 60 + DAY_START.m; mins <= DAY_END.h * 60 + DAY_END.m; mins += SLOT_MINUTES) {
    slots.push(zonedToUtc(y, m, d, Math.floor(mins / 60), mins % 60));
  }
  return slots;
}

export function isBookable(slot: Date, now = new Date()): boolean {
  return slot.getTime() >= now.getTime() + MIN_LEAD_HOURS * 3600000;
}

export function formatSlot(date: Date, timeZone = BUSINESS_TZ, opts: Intl.DateTimeFormatOptions = {}): string {
  return date.toLocaleString("en-US", { timeZone, hour: "numeric", minute: "2-digit", ...opts });
}

export function formatLong(date: Date, timeZone = BUSINESS_TZ): string {
  return date.toLocaleString("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}
