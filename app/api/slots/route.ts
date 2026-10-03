import { NextResponse } from "next/server";
import { rpc } from "@/lib/supabase";
import { BOOKING_WINDOW_DAYS } from "@/lib/schedule";

export const dynamic = "force-dynamic";

// Returns only the start times of already-booked slots — no personal data.
export async function GET() {
  const from = new Date();
  const to = new Date(from.getTime() + (BOOKING_WINDOW_DAYS + 2) * 86400000);
  const { data, error } = await rpc<string[]>("partner_booked_slots", {
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  });
  if (error) return NextResponse.json({ booked: [], degraded: true }, { status: 200 });
  const booked = (data || []).map((t) => new Date(t).toISOString());
  return NextResponse.json({ booked }, { headers: { "Cache-Control": "no-store" } });
}
