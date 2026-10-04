// مسیر فایل: src/app/checkout/layout.tsx
// این صفحه "use client" است و نمی‌تواند metadata بدهد؛ پس متای اختصاصی را از این لایه‌ی سروری می‌دهیم.

import type { Metadata } from "next";
import { noIndexMeta } from "@/lib/seo";

export const metadata: Metadata = noIndexMeta;

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
