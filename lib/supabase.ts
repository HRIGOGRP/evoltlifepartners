// Minimal server-side Supabase RPC client (PostgREST) — no SDK needed.
// Access is limited to three SECURITY DEFINER functions in the `golf` schema;
// the partner_inquiries table itself has RLS on with no public policies.
const SUPABASE_URL = process.env.SUPABASE_URL || "https://eddximawayqmnupayhaj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_ckn9Af9BTLe7Ku4oLYaXMg_3hM6FzJq";

export async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Content-Profile": "golf",
      "Accept-Profile": "golf",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg = (body as { message?: string })?.message || `HTTP ${res.status}`;
    return { error: msg };
  }
  return { data: body as T };
}
