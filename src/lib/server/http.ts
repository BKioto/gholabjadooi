// مسیر فایل: src/lib/server/http.ts
// ابزارهای مشترک API: پاسخ JSON، خواندن امن بدنه، اعتبارسنجی شناسه‌ها، پاک‌سازی سبد خرید.

import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

/** بدنه‌ی JSON را با محدودیت حجم می‌خواند. اگر خراب بود null برمی‌گرداند. */
export async function readJson(request: Request, maxBytes = 80_000): Promise<Record<string, unknown> | null> {
  try {
    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > maxBytes) return null;
    const text = await request.text();
    if (text.length > maxBytes) return null;
    const data: unknown = JSON.parse(text);
    return data && typeof data === "object" && !Array.isArray(data) ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** اثر انگشت ناشناس IP (برای محدودکردن درخواست‌های پشت‌سرهم؛ خود IP ذخیره نمی‌شود). */
export function clientIpHash(request: Request): string | null {
  const fwd = request.headers.get("x-forwarded-for");
  const ip = (fwd ? fwd.split(",")[0] : request.headers.get("x-real-ip") ?? "").trim();
  if (!ip) return null;
  const salt = process.env.BALE_WEBHOOK_SECRET || "gholab";
  return createHash("sha256").update(`${ip}|${salt}`).digest("hex").slice(0, 32);
}

export function safeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export interface CartSnapshotItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
}

const safeImage = (v: unknown): string => {
  const s = String(v ?? "").slice(0, 600);
  return /^(https?:\/\/|\/)/i.test(s) ? s : "";
};

/** آیتم‌های سبد را پاک‌سازی می‌کند (برای ذخیره‌ی نسخه‌ی سبد). */
export function sanitizeCart(input: unknown): CartSnapshotItem[] | null {
  if (!Array.isArray(input) || input.length > 40) return null;
  const out: CartSnapshotItem[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if (!isUuid(r.id)) continue;
    const price = Number(r.price);
    const qty = Math.round(Number(r.quantity));
    out.push({
      id: r.id,
      title: String(r.title ?? "").slice(0, 200),
      price: Number.isFinite(price) && price >= 0 && price < 1e10 ? Math.round(price) : 0,
      image: safeImage(r.image),
      quantity: Number.isFinite(qty) ? Math.min(99, Math.max(1, qty)) : 1,
      color: r.color ? String(r.color).slice(0, 60) : undefined,
    });
  }
  return out;
}

export interface QuoteItemInput {
  productId: string;
  color?: string;
  quantity: number;
}

/** آیتم‌های سبد برای قیمت‌گذاری سرور را پاک‌سازی می‌کند. */
export function sanitizeQuoteItems(input: unknown): QuoteItemInput[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 40) return null;
  const out: QuoteItemInput[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    if (!isUuid(r.productId)) return null;
    const qty = Math.round(Number(r.quantity));
    out.push({
      productId: r.productId,
      color: r.color ? String(r.color).slice(0, 60) : undefined,
      quantity: Number.isFinite(qty) ? Math.min(99, Math.max(1, qty)) : 1,
    });
  }
  return out;
}
