// مسیر فایل: src/lib/useInquiries.ts
// منطق سمت مشتری: پرسیدن قیمت، لغو، به‌روزرسانی خودکار جواب‌ها و برگشت از روی لینک ذخیره‌شده.
"use client";

import { useCallback, useEffect, useState } from "react";
import { useInquiryStore, type CustomerInquiry } from "@/store/inquiryStore";
import { useCartStore, type CartItem } from "@/store/cartStore";

const JSON_HEADERS = { "Content-Type": "application/json" };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ItemState =
  | { kind: "idle" }
  | { kind: "waiting"; stage: "queued" | "asking"; queueAhead: number; since: string }
  | { kind: "answered"; previous: number; final: number; lockedUntil: string; confirmedAt?: string }
  | { kind: "expired" };

export type AskProblem = "rate_limited" | "store_closed" | "network" | "server" | null;

interface StatusData {
  inquiries: CustomerInquiry[];
  storeOpen: boolean;
  serverTime: string;
}

/** وضعیت استعلام‌ها را از سرور می‌گیرد (اگر نشد null). */
async function fetchStatus(token: string): Promise<StatusData | null> {
  try {
    const res = await fetch("/api/inquiries/status", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify({ token }) });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.ok ? (data as StatusData) : null;
  } catch {
    return null;
  }
}

/** وضعیت قیمت یک محصول را از روی آخرین استعلام می‌سازد. */
export function computeItemState(inq: CustomerInquiry | undefined, nowMs: number): ItemState {
  if (!inq) return { kind: "idle" };
  if (inq.status === "waiting") {
    return {
      kind: "waiting",
      stage: inq.stage === "asking" ? "asking" : "queued",
      queueAhead: inq.queueAhead,
      since: inq.createdAt,
    };
  }
  if (inq.status === "answered" && inq.finalPrice != null && inq.lockedUntil) {
    if (Date.parse(inq.lockedUntil) > nowMs) {
      return {
        kind: "answered",
        previous: inq.previousPrice,
        final: inq.finalPrice,
        lockedUntil: inq.lockedUntil,
        confirmedAt: inq.answeredAt ?? undefined,
      };
    }
    return { kind: "expired" };
  }
  return { kind: "idle" };
}

/** «الان» به وقت سرور (برای شمارش اعتبار قیمت، حتی اگر ساعت گوشی اشتباه باشد). */
export function useServerNow(intervalMs = 20_000): number {
  const offset = useInquiryStore((s) => s.serverOffsetMs);
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return tick + offset;
}

/** اگر مشتری از روی لینک ذخیره‌شده (?c=...) آمده باشد، سبد و استعلام‌هایش برمی‌گردد. */
export function useResumeFromLink(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const c = new URLSearchParams(window.location.search).get("c");
    if (!c || !UUID_RE.test(c)) return;
    if (useInquiryStore.getState().token === c) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/cart-session?token=${encodeURIComponent(c)}`, { cache: "no-store" });
        const data = await res.json();
        if (cancelled || !data?.ok || !data.found) return;
        const cart = useCartStore.getState();
        const have = new Set(cart.items.map((i) => i.cartItemId));
        for (const it of data.items as Omit<CartItem, "cartItemId">[]) {
          const cartItemId = it.color ? `${it.id}-${it.color}` : it.id;
          if (!have.has(cartItemId)) {
            cart.addToCart({ id: it.id, title: it.title, price: it.price, image: it.image, quantity: it.quantity, color: it.color });
          }
        }
        const s = useInquiryStore.getState();
        s.adoptToken(c);
        s.setAcceptFluctuation(Boolean(data.acceptFluctuation));
      } catch {
        /* اگر نشد، مشتری با سبد فعلی ادامه می‌دهد */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);
}

export function useInquiries(items: CartItem[], priceOf: (item: CartItem) => number) {
  const token = useInquiryStore((s) => s.token);
  const inquiries = useInquiryStore((s) => s.inquiries);
  const [busy, setBusy] = useState(false);
  const [rawProblem, setRawProblem] = useState<AskProblem>(null);
  const [storeOpen, setStoreOpen] = useState(true);
  const [failures, setFailures] = useState(0);

  const applyStatus = useCallback((data: StatusData) => {
    useInquiryStore.getState().replaceInquiries(data.inquiries, data.serverTime);
    setStoreOpen(data.storeOpen !== false);
    setFailures(0);
  }, []);

  const refresh = useCallback(async () => {
    const t = useInquiryStore.getState().token;
    if (!t) return;
    const data = await fetchStatus(t);
    if (data) applyStatus(data);
    else setFailures((f) => f + 1);
  }, [applyStatus]);

  // بار اول (و هر وقت لینک ذخیره‌شده توکن را عوض کرد) وضعیت را بخوان
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void fetchStatus(token).then((data) => {
      if (!cancelled && data) applyStatus(data);
    });
    return () => {
      cancelled = true;
    };
  }, [token, applyStatus]);

  // اگر سرور چند بار پشت‌سرهم جواب نداد، به مشتری خبر بده
  const problem: AskProblem = rawProblem ?? (failures >= 3 ? "network" : null);

  const hasWaiting = Object.values(inquiries).some((i) => i.status === "waiting");

  // تا وقتی جوابی در راه است، هر چند ثانیه بپرس
  useEffect(() => {
    if (!token || !hasWaiting) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (stopped) return;
      if (document.visibilityState === "visible") await refresh();
      if (stopped) return;
      timer = setTimeout(tick, document.visibilityState === "visible" ? 3000 : 15000);
    };
    timer = setTimeout(tick, 1500);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [token, hasWaiting, refresh]);

  /** برای این محصول‌ها قیمت امروز را از هنرمند بپرس. */
  const ask = useCallback(
    async (productIds: string[]): Promise<boolean> => {
      const state = useInquiryStore.getState();
      const token = state.ensureToken();
      const unique = Array.from(new Set(productIds));
      const toAsk = unique.map((pid) => items.find((i) => i.id === pid)).filter(Boolean) as CartItem[];
      if (toAsk.length === 0) return false;
      setBusy(true);
      setRawProblem(null);
      try {
        const res = await fetch("/api/inquiries", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({
            token,
            items: toAsk.map((i) => ({ productId: i.id, cartPrice: priceOf(i) })),
            cart: items.map((i) => ({ id: i.id, title: i.title, price: i.price, image: i.image, quantity: i.quantity, color: i.color })),
            acceptFluctuation: state.acceptFluctuation,
          }),
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.ok) {
          useInquiryStore.getState().mergeInquiries(data.inquiries as CustomerInquiry[]);
          setTimeout(() => void refresh(), 1500);
          return true;
        }
        setRawProblem(data?.reason === "rate_limited" ? "rate_limited" : data?.reason === "store_closed" ? "store_closed" : "server");
        return false;
      } catch {
        setRawProblem("network");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [items, priceOf, refresh]
  );

  /** استعلام‌های در انتظار این محصول‌ها را لغو کن. */
  const cancel = useCallback(
    async (productIds: string[]) => {
      const t = useInquiryStore.getState().token;
      if (!t || productIds.length === 0) return;
      try {
        await fetch("/api/inquiries/cancel", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({ token: t, productIds: Array.from(new Set(productIds)) }),
        });
      } catch {
        /* بی‌صدا */
      }
      await refresh();
    },
    [refresh]
  );

  return {
    token,
    inquiries,
    busy,
    problem,
    storeOpen,
    hasWaiting,
    ask,
    cancel,
    refresh,
    clearProblem: () => {
      setRawProblem(null);
      setFailures(0);
    },
  };
}
