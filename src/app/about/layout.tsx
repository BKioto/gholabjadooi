// مسیر فایل: src/app/about/layout.tsx
// این صفحه "use client" است و نمی‌تواند metadata بدهد؛ پس متای اختصاصی را از این لایه‌ی سروری می‌دهیم.

import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/about",
  "درباره قلاب جادویی؛ تیم هنرمندان قلاب‌باف اهواز",
  "آشنایی با قلاب جادویی؛ تیم هنرمندان قلاب‌باف اهواز که عروسک آمیگورومی، دسته گل و اکسسوری کاموایی را با دست می‌بافند و به سراسر ایران ارسال می‌کنند."
);

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
