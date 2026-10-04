// مسیر فایل: src/lib/seo.ts
// ابزارهای مشترک سئو: آدرس سایت، پاک‌سازی HTML، ساخت متای استاندارد و JSON-LD امن

import type { Metadata } from "next";

export const SITE_URL = "https://www.gholabjadooi.ir";
export const SITE_NAME = "قلاب جادویی";

// تصویر پیش‌فرض اشتراک‌گذاری (ابعاد واقعی فایل public/seo-products-banner.webp)
export const DEFAULT_OG_IMAGE = {
  url: "/seo-products-banner.webp",
  width: 736,
  height: 736,
  alt: "محصولات فروشگاه قلاب جادویی",
};

// حذف تگ‌های HTML و فاصله‌های اضافه (برای متای توضیحات و اسکیمای JSON-LD)
export function plainText(html: string | null | undefined): string {
  return (html ?? "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

// تبدیل آدرس نسبی به مطلق
export function absUrl(u: string | null | undefined): string | undefined {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  return `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`;
}

// تبدیل امن به رشته‌ی JSON برای تگ script
export function ldJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// قیمت‌های سایت به تومان است؛ در اسکیما از کد استاندارد ریال (IRR) استفاده می‌شود (۱ تومان = ۱۰ ریال)
export const tomanToRial = (toman: number) => Math.round(toman) * 10;

// متای کامل (عنوان، توضیحات، canonical، Open Graph، Twitter) برای صفحات ثابت
export function pageMeta(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "fa_IR", siteName: SITE_NAME, url: path, title, description, images: [DEFAULT_OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [DEFAULT_OG_IMAGE.url] },
  };
}

// صفحات خصوصی که نباید در گوگل ایندکس شوند
export const noIndexMeta: Metadata = { robots: { index: false, follow: false } };
