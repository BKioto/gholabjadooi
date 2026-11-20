// مسیر فایل: src/app/api/orders/route.ts
// ثبت سفارش در «سرور»: قیمت‌ها از دیتابیس و از روی استعلام‌ها محاسبه می‌شود (نه از روی مرورگر).

import { after } from "next/server";
import { getAdminClient, rpc } from "@/lib/server/supabase-admin";
import { isUuid, json, readJson, sanitizeQuoteItems } from "@/lib/server/http";
import { notifyNewOrder } from "@/lib/server/inquiry-bot";
import { normalizeDigits, normalizeIranMobile } from "@/lib/price-utils";

export const dynamic = "force-dynamic";

interface OrderResult {
  ok: boolean;
  reason?: string;
  duplicate?: boolean;
  orderCode?: string;
  total?: number;
  priceMode?: string | null;
  quote?: unknown;
  lines?: { title: string; color?: string | null; quantity: number; unitPrice: number; state: string }[];
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const items = sanitizeQuoteItems(body?.items);
  const customer = body?.customer as Record<string, unknown> | undefined;
  if (!body || !isUuid(body.token) || !items || !customer || typeof customer !== "object") {
    return json({ ok: false, reason: "bad_request" }, 400);
  }

  const name = String(customer.name ?? "").trim().slice(0, 80);
  const phone = normalizeIranMobile(String(customer.phone ?? ""));
  const address = String(customer.address ?? "").trim().slice(0, 600);
  const postal = normalizeDigits(String(customer.postalCode ?? "")).replace(/\D/g, "");
  const expected = Number(body.expectedTotal);

  try {
    const admin = getAdminClient();
    const { data: pay } = await admin.from("payment_settings").select("card_number").eq("id", 1).maybeSingle();
    if (!pay?.card_number) return json({ ok: false, reason: "payment_not_ready" }, 409);

    const res = await rpc<OrderResult>("create_order_atomic", {
      p_token: body.token,
      p_items: items,
      p_accept: body.acceptFluctuation === true,
      p_name: name,
      p_phone: phone,
      p_address: address,
      p_postal: postal,
      p_expected_total: Number.isFinite(expected) ? expected : null,
    });

    if (!res.ok) {
      const conflict = res.reason === "not_orderable" || res.reason === "price_changed";
      return json(res, conflict ? 409 : 400);
    }

    if (!res.duplicate && res.orderCode) {
      const notice = {
        orderCode: res.orderCode,
        total: Number(res.total),
        packaging: 50000,
        priceMode: res.priceMode ?? null,
        name,
        phone,
        lines: res.lines ?? [],
      };
      after(async () => {
        try {
          await notifyNewOrder(notice);
        } catch (e) {
          console.error("[orders] notify:", e instanceof Error ? e.message : e);
        }
      });
    }
    return json({ ok: true, duplicate: Boolean(res.duplicate), orderCode: res.orderCode, total: res.total, priceMode: res.priceMode ?? null });
  } catch (e) {
    console.error("[orders] create:", e instanceof Error ? e.message : e);
    return json({ ok: false, reason: "server_error" }, 500);
  }
}
