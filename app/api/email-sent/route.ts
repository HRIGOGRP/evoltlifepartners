import { NextResponse } from "next/server";
import { rpc } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Marks a just-created submission as emailed (only works within 10 minutes of creation).
export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ ok: false }, { status: 400 });
    await rpc("mark_partner_email_sent", { p_id: id });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
