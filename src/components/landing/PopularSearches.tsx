// مسیر فایل: src/components/landing/PopularSearches.tsx
// بلوک «جستجوهای پرطرفدار» برای صفحه‌ی اصلی: لینک مستقیم از قوی‌ترین صفحه‌ی سایت به هر ۳۰ صفحه‌ی لندینگ

import Link from "next/link";
import { groupLabels, landingMeta } from "@/data/landing/meta";
import type { LandingGroup } from "@/data/landing/types";

export default function PopularSearches() {
  const groups = Object.keys(groupLabels) as LandingGroup[];
  return (
    <section aria-label="راهنمای خرید بافتنی دست‌ساز" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-10">
        <h2 className="font-display text-3xl text-text-dark mb-2">راهنمای خرید بافتنی دست‌ساز</h2>
        <p className="text-gray-500 font-sans text-sm mb-8">پرطرفدارترین جستجوهای مشتریان قلاب جادویی؛ از دسته گل و عروسک آمیگورومی تا هدیه‌ی مناسبت‌ها و ارسال به شهر شما.</p>
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g}>
              <h3 className="text-sm font-bold text-primary-pink mb-3">{groupLabels[g]}</h3>
              <div className="flex flex-wrap gap-2.5">
                {landingMeta.filter((m) => m.group === g).map((m) => (
                  <Link key={m.slug} href={`/${m.slug}`} className="px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-text-dark text-sm font-medium hover:bg-primary-pink hover:text-white hover:border-primary-pink transition-colors">
                    {m.chip}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
