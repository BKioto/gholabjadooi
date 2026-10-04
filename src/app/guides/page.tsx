// مسیر فایل: src/app/guides/page.tsx
// صفحه‌ی مادر «راهنمای خرید»: یک لینک مستقیم به هر ۳۰ صفحه‌ی لندینگ (مهم برای خزیدن ربات‌های گوگل)

import type { Metadata } from "next";
import Link from "next/link";
import { groupLabels } from "@/data/landing/meta";
import { landingPages } from "@/data/landing/pages";
import type { LandingGroup } from "@/data/landing/types";

export const metadata: Metadata = {
  title: "راهنمای خرید بافتنی دست‌ساز",
  description: "راهنمای کامل خرید دسته گل بافتنی، عروسک آمیگورومی، کیف، کلاه و هدیه‌ی دست‌ساز؛ قیمت، ارسال به سراسر ایران و سفارش اختصاصی در قلاب جادویی.",
  alternates: { canonical: "/guides" },
};

export default function GuidesHub() {
  const groups = Object.keys(groupLabels) as LandingGroup[];
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <h1 className="font-display text-4xl sm:text-5xl text-text-dark">راهنمای خرید بافتنی دست‌ساز</h1>
        <p className="mt-4 text-gray-600 font-sans leading-8 max-w-3xl">
          اینجا همه‌ی راهنماهای خرید قلاب جادویی یک‌جا جمع شده: از انتخاب دسته گل و عروسک آمیگورومی تا قیمت، هدیه‌ی مناسبت‌ها، سفارش عمده و ارسال به شهر شما. هر راهنما با محصولات واقعی فروشگاه کامل شده است.
        </p>
        {groups.map((g) => (
          <section key={g} className="mt-12">
            <h2 className="text-2xl font-bold text-text-dark mb-5">{groupLabels[g]}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {landingPages.filter((p) => p.group === g).map((p) => (
                <Link key={p.slug} href={`/${p.slug}`} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-primary-pink/30 hover:shadow-lg transition-all">
                  <h3 className="font-bold text-text-dark mb-2">{p.chip}</h3>
                  <p className="text-xs text-gray-500 font-sans leading-6 line-clamp-3">{p.metaDescription}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
