// مسیر فایل: src/app/faq/layout.tsx
// این صفحه "use client" است و نمی‌تواند metadata بدهد؛ پس متای اختصاصی را از این لایه‌ی سروری می‌دهیم.

import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/faq",
  "سوالات متداول خرید بافتنی دست‌ساز؛ سفارش، ارسال و شستشو",
  "پاسخ سوالات رایج درباره خرید بافتنی دست‌ساز: سفارش اختصاصی از روی عکس، شست‌وشو، ارسال با پست پیشتاز، پس‌کرایه، خرید عمده و شرایط مرجوعی."
);

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
