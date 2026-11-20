// مسیر فایل: src/app/api/cart-session/route.ts
// نسخه‌ی ذخیره‌شده‌ی سبد خرید: برای برگشتن از روی لینک/میان‌بر (روی هر مرورگر یا دستگاه).

import { getAdminClient } from "@/lib/server/supabase-admin";
import { isUuid, json, readJson, sanitizeCart } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!isUuid(token)) return json({ ok: false, reason: "bad_request" }, 400);
  try {
    const { data, error } = await getAdminClient()
      .from("cart_sessions")
      .select("items, accept_fluctuation")
      .eq("token", token)
      .maybeSingle();
    if (error) throw error;
    if (!data) return json({ ok: true, found: false });
    return json({
      ok: true,
      found: true,
      items: sanitizeCart(data.items) ?? [],
      acceptFluctuation: Boolean(data.accept_fluctuation),
    });
  } catch (e) {
    console.error("[cart-session] get:", e instanceof Error ? e.message : e);
    return json({ ok: false, reason: "server_error" }, 500);
  }
}

// به‌روزرسانی نسخه‌ی سبد (فقط برای سبدهایی که قبلاً با استعلام ساخته شده‌اند)
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body || !isUuid(body.token)) return json({ ok: false, reason: "bad_request" }, 400);
  const items = sanitizeCart(body.items);
  if (!items) return json({ ok: false, reason: "bad_items" }, 400);
  try {
    const { error } = await getAdminClient()
      .from("cart_sessions")
      .update({ items, accept_fluctuation: body.acceptFluctuation === true, updated_at: new Date().toISOString() })
      .eq("token", body.token);
    if (error) throw error;
    return json({ ok: true });
  } catch (e) {
    console.error("[cart-session] save:", e instanceof Error ? e.message : e);
    return json({ ok: false, reason: "server_error" }, 500);
  }
}
