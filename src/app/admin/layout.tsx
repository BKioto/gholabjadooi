// مسیر فایل: src/app/admin/layout.tsx
// جلوگیری از ایندکس شدن پنل مدیریت در نتایج گوگل

import type { Metadata } from "next";
import { noIndexMeta } from "@/lib/seo";

export const metadata: Metadata = {
  ...noIndexMeta,
  title: "پنل مدیریت دست‌بافت‌های آماده شده",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}