// مسیر فایل: src/app/api/inquiries/route.ts
// مشتری روی «استعلام قیمت» می‌زند => برای هر محصول یک استعلام در صف ساخته می‌شود.

import { after } from "next/server";
import { rpc } from "@/lib/server/supabase-admin";
import { clientIpHash, isUuid, json, readJson, sanitizeCart } from "@/lib/server/http";
import { dispatchNext } from "@/lib/server/inquiry-bot";

export const dynamic = "force-dynamic";

interface CreateResult {
  ok: boolean;
  reason?: string;
  inquiries?: unknown[];
  skipped?: unknown[];
}

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body || !isUuid(body.token)) return json({ ok: false, reason: "bad_request" }, 400);

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items = rawItems.slice(0, 12).flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const r = raw as Record<string, unknown>;
    if (!isUuid(r.productId)) return [];
    const p = Number(r.cartPrice);
    return [{ productId: r.productId, cartPrice: Number.isFinite(p) && p >= 0 ? Math.round(p) : null }];
  });
  if (items.length === 0) return json({ ok: false, reason: "bad_items" }, 400);

  try {
    const res = await rpc<CreateResult>("create_price_inquiries", {
      p_token: body.token,
      p_ip_hash: clientIpHash(request),
      p_items: items,
      p_cart: sanitizeCart(body.cart),
      p_accept: body.acceptFluctuation === true,
    });
    if (!res.ok) {
      const status = res.reason === "rate_limited" ? 429 : res.reason === "store_closed" ? 409 : 400;
      return json(res, status);
    }
    // اولین پیام را بعد از پاسخ‌دادن به مشتری می‌فرستیم تا او معطل نشود
    after(async () => {
      try {
        await dispatchNext();
      } catch (e) {
        console.error("[price-inquiry] dispatch after create:", e instanceof Error ? e.message : e);
      }
    });
    return json(res);
  } catch (e) {
    console.error("[price-inquiry] create:", e instanceof Error ? e.message : e);
    return json({ ok: false, reason: "server_error" }, 500);
  }
}
