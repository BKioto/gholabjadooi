// مسیر فایل: src/app/not-found.tsx
// صفحه‌ی ۴۰۴ فارسی (کد وضعیت ۴۰۴ واقعی؛ نه soft-404) با لینک به مهم‌ترین بخش‌های سایت

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "صفحه پیدا نشد" };

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-primary-pink font-bold text-lg mb-2">خطای ۴۰۴</p>
      <h1 className="font-display text-4xl text-text-dark mb-4">این صفحه پیدا نشد</h1>
      <p className="text-gray-600 font-sans leading-8 max-w-xl mb-8">
        ممکن است آدرس را اشتباه وارد کرده باشید یا این محصول از فروشگاه حذف شده باشد. از لینک‌های زیر ادامه بدهید:
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="px-6 py-3 rounded-2xl bg-primary-pink text-white font-bold hover:opacity-90 transition-opacity">فروشگاه</Link>
        <Link href="/guides" className="px-6 py-3 rounded-2xl border-2 border-primary-pink/40 text-primary-pink font-bold hover:bg-primary-pink/10 transition-colors">راهنمای خرید</Link>
        <Link href="/" className="px-6 py-3 rounded-2xl bg-white text-text-dark font-bold border border-gray-200 hover:bg-gray-50 transition-colors">صفحه اصلی</Link>
      </div>
    </div>
  );
}
