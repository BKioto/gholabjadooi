// مسیر فایل: src/app/api/inquiries/cancel/route.ts
// مشتری محصول را از سبد حذف کرد (یا بدون انتظار ادامه داد) => استعلام‌های در انتظار لغو می‌شود.

import { after } from "next/server";
import { rpc } from "@/lib/server/supabase-admin";
import { isUuid, json, readJson } from "@/lib/server/http";
import { afterCustomerCancel, type InquiryRow } from "@/lib/server/inquiry-bot";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readJson(request, 8_000);
  if (!body || !isUuid(body.token) || !Array.isArray(body.productIds)) {
    return json({ ok: false, reason: "bad_request" }, 400);
  }
  const ids = body.productIds.filter(isUuid).slice(0, 40);
  try {
    const cancelled: InquiryRow[] = [];
    for (const productId of ids) {
      const row = await rpc<InquiryRow | null>("cancel_price_inquiry", { p_token: body.token, p_product_id: productId });
      if (row) cancelled.push(row);
    }
    if (cancelled.length > 0) {
      after(async () => {
        try {
          await afterCustomerCancel(cancelled);
        } catch (e) {
          console.error("[price-inquiry] after cancel:", e instanceof Error ? e.message : e);
        }
      });
    }
    return json({ ok: true, cancelled: cancelled.length });
  } catch (e) {
    console.error("[price-inquiry] cancel:", e instanceof Error ? e.message : e);
    return json({ ok: false, reason: "server_error" }, 500);
  }
}
