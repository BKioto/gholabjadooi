// مسیر فایل: src/components/landing/RelatedGuides.tsx
// بلوک «راهنمای خرید مرتبط» برای صفحه‌ی دسته‌بندی و صفحه‌ی محصول (لینک‌دهی داخلی به صفحات لندینگ)

import Link from "next/link";
import { chipOf } from "@/data/landing/meta";

export default function RelatedGuides({ slugs, title = "راهنمای خرید و مقالات مرتبط" }: { slugs: string[]; title?: string }) {
  if (!slugs.length) return null;
  return (
    <section aria-label={title} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-text-dark mb-4">{title}</h2>
        <div className="flex flex-wrap gap-3">
          {slugs.map((s) => (
            <Link key={s} href={`/${s}`} className="px-4 py-2 rounded-full bg-soft-blue/30 text-text-dark text-sm font-medium hover:bg-primary-pink hover:text-white transition-colors">
              {chipOf(s)}
            </Link>
          ))}
          <Link href="/guides" className="px-4 py-2 rounded-full border border-primary-pink/40 text-primary-pink text-sm font-bold hover:bg-primary-pink/10 transition-colors">
            همه‌ی راهنماهای خرید
          </Link>
        </div>
      </div>
    </section>
  );
}
