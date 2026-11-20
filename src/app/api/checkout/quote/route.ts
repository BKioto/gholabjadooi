// مسیر فایل: src/app/api/checkout/quote/route.ts
// قیمت نهایی سبد (از روی دیتابیس، نه از روی مرورگر). اطلاعات کارت فقط وقتی برمی‌گردد که قیمت‌ها نهایی باشد.

import { getAdminClient, rpc } from "@/lib/server/supabase-admin";
import { isUuid, json, readJson, sanitizeQuoteItems } from "@/lib/server/http";

export const dynamic = "force-dynamic";

interface QuoteResult {
  ok: boolean;
  reason?: string;
  canOrder?: boolean;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const items = sanitizeQuoteItems(body?.items);
  if (!body || !isUuid(body.token) || !items) return json({ ok: false, reason: "bad_request" }, 400);
  try {
    const quote = await rpc<QuoteResult>("quote_cart", {
      p_token: body.token,
      p_items: items,
      p_accept: body.acceptFluctuation === true,
    });
    if (!quote.ok) return json(quote, 400);

    let payment: { cardNumber: string; cardOwnerName: string } | null = null;
    if (quote.canOrder) {
      const { data } = await getAdminClient()
        .from("payment_settings")
        .select("card_number, card_owner_name")
        .eq("id", 1)
        .maybeSingle();
      if (data?.card_number) {
        payment = { cardNumber: String(data.card_number), cardOwnerName: String(data.card_owner_name ?? "") };
      }
    }
    return json({ ...quote, payment });
  } catch (e) {
    console.error("[checkout] quote:", e instanceof Error ? e.message : e);
    return json({ ok: false, reason: "server_error" }, 500);
  }
}
