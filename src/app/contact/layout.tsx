// مسیر فایل: src/app/contact/layout.tsx
// این صفحه "use client" است و نمی‌تواند metadata بدهد؛ پس متای اختصاصی را از این لایه‌ی سروری می‌دهیم.

import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/contact",
  "تماس با قلاب جادویی؛ مشاوره و سفارش بافتنی دست‌ساز",
  "راه‌های ارتباط با قلاب جادویی: شماره تماس، پیام‌رسان بله، ایتا، تلگرام و واتساپ و آدرس اهواز، کیان‌آباد؛ مشاوره پیش از سفارش بافتنی دست‌ساز."
);

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
