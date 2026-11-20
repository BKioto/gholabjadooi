// مسیر فایل: src/lib/useCartQuote.ts
// قیمت به‌روز و نهایی سبد خرید را از سرور می‌گیرد (قیمت داخل مرورگر ممکن است قدیمی باشد).
"use client";

import { useEffect, useState } from "react";
import type { CartItem } from "@/store/cartStore";
import { makeUuid } from "@/store/inquiryStore";
import type { Quote } from "@/lib/quote-types";

export function useCartQuote(items: CartItem[], token: string | null, acceptFluctuation: boolean, refreshKey: string) {
  const [quote, setQuote] = useState<Quote | null>(null);

  const itemsKey = items.map((i) => `${i.id}:${i.color ?? ""}:${i.quantity}`).join("|");

  useEffect(() => {
    if (items.length === 0) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/checkout/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            token: token ?? makeUuid(),
            items: items.map((i) => ({ productId: i.id, color: i.color, quantity: i.quantity })),
            acceptFluctuation,
          }),
        });
        const data = (await res.json()) as Quote;
        if (data?.ok) setQuote(data);
      } catch {
        /* اگر نشد، همان قیمت داخل سبد نمایش داده می‌شود */
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, token, acceptFluctuation, refreshKey]);

  return items.length === 0 ? null : quote;
}
