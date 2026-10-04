// مسیر فایل: src/app/terms/layout.tsx
// این صفحه "use client" است و نمی‌تواند metadata بدهد؛ پس متای اختصاصی را از این لایه‌ی سروری می‌دهیم.

import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/terms",
  "قوانین و مقررات خرید از قلاب جادویی",
  "قوانین و مقررات خرید از قلاب جادویی: شرایط عمومی، حفظ حریم خصوصی، ثبت و ارسال سفارش و شرایط مرجوعی کالا."
);

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
